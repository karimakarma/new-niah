chrome.storage.local.get(
  ["running", "whitelist", "blacklist", "endTime", "niat", "todos"],
  (data) => {
    if (!data.running) return;
    if (Date.now() > data.endTime) {
      chrome.storage.local.set({ running: false });
      return;
    }

    const host = location.hostname;
    const whitelist = [...(data.whitelist || []), "google.com"];
    const blacklist = data.blacklist || [];

    const inWhitelist = whitelist.some((s) => host === s || host.endsWith(`.${s}`));
    const inBlacklist = blacklist.some((s) => host === s || host.endsWith(`.${s}`));

    if (inBlacklist) {
      showBlocked(host, false);
      return;
    } else if (inWhitelist) {
      runInjectOverlay(data);
      return;
    } else showBlocked(host, true);
  },
);

function runInjectOverlay(data) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    injectOverlay(data);
  } else {
    window.addEventListener("DOMContentLoaded", () => injectOverlay(data));
  }
}

function showBlocked(host, unlisted) {
  document.body.innerHTML = "";
  document.body.style.cssText = "margin:0;padding:0;";

  const wrap = document.createElement("div");
  wrap.style.cssText = `
    position:fixed;inset:0;background:#0a0a0a;color:#fff;
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;font-family:sans-serif;z-index:99999;gap:8px;
  `;

  wrap.innerHTML = `
    <p style="font-size:64px;margin:0">🚫</p>
    <h1 style="font-size:2rem;font-weight:600;margin:0 0 4px">${unlisted ? "Unlisted Site" : "Blocked"}</h1>
    <p style="opacity:0.5;margin:0 0 24px">${unlisted ? "This site is not on your list." : "You're supposed to be focusing."}</p>
    <button id="go-back" style="padding:8px 20px;border-radius:99px;border:1px solid rgba(255,255,255,0.3);background:transparent;color:white;cursor:pointer;font-size:14px;">Go back</button>
    ${
      unlisted
        ? `
    <button id="add-white" style="padding:8px 20px;border-radius:99px;border:1px solid rgba(255,255,255,0.3);background:transparent;color:white;cursor:pointer;font-size:14px;">Add to whitelist</button>
    <button id="add-black" style="padding:8px 20px;border-radius:99px;border:1px solid rgba(255,255,255,0.3);background:transparent;color:white;cursor:pointer;font-size:14px;">Add to blacklist</button>
    `
        : ""
    }
  `;

  document.body.appendChild(wrap);

  document.getElementById("go-back").onclick = () => history.back();

  if (unlisted) {
    document.getElementById("add-white").onclick = () => {
      chrome.storage.local.get(["whitelist"], (d) => {
        const newWhitelist = [...(d.whitelist || []), host];
        chrome.storage.local.set({ whitelist: newWhitelist }, () => {
          // confirmed saved, now reload
          location.reload();
        });
      });
    };
    document.getElementById("add-black").onclick = () => {
      chrome.storage.local.get(["blacklist"], (d) => {
        const newBlacklist = [...(d.blacklist || []), host];
        chrome.storage.local.set({ blacklist: newBlacklist }, () => {
          showBlocked(host, false);
        });
      });
    };
  }
}

