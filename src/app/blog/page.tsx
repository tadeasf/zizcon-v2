import { getBlogPosts, type BlogPost, getImageUrl } from "@/lib/directus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import Image from "next/image";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  if (!posts.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Blog</h1>
      <Accordion type="single" collapsible className="w-full">
        {posts.map((post: BlogPost) => (
          <AccordionItem key={post.id} value={post.id}>
            <Card className="mb-4">
              <CardHeader>
                <AccordionTrigger>
                  <div className="flex flex-col items-start">
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(post.date_created), "MMMM dd, yyyy")}
                    </CardDescription>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent>
                  {post.header && (
                    <div className="relative w-full h-[300px] mb-6">
                      <Image
                        src={getImageUrl(post.header.id)}
                        alt={post.header.filename_download}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 