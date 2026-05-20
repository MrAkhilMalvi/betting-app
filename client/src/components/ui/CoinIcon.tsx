import React from "react";

interface CoinIconProps {
  size?: number;
  className?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ size = 16, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none align-middle object-contain drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)] hover:scale-110 active:scale-95 transition-transform duration-300 ${className}`}
    >
      <defs>
        {/* Deep background edge gradient to simulate 3D thickness */}
        <linearGradient id="coinEdge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Polished front face gold gradient */}
        <linearGradient id="coinFace" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* High-fidelity inner metallic ring shine */}
        <linearGradient id="coinInnerRing" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="50%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Specular highlight gradient for realistic metallic reflections */}
        <linearGradient id="specularHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* 3D Drop Shadow / Extrusion Layer */}
      <circle cx="16" cy="17.5" r="14.5" fill="url(#coinEdge)" />

      {/* Main Volumetric Front Plate */}
      <circle cx="16" cy="16" r="14.5" fill="url(#coinFace)" />

      {/* Polished Inner Inset Border */}
      <circle cx="16" cy="16" r="11.5" stroke="url(#coinInnerRing)" strokeWidth="1.5" />

      {/* Inner Inset Face */}
      <circle cx="16" cy="16" r="10" fill="url(#coinFace)" />

      {/* Premium Core Gaming Insignia Symbol (Sleek Geometric Star) */}
      <path
        d="M16 9.5L18.1 13.9L22.5 14.5L19.2 17.6L20 22.2L16 20L12 22.2L12.8 17.6L9.5 14.5L13.9 13.9L16 9.5Z"
        fill="#FEF08A"
        stroke="#78350F"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Specular Reflective Overlay */}
      <circle cx="16" cy="16" r="14.5" fill="url(#specularHighlight)" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
};