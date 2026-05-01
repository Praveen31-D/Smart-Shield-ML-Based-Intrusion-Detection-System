import asyncio
import ipaddress
import json
import sys
import os

OUTPUT_FILE = "scan_state.json"

class ZeroGravityScanner:
    """
    Zero-Gravity Recursive Network Scanner
    - Uses strict IPv4 Class logic (A, B, C, D, E)
    - Automatically regresses to a /24 subnet mask to optimize speed
    - Asynchronous execution to prevent stalling on non-responsive IPs
    - Lightweight self-updating JSON state structure
    """
    def __init__(self, target_ips):
        self.target_ips = target_ips
        # Internal file structure for lightweight state tracking
        self.state = {
            "up_ips": [],
            "scanned_subnets": [],
            "skipped_classes": []
        }
        self.scanned_ips = set()
        self.semaphore = asyncio.Semaphore(100)  # Concurrency limit to prevent stalling
        self.load_state()

    def load_state(self):
        if os.path.exists(OUTPUT_FILE):
            try:
                with open(OUTPUT_FILE, 'r') as f:
                    data = json.load(f)
                    self.state.update(data)
            except Exception:
                pass

    def save_state(self):
        """Updates its own internal file structure to be lightweight"""
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(self.state, f, indent=2)

    def validate_and_classify(self, ip_str: str):
        """Hardcoded IPv4 Class Definitions for strict validation"""
        try:
            ip = ipaddress.IPv4Address(ip_str)
            first_octet = int(str(ip).split('.')[0])
        except Exception:
            return "Invalid", None

        # Reserved & Loopback skip (e.g., 127.0.0.0/8)
        if first_octet == 0 or first_octet == 127:
            return "Reserved", None
            
        # Class A: 1.0.0.0 to 126.255.255.255
        if 1 <= first_octet <= 126:
            return "A", "255.0.0.0"
        # Class B: 128.0.0.0 to 191.255.255.255
        elif 128 <= first_octet <= 191:
            return "B", "255.255.0.0"
        # Class C: 192.0.0.0 to 223.255.255.255
        elif 192 <= first_octet <= 223:
            return "C", "255.255.255.0"
        # Class D: 224.0.0.0 to 239.255.255.255 (Multicast)
        elif 224 <= first_octet <= 239:
            return "D", None
        # Class E: 240.0.0.0 to 255.255.255.255 (Experimental)
        elif 240 <= first_octet <= 255:
            return "E", None
            
        return "Unknown", None

    async def is_up(self, ip_str: str) -> bool:
        """Asynchronous threading error-free execution via ping sweep"""
        if ip_str in self.scanned_ips:
            return False
        self.scanned_ips.add(ip_str)

        async with self.semaphore:
            # Minimal timeout parameter minimizes credit consumption
            cmd = ['ping', '-n', '1', '-w', '300', ip_str] if os.name == 'nt' else ['ping', '-c', '1', '-W', '1', ip_str]
            try:
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.DEVNULL,
                    stderr=asyncio.subprocess.DEVNULL
                )
                await proc.communicate()
                return proc.returncode == 0
            except Exception:
                return False

    async def check_and_recurse(self, ip_str: str):
        """Validates class, checks status, and triggers back-scanning regression"""
        ip_class, _ = self.validate_and_classify(ip_str)
        
        # Skip Multicast (D) and Experimental (E) unless explicitly instructed (not supported yet)
        if ip_class in ["Reserved", "D", "E", "Invalid"]:
            if ip_str not in self.state["skipped_classes"]:
                print(f"[-] Skipping {ip_str} (Class {ip_class})")
                self.state["skipped_classes"].append(ip_str)
                self.save_state()
            return

        if await self.is_up(ip_str):
            print(f"[+] Active Host Found: {ip_str} (Class {ip_class})")
            if ip_str not in self.state["up_ips"]:
                self.state["up_ips"].append(ip_str)
                self.save_state()
            
            # Regression Updates: 
            # Program regresses scanning parameters to default subnet mask (255.255.255.0) 
            # to optimize speed and avoid scanning entire Class A/B blocks.
            regressed_subnet = ipaddress.IPv4Network(f"{ip_str}/255.255.255.0", strict=False)
            subnet_str = str(regressed_subnet)
            
            if subnet_str not in self.state["scanned_subnets"]:
                print(f"[*] Regressing to /24 mask. Back-scanning localized subnet: {subnet_str}")
                self.state["scanned_subnets"].append(subnet_str)
                self.save_state()
                
                # Asynchronous thread spawning for recursive iteration
                asyncio.create_task(self.scan_subnet(regressed_subnet))

    async def scan_subnet(self, network: ipaddress.IPv4Network):
        """Recursive Iteration: Map neighbors in the localized block"""
        tasks = []
        for host in network.hosts():
            host_str = str(host)
            if host_str not in self.scanned_ips:
                tasks.append(self.check_and_recurse(host_str))
        
        if tasks:
            await asyncio.gather(*tasks)

    async def run(self):
        print("Initializing Zero-Gravity Recursive Scanner...")
        print("Validating seed targets and dispatching async probes...")
        
        initial_tasks = [self.check_and_recurse(ip) for ip in self.target_ips]
        await asyncio.gather(*initial_tasks)

        # Await any dynamically spawned back-scan tasks
        pending = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
        if pending:
            print(f"[*] Waiting for {len(pending)} back-scanning threads to collapse...")
            await asyncio.gather(*pending)
            
        print("\n[✓] Zero-Gravity Scan Complete.")
        print(f"Total Active Hosts Detected: {len(self.state['up_ips'])}")
        print(f"Lightweight state structure saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    # Supply IP seeds via arguments or fallback to default gateways
    seeds = sys.argv[1:] if len(sys.argv) > 1 else ["192.168.1.1", "10.0.0.1", "127.0.0.1", "224.0.0.1", "8.8.8.8"]
    
    scanner = ZeroGravityScanner(seeds)
    
    try:
        if sys.platform == 'win32':
            # Required for asyncio.create_subprocess_exec on Windows
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        asyncio.run(scanner.run())
    except KeyboardInterrupt:
        print("\n[!] Execution interrupted. State safely retained in JSON.")
