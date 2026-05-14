"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Copy, ArrowRight, CheckCheck } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  captionTemplate: string;
  hashtagsTemplate: string | null;
}

const categoryColors: Record<string, string> = {
  "Product Launch": "bg-violet-500/10 text-violet-400",
  "Portfolio": "bg-blue-500/10 text-blue-400",
  "Creator": "bg-emerald-500/10 text-emerald-400",
  "Motion Design": "bg-pink-500/10 text-pink-400",
};

export function TemplatesClient({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const { showToast } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleUseTemplate = async (template: Template) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${template.name} — Draft`,
        platform: "INSTAGRAM",
        caption: template.captionTemplate,
        hashtags: template.hashtagsTemplate || null,
        status: "DRAFT",
      }),
    });
    const post = await res.json();
    showToast("Post created from template!", "success");
    router.push(`/library/${post.id}/edit`);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  return (
    <div className="max-w-4xl mx-auto">
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">{category}</h2>
          <div className="space-y-2">
            {templates.filter((t) => t.category === category).map((template) => (
              <div key={template.id} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === template.id ? null : template.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/3 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <h3 className="text-sm font-medium text-zinc-200">{template.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[template.category] || "bg-zinc-500/10 text-zinc-400"}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-1">{template.captionTemplate.slice(0, 80)}…</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-zinc-600 transition-transform ${expanded === template.id ? "rotate-90" : ""}`} />
                </button>

                {expanded === template.id && (
                  <div className="px-5 pb-5 border-t border-white/5">
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Caption Template</p>
                          <CopyBtn onClick={() => handleCopy(template.captionTemplate)} />
                        </div>
                        <pre className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap font-sans bg-white/3 rounded-lg p-4">
                          {template.captionTemplate}
                        </pre>
                      </div>

                      {template.hashtagsTemplate && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Hashtags</p>
                            <CopyBtn onClick={() => handleCopy(template.hashtagsTemplate!)} />
                          </div>
                          <p className="text-sm text-zinc-500 font-mono bg-white/3 rounded-lg p-3">
                            {template.hashtagsTemplate}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Use this template
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CopyBtn({ onClick }: { onClick: () => void }) {
  const [done, setDone] = useState(false);
  const handle = () => { onClick(); setDone(true); setTimeout(() => setDone(false), 1800); };
  return (
    <button onClick={handle} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/8 transition-all border border-white/8">
      {done ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}
