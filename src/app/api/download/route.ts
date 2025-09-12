import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Call our serverless function to download the Framer website
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SECRET_TOKEN!
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.detail || 'Download failed' }, { status: response.status });
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
  } catch (error) {
    console.error('Error downloading Framer website:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
