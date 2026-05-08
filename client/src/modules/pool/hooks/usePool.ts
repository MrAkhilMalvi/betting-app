import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import * as service from "../services/pool.service";
import { Pool } from "../types/pool.types";

import { socket } from "../../../api/socket/game.socket";

export const usePool = () => {
  const [pool, setPool] = useState<Pool | null>(null);

  const [loading, setLoading] = useState(false);

  // 📦 Load pool
  const loadPool = async () => {
    try {
      const data = await service.getPool();

      setPool(data);
    } catch (err: any) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Failed to load pool");
    }
  };

  // 🎟 Join pool
  const join = async () => {
    if (!pool) return;

    setLoading(true);

    try {
      const res = await service.joinPool(pool.id);

      toast.success("Joined pool successfully 🎉");

      await loadPool();
    } catch (err: any) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Failed to join pool");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadPool();

    // 🏆 Winner event
    socket.on("poolWinner", async (data) => {
      console.log("🏆 Winner Event:", data);

      toast.success("🏆 Pool winner announced!");

      await loadPool();
    });

    // 🔥 Pool updated
    socket.on("poolUpdated", async () => {
      await loadPool();
    });

    return () => {
      socket.off("poolWinner");

      socket.off("poolUpdated");
    };
  }, []);

  return {
    pool,
    loading,
    join,
  };
};
