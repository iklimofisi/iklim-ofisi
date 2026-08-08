export default function TemperatureGauge() {
  return (
    <div className="w-full max-w-xl">
      <svg
        viewBox="0 0 640 180"
        className="w-full h-auto"
        role="img"
        aria-label="Soğutmadan ısıtmaya, her ortama uygun iklim aralığı"
      >
        <defs>
          <linearGradient id="rangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0E7C86" />
            <stop offset="55%" stopColor="#5FA6A0" />
            <stop offset="100%" stopColor="#E8734A" />
          </linearGradient>
        </defs>

        {/* ana bar */}
        <rect x="20" y="70" width="600" height="10" rx="5" fill="url(#rangeGradient)" />

        {/* tick'ler */}
        {Array.from({ length: 13 }).map((_, i) => {
          const x = 20 + (600 / 12) * i;
          return (
            <line
              key={i}
              x1={x}
              y1={86}
              x2={x}
              y2={98}
              stroke="#C7D1D3"
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}

        <text x="20" y="120" fontFamily="var(--font-mono)" fontSize="14" fill="#0B646C">
          -5°C
        </text>
        <text x="300" y="120" fontFamily="var(--font-mono)" fontSize="14" fill="#12212B" textAnchor="middle">
          İKLİM OFİSİ ARALIĞI
        </text>
        <text x="600" y="120" fontFamily="var(--font-mono)" fontSize="14" fill="#C75E39" textAnchor="end">
          +35°C
        </text>

        {/* hareketli gösterge iğnesi */}
        <g className="gauge-needle">
          <circle cx="0" cy="75" r="10" fill="#12212B" />
          <circle cx="0" cy="75" r="4" fill="#F5F7F7" />
        </g>
      </svg>

      <style>{`
        .gauge-needle {
          animation: gaugeMove 7s ease-in-out infinite;
        }
        @keyframes gaugeMove {
          0%   { transform: translateX(60px); }
          50%  { transform: translateX(560px); }
          100% { transform: translateX(60px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gauge-needle { animation: none; transform: translateX(310px); }
        }
      `}</style>
    </div>
  );
}
