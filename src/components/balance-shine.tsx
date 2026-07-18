"use client";

import { Shine } from "frosted-ui";

export function BalanceShine({ children }: { children: React.ReactNode }) {
  return <Shine puffyness="1.5">{children}</Shine>;
}
