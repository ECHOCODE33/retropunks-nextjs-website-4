import { type Abi, type Address } from "viem";
import RetroPunksABI from "./RetroPunksABI.json";

export const RETROPUNKS_ABI = RetroPunksABI as Abi;

export const RETROPUNKS_CONTRACT = "0xf271683b7E199a1e26aFa0C6A698E36f83165d65" as Address;
