import axios from "@/providers/axios";
import { API_ENDPOINTS } from "@/providers/api-config";
import { Pool } from "../types/pool.types";

export const fetchActivePool = async (): Promise<Pool> => {
  try {
    const res = await axios.get(API_ENDPOINTS.POOL.ACTIVEPOOL);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching active pool:", error);

    throw new Error(
      error?.response?.data?.message || "Failed to fetch active pool",
    );
  }
};

export const joinPool = async (poolId: string) => {
  try {
    const res = await axios.post(API_ENDPOINTS.POOL.JOINPOOL, {
      poolId,
    });

    return res.data;
  } catch (error: any) {
    console.error("Error joining pool:", error);

    throw new Error(error?.response?.data?.message || "Failed to join pool");
  }
};
