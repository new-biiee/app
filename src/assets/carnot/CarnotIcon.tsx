export const CarnotIcon: React.FC<{ size: number }> = ({ size = 80 }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
            <defs>
                <radialGradient id="rg80" cx="28" cy="28" r="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#3ef4ff" stop-opacity="0.25" /><stop offset="100%" stop-color="#3ef4ff" stop-opacity="0" />
                </radialGradient>
                <filter id="gl80"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <circle cx="28" cy="28" r="24" stroke="#3ef4ff" stroke-width="0.8" opacity="0.10" />
            <circle cx="28" cy="28" r="18" stroke="#3ef4ff" stroke-width="1" opacity="0.18" />
            <circle cx="28" cy="28" r="12" stroke="#3ef4ff" stroke-width="1.2" opacity="0.32" />
            <circle cx="28" cy="28" r="24" fill="url(#rg80)" />
            <circle cx="28" cy="28" r="6.5" fill="#3ef4ff" filter="url(#gl80)" />
            <line x1="28" y1="21.5" x2="28" y2="24" stroke="#0B0A0F" stroke-width="1.5" stroke-linecap="round" />
            <line x1="28" y1="32" x2="28" y2="34.5" stroke="#0B0A0F" stroke-width="1.5" stroke-linecap="round" />
            <line x1="21.5" y1="28" x2="24" y2="28" stroke="#0B0A0F" stroke-width="1.5" stroke-linecap="round" />
            <line x1="32" y1="28" x2="34.5" y2="28" stroke="#0B0A0F" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    );
};