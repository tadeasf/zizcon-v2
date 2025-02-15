import { type BlogPost } from "@/lib/directus";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { BlogCard } from "@/components/blog/BlogCard";

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3300';
    const response = await fetch(`${baseUrl}/api/content/blog`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw error;
  }
}

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let error: Error | null = null;
  
  try {
    posts = await getBlogPosts();
  } catch (e) {
    error = e instanceof Error ? e : new Error('Unknown error occurred');
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Blog Posts</CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">{error.message}</CardDescription>
        </Card>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-[300px] w-full">
                <Skeleton className="h-full w-full absolute" />
              </div>
              <div className="p-6">
                <Skeleton className="h-4 w-[250px] mb-2" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <Accordion type="single" collapsible className="w-full">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </Accordion>
    </div>
  );
} 