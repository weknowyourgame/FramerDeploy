import { NextRequest, NextResponse } from 'next/server';

// Simple API token for development
const SECRET_TOKEN = process.env.SECRET_TOKEN || 'dev_token_for_testing';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // For testing, just connect directly to the Express server at port 3001
    const EXPRESS_SERVER = 'http://localhost:3001';
    
    try {
      // Forward the request to Express server
      const response = await fetch(`${EXPRESS_SERVER}/api/mirror`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SECRET_TOKEN,
        },
        body: JSON.stringify(body),
      });
      
      // Handle errors from Express server
      if (!response.ok) {
        let errorMessage = 'Error mirroring website';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Server error (${response.status})`;
        }
        
        return NextResponse.json({ error: errorMessage }, { status: response.status });
      }
      
      // Get the zip file as blob
      const blob = await response.blob();
      
      // Create a new response with the blob
      const newResponse = new NextResponse(blob);
      
      // Copy content-disposition header if present
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        newResponse.headers.set('content-disposition', contentDisposition);
      }
      
      // Set content type to zip
      newResponse.headers.set('content-type', 'application/zip');
      
      return newResponse;
    } catch (fetchError) {
      console.error('Error connecting to Express server:', fetchError);
      return NextResponse.json({
        error: 'Failed to connect to download server',
        details: 'Make sure the Express server is running on port 3001'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}