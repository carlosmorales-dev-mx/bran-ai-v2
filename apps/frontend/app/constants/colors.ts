export const C = {
  bg: "#f2f4fb",
  surface: "#ffffff",
  card: "#ffffff",
  cardAlt: "#f7f8fe",

  border: "#e4e8f5",
  borderHi: "#c8d0ec",

  crimson: "#b91c3a",
  crimsonMid: "#dc2d50",
  crimsonLight: "#f43f5e",
  crimsonDim: "rgba(185,28,58,0.08)",
  crimsonGlow: "rgba(185,28,58,0.18)",

  blue: "#2d5be3",
  blueMid: "#4169e8",
  blueDim: "rgba(45,91,227,0.08)",
  blueGlow: "rgba(45,91,227,0.14)",

  yellow: "#c97a06",
  yellowDim: "rgba(201,122,6,0.10)",

  green: "#16955a",
  greenDim: "rgba(22,149,90,0.09)",

  tx: "#1a1d35",
  txS: "#5a6180",
  txM: "#9ba3bf",

  mono: "'DM Mono', monospace",

  shadow: "0 1px 3px rgba(26,29,53,0.07),0 4px 16px rgba(26,29,53,0.05)",
  shadowMd: "0 4px 24px rgba(26,29,53,0.10),0 1px 4px rgba(26,29,53,0.06)",
  shadowLg: "0 12px 48px rgba(26,29,53,0.14),0 2px 8px rgba(26,29,53,0.08)",
};

export const inputStyle = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: "9px",
  padding: "11px 14px",
  color: C.tx,
  fontSize: "13px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, box-shadow 0.2s",
};
