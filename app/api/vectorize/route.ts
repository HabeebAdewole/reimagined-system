import { NextResponse } from 'next/server';
import { vectorizeImage } from '@/lib/vectorizer';
import { withRetry } from '@/lib/retry';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) return NextResponse.json({ error: 'image is required' }, { status: 400 });
    
    // image is base64 string
    const imageBuffer = Buffer.from(image, 'base64');
    const svgContent = await withRetry(() => vectorizeImage(imageBuffer));
    
    return NextResponse.json({ svg: svgContent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}