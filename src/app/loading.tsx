export default function Loading() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center">
      <div className="flex items-center gap-3" style={{ animation: "splash-in 200ms ease-out both" }}>
        <img src="/whop-mark.svg" alt="" style={{ height: 28, width: "auto" }} />
        <span className="text-[22px] font-bold tracking-tight">Dossier.</span>
      </div>
    </div>
  );
}
