import aiohttp
import asyncio
import random
import json
import os
from datetime import datetime, timezone

def get_random_user_agent(file_path="UserAgent.txt"):
    with open(file_path, "r") as file:
        agents = [line.strip() for line in file if line.strip()]
    return random.choice(agents)

# Load flagged groups and reasons
def load_flagged_groups(file_path="Flagged_Groups.json"):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    return {}

# Save flagged user
def save_flagged_user(user_id, matched_groups, reason_codes=None, file_path="Flagged_Accounts.json"):
    if reason_codes is None:
        reason_codes = [0]

    # Ensure unique reason codes
    unique_reason_codes = list(set(reason_codes))

    # Load existing flagged accounts
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            data = {}
    else:
        data = {}

    data[str(user_id)] = {
        "reasons": unique_reason_codes,
        "friends_with": [],
        "in_groups": matched_groups,
        "is_banned": False,
        "flagged_on": datetime.now(timezone.utc).isoformat()
    }

    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)

# Main logic to check groups
async def check_scam_groups(user_id):
    user_agent = get_random_user_agent()
    headers = {
        "User-Agent": user_agent
    }

    url = f"https://groups.roblox.com/v1/users/{user_id}/groups/roles?includeLocked=true"

    flagged_groups_data = load_flagged_groups()
    flagged_group_ids = set(map(int, flagged_groups_data.keys()))

    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as response:
            if response.status != 200:
                print(f"Failed to fetch group data: {response.status}")
                return

            data = await response.json()
            matched_groups = []
            collected_reason_codes = []

            for group in data.get("data", []):
                group_id = group.get("group", {}).get("id")
                role_id = group.get("role", {}).get("id")

                if group_id in flagged_group_ids:
                    group_info = flagged_groups_data.get(str(group_id), {})
                    flagged_roles = group_info.get("roles", [])

                    if role_id in flagged_roles:
                        # Confirmed scam role
                        matched_groups.append(group_id)
                        collected_reason_codes.extend(group_info.get("reasons", []))
                    else:
                        # User is only a member, not in a flagged role
                        print(f"⚠️ User {user_id} is a **member** of flagged group {group_id} (Role ID: {role_id}) — Suspected only (Reason code 6: Suspicious Association)")

            if matched_groups:
                print(f"🚩 User {user_id} is in flagged group roles: {matched_groups}")
                save_flagged_user(user_id, matched_groups, reason_codes=collected_reason_codes)
            else:
                print(f"✅ User {user_id} is clean or only a suspected member.")

# Run with an example user
async def main():
    await check_scam_groups(74809603)

asyncio.run(main())