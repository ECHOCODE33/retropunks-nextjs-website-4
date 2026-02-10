import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) throw new Error("Missing WalletConnect Project ID");

export const config = getDefaultConfig({
  appName: "RetroPunks",
  projectId,
  chains: [base],
  ssr: true,
});
