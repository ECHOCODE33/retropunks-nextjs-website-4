"use client";

import dynamic from "next/dynamic";

const ProvidersNoSSR = dynamic(
  () => import("@/app/providers").then((mod) => mod.Providers),
  { ssr: false },
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ProvidersNoSSR>{children}</ProvidersNoSSR>;
}
