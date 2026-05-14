"use client";

import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface Props {
  caption: string;
  hashtags: string | null;
  mediaPath?: string | null;
}

export function ClipboardButtons({ caption, hashtags, mediaPath }: Props) {
  const { showToast } = useAppStore();

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, "success");
  };

  return (
    <div className="flex items-center gap-1.5">
      <CopyBtn label="Caption" onClick={() => copy(caption, "Caption")} />
      {hashtags && <CopyBtn label="Hashtags" onClick={() => copy(hashtags, "Hashtags")} />}
      {hashtags && <CopyBtn label="Caption + Tags" onClick={() => copy(caption + "\n\n" + hashtags, "Full caption")} />}
      {mediaPath && <CopyBtn label="Media path" onClick={() => copy(mediaPath, "Media path")} />}
    </div>
  );
}

function CopyBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [done, setDone] = useState(false);

  const handle = () => {
    onClick();
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/8 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/8 transition-all"
    >
      {done ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {label}
    </button>
  );
}
