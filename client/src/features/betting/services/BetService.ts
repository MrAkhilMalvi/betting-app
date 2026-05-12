import axios from "@/providers/axios";
import { API_ENDPOINTS } from "@/providers/api-config";

export const placeBet = async (amount: number) => {
  try {
    const res = await axios.post(API_ENDPOINTS.BET.PLACE, {
      amount,
    });

    return res.data;
  } catch (error: any) {
    console.error("Error placing bet:", error);

    throw new Error(error?.response?.data?.message || "Failed to place bet");
  }
};

export const resolveBet = async (betId: number, multiplier: number) => {
  try {
    const res = await axios.post(API_ENDPOINTS.BET.RESOLVE, {
      betId,
      multiplier,
    });

    return res.data;
  } catch (error: any) {
    console.error("Error resolving bet:", error);

    throw new Error(error?.response?.data?.message || "Failed to resolve bet");
  }
};
