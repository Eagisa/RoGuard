import requests
import concurrent.futures

# Load proxies
with open("Working_Proxies.txt", "r") as f:
    proxies = [line.strip() for line in f if ':' in line]

# Function to check one proxy
def check_proxy(proxy):
    proxy_dict = {
        "http": f"http://{proxy}",
        "https": f"http://{proxy}"
    }
    try:
        response = requests.get("https://httpbin.org/ip", proxies=proxy_dict, timeout=5)
        if response.status_code == 200:
            print(f"[+] Working: {proxy} -> {response.json()['origin']}")
            return proxy
    except:
        pass
    print(f"[-] Dead: {proxy}")
    return None

# Use threading to speed up checking
working_proxies = []
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(check_proxy, proxies))
    working_proxies = [p for p in results if p]

# Save working proxies
with open("Working_Proxies.txt", "w") as f:
    for p in working_proxies:
        f.write(p + "\n")

print(f"\n✅ Done! {len(working_proxies)} working proxies saved to Working_Proxies.txt.")
