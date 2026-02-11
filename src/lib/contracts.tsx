import { type Abi, type Address } from "viem";
import retropunksAbi from "../../extra/retropunksABI.json";

export const RETROPUNKS_ABI = retropunksAbi as Abi;

export const RETROPUNKS_CONTRACT = "0xa7F6B0079F1f15eaC0Ee657933e550ee8502E1D7" as Address;
