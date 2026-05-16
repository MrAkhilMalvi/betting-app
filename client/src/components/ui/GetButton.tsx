export   const getButtonProps = () => {
    if (isLoading) return { text: "SYNCING...", color: "bg-white/5 text-gray-500 border-white/5" };
    if (gameState === "waiting" && !hasBet) return { text: "PLACE BET", color: "bg-green-500 text-black hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]" };
    if (gameState === "waiting" && hasBet) return { text: "BET READY", color: "bg-orange-500/20 text-orange-500 border-orange-500/30" };
    if (gameState === "running" && hasBet) return { text: `CASHOUT`, color: "bg-yellow-500 text-black animate-pulse shadow-[0_0_40px_rgba(234,179,8,0.5)]" };
    if (gameState === "running" && !hasBet) return { text: "GAME LIVE", color: "bg-white/5 text-gray-600" };
    if (gameState === "crashed") return { text: "CRASHED", color: "bg-red-500/20 text-red-500" };
    return { text: "WAITING", color: "bg-white/5 text-gray-600" };
  };