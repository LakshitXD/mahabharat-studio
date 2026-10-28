import React from "react";
import type { ActorProps, CharacterDef, Mood, Registry, SetDef, SetProps } from "../shared/contract";

// Placeholder look so the player can be built and tested before src/m/ lands.
// Every shape is labelled STUB and shows the state the player hands it.

const HEIGHT = 520;

const SKY: Record<Mood, [string, string]> = {
  day: ["#9cc3d8", "#e8dcc0"],
  evening: ["#c9785a", "#f0c48a"],
  night: ["#0e1830", "#2b3a5c"],
};

const StubBank: React.FC<SetProps> = ({ mood, frame }) => {
  const [top, bottom] = SKY[mood];
  return (
    <g>
      <defs>
        <linearGradient id="stub-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#stub-sky)" />
      <rect y={560} width={1920} height={260} fill="#5d8fa3" />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={((frame * 2 + i * 340) % 2200) - 200} x2={((frame * 2 + i * 340) % 2200) - 60} y1={600 + i * 35} y2={600 + i * 35} stroke="#cfe3ea" strokeWidth={4} />
      ))}
      <rect y={820} width={1920} height={260} fill="#b39a6e" />
      <line y1={886} y2={886} x2={1920} stroke="#7a6440" strokeWidth={2} strokeDasharray="12 10" />
      <text x={40} y={70} fontSize={40} fontFamily="monospace" fill="#222">STUB SET ganga-tat ({mood}) groundY 0.82</text>
      {[0.25, 0.5, 0.75].map((f) => (
        <text key={f} x={f * 1920} y={1060} fontSize={26} fontFamily="monospace" fill="#3a2e1c" textAnchor="middle">x={f}</text>
      ))}
    </g>
  );
};

const StubReeds: React.FC<SetProps> = ({ frame }) => (
  <g>
    {[60, 110, 1800, 1850].map((x, i) => (
      <path key={x} d={`M${x},1080 Q${x + 10 + Math.sin((frame + i * 20) / 25) * 12},960 ${x + 20},880`} stroke="#3f5a2c" strokeWidth={10} fill="none" />
    ))}
  </g>
);

function stubCharacter(id: string, color: string): CharacterDef {
  const Component: React.FC<ActorProps> = (p) => {
    const swing = p.pose === "walk" ? Math.sin(p.walkPhase * Math.PI * 2) * 28 : 0;
    const lean = p.pose === "bow" ? 24 : 0;
    const armAngle = { point: -80, offer: -40, talk: -20, think: -130 }[p.pose as string] ?? 10;
    const bob = Math.sin(p.frame / 20) * 3;
    return (
      <g>
        <line x1={-20 + swing * 2} y1={0} x2={-20} y2={-200} stroke={color} strokeWidth={22} strokeLinecap="round" />
        <line x1={20 - swing * 2} y1={0} x2={20} y2={-200} stroke={color} strokeWidth={22} strokeLinecap="round" />
        <g transform={`rotate(${lean} 0 -200) translate(0 ${bob})`}>
          <rect x={-55} y={-410} width={110} height={220} rx={40} fill={color} />
          <line x1={30} y1={-390} x2={130} y2={-390} stroke={color} strokeWidth={20} strokeLinecap="round" transform={`rotate(${armAngle} 30 -390)`} />
          <circle cx={0} cy={-460} r={58} fill="#f1d3b0" stroke={color} strokeWidth={6} />
          <ellipse cx={26} cy={-472} rx={9} ry={9 * (1 - p.blink) + 1} fill="#222" />
          <ellipse cx={30} cy={-432} rx={16} ry={2 + 16 * p.mouth} fill="#7a1f1f" />
        </g>
        <g transform={p.facing === "left" ? "scale(-1 1)" : undefined}>
          <text y={-HEIGHT - 50} textAnchor="middle" fontSize={30} fontFamily="monospace" fill="#111">STUB {id}{p.variant ? `/${p.variant}` : ""}</text>
          <text y={-HEIGHT - 16} textAnchor="middle" fontSize={22} fontFamily="monospace" fill="#111">
            {p.pose} {p.expression} {p.viseme} m{p.mouth.toFixed(2)} b{p.blink.toFixed(1)} w{p.walkPhase.toFixed(2)}
          </text>
        </g>
      </g>
    );
  };
  return { id, Component, height: HEIGHT };
}

const bank: SetDef = { id: "ganga-tat", Back: StubBank, Front: StubReeds, groundY: 0.82, actorScale: 1 };

export const registry: Registry = {
  characters: {
    ganga: stubCharacter("ganga", "#2f7f86"),
    shantanu: stubCharacter("shantanu", "#b8862f"),
  },
  sets: { "ganga-tat": bank },
};
