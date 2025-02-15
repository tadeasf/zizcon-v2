import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/directus";
import { PravidlaUcasti } from "@/lib/models/PravidlaUcasti";

interface RulesCardProps {
  rules: PravidlaUcasti;
  value: string;
}

export function RulesCard({ rules, value }: RulesCardProps) {
  const imageUrl = rules.header ? 
    getImageUrl(rules.header.id, {
      width: 1200,
      height: 400,
      fit: 'cover',
      quality: 80
    }) : 
    null;

  return (
    <AccordionItem value={value} className="border-none">
      <Card className="overflow-hidden mb-4">
        <div className="relative">
          {imageUrl && rules.header && (
            <div className="relative h-[200px] w-full">
              <Image
                src={imageUrl}
                alt={rules.header.filename_download}
                fill
                className="object-cover"
                priority
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
              <h2 className={cn(
                "text-2xl font-bold text-left",
                imageUrl ? "text-white drop-shadow-lg" : "text-foreground"
              )}>
                {rules.title}
              </h2>
            </AccordionTrigger>
          </CardHeader>
        </div>
        <AccordionContent>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  a: (props) => (
                    <a {...props} className="text-primary hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer" />
                  ),
                  ul: (props) => (
                    <ul {...props} className="list-disc pl-6 space-y-2" />
                  ),
                  ol: (props) => (
                    <ol {...props} className="list-decimal pl-6 space-y-2" />
                  ),
                  li: (props) => (
                    <li {...props} className="marker:text-primary" />
                  ),
                  p: (props) => (
                    <p {...props} className="mb-4 last:mb-0" />
                  ),
                }}
              >
                {rules.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
} 