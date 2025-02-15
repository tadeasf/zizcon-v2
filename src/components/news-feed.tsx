"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { NewsCard } from "@/components/news/NewsCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { News } from "@/lib/models/News";

export function NewsFeed() {
  const [news, setNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/content/news?page=${currentPage}&pageSize=3`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Validate the response structure
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        setNews(data.data);
        setTotalPages(data.meta?.pageCount ?? 1);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch news');
        setNews([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    // Smooth scroll to top of the news section
    document.getElementById('news-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    // Smooth scroll to top of the news section
    document.getElementById('news-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section id="news-section" className="container mx-auto px-4">
        <div className="max-w-[80%] mx-auto">
          <h2 className="text-3xl font-bold mb-8">Latest News</h2>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="news-section" className="container mx-auto px-4">
        <div className="max-w-[80%] mx-auto">
          <h2 className="text-3xl font-bold mb-8">Latest News</h2>
          <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="news-section" className="container mx-auto px-4">
      <div className="max-w-[80%] mx-auto space-y-8">
        <h2 className="text-3xl font-bold">Latest News</h2>

        {currentPage > 1 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              className="w-12 h-12 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <ChevronUp className="h-8 w-8" />
            </Button>
          </div>
        )}
        
        <Accordion type="single" collapsible className="space-y-4">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </Accordion>

        {currentPage < totalPages && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              className="w-12 h-12 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <ChevronDown className="h-8 w-8" />
            </Button>
          </div>
        )}

        {news.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No news available.</p>
        )}
      </div>
    </section>
  );
} 