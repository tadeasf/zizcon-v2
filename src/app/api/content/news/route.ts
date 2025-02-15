import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import type { News } from '@/lib/directus';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '3');

    const response = await directus.request<News[]>(
      readItems('news', {
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
        sort: ['-date_updated']
      })
    );

    if (!Array.isArray(response)) {
      console.error('News API: Unexpected response format:', response);
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Calculate pagination
    const totalItems = response.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = response.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        data: paginatedData,
        meta: {
          total: totalItems,
          page,
          pageSize,
          pageCount: totalPages
        }
      },
      {
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('News API: Error fetching news:', error);
    if (error instanceof Error) {
      console.error('News API: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch news' },
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