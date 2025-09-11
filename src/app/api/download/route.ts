import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Call our Express API to download the Framer website
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/download-framer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SECRET_TOKEN || 'your-api-key-here'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.detail || 'Download failed' }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Download completed successfully',
      url,
      download_url: data.download_url,
      view_url: data.view_url
    });
  } catch (error) {
    console.error('Error downloading Framer website:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
