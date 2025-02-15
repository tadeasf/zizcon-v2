import { createDirectus, rest, readItems, authentication } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8355';
const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

// Initialize with static token if available
if (directusToken) {
  directus.setToken(directusToken);
}

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
  };
}

export async function getBlogPosts() {
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
    return posts as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export function getImageUrl(fileId: string) {
  return `${directusUrl}/assets/${fileId}`;
}

export { directus };
