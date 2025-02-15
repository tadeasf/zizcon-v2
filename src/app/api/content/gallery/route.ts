import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export async function GET() {
  try {
    // First fetch galleries
    const galleries = await directus.request(
      readItems('gallery', {
        fields: [
          'id',
          'status',
          'sort',
          'date_updated',
          'title',
          'header.id',
          'header.filename_download'
        ],
        filter: {
          status: {
            _eq: 'published'
          }
        },
        sort: ['-date_updated']
      })
    );


    if (!Array.isArray(galleries)) {
      console.error('Gallery API: Unexpected response format:', galleries);
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Then fetch gallery files for each gallery
    const galleriesWithFiles = await Promise.all(
      galleries.map(async (gallery) => {
        const files = await directus.request(
          readItems('gallery_files', {
            fields: [
              'id',
              'directus_files_id.id',
              'directus_files_id.filename_download'
            ],
            filter: {
              gallery_id: {
                _eq: gallery.id
              }
            }
          })
        );


        return {
          ...gallery,
          gallery_files: Array.isArray(files) ? files : []
        };
      })
    );

    return NextResponse.json(
      { galleries: galleriesWithFiles },
      {
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('Gallery API: Error fetching galleries:', error);
    if (error instanceof Error) {
      console.error('Gallery API: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch galleries' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
