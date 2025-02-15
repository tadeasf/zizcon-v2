import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export async function GET() {
  try {
    const rules = await directus.request(
      readItems('pravidlaucasti', {
        fields: [
          'id',
          'status',
          'sort',
          'user_created',
          'date_created',
          'user_updated',
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
        sort: ['sort']
      })
    );

    if (!Array.isArray(rules)) {
      console.error('API: Unexpected response format:', rules);
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
      { rules },
      {
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('API: Error fetching rules:', error);
    if (error instanceof Error) {
      console.error('API: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
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