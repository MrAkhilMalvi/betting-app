import confetti from "canvas-confetti";

export const triggerConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#22c55e", "#eab308", "#ffffff"],
  });
};

export const spawnCoins = (clientX: number, clientY: number) => {
  const coinCount = 12;
  const coinImage =
    "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Coin.png";

  const targetElement = document.getElementById("header-wallet-pill");
  if (!targetElement) return;

  const targetRect = targetElement.getBoundingClientRect();
  // Target the center of the wallet pill
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  for (let i = 0; i < coinCount; i++) {
    setTimeout(() => {
      const coin = document.createElement("img");
      coin.src = coinImage;
      // Add a bezier curve transition for smooth acceleration
      coin.className =
        "fixed pointer-events-none z-[9999] w-6 h-6 object-contain transition-all duration-700 cubic-bezier(0.25, 1, 0.5, 1)";

      // Add slight starting randomized offset near the click point
      const startX = clientX + (Math.random() * 40 - 20);
      const startY = clientY + (Math.random() * 40 - 20);

      coin.style.left = `${startX - 12}px`;
      coin.style.top = `${startY - 12}px`;
      coin.style.transform = "scale(0.8) rotate(0deg)";
      coin.style.opacity = "1";

      document.body.appendChild(coin);

      // Force layout calculation
      coin.getBoundingClientRect();

      // Calculate directional vector to target
      const tx = targetX - startX;
      const ty = targetY - startY;

      // Animate transition and scaling down as they merge with wallet
      coin.style.transform = `translate(${tx}px, ${ty}px) scale(0.3) rotate(${360 + Math.random() * 360}deg)`;
      coin.style.opacity = "0.2";

      // Temporary pulse effect on wallet container upon final coin arrivals
      if (i === coinCount - 1) {
        setTimeout(() => {
          targetElement.style.transform = "scale(1.05)";
          setTimeout(() => {
            targetElement.style.transform = "scale(1)";
          }, 150);
        }, 700);
      }

      setTimeout(() => {
        coin.remove();
      }, 700);
    }, i * 60); // Stagger interval in milliseconds
  }
};
