import React from 'react';
import { NumogramZone, ZoneId } from '../types/amelia';
import { Activity, Zap, Lock, Sparkles, Orbit, Compass } from 'lucide-react';

interface NumogramZoneMapProps {
  zones: Record<ZoneId, NumogramZone>;
  onSelectZone: (zoneId: ZoneId) => void;
  selectedZone: ZoneId;
}

const ZONE_COORDS: Record<ZoneId, { x: number; y: number; color: string; label: string }> = {
  0: { x: 50, y: 15, color: '#f59e0b', label: '0: Utter-Void' },
  1: { x: 80, y: 28, color: '#3b82f6', label: '1: Barker Flux' },
  2: { x: 20, y: 28, color: '#10b981', label: '2: Chasm Crossing' },
  3: { x: 85, y: 55, color: '#06b6d4', label: '3: Chrono-Attractor' },
  4: { x: 65, y: 45, color: '#6366f1', label: '4: Central Equilibrium' },
  5: { x: 35, y: 45, color: '#8b5cf6', label: '5: Torque Anchor' },
  6: { x: 15, y: 55, color: '#d946ef', label: '6: Pandemonium Vortex' },
  7: { x: 75, y: 78, color: '#ec4899', label: '7: Hyperborean Gate' },
  8: { x: 25, y: 78, color: '#f43f5e', label: '8: Anamnesis Locus' },
  9: { x: 50, y: 90, color: '#14b8a6', label: '9: Terminal Contact' }
};

// Syzygy pairing connections (sum to 9)
const SYZYGIES: [ZoneId, ZoneId][] = [
  [0, 9],
  [1, 8],
  [2, 7],
  [3, 6],
  [4, 5]
];

export const NumogramZoneMap: React.FC<NumogramZoneMapProps> = ({
  zones,
  onSelectZone,
  selectedZone
}) => {
  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto bg-stone-950/80 rounded-2xl border border-stone-800 p-6 flex items-center justify-center shadow-2xl overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#332a22_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* SVG Canvas for Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Syzygy Torque Lines */}
        {SYZYGIES.map(([z1, z2], idx) => {
          const c1 = ZONE_COORDS[z1];
          const c2 = ZONE_COORDS[z2];
          const act1 = zones[z1]?.activation || 0.5;
          const act2 = zones[z2]?.activation || 0.5;
          const meanAct = (act1 + act2) / 2;

          return (
            <g key={`syz-${idx}`}>
              <line
                x1={`${c1.x}%`}
                y1={`${c1.y}%`}
                x2={`${c2.x}%`}
                y2={`${c2.y}%`}
                stroke="url(#syzygyGrad)"
                strokeWidth={1.5 + meanAct * 2.5}
                strokeDasharray="4,4"
                className="opacity-60"
              />
              <circle
                cx={`${(c1.x + c2.x) / 2}%`}
                cy={`${(c1.y + c2.y) / 2}%`}
                r={3 + meanAct * 2}
                fill="#f59e0b"
                className="opacity-75 animate-pulse"
              />
            </g>
          );
        })}

        {/* Outer Perimeter Flux Mesh */}
        <polygon
          points={`${ZONE_COORDS[0].x}%,${ZONE_COORDS[0].y}% ${ZONE_COORDS[1].x}%,${ZONE_COORDS[1].y}% ${ZONE_COORDS[3].x}%,${ZONE_COORDS[3].y}% ${ZONE_COORDS[7].x}%,${ZONE_COORDS[7].y}% ${ZONE_COORDS[9].x}%,${ZONE_COORDS[9].y}% ${ZONE_COORDS[8].x}%,${ZONE_COORDS[8].y}% ${ZONE_COORDS[6].x}%,${ZONE_COORDS[6].y}% ${ZONE_COORDS[2].x}%,${ZONE_COORDS[2].y}%`}
          fill="none"
          stroke="#44403c"
          strokeWidth="1"
          strokeDasharray="2,2"
          className="opacity-30"
        />

        <defs>
          <linearGradient id="syzygyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Interactive Zones */}
      {Object.entries(ZONE_COORDS).map(([idStr, coord]) => {
        const id = Number(idStr) as ZoneId;
        const zone = zones[id] || { activation: 0.5, deformationStress: 0.2, polarCharge: 0 };
        const isSelected = selectedZone === id;

        return (
          <button
            key={id}
            id={`zone-node-${id}`}
            onClick={() => onSelectZone(id)}
            style={{
              left: `${coord.x}%`,
              top: `${coord.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute group flex flex-col items-center justify-center transition-transform hover:scale-110 focus:outline-none z-10`}
          >
            {/* Zone Glow Aura */}
            <div
              style={{
                backgroundColor: coord.color,
                opacity: 0.15 + zone.activation * 0.35,
                transform: `scale(${1 + zone.activation * 0.5})`,
              }}
              className="absolute w-12 h-12 rounded-full blur-md transition-all duration-300 pointer-events-none"
            />

            {/* Zone Core Badge */}
            <div
              style={{
                borderColor: isSelected ? '#ffffff' : coord.color,
                boxShadow: isSelected ? `0 0 16px ${coord.color}` : 'none',
              }}
              className={`w-10 h-10 rounded-full border-2 bg-stone-900 flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all ${
                isSelected ? 'scale-110 ring-2 ring-white/60' : ''
              }`}
            >
              <span style={{ color: coord.color }}>{id}</span>
            </div>

            {/* Zone Tag */}
            <span className="text-[10px] font-mono text-stone-400 mt-1 whitespace-nowrap px-1.5 py-0.5 rounded bg-stone-950/80 border border-stone-800">
              {(zone.activation * 100).toFixed(0)}%
            </span>
          </button>
        );
      })}
    </div>
  );
};
