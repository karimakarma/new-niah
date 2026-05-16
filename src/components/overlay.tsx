import { useState, useEffect } from "react";

type Task = { name: string; done: boolean };

type Props = {
  niat: string;
  tasks: Task[];
  totalSecs: number;
  onTaskToggle: (index: number) => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Overlay({ niat, tasks: initialTasks, totalSecs, onTaskToggle }: Props) {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(totalSecs);
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const toggle = (i: number) => {
    setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));
    onTaskToggle(i);
  };

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const m = pad(Math.floor(remaining / 60));
  const s = pad(remaining % 60);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999999,
        width: 220,
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(15,15,15,0.75)",
        backdropFilter: "blur(12px)",
        border: "0.5px solid rgba(255,255,255,0.15)",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#1D9E75",
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {m}:{s}
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </div>

      {/* Accordion Body */}
      {open && (
        <div
          style={{
            borderTop: "0.5px solid rgba(255,255,255,0.1)",
            padding: "10px 14px 12px",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            NIAT
          </p>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 12,
              lineHeight: 1.4,
            }}
          >
            {niat}
          </p>

          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            CHECKLIST
          </p>

          {tasks.map((task, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: task.done ? "none" : "1.5px solid rgba(255,255,255,0.3)",
                  background: task.done ? "#1D9E75" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {task.done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: task.done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.75)",
                  textDecoration: task.done ? "line-through" : "none",
                  transition: "all 0.15s",
                }}
              >
                {task.name}
              </span>
            </div>
          ))}

          {/* Progress bar */}
          <div
            style={{
              height: 3,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 99,
              marginTop: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "#1D9E75",
                borderRadius: 99,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
