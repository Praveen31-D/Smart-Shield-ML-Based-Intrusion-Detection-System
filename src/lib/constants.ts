/**
 * constants.ts — Single source of truth for shared IDS-ML constants & utilities.
 * Eliminates 4× severity map duplication, 3× randomIp, 2× PROTOCOLS, 4× risk calc.
 */

export type Severity = "safe" | "medium" | "high" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Attack label → severity mapping (was duplicated in OperationsPage, LiveCaptureSimulator, reportGenerator, ml_pipeline) */
export const SEVERITY_MAP: Record<string, Severity> = {
  Normal: "safe",
  Reconnaissance: "medium",
  Analysis: "medium",
  Fuzzers: "high",
  Generic: "high",
  DoS: "critical",
  Exploits: "critical",
  Backdoor: "critical",
  Shellcode: "critical",
  Worms: "critical",
};

/** CSS classes for severity text color */
export const severityTextClass: Record<string, string> = {
  safe: "severity-safe",
  medium: "severity-medium",
  high: "severity-high",
  critical: "severity-critical",
};

/** Network protocols used in flow simulation */
export const PROTOCOLS = ["TCP", "UDP", "ICMP"] as const;

/** Generate a random valid IPv4 address */
export const randomIp = (): string =>
  `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 253) + 1}`;

/** Calculate risk level from attack ratio (thresholds match backend ml_pipeline) */
export const calcRisk = (ratio: number): RiskLevel =>
  ratio > 0.5 ? "critical" : ratio > 0.3 ? "high" : ratio > 0.1 ? "medium" : "low";

/** Format a Date to local ISO string (YYYY-MM-DD HH:MM:SS) */
export const toLocalIso = (date: Date): string => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};
