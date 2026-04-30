import axios from "./axios";
import { API_ENDPOINTS } from "./api-config";

export const placeBetApi = (amount: number) => {
  return axios.post(API_ENDPOINTS.BET.PLACE, { amount });
};

export const resolveBetApi = (betId: number, multiplier: number) => {
  return axios.post(API_ENDPOINTS.BET.RESOLVE, {
    betId,
    multiplier,
  });
};