import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const alchemyUrl = process.env.NEXT_PUBLIC_RPC_URL;

export const config = getDefaultConfig({
  appName: 'RetroPunks',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(alchemyUrl),
  },
});