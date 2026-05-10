import Image from "next/image";

export function EarnBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      <Image
        src="/Assets/Images/Background/bg-expert-2.webp"
        alt=""
        fill
        priority
        fetchPriority="high"
        quality={70}
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwZDBlMGYiLz48L3N2Zz4="
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,14,15,0.35)_0%,rgba(13,14,15,0.55)_55%,rgba(13,14,15,0.82)_100%)]" />
    </div>
  );
}
