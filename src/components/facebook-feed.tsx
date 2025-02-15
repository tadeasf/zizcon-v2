"use client";

export function FacebookFeed() {
  return (
    <div className="w-full max-w-[340px] h-[400px] mx-auto">
      <iframe
        src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffestivalzizcon&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=734502472148349"
        width="100%"
        height="100%"
        style={{ border: "none", overflow: "hidden" }}
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title="Facebook Page Widget"
      ></iframe>
    </div>
  );
} 