import { Hero } from "@/components/hero";
import { SocialFeeds } from "@/components/social-feeds";
import { MapSection } from "@/components/map-section";

export default async function Home() {
  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden py-4">
      <Hero />
      <SocialFeeds />
      <MapSection />
    </div>
  );
}
