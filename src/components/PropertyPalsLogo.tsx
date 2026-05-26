import React from 'react';

interface PropertyPalsLogoProps {
  className?: string;
  size?: number; // width and height will scale proportional to this size
  showText?: boolean;
}

export default function PropertyPalsLogo({ className = '', size = 120, showText = true }: PropertyPalsLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} style={{ height: size }}>
      <svg
        id="property-pals-svg-logo"
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg transition-transform hover:scale-105 duration-300"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBDB5C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          
          <linearGradient id="shield-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="40%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0B1329" />
          </linearGradient>

          <linearGradient id="silver-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="building-gold" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          
          <linearGradient id="helmet-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <filter id="logo-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.3" floodColor="#000000" />
          </filter>
        </defs>

        <g filter="url(#logo-drop-shadow)">
          {/* Main Shield Outline & Background */}
          <path
            d="M 250 40 C 370 40, 440 80, 440 210 C 440 330, 340 410, 250 455 C 160 410, 60 330, 60 210 C 60 80, 130 40, 250 40 Z"
            fill="url(#shield-bg)"
            stroke="url(#silver-border)"
            strokeWidth="12"
            strokeLinejoin="round"
          />
          
          {/* Inner Golden Glow Shield Accent */}
          <path
            d="M 250 54 C 356 54, 424 90, 424 208 C 424 316, 328 392, 250 435 C 172 392, 76 316, 76 208 C 76 90, 144 54, 250 54 Z"
            stroke="url(#gold-gradient)"
            strokeWidth="4"
            fill="none"
            opacity="0.85"
          />

          {/* BACKGROUND: High-Rise Buildings and skyline */}
          <rect x="180" y="110" width="30" height="110" fill="#1E293B" opacity="0.4" />
          <rect x="210" y="80" width="35" height="140" fill="#1E1E2E" />
          <path d="M 210 80 L 227.5 60 L 245 80 Z" fill="#1E1E2E" /> {/* Steeple roof */}
          <rect x="250" y="95" width="40" height="125" fill="#334155" />
          <rect x="295" y="125" width="25" height="95" fill="#1E293B" opacity="0.4" />
          
          {/* Tiny yellow windows on center building */}
          <rect x="217" y="95" width="4" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="234" y="95" width="4" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="217" y="115" width="4" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="234" y="115" width="4" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="217" y="135" width="4" height="6" fill="#FBBF24" opacity="0.8" />
          <rect x="234" y="135" width="4" height="6" fill="#FBBF24" opacity="0.8" />

          {/* Roof Gable outline in middle */}
          <path d="M 160 195 L 250 145 L 340 195" stroke="url(#silver-border)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <polygon points="238,175 262,175 262,192 238,192" fill="#F97316" stroke="white" strokeWidth="2" />
          
          {/* TWO BUILDERS MASCOTS */}
          {/* Left Builder */}
          <g id="left-builder">
            {/* Body / Overalls */}
            <path d="M 155 228 C 155 228, 165 242, 182 242 C 199 242, 209 228, 209 228 L 214 265 L 150 265 Z" fill="#1D4ED8" />
            <rect x="168" y="228" width="6" height="14" fill="#1E3A8A" />
            <rect x="190" y="228" width="6" height="14" fill="#1E3A8A" />
            {/* Skin / Face */}
            <circle cx="182" cy="208" r="18" fill="#FFEDD5" />
            {/* Eyes */}
            <circle cx="176" cy="205" r="2" fill="#111827" />
            <circle cx="188" cy="205" r="2" fill="#111827" />
            {/* Friendly Smile */}
            <path d="M 176 214 Q 182 220 188 214" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Hardhat */}
            <path d="M 157 195 A 25 21 0 0 1 207 195 Z" fill="url(#helmet-gold)" />
            <path d="M 150 195 L 214 195 A 4 4 0 0 1 214 199 L 150 199 A 4 4 0 0 1 150 195 Z" fill="#F97316" />
            <rect x="178" y="174" width="8" height="21" fill="#EA580C" rx="2" />
            
            {/* Arm holding Wrench */}
            <path d="M 150 245 C 135 245, 125 235, 120 220" stroke="#1D4ED8" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Hand */}
            <circle cx="120" cy="216" r="9" fill="#FFEDD5" />
            {/* Wrench */}
            <g transform="translate(118, 215) rotate(-35)">
              <rect x="-4" y="-35" width="8" height="35" fill="#94A3B8" rx="2" stroke="#64748B" strokeWidth="1" />
              <circle cx="0" cy="-35" r="9" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
              <circle cx="0" cy="-35" r="4" fill="#1E293B" />
              <rect x="-3" y="-42" width="6" height="8" fill="#1E293B" />
              <rect x="-4" y="0" width="8" height="5" fill="#94A3B8" stroke="#64748B" strokeWidth="1" rx="1" />
            </g>
          </g>

          {/* Right Builder */}
          <g id="right-builder">
            {/* Body / Overalls */}
            <path d="M 291 228 C 291 228, 301 242, 318 242 C 335 242, 345 228, 345 228 L 350 265 L 286 265 Z" fill="#EA580C" />
            <rect x="302" y="228" width="6" height="14" fill="#9A3412" />
            <rect x="326" y="228" width="6" height="14" fill="#9A3412" />
            {/* Skin / Face */}
            <circle cx="318" cy="208" r="18" fill="#FFEDD5" />
            {/* Eyes */}
            <circle cx="312" cy="205" r="2" fill="#111827" />
            <circle cx="324" cy="205" r="2" fill="#111827" />
            {/* Friendly Smile */}
            <path d="M 312 214 Q 318 220 324 214" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Hardhat */}
            <path d="M 293 195 A 25 21 0 0 1 343 195 Z" fill="url(#helmet-gold)" />
            <path d="M 286 195 L 350 195 A 4 4 0 0 1 350 199 L 286 199 A 4 4 0 0 1 286 195 Z" fill="#EA580C" />
            <rect x="314" y="174" width="8" height="21" fill="#EA580C" rx="2" />

            {/* Arm holding Hammer */}
            <path d="M 350 245 C 365 245, 375 235, 380 220" stroke="#EA580C" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Hand */}
            <circle cx="380" cy="216" r="9" fill="#FFEDD5" />
            {/* Hammer */}
            <g transform="translate(382, 215) rotate(35)">
              {/* Wooden Handle */}
              <rect x="-3.5" y="-5" width="7" height="35" fill="#854D0E" rx="1.5" />
              {/* Hammer Head Metal */}
              <path d="M -16 -12 L 14 -12 L 14 -3 L -5 -3 L -5 3 L -12 3 L -12 -3 L -16 -3 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
              {/* Claw curve */}
              <path d="M 14 -12 C 18 -10, 22 -3, 24 5 L 18 5 C 16 0, 14 -6, 11 -7 Z" fill="#94A3B8" />
            </g>
          </g>

          {/* MAIN BRANDING TEXT CONTAINER (The curved shield horizontal banner) */}
          <rect
            x="45"
            y="262"
            width="410"
            height="76"
            rx="16"
            fill="#0F172A"
            stroke="url(#silver-border)"
            strokeWidth="6"
          />
          <rect
            x="48"
            y="265"
            width="404"
            height="70"
            rx="13"
            stroke="url(#gold-gradient)"
            strokeWidth="3"
            fill="none"
          />

          {/* "PropertyPals" text styling inside banner */}
          <text
            x="75"
            y="312"
            fill="#FFFFFF"
            fontSize="38"
            fontWeight="900"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            letterSpacing="-0.03em"
          >
            Property
          </text>
          <text
            x="275"
            y="312"
            fill="url(#gold-gradient)"
            fontSize="38"
            fontWeight="950"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            letterSpacing="-0.01em"
          >
            Pals
          </text>

          {/* SUB-BANNER AND CAPTION: "CONSTRUCTION & MAINTENANCE" */}
          <rect
            x="78"
            y="346"
            width="344"
            height="32"
            rx="8"
            fill="#1E293B"
            stroke="url(#silver-border)"
            strokeWidth="2"
          />
          <text
            x="250"
            y="367"
            fill="#FFFFFF"
            fontSize="13.5"
            fontWeight="900"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            letterSpacing="0.14em"
            textAnchor="middle"
          >
            CONSTRUCTION & MAINTENANCE
          </text>

          {/* BOTTOM EMBLEM: Gear and crossed mini-tools */}
          <g id="bottom-gear" transform="translate(250, 412)">
            {/* Golden Gear Outline */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="url(#gold-gradient)" strokeWidth="5.5" />
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <rect
                key={angle}
                x="-3"
                y="-23"
                width="6"
                height="8"
                fill="url(#gold-gradient)"
                transform={`rotate(${angle})`}
                rx="1"
              />
            ))}
            <circle cx="0" cy="0" r="10" fill="#0B1329" />
            
            {/* Tiny crossed wrench and hammer in center of gear */}
            <path d="M -7 -4 L 7 4" stroke="url(#silver-border)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 7 -4 L -7 4" stroke="url(#silver-border)" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Decorative Sparkle Highlights left and right */}
          {/* Left Sparkle */}
          <path d="M 125 400 Q 125 410, 135 410 Q 125 410, 125 420 Q 125 410, 115 410 Q 125 410, 125 400" fill="white" />
          <path d="M 150 422 Q 150 427, 155 427 Q 150 427, 150 432 Q 150 427, 145 427 Q 150 427, 150 422" fill="#FBBF24" />
          
          {/* Right Sparkle */}
          <path d="M 375 400 Q 375 410, 385 410 Q 375 410, 375 420 Q 375 410, 365 410 Q 375 410, 375 400" fill="white" />
          <path d="M 350 422 Q 350 427, 355 427 Q 350 427, 350 432 Q 350 427, 345 427 Q 350 427, 350 422" fill="#FBBF24" />
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col select-none leading-none">
          <div className="flex items-baseline">
            <span className="text-xl font-extrabold tracking-tight text-primary-900">Property</span>
            <span className="text-xl font-black tracking-tight text-accent-orange ml-0.5">Pals</span>
          </div>
          <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-slate-500 mt-1">
            CONSTRUCTION & MAINTENANCE
          </span>
        </div>
      )}
    </div>
  );
}
