import Button from "./components/button";
import Card from "./components/card";
import { Dropdown, TextField } from "./components/input";
import Timer from "./components/timer";
import Notif from "./components/notifications";
import { useState, useEffect } from "react";
import Time from "./components/time";
import Search from "./components/search";

type StorageData = {
  running?: boolean;
  endTime?: number;
  whitelist?: string[];
};

export default function Home() {
  const [session, setSession] = useState(false);
  const [error, setError] = useState<string>("");
  const [niat, setNiat] = useState<string>("");
  const [totalMins, setTotalMins] = useState(25);
  const [running, setRunning] = useState(false);

  const handleStart = () => {
    if (!niat) {
      setError("Niat is required");
      return;
    }
    if (typeof chrome === "undefined" || !chrome.storage) return;

    chrome.storage.local.get(
      ["todos", "whitelist"],
      (data: { todos?: { task: string; done: boolean }[]; whitelist?: string[] }) => {
        const whitelist: string[] = [...(data.whitelist || []), "google.com"];

        chrome.storage.local.set({
          running: true,
          niat,
          todos: data.todos || [],
          endTime: Date.now() + totalMins * 60 * 1000,
        });

        // close all tabs then open whitelisted
        chrome.tabs.query({}, (tabs) => {
          const currentTab = tabs.find((t) => t.active);
          tabs.forEach((t) => {
            if (t.id && t.id !== currentTab?.id) chrome.tabs.remove(t.id);
          });

          whitelist.forEach((site) => {
            chrome.tabs.create({ url: `https://${site}` });
          });

          // close current tab last
          if (currentTab?.id) chrome.tabs.remove(currentTab.id);
        });
      },
    );

    setRunning(true);
    setSession(true);
  };

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;

    chrome.storage.local.get(["running", "endTime", "whitelist"], (data: StorageData) => {
      if (data.running && typeof data.endTime === "number" && Date.now() < data.endTime) {
        setSession(true);
      }
    });
  }, []);

  if (session) return <Search />;

  return (
    <div className="p-10 h-full flex flex-col">
      <Notif text={error} type="error" closeAction={() => setError("")} />
      <div className="text-center mb-8">
        <Time />
      </div>
      <Card
        className="md:w-160 md:mx-auto"
        classNameInner="justify-start gap-10"
        head={<h1 className="font-bold text-4xl">New Niah</h1>}
        cont={
          <div>
            <div className="pb-8 border-b border-b-white/50 mb-8">
              <p className="mb-4 text-lg">
                What's your <span className="italic font-bold">Niah</span>?<strong>*</strong>
              </p>
              <TextField
                placeholder="Finish my..."
                value={niat}
                onChange={(e) => setNiat(e.target.value)}
              />
            </div>
            <div className="pb-8 border-b border-b-white/50 mb-8">
              <p className="mb-4 text-lg">Timer</p>
              <Timer
                totalMins={totalMins}
                setTotalMins={setTotalMins}
                running={running}
                setRunning={setRunning}
              />
            </div>
            <div className="pb-8 border-b border-b-white/50 mb-8">
              <p className="mb-4 text-lg">
                Websites List<strong>*</strong>
              </p>
              <Card cont={<WebsitesList setError={setError} />} />
            </div>
            <div className="pb-8 border-b border-b-white/50 mb-8">
              <p className="mb-4 text-lg">To-do list</p>
              <Card cont={<TodoList setError={setError} />} />
            </div>
            <div className="pb-8 border-b border-b-white/50 mb-8">
              <p className="mb-4 text-lg">Description</p>
              <TextField placeholder="This is to..." long />
            </div>
            <div className="pb-8 border-b border-b-white/50 mb-8 flex justify-center">
              <Button
                className="text-2xl px-16 py-4"
                text="Start"
                solid
                active
                onClick={handleStart}
              />
            </div>
            <p className="text-sm">
              <strong>*</strong> = required
            </p>
          </div>
        }
      />
    </div>
  );
}

