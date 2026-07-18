"use client";

import { CreditCard, Theme } from "frosted-ui";

export function VaultCard({ name }: { name: string }) {
  return (
    <CreditCard.Root defaultFace="front">
      <Theme render={<CreditCard.Content />} hasBackground={false} appearance="light">
        <CreditCard.Front>
          <CreditCard.FrontHeader>
            <CreditCard.Logo>
              <img src="/whop-mark.svg" alt="Whop" style={{ height: 18, width: "auto" }} />
            </CreditCard.Logo>
            <CreditCard.Brand>
              <span className="text-[13px] font-bold tracking-tight">Dossier.</span>
            </CreditCard.Brand>
          </CreditCard.FrontHeader>
          <CreditCard.FrontFooter>
            <CreditCard.Title>{name}</CreditCard.Title>
            <CreditCard.LastFour>•••• 4242</CreditCard.LastFour>
          </CreditCard.FrontFooter>
        </CreditCard.Front>
        <CreditCard.Back>
          <CreditCard.MagStripe />
        </CreditCard.Back>
      </Theme>
    </CreditCard.Root>
  );
}
