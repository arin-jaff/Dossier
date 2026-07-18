"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteSplash() {
  const pathname = usePathname();
  const first = useRef(true);
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPhase("in");
    const hold = setTimeout(() => setPhase("out"), 260);
    const done = setTimeout(() => setPhase("hidden"), 660);
    return () => {
      clearTimeout(hold);
      clearTimeout(done);
    };
  }, [pathname]);

  if (phase === "hidden" || pathname === "/login") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#111113]"
      style={{ animation: phase === "in" ? "splash-in 180ms ease-out both" : "splash-out 380ms ease-in both" }}
    >
      <div className="flex items-center gap-3">
        <img src="/whop-mark.svg" alt="" style={{ height: 28, width: "auto" }} />
        <span className="text-[22px] font-bold tracking-tight text-white">Dossier.</span>
      </div>
    </div>
  );
}
