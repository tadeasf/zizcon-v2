import { Hero } from "@/components/hero";
import { NewsFeed } from "@/components/news-feed";
import { SocialFeeds } from "@/components/social-feeds";
import { MapSection } from "@/components/map-section";

export default async function Home() {
  return (
    <>
      <Hero />
      <NewsFeed />
      <SocialFeeds />
      <MapSection />
    </>
  );
}
