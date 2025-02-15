"use client";

import { useEffect, useState } from "react";
import { type News } from "@/lib/directus";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { NewsCard } from "@/components/news/NewsCard";

export function NewsFeed() {
  const [news, setNews] = useState<News[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchNews() {
      try {
        const response = await fetch('/api/content/news');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNews(data.news);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch news'));
        console.error('Error fetching news:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  // Don't render anything until after hydration
  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Latest News</h2>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
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

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading News</CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">{error.message}</CardDescription>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Latest News</h2>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
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

  if (!news.length) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">Latest News</h2>
      <Accordion type="single" collapsible className="w-full">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </Accordion>
    </div>
  );
} 