import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { socket } from "@/providers/socket/socket";
import { fetchActivePool, joinPool } from "../services/poolService";
import { Pool } from "../types/pool.types";

export const usePool = () => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const loadPool = async () => {
    try {
      const data = await fetchActivePool();

      setPool(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const join = async () => {
    if (!pool) return;

    try {
      setLoading(true);
      await joinPool(pool.id);

      toast.success("Joined pool successfully 🎉");
    } catch (err: any) {
      toast.error(err?.message || "Failed to join pool");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPool();

    socket.on("pool:created", (data: Pool) => {
      setPool(data);
    });

    socket.on("pool:updated", (data: Pool) => {
      setPool(data);
    });

    socket.on("pool:countdown", (data) => {
      setCountdown(data.remaining);
    });

    socket.on("pool:locked", () => {
      toast("Pool locked 🔒");
    });

    socket.on("pool:winner", (data) => {
      toast.success(`🏆 Winner announced`);

      setPool((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: "completed",
          winner_id: data.winnerId,
        };
      });
    });

    return () => {
      socket.off("pool:created");
      socket.off("pool:updated");
      socket.off("pool:countdown");
      socket.off("pool:locked");
      socket.off("pool:winner");
    };
  }, []);

  return {
    pool,
    loading,
    countdown,
    join,
    reload: loadPool,
  };
};
