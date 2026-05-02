import { fetchActivePool, joinPoolApi } from "../api/pool.api";



export const getPool = async () => {
  return fetchActivePool();
};

export const joinPool = async (poolId: string) => {
  return joinPoolApi(poolId);
};

