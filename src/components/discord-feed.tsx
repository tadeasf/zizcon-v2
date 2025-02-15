"use client";

export function DiscordFeed() {
  const serverId = "1160646990514896908";

  return (
    <div className="w-full max-w-[340px] h-[400px] mx-auto rounded-lg overflow-hidden border">
      <iframe
        src={`https://discord.com/widget?id=${serverId}&theme=dark`}
        width="100%"
        height="100%"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        title="Discord Widget"
        className="border-none"
      ></iframe>
    </div>
  );
} 