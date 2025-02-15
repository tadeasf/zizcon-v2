import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type Gallery, getImageUrl } from "@/lib/directus";

interface ImageCarouselProps {
  gallery: Gallery;
}

export function ImageCarousel({ gallery }: ImageCarouselProps) {
  const galleryFiles = gallery.gallery_files || [];
  const headerImage = gallery.header;


  // Combine header image with other images if it exists
  const allImages = [
    ...(headerImage ? [headerImage] : []),
    ...galleryFiles.map(gf => gf.directus_files_id)
  ].filter(Boolean);


  if (allImages.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      {gallery.title && (
        <CardHeader>
          <CardTitle>{gallery.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-1">
        <Carousel className="w-full">
          <CarouselContent>
            {allImages.map((image, index) => {
              const imageUrl = getImageUrl(image.id, {
                width: 1200,
                height: 800,
                fit: 'cover',
                quality: 80
              });

              if (!imageUrl) {
                return null;
              }

              return (
                <CarouselItem key={image.id}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={imageUrl}
                      alt={image.filename_download}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {allImages.length > 1 && (
            <>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
}
