"use client";
import { useState, useEffect, useRef } from "react";
import Button from "./button";
import Card from "./card";

const PRESETS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "5 min break", value: 5 },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Props = {
  totalMins: number;
  setTotalMins: (n: number) => void;
  running: boolean;
  setRunning: (r: boolean) => void;
};

export default function Timer({ totalMins, setTotalMins, running, setRunning }: Props) {
  const [remaining, setRemaining] = useState(totalMins * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  const setPreset = (mins: number) => {
    setRunning(false);
    setTotalMins(mins);
    setRemaining(mins * 60);
  };

  const m = pad(Math.floor(remaining / 60));
  const s = pad(remaining % 60);

  return (
    <Card
      className="w-full md:mx-auto"
      classNameInner="justify-start gap-6"
      cont={
        <div>
          <div className="pb-8 border-b border-b-white/50 mb-6">
            <p className="text-7xl font-bold text-center tracking-widest">
              {m}:{s}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {PRESETS.map((p) => (
              <Button
                key={p.value}
                text={p.label}
                active
                solid={totalMins === p.value}
                onClick={() => setPreset(p.value)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}
