import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Forward the request to our serverless function
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    try {
      const response = await fetch(`${baseUrl}/api/server`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SECRET_TOKEN || 'dev_token_for_testing',
        },
        body: JSON.stringify(body),
      });
      
      // Handle errors from serverless function
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
      console.error('Error calling serverless function:', fetchError);
      return NextResponse.json({
        error: 'Failed to process mirror request',
        details: 'Internal server error'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}