"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./map").then(mod => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg border bg-muted animate-pulse" />
  )
});

export function MapSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Visit Us</h2>
      <Map />
    </div>
  );
} 