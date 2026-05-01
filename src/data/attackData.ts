// Attack type definitions and sample data for the IDS-ML project

export interface AttackSample {
  id: number;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: string;
  duration: number;
  bytes: number;
  packets: number;
  label: string;
}

export interface AttackType {
  name: string;
  severity: "critical" | "high" | "medium" | "low" | "safe";
  icon: string;
  description: string;
  technicalDetail: string;
  indicators: string[];
  samples: AttackSample[];
}

export const attackTypes: AttackType[] = [
  {
    name: "Normal",
    severity: "safe",
    icon: "✅",
    description: "Legitimate network traffic with no malicious intent.",
    technicalDetail: "Normal traffic follows expected protocol behavior, standard handshake sequences, and typical payload sizes for the services in use.",
    indicators: ["Standard TTL values", "Normal packet sizes", "Expected protocol behavior"],
    samples: [
      { id: 1, srcIp: "192.168.1.10", dstIp: "10.0.0.5", srcPort: 49152, dstPort: 80, protocol: "TCP", duration: 2.34, bytes: 1520, packets: 12, label: "Normal" },
      { id: 2, srcIp: "192.168.1.25", dstIp: "8.8.8.8", srcPort: 53421, dstPort: 53, protocol: "UDP", duration: 0.05, bytes: 128, packets: 2, label: "Normal" },
      { id: 3, srcIp: "10.0.0.15", dstIp: "172.16.0.1", srcPort: 22345, dstPort: 443, protocol: "TCP", duration: 15.67, bytes: 45230, packets: 89, label: "Normal" },
    ],
  },
  {
    name: "DoS",
    severity: "critical",
    icon: "🔴",
    description: "Denial of Service attacks that flood a target with traffic to overwhelm resources.",
    technicalDetail: "DoS attacks exploit protocol weaknesses (SYN flood, UDP amplification) or application layer vulnerabilities to exhaust server resources, bandwidth, or connection tables.",
    indicators: ["Extremely high packet rate", "Many half-open connections", "Abnormal traffic volume spikes"],
    samples: [
      { id: 1, srcIp: "45.33.32.156", dstIp: "192.168.1.100", srcPort: 0, dstPort: 80, protocol: "TCP", duration: 0.001, bytes: 60, packets: 1500, label: "DoS" },
      { id: 2, srcIp: "203.0.113.50", dstIp: "192.168.1.100", srcPort: 12345, dstPort: 53, protocol: "UDP", duration: 0.5, bytes: 512000, packets: 8000, label: "DoS" },
      { id: 3, srcIp: "198.51.100.23", dstIp: "192.168.1.100", srcPort: 0, dstPort: 443, protocol: "TCP", duration: 0.01, bytes: 44, packets: 3200, label: "DoS" },
    ],
  },
  {
    name: "Exploits",
    severity: "critical",
    icon: "🔴",
    description: "Attacks exploiting known software vulnerabilities to gain unauthorized access or execute code.",
    technicalDetail: "Exploit payloads target buffer overflows, SQL injection, RCE vulnerabilities in services like Apache, SMB, or SSH. Characterized by unusual payload patterns and shellcode signatures.",
    indicators: ["Unusual payload content", "Known exploit signatures", "Abnormal service responses"],
    samples: [
      { id: 1, srcIp: "10.40.85.30", dstIp: "192.168.1.50", srcPort: 41872, dstPort: 445, protocol: "TCP", duration: 0.12, bytes: 2048, packets: 5, label: "Exploits" },
      { id: 2, srcIp: "172.16.0.100", dstIp: "192.168.1.50", srcPort: 55123, dstPort: 8080, protocol: "TCP", duration: 0.34, bytes: 4096, packets: 8, label: "Exploits" },
      { id: 3, srcIp: "10.0.0.99", dstIp: "192.168.1.50", srcPort: 60001, dstPort: 22, protocol: "TCP", duration: 1.2, bytes: 3584, packets: 15, label: "Exploits" },
    ],
  },
  {
    name: "Reconnaissance",
    severity: "medium",
    icon: "🟡",
    description: "Network scanning and probing to discover hosts, open ports, and running services.",
    technicalDetail: "Reconnaissance uses techniques like SYN scans, ICMP sweeps, and service fingerprinting (Nmap-style) to map network topology and identify potential targets.",
    indicators: ["Sequential port scanning", "ICMP sweep patterns", "Multiple failed connections"],
    samples: [
      { id: 1, srcIp: "10.0.0.200", dstIp: "192.168.1.0/24", srcPort: 45000, dstPort: 22, protocol: "TCP", duration: 30.5, bytes: 2640, packets: 44, label: "Reconnaissance" },
      { id: 2, srcIp: "10.0.0.200", dstIp: "192.168.1.50", srcPort: 45001, dstPort: 0, protocol: "TCP", duration: 12.3, bytes: 6600, packets: 110, label: "Reconnaissance" },
      { id: 3, srcIp: "10.0.0.200", dstIp: "192.168.1.0/24", srcPort: 0, dstPort: 0, protocol: "ICMP", duration: 5.0, bytes: 3840, packets: 60, label: "Reconnaissance" },
    ],
  },
  {
    name: "Fuzzers",
    severity: "high",
    icon: "🔴",
    description: "Fuzzing attacks sending malformed or random data to crash applications or discover vulnerabilities.",
    technicalDetail: "Fuzzers generate semi-random inputs targeting protocol parsers, file format handlers, and API endpoints. Aims to trigger crashes, memory leaks, or unexpected behaviors.",
    indicators: ["Malformed protocol headers", "Random payload data", "Rapid request variations"],
    samples: [
      { id: 1, srcIp: "172.16.5.10", dstIp: "192.168.1.30", srcPort: 33000, dstPort: 80, protocol: "TCP", duration: 0.8, bytes: 8192, packets: 25, label: "Fuzzers" },
      { id: 2, srcIp: "172.16.5.10", dstIp: "192.168.1.30", srcPort: 33001, dstPort: 21, protocol: "TCP", duration: 1.5, bytes: 12288, packets: 40, label: "Fuzzers" },
      { id: 3, srcIp: "172.16.5.10", dstIp: "192.168.1.30", srcPort: 33002, dstPort: 443, protocol: "TCP", duration: 2.1, bytes: 16384, packets: 55, label: "Fuzzers" },
    ],
  },
  {
    name: "Generic",
    severity: "high",
    icon: "🔴",
    description: "Generic attack patterns that don't fit specific categories but exhibit malicious characteristics.",
    technicalDetail: "Generic attacks include broad-spectrum techniques like credential stuffing, brute force attempts, and protocol abuse that span multiple attack vectors.",
    indicators: ["Repeated failed auth attempts", "Protocol anomalies", "Unusual traffic patterns"],
    samples: [
      { id: 1, srcIp: "203.0.113.100", dstIp: "192.168.1.10", srcPort: 50000, dstPort: 22, protocol: "TCP", duration: 45.0, bytes: 5600, packets: 200, label: "Generic" },
      { id: 2, srcIp: "203.0.113.100", dstIp: "192.168.1.10", srcPort: 50001, dstPort: 3389, protocol: "TCP", duration: 60.0, bytes: 7200, packets: 300, label: "Generic" },
      { id: 3, srcIp: "203.0.113.101", dstIp: "192.168.1.10", srcPort: 50002, dstPort: 8080, protocol: "TCP", duration: 30.0, bytes: 4800, packets: 150, label: "Generic" },
    ],
  },
  {
    name: "Backdoor",
    severity: "critical",
    icon: "🔴",
    description: "Unauthorized access channels that bypass normal authentication to maintain persistent access.",
    technicalDetail: "Backdoors establish covert communication channels using reverse shells, RATs (Remote Access Trojans), or modified services. Often use encrypted C2 channels on non-standard ports.",
    indicators: ["Connections to unusual ports", "Encrypted traffic on non-standard ports", "Periodic beaconing patterns"],
    samples: [
      { id: 1, srcIp: "192.168.1.50", dstIp: "45.77.65.211", srcPort: 49999, dstPort: 4444, protocol: "TCP", duration: 3600, bytes: 2048, packets: 30, label: "Backdoor" },
      { id: 2, srcIp: "192.168.1.50", dstIp: "185.220.101.1", srcPort: 50000, dstPort: 8443, protocol: "TCP", duration: 7200, bytes: 4096, packets: 50, label: "Backdoor" },
      { id: 3, srcIp: "192.168.1.50", dstIp: "91.121.87.10", srcPort: 50001, dstPort: 31337, protocol: "TCP", duration: 1800, bytes: 1024, packets: 20, label: "Backdoor" },
    ],
  },
  {
    name: "Shellcode",
    severity: "critical",
    icon: "🔴",
    description: "Injection of executable shellcode to gain system-level access on the target machine.",
    technicalDetail: "Shellcode payloads are position-independent machine code injected via buffer overflows or code injection. Often contains NOP sleds, syscalls for spawning shells, and encoded payloads.",
    indicators: ["NOP sled patterns (0x90)", "Suspicious binary payloads", "Code execution after overflow"],
    samples: [
      { id: 1, srcIp: "10.10.14.5", dstIp: "192.168.1.40", srcPort: 42000, dstPort: 139, protocol: "TCP", duration: 0.05, bytes: 1024, packets: 3, label: "Shellcode" },
      { id: 2, srcIp: "10.10.14.5", dstIp: "192.168.1.40", srcPort: 42001, dstPort: 445, protocol: "TCP", duration: 0.08, bytes: 2048, packets: 4, label: "Shellcode" },
      { id: 3, srcIp: "10.10.14.5", dstIp: "192.168.1.40", srcPort: 42002, dstPort: 8080, protocol: "TCP", duration: 0.12, bytes: 4096, packets: 6, label: "Shellcode" },
    ],
  },
  {
    name: "Analysis",
    severity: "medium",
    icon: "🟡",
    description: "Traffic analysis attacks that monitor and analyze network communications to extract information.",
    technicalDetail: "Analysis attacks passively or actively inspect traffic metadata (timing, packet sizes, flow patterns) to infer communication patterns, user behavior, or encrypted content.",
    indicators: ["Passive monitoring signatures", "Traffic correlation patterns", "Metadata extraction behavior"],
    samples: [
      { id: 1, srcIp: "192.168.1.200", dstIp: "192.168.1.1", srcPort: 0, dstPort: 0, protocol: "ICMP", duration: 120, bytes: 9600, packets: 150, label: "Analysis" },
      { id: 2, srcIp: "192.168.1.200", dstIp: "192.168.1.0/24", srcPort: 0, dstPort: 0, protocol: "ARP", duration: 60, bytes: 4200, packets: 100, label: "Analysis" },
      { id: 3, srcIp: "192.168.1.200", dstIp: "192.168.1.50", srcPort: 51000, dstPort: 80, protocol: "TCP", duration: 300, bytes: 15000, packets: 250, label: "Analysis" },
    ],
  },
  {
    name: "Worms",
    severity: "critical",
    icon: "🔴",
    description: "Self-propagating malware that spreads across networks without user interaction.",
    technicalDetail: "Worms exploit network vulnerabilities to replicate across hosts. They scan for vulnerable systems, exploit known CVEs, and propagate payloads. Can cause network congestion and system compromise.",
    indicators: ["Rapid lateral movement", "Identical exploit patterns across hosts", "Exponential connection growth"],
    samples: [
      { id: 1, srcIp: "192.168.1.100", dstIp: "192.168.1.101", srcPort: 445, dstPort: 445, protocol: "TCP", duration: 0.3, bytes: 8192, packets: 10, label: "Worms" },
      { id: 2, srcIp: "192.168.1.101", dstIp: "192.168.1.102", srcPort: 445, dstPort: 445, protocol: "TCP", duration: 0.3, bytes: 8192, packets: 10, label: "Worms" },
      { id: 3, srcIp: "192.168.1.102", dstIp: "192.168.1.103", srcPort: 445, dstPort: 445, protocol: "TCP", duration: 0.3, bytes: 8192, packets: 10, label: "Worms" },
    ],
  },
];

export const severityColors: Record<string, string> = {
  critical: "text-destructive",
  high: "text-warning",
  medium: "text-accent",
  low: "text-muted-foreground",
  safe: "text-success",
};

export const severityBgColors: Record<string, string> = {
  critical: "bg-destructive/10 border-destructive/30",
  high: "bg-warning/10 border-warning/30",
  medium: "bg-accent/10 border-accent/30",
  low: "bg-muted/10 border-muted/30",
  safe: "bg-success/10 border-success/30",
};
