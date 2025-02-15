import { NextRequest, NextResponse } from 'next/server';
import { getImageUrl } from '@/lib/directus';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageId = searchParams.get('id');
  const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined;
  const height = searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined;
  const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality')!) : undefined;
  const fit = searchParams.get('fit') as 'cover' | 'contain' | 'inside' | 'outside' | undefined;

  if (!imageId) {
    return NextResponse.json({ error: 'Missing image ID' }, { status: 400 });
  }

  const imageUrl = getImageUrl(imageId, {
    width,
    height,
    quality,
    fit
  });

  if (!imageUrl) {
    return NextResponse.json({ error: 'Failed to generate image URL' }, { status: 500 });
  }
  
  // Redirect to the Directus URL with transformations
  return NextResponse.redirect(imageUrl);
} 