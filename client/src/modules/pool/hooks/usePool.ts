import { useEffect, useState } from "react";
import * as service from "../services/pool.service";
import { Pool } from "../types/pool.types";

export const usePool = () => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPool = async () => {
    const data = await service.getPool();
    setPool(data);
  };

  const join = async () => {
    if (!pool) return;

    setLoading(true);
    try {
      await service.joinPool(pool.id);
      await loadPool();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPool();
  }, []);

  return { pool, loading, join };
};