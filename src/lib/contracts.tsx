import { type Abi, type Address } from "viem";
import RetroPunksABI from "./RetroPunksABI.json";


export const RETROPUNKS_ABI = RetroPunksABI as Abi;

export const RETROPUNKS_CONTRACT = "0xa7F6B0079F1f15eaC0Ee657933e550ee8502E1D7" as Address;
