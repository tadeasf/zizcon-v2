import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/directus";
import { News } from "@/lib/models/News";
interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  const imageUrl = news.header ? 
    getImageUrl(news.header.id, {
      width: 1200,
      height: 600,
      fit: 'cover',
      quality: 80
    }) : 
    null;

  return (
    <AccordionItem value={news.id}>
      <Card className="mb-4 overflow-hidden">
        <div className="relative">
          {imageUrl && news.header && (
            <div className="relative h-[300px] w-full">
              <Image
                src={imageUrl}
                alt={news.header.filename_download}
                fill
                className="object-cover"
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/90" />
            </div>
          )}
          <CardHeader 
            className={cn(
              "relative p-6",
              imageUrl ? "absolute bottom-0 left-0 right-0 z-10" : ""
            )}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col items-start text-left">
                <h3 className={cn(
                  "text-2xl font-bold mb-2",
                  imageUrl ? "text-white drop-shadow-lg" : "text-foreground"
                )}>
                  {news.title}
                </h3>
                <CardDescription className={cn(
                  "text-sm font-medium",
                  imageUrl ? "text-gray-100 drop-shadow-lg" : "text-muted-foreground"
                )}>
                  {format(new Date(news.date_created), "MMMM dd, yyyy")}
                </CardDescription>
              </div>
            </AccordionTrigger>
          </CardHeader>
        </div>
        <AccordionContent>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{news.content}</ReactMarkdown>
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
} 