function injectOverlay(data) {
  let secs = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
  let open = false;
  let todos = (data.todos || []).map((t) => ({ ...t }));
  let paused = false;

  const widget = document.createElement("div");
  widget.id = "tab-baru-overlay";
  widget.style.cssText = `
    position:fixed;top:20px;left:20px;z-index:2147483647;
    width:240px;border-radius:16px;overflow:hidden;
    background:rgba(15,15,15,0.75);backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
    border:0.5px solid rgba(255,255,255,0.15);color:#fff;
    font-family:sans-serif;
    cursor: grab;
  `;

  // Make widget draggable
  widget.style.cursor = "grab";
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  widget.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - widget.getBoundingClientRect().left;
    offsetY = e.clientY - widget.getBoundingClientRect().top;
    widget.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    widget.style.cursor = "grab";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    // Keep widget inside viewport
    const maxLeft = window.innerWidth - widget.offsetWidth;
    const maxTop = window.innerHeight - widget.offsetHeight;
    left = Math.min(Math.max(0, left), maxLeft);
    top = Math.min(Math.max(0, top), maxTop);

    widget.style.left = left + "px";
    widget.style.top = top + "px";
    widget.style.right = "auto"; // disable right to allow left positioning
    widget.style.bottom = "auto"; // disable bottom to allow top positioning
  });

  function saveTodos() {
    chrome.storage.local.set({ todos });
  }

  function renderTodos() {
    return todos
      .map(
        (t, i) => `
      <div data-todo="${i}" style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;">
        <div style="width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
          ${t.done ? "background:#1D9E75;border:none;" : "border:1.5px solid rgba(255,255,255,0.3);background:transparent;"}">
          ${t.done ? '<span style="font-size:10px;color:#fff;">✓</span>' : ""}
        </div>
        <span style="font-size:12px;${t.done ? "text-decoration:line-through;color:rgba(255,255,255,0.35);" : "color:rgba(255,255,255,0.75);"}">${t.task}</span>
      </div>
    `,
      )
      .join("");
  }

  function render() {
    const done = todos.filter((t) => t.done).length;
    const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

    widget.innerHTML = `
      <div id="baru-header" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;user-select:none;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:7px;height:7px;border-radius:50%;background:#1D9E75;"></div>
          <span id="timer-display" style="font-size:22px;font-weight:500;letter-spacing:1px;font-variant-numeric:tabular-nums;"></span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button id="pause-btn" style="background:none;border:none;color:#fff;cursor:pointer;font-size:14px;">⏸️</button>
          <button id="stop-btn" style="background:none;border:none;color:#fff;cursor:pointer;font-size:14px;">⏹️</button>
          <span style="font-size:14px;color:rgba(255,255,255,0.5);display:inline-block;transform:${open ? "rotate(180deg)" : "rotate(0)"};transition:transform .25s;cursor:pointer;">▾</span>
        </div>
      </div>
      ${
        open
          ? `
      <div style="border-top:0.5px solid rgba(255,255,255,0.1);padding:10px 14px 12px;">
        <p style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:.06em;margin:0 0 4px;">NIAT</p>
        <p style="font-size:13px;color:rgba(255,255,255,0.85);margin:0 0 12px;line-height:1.4;">${data.niat || "No niat set"}</p>
        ${
          todos.length
            ? `
        <p style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:.06em;margin:0 0 6px;">TO-DO</p>
        <div id="baru-todos">${renderTodos()}</div>
        <div style="height:3px;background:rgba(255,255,255,0.1);border-radius:99px;margin-top:10px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:#1D9E75;border-radius:99px;transition:width .3s;"></div>
        </div>
        `
            : ""
        }
      </div>`
          : ""
      }
    `;

    const timerDisplay = widget.querySelector("#timer-display");
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    timerDisplay.textContent = `${m}:${s}`;

    const pauseBtn = widget.querySelector("#pause-btn");
    const stopBtn = widget.querySelector("#stop-btn");

    pauseBtn.onclick = () => {
      paused = !paused;
      pauseBtn.textContent = paused ? "▶️" : "⏸️";
    };

    stopBtn.onclick = () => {
      clearInterval(interval);
      chrome.storage.local.set({ running: false });
      widget.remove();
    };
  }

  render();
  document.body.appendChild(widget);

  const interval = setInterval(() => {
    if (!paused) {
      if (secs > 0) {
        secs--;
        const timerDisplay = widget.querySelector("#timer-display");
        const m = String(Math.floor(secs / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        timerDisplay.textContent = `${m}:${s}`;
      } else {
        clearInterval(interval);
        chrome.storage.local.set({ running: false });
        widget.remove();
      }
    }
  }, 1000);
}
