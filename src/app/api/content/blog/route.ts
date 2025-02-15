import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export interface BlogPost {
  id: string;
  status: 'published' | 'draft';
  sort: number;
  user_created: string;
  user_updated: string;
  date_created: string;
  date_updated: string;
  title: string;
  content: string;
  header: {
    id: string;
    filename_download: string;
  } | null;
}

export async function GET() {
  try {
    const posts = await directus.request(
      readItems('blog', {
        fields: [
          'id',
          'status',
          'sort',
          'user_created',
          'user_updated',
          'date_created',
          'date_updated',
          'title',
          'content',
          'header.id',
          'header.filename_download'
        ],
        filter: {
          status: {
            _eq: 'published'
          }
        },
        sort: ['-date_created']
      })
    );

    if (!Array.isArray(posts)) {
      console.error('API: Unexpected response format:', posts);
      return NextResponse.json(
        { error: 'Invalid response format' },
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

    return NextResponse.json(
      { posts },
      {
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('API: Error fetching blog posts:', error);
    if (error instanceof Error) {
      console.error('API: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
