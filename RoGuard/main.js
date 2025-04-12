const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Eagisa/RoShield/refs/heads/main/Flagged_Accounts.json";

const REASON_CODES = {
    0: "No Violations",
    1: "Phishing Activity",
    2: "Predatory Behavior",
    3: "Excessive Spamming",
    4: "Suspicious Connections",
    5: "Suspicious Account is Too New",
    6: "Member of a Group Flagged for Scam Activity"
};

async function fetchFlaggedData() {
    try {
        const response = await fetch(GITHUB_JSON_URL);
        return await response.json();
    } catch (e) {
        console.error("Failed to load flagged accounts JSON:", e);
        return {};
    }
}

function injectMessages(flaggedData) {
    const cards = document.querySelectorAll("li.avatar-card");

    cards.forEach(card => {
        if (card.querySelector(".alert-icon")) return;

        const profileLink = card.querySelector("a[href*='/users/'][href*='/profile']");
        let userId = null;

        if (profileLink) {
            const match = profileLink.href.match(/\/users\/(\d+)\//);
            if (match) {
                userId = match[1];
            }
        }

        if (!userId || !(userId in flaggedData)) return;

        const userInfo = flaggedData[userId];
        const reasonDescriptions = userInfo.reasons
            .map(code => REASON_CODES[code])
            .filter(Boolean);

        const alertIcon = document.createElement("div");
        alertIcon.className = "alert-icon";
        alertIcon.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #ff4d4d;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            cursor: pointer;
            z-index: 1000;
            font-size: 14px;
        `;
        alertIcon.innerText = "!";

        const tooltip = document.createElement("div");
        tooltip.className = "custom-tooltip";
        tooltip.innerHTML = `
            <strong>⚠️ Flagged Account</strong><br><br>
            <strong>• Reason(s) :</strong><br>
            ${reasonDescriptions.map(reason => `&nbsp;&nbsp;- ${reason}`).join("<br>")}
        `;
        tooltip.style.cssText = `
            position: absolute;
            bottom: 130%;
            left: 50%;
            transform: translateX(-50%);
            background: #1e1e1e;
            color: #ffcccc;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            white-space: normal;
            display: none;
            z-index: 2000;
            text-align: left;
            width: max-content;
            max-width: 250px;
        `;

        const arrow = document.createElement("div");
        arrow.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #1e1e1e;
        `;
        tooltip.appendChild(arrow);

        alertIcon.addEventListener("mouseenter", () => {
            tooltip.style.display = "block";
        });

        alertIcon.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        alertIcon.appendChild(tooltip);
        card.style.position = "relative";
        card.appendChild(alertIcon);
    });
}

// ✅ KEEPING this function exactly as requested
function injectIntoProfilePage(flaggedData) {
    const match = window.location.pathname.match(/\/users\/(\d+)\/profile/);
    if (!match) return;
    const userId = match[1];

    if (!(userId in flaggedData)) return;

    const reasonDescriptions = flaggedData[userId].reasons
        .map(code => REASON_CODES[code])
        .filter(Boolean);

    const icon = document.createElement("div");
    icon.className = "alert-icon";
    icon.innerText = "!";
    icon.style.cssText = `
        background-color: #ff4d4d;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        position: relative;
        z-index: 10;
        margin-left: 10px;
    `;

    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.innerHTML = `
        <strong>⚠️ Flagged Account</strong><br><br>
        <strong>• Reason(s) :</strong><br>
        ${reasonDescriptions.map(reason => `&nbsp;&nbsp;- ${reason}`).join("<br>")}
    `;
    tooltip.style.cssText = `
        position: absolute;
        top: 130%; /* bottom positioning */
        left: 50%;
        transform: translateX(-50%);
        background: #1e1e1e;
        color: #ffcccc;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        white-space: normal;
        display: none;
        z-index: 2000;
        text-align: left;
        width: max-content;
        max-width: 250px;
    `;

    const arrow = document.createElement("div");
    arrow.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #1e1e1e;
    `;
    tooltip.appendChild(arrow);

    icon.appendChild(tooltip);

    icon.addEventListener("mouseenter", () => {
        tooltip.style.display = "block";
    });

    icon.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });

    const interval = setInterval(() => {
        const displayNameEl = document.querySelector(".web-blox-css-tss-1sr4lqx-Typography-h1-Typography-root");

        if (displayNameEl && !displayNameEl.parentElement.querySelector(".alert-icon")) {
            const badgeSpan = displayNameEl.parentElement.querySelector(".jss4");
            if (badgeSpan) {
                badgeSpan.insertAdjacentElement("afterend", icon);
            } else {
                displayNameEl.insertAdjacentElement("afterend", icon);
            }
            clearInterval(interval);
        }
    }, 500);
}

// Shared utility to create alert icons with reasons
function createAlertIcon(reasonDescriptions) {
    const icon = document.createElement("div");
    icon.className = "alert-icon";
    icon.innerText = "!";
    icon.style.cssText = `
        background-color: #ff4d4d;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        position: relative;
        z-index: 10;
    `;

    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.innerHTML = `
        <strong>⚠️ Flagged Account</strong><br><br>
        <strong>• Reason(s) :</strong><br>
        ${reasonDescriptions.map(reason => `&nbsp;&nbsp;- ${reason}`).join("<br>")}
    `;
    tooltip.style.cssText = `
        position: absolute;
        bottom: 130%;
        left: 50%;
        transform: translateX(-50%);
        background: #1e1e1e;
        color: #ffcccc;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        white-space: normal;
        display: none;
        z-index: 2000;
        text-align: left;
        width: max-content;
        max-width: 250px;
    `;

    const arrow = document.createElement("div");
    arrow.style.cssText = `
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #1e1e1e;
    `;

    tooltip.appendChild(arrow);

    icon.addEventListener("mouseenter", () => {
        tooltip.style.display = "block";
    });

    icon.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });

    icon.appendChild(tooltip);
    return icon;
}

// Fetch and apply injections
fetchFlaggedData().then(flaggedData => {
    injectIntoProfilePage(flaggedData);

    const interval = setInterval(() => injectMessages(flaggedData), 1000);
    let runCount = 0;
    const maxRuns = 20;

    const observer = new MutationObserver(() => injectMessages(flaggedData));
    observer.observe(document.body, { childList: true, subtree: true });

    const stopAfterLimit = setInterval(() => {
        if (++runCount >= maxRuns) clearInterval(interval);
    }, 1000);
});