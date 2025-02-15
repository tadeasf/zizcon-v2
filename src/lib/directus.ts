import { createDirectus, rest, authentication, readItems } from '@directus/sdk';

// Use environment variables for configuration
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8355';
const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

console.log('Directus Configuration:', {
  url: directusUrl,
  hasToken: !!directusToken
});

// Create and configure the Directus client
export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

// Initialize with static token if available
if (directusToken) {
  directus.setToken(directusToken);
  console.log('Directus token set successfully');
}

// Types for blog posts
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

export interface Gallery {
  id: string;
  status: 'published' | 'draft';
  sort: number;
  date_updated: string;
  header: {
    id: string;
    filename_download: string;
  } | null;
  images: {
    id: string;
    filename_download: string;
  }[];
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
  console.log('Fetching blog posts...');
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
    
    console.log('Raw posts response:', JSON.stringify(posts, null, 2));
    
    if (!Array.isArray(posts)) {
      console.error('Unexpected response format:', posts);
      return [];
    }
    
    return posts as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return [];
  }
}



