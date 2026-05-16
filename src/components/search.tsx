import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query) return;
    const isWebsite = query.includes(".") && !query.includes(" ");
    const url = isWebsite
      ? `https://${query}`
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    chrome.tabs.create({ url });
  };

  return (
    <div className="p-10 h-screen flex flex-col justify-center">
      <div className="md:w-200 md:mx-auto flex flex-col bg-base-950/70 px-4 py-2 rounded-xl border border-white/60 gap-2 h-12">
        <input
          type="text"
          className="outline-none flex-1"
          placeholder="Website or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>
    </div>
  );
}
