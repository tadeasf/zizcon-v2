"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Load Map component with no SSR
const Map = dynamic(() => import("./map").then(mod => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg border bg-muted animate-pulse" />
  )
});

export function MapSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Visit Us</h2>
        <div className="h-[400px] w-full rounded-lg border bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">Visit Us</h2>
      <Map />
    </div>
  );
} 