export const CarnotFullLogo: React.FC<{ iconSize?: number }> = ({ iconSize = 80 }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width={iconSize} height={iconSize} viewBox="0 0 56 56" fill="none">
                <defs>
                    <radialGradient id="rg-h" cx="28" cy="28" r="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3ef4ff" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#3ef4ff" stopOpacity="0" />
                    </radialGradient>
                    <filter id="gl-h"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="28" cy="28" r="24" stroke="#3ef4ff" strokeWidth="1" opacity="0.10" />
                <circle cx="28" cy="28" r="18" stroke="#3ef4ff" strokeWidth="1.2" opacity="0.20" />
                <circle cx="28" cy="28" r="12" stroke="#3ef4ff" strokeWidth="1.5" opacity="0.35" />
                <circle cx="28" cy="28" r="24" fill="url(#rg-h)" />
                <circle cx="28" cy="28" r="6.5" fill="#3ef4ff" filter="url(#gl-h)" />
                <line x1="28" y1="21.5" x2="28" y2="24" stroke="#0B0A0F" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="28" y1="32" x2="28" y2="34.5" stroke="#0B0A0F" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="21.5" y1="28" x2="24" y2="28" stroke="#0B0A0F" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="32" y1="28" x2="34.5" y2="28" stroke="#0B0A0F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: iconSize * 0.6, letterSpacing: "-0.03em", color: "#3ef4ff" }}>carnot</span>
        </div>
    );
};