"use client";

import { useEffect, useState } from "react";
import { FacebookFeed } from "./facebook-feed";
import { DiscordFeed } from "./discord-feed";

export function SocialFeeds() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          <div className="w-[340px] h-[400px] bg-muted animate-pulse rounded-lg" />
          <div className="w-[340px] h-[400px] bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">Social Media</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
        <FacebookFeed />
        <DiscordFeed />
      </div>
    </div>
  );
} 