import { createDirectus, rest, authentication, readItems } from '@directus/sdk';
import { DirectusResponse } from './models/DirectusResponse';
import { BlogPost } from './models/BlogPost';
import { News } from './models/News';

// Use environment variables for configuration
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error('NEXT_PUBLIC_DIRECTUS_URL environment variable is required');
}

// Create and configure the Directus client
export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

// Initialize with static token if available
const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
if (directusToken) {
  directus.setToken(directusToken);
}

// Utility function to generate image URLs with transformations
export function getImageUrl(imageId: string | undefined, options?: {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
}) {
  if (!imageId) return null;
  
  const params = new URLSearchParams();
  
  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.quality) params.append('quality', options.quality.toString());
  if (options?.fit) params.append('fit', options.fit);
  
  const queryString = params.toString();
  return `${directusUrl}/assets/${imageId}${queryString ? `?${queryString}` : ''}`;
}

export async function getBlogPosts() {
  try {
    const response = await directus.request<DirectusResponse<BlogPost>>(
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
    
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching blog posts:', error.message);
    }
    return [];
  }
}

export async function getNews(page: number = 1, pageSize: number = 3) {
  try {
    const response = await directus.request<DirectusResponse<News>>(
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
        sort: ['-date_updated'],
        page,
        limit: pageSize,
        meta: 'total_count,filter_count'
      })
    );
    
    if (!response?.data || !Array.isArray(response.data)) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          pageSize,
          pageCount: 0
        }
      };
    }
    
    return {
      data: response.data,
      meta: {
        total: response.meta?.total_count ?? 0,
        page,
        pageSize,
        pageCount: Math.ceil((response.meta?.total_count ?? 0) / pageSize)
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching news:', error.message);
    }
    return {
      data: [],
      meta: {
        total: 0,
        page,
        pageSize,
        pageCount: 0
      }
    };
  }
}



