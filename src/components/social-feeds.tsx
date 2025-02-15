"use client";

import { FacebookFeed } from "./facebook-feed";
import { DiscordFeed } from "./discord-feed";

export function SocialFeeds() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
        <FacebookFeed />
        <DiscordFeed />
      </div>
    </div>
  );
} 