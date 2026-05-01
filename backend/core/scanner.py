"""
scanner.py — Active network mapping using Scapy.
ARP sweeps for host discovery + TCP SYN scanning for port states.
For educational/authorized network administration only.
"""

from scapy.all import ARP, Ether, srp, IP, TCP, sr1, ICMP
import asyncio
import logging

logging.getLogger("scapy.runtime").setLevel(logging.ERROR)

DEFAULT_PORTS = [22, 53, 80, 443, 3389, 8080]


def run_arp_sweep(subnet="192.168.1.0/24"):
    """Discover active IPs on subnet via ARP broadcast."""
    devices = []
    try:
        result, _ = srp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=subnet), timeout=2, verbose=False)
        devices = [{'ip': rcv.psrc, 'mac': rcv.hwsrc, 'status': 'active'} for _, rcv in result]
    except Exception as e:
        print(f"ARP Sweep Error: {e}")
    return devices


def _scan_single_port(target_ip: str, port: int) -> dict:
    """Synchronous single-port TCP SYN probe."""
    try:
        resp = sr1(IP(dst=target_ip)/TCP(dport=port, flags="S"), timeout=1, verbose=False)
        if resp is None:
            return {'port': port, 'state': 'filtered'}
        elif resp.haslayer(TCP):
            flags = resp.getlayer(TCP).flags
            if flags == 0x12:  # SYN-ACK → open
                sr1(IP(dst=target_ip)/TCP(dport=port, flags="R"), timeout=1, verbose=False)
                return {'port': port, 'state': 'open'}
            elif flags == 0x14:  # RST-ACK → closed
                return {'port': port, 'state': 'closed'}
        elif resp.haslayer(ICMP):
            if int(resp.getlayer(ICMP).type) == 3 and int(resp.getlayer(ICMP).code) in [1,2,3,9,10,13]:
                return {'port': port, 'state': 'filtered'}
    except Exception as e:
        return {'port': port, 'state': 'error', 'detail': str(e)}
    return {'port': port, 'state': 'unknown'}


async def async_tcp_syn_scan(target_ip: str, ports: list[int] = DEFAULT_PORTS) -> list[dict]:
    """Parallel TCP SYN scan via asyncio.gather + run_in_executor."""
    loop = asyncio.get_event_loop()
    tasks = [loop.run_in_executor(None, _scan_single_port, target_ip, port) for port in ports]
    results = await asyncio.gather(*tasks)
    return sorted(results, key=lambda r: r['port'])


def run_tcp_syn_scan(target_ip: str, ports: list[int] = DEFAULT_PORTS) -> list[dict]:
    """Legacy synchronous scan (backward compat). Prefer async_tcp_syn_scan."""
    return [_scan_single_port(target_ip, port) for port in ports]
