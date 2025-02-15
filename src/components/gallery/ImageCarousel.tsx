"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getImageUrl } from "@/lib/directus";
import { Gallery } from "@/lib/models/Gallery";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  gallery: Gallery;
}

export function ImageCarousel({ gallery }: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const galleryFiles = gallery.gallery_files || [];
  const headerImage = gallery.header;

  // Combine header image with other images if it exists
  const allImages = [
    ...(headerImage ? [headerImage] : []),
    ...galleryFiles.map(gf => gf.directus_files_id)
  ].filter(Boolean);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
      <CardContent className="p-1 space-y-4">
        <Carousel className="w-full" setApi={setApi}>
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

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 px-2">
            {allImages.map((image, index) => {
              const thumbnailUrl = getImageUrl(image.id, {
                width: 120,
                height: 80,
                fit: 'cover',
                quality: 60
              });

              if (!thumbnailUrl) {
                return null;
              }

              return (
                <button
                  key={image.id}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "relative aspect-[3/2] w-full overflow-hidden rounded-md transition-opacity",
                    current === index ? "opacity-100 ring-2 ring-primary" : "opacity-50 hover:opacity-75"
                  )}
                >
                  <Image
                    src={thumbnailUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 16vw, (max-width: 1200px) 12vw, 10vw"
                  />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
