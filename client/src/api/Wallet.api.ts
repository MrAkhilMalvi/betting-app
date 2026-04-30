import axios from "./axios";
import { API_ENDPOINTS } from "./api-config";

export const getWalletApi = () => {
  return axios.get(API_ENDPOINTS.WALLET.GET);
};