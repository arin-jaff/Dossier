export function PageArt({ src, opacity = 0.3 }: { src: string; opacity?: number }) {
  return (
    <>
      <img
        src={src}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{
          opacity,
          maskImage: "linear-gradient(to left, black 15%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to left, black 15%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/70 to-transparent" />
    </>
  );
}
