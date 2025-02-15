import { Gallery } from "@/lib/models/Gallery";
import { Card, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/gallery/ImageCarousel";

async function getGalleries(): Promise<Gallery[]> {
  try {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3300';
    const response = await fetch(`${baseUrl}/api/content/gallery`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch galleries: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.galleries;
  } catch (error) {
    console.error('Gallery Page: Error fetching galleries:', error);
    if (error instanceof Error) {
      console.error('Gallery Page: Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export default async function GalleryPage() {
  let galleries: Gallery[] = [];
  let error: Error | null = null;
  
  try {
    galleries = await getGalleries();
  } catch (e) {
    error = e instanceof Error ? e : new Error('Unknown error occurred');
    console.error('Gallery Page: Error in page render:', error);
  }

  if (error) {
    return (
      <div className="container max-w-5xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Gallery</h1>
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            {error.message}
          </CardDescription>
        </Card>
      </div>
    );
  }

  if (!galleries.length) {
    return (
      <div className="container max-w-5xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Gallery</h1>
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>
      <div className="grid gap-6">
        {galleries.map((gallery) => (
          <ImageCarousel key={gallery.id} gallery={gallery} />
        ))}
      </div>
    </div>
  );
}