const WebsitesList = ({ setError }: { setError: React.Dispatch<React.SetStateAction<string>> }) => {
  const [site, setSite] = useState<string>("");
  const [mode, setMode] = useState<"whitelist" | "blacklist">("whitelist");
  const [list, setList] = useState<{ site: string; prohibited: boolean }[]>([]);

  // Load sites from storage on component mount
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;

    chrome.storage.local.get(["sites"], (data) => {
      if (data.sites) {
        setList(data.sites as { site: string; prohibited: boolean }[]);
      }
    });
  }, []);

  // Update storage whenever the list changes
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;

    chrome.storage.local.set({
      sites: list,
      whitelist: list.filter((s) => !s.prohibited).map((s) => s.site),
      blacklist: list.filter((s) => s.prohibited).map((s) => s.site),
    });
  }, [list]);

  const addSite = () => {
    if (!site) return;

    // Check for duplicates
    if (list.some((s) => s.site === site)) {
      setError(`Duplicate found for ${site}`);
      setSite("");
      return;
    }

    // Add the new site to the list
    setList((prev) => [...prev, { site, prohibited: mode === "blacklist" }]);
    setSite("");
  };

  return (
    <div>
      <div className="mb-4">
        {!list.length ? (
          <h2 className="text-xl font-bold">No websites yet...</h2>
        ) : (
          list.map((item, i) => (
            <Card
              className="first:rounded-t-xl last:rounded-b-xl rounded-none"
              key={i}
              cont={
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.prohibited
                          ? "bg-red-900/50 text-red-300"
                          : "bg-green-900/50 text-green-300"
                      }`}
                    >
                      {item.prohibited ? "blocked" : "allowed"}
                    </span>
                    <h1>{item.site}</h1>
                  </div>
                  <a
                    className="cursor-pointer"
                    onClick={() => setList((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    x
                  </a>
                </div>
              }
            />
          ))
        )}
      </div>
      <div className="relative">
        <TextField
          value={site}
          onChange={(e) => setSite(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addSite();
          }}
          placeholder="example.com"
        />
        <div className="absolute top-0 right-0 h-full flex gap-2 items-center">
          <Dropdown
            options={["whitelist", "blacklist"]}
            value={mode}
            onChange={(v) => setMode(v as "whitelist" | "blacklist")}
            className="text-sm"
          />
          <a className="h-full" onClick={addSite}>
            <Button className="h-full rounded-xl" text="+" active solid />
          </a>
        </div>
      </div>
    </div>
  );
};

const TodoList = ({ setError }: { setError: React.Dispatch<React.SetStateAction<string>> }) => {
  const [task, setTask] = useState<string>("");
  const [list, setList] = useState<{ task: string; done: boolean }[]>([]);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;
    chrome.storage.local.get(["todos"], (data) => {
      if (data.todos) setList(data.todos as { task: string; done: boolean }[]);
    });
  }, []);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;
    chrome.storage.local.set({ todos: list });
  }, [list]);

  const addTask = () => {
    if (!task) return;
    if (list.some((t) => t.task === task)) {
      setError(`Duplicate task: ${task}`);
      setTask("");
      return;
    }
    setList((prev) => [...prev, { task, done: false }]);
    setTask("");
  };

  return (
    <div>
      <div className="mb-4">
        {!list.length ? (
          <h2 className="text-xl font-bold">No tasks yet...</h2>
        ) : (
          list.map((item, i) => (
            <Card
              className="first:rounded-t-xl last:rounded-b-xl rounded-none"
              key={i}
              cont={
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        setList((prev) =>
                          prev.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)),
                        )
                      }
                      className="accent-green-500"
                    />
                    <span className={item.done ? "line-through opacity-40" : ""}>{item.task}</span>
                  </div>
                  <a
                    className="cursor-pointer"
                    onClick={() => setList((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    x
                  </a>
                </div>
              }
            />
          ))
        )}
      </div>
      <div className="relative">
        <TextField
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
          placeholder="Finish hero section..."
        />
        <a className="absolute top-0 right-0 h-full" onClick={addTask}>
          <Button className="h-full rounded-xl" text="+" active solid />
        </a>
      </div>
    </div>
  );
};
