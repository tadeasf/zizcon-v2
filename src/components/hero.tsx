import Image from "next/image";

export function Hero() {
  return (
    <div className="flex items-center justify-center w-full max-w-5xl mx-auto px-4 py-4">
      <div className="relative w-full max-w-[80vw] md:max-w-[60vw] h-[120px] md:h-[180px]">
        <Image
          src="/logo_large.png"
          alt="ŽIŽCON Logo Large"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
} 