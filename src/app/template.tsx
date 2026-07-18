export default function Template({ children }: { children: React.ReactNode }) {
  return <div style={{ animation: "page-in 350ms ease-out both" }}>{children}</div>;
}
