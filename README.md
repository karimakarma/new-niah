# Focus Tab Extension

## Overview
Focus Tab is a Chrome extension designed to help you stay focused by controlling access to websites based on customizable whitelist and blacklist rules. When activated, it blocks or marks unlisted sites, encouraging productive browsing sessions.

## Features
- **Whitelist and Blacklist Management:** Define which sites are allowed (whitelist) and which are blocked (blacklist).
- **Unlisted Site Handling:** Sites not on either list show a distinct "Unlisted Site" message with options to add them to whitelist or blacklist.
- **Overlay Widget:** Displays a draggable timer and task list to help you track your focus session.
- **Session Control:** Automatically stops the session when the timer ends.
- **Easy Controls:** Pause, stop, and manage your focus session directly from the overlay.

## How It Works
- When the extension is running, it checks the current site's hostname against your whitelist and blacklist.
- If the site is whitelisted, the overlay widget appears, showing your focus timer and tasks.
- If the site is blacklisted, the page is blocked with a "Blocked" message.
- If the site is neither, it shows an "Unlisted Site" message with options to add it to your lists.

## Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the extension folder.
5. The extension will be installed and ready to use.

## Usage
- Start a focus session by setting a timer and optionally adding tasks and a motivation note ("niat").
- Visit websites; the extension will enforce your whitelist and blacklist rules.
- On unlisted sites, use the provided buttons to add them to your whitelist or blacklist.
- Use the overlay controls to pause or stop your session anytime.

## Storage
The extension uses `chrome.storage.local` to save:
- `running`: Whether a focus session is active.
- `whitelist`: Array of allowed hostnames.
- `blacklist`: Array of blocked hostnames.
- `endTime`: Timestamp when the session ends.
- `niat`: Motivation or intention note.
- `todos`: List of tasks for the session.

## Development
- The main logic is in the content script, which injects the overlay and manages site blocking.
- The overlay is draggable and updates every second to show remaining time.
- Adding sites to whitelist or blacklist updates storage and reloads or updates the UI accordingly.

## Contributing
Feel free to fork and submit pull requests. Please ensure your code is clean and well-documented.
Alternatively, you can file a feedback or suggestion in the following form:
https://forms.gle/4FpK2971zMpxfkCZA

## License
MIT License

---

Stay focused. Block distractions. Get things done.
