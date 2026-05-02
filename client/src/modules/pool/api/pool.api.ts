import axios from "../../../api/axios";
import { Pool } from "@/modules/pool/types/pool.types";

export const fetchActivePool = async (): Promise<Pool> => {
  const res = await axios.get("/pool/active");
  return res.data;
};

export const joinPoolApi = async (poolId: string) => {
  return axios.post("/pool/join", { poolId });
};