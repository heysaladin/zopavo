"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const supabase = createClient(
  "https://vnqyzthjviyljhplvzay.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZucXl6dGhqdml5bGpocGx2emF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTU4MzEsImV4cCI6MjA4OTkzMTgzMX0.hu9HWGs-I4P2EmlMGp-2fffWUfHx9n9SZj1bsQnE7Y8"
);

const BOARD_ID = "hyperfantasy";

const NOTE_COLORS: Record<string, string> = {
  yellow: "#fef08a",
  pink:   "#fda4af",
  blue:   "#93c5fd",
  green:  "#86efac",
  purple: "#d8b4fe",
  orange: "#fdba74",
};

const COL_CENTER: Record<string, { x: number; y: number }> = {
  IN_PROGRESS: { x: 0.25, y: 0.25 },
  TODO:        { x: 0.75, y: 0.25 },
  BACKLOG:     { x: 0.75, y: 0.75 },
  REVIEW:      { x: -1,   y: 0.5  },
};

type KanbanCol = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

const COL_ORDER: KanbanCol[] = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const COL_LABELS: Record<KanbanCol, string> = {
  BACKLOG:     "Backlog",
  TODO:        "Todo",
  IN_PROGRESS: "In Progress",
  REVIEW:      "Review",
  DONE:        "Done",
};

interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  done: boolean;
  workingOnBy?: string | null;
  updatedAt: string;
}

function noteCol(n: Note): KanbanCol {
  if (n.done) return "DONE";
  if (n.x < 0) return "REVIEW";
  if (n.x < 0.5 && n.y < 0.5) return "IN_PROGRESS";
  if (n.x >= 0.5 && n.y < 0.5) return "TODO";
  return "BACKLOG";
}

function StickyCard({
  note,
  compact = false,
  onMove,
  onDelete,
  onDragStart,
}: {
  note: Note;
  compact?: boolean;
  onMove?: (col: KanbanCol) => void;
  onDelete?: () => void;
  onDragStart?: (id: string) => void;
}) {
  const bg = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
  const col = noteCol(note);
  const idx = COL_ORDER.indexOf(col);
  const prev = COL_ORDER[idx - 1] as KanbanCol | undefined;
  const next = COL_ORDER[idx + 1] as KanbanCol | undefined;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => {
        onDragStart?.(note.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "rounded-lg border border-black/10 relative group select-none",
        compact ? "p-2.5 min-h-[70px]" : "p-3 min-h-[90px]",
        onDragStart && "cursor-grab active:cursor-grabbing active:opacity-50 active:scale-95 transition-[opacity,transform] duration-100"
      )}
      style={{ backgroundColor: bg }}
    >
      <p className={cn("font-medium leading-snug text-slate-800", compact ? "text-[11px] pr-4" : "text-[13px] pr-5")}>
        {note.content || <span className="italic opacity-40">Empty note</span>}
      </p>
      {note.workingOnBy && (
        <p className="text-[10px] text-slate-500 italic mt-1.5">@{note.workingOnBy}</p>
      )}

      {(onMove || onDelete) && (
        <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onMove && prev && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(prev); }}
              title={COL_LABELS[prev]}
              className="p-0.5 rounded bg-white/60 hover:bg-white/90 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-slate-600" />
            </button>
          )}
          {onMove && next && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(next); }}
              title={COL_LABELS[next]}
              className="p-0.5 rounded bg-white/60 hover:bg-white/90 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-slate-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-0.5 rounded bg-white/60 hover:bg-white/90 transition-colors"
            >
              <X className="w-3 h-3 text-slate-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DropColumn({
  col,
  notes,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onMove,
  onDelete,
  onDragStart,
  addingTo,
  newText,
  onStartAdd,
  onChangeText,
  onAdd,
  onCancelAdd,
}: {
  col: KanbanCol;
  notes: Note[];
  dragOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onMove: (id: string, col: KanbanCol) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  addingTo: KanbanCol | null;
  newText: string;
  onStartAdd: () => void;
  onChangeText: (v: string) => void;
  onAdd: () => void;
  onCancelAdd: () => void;
}) {
  const isAdding = addingTo === col;

  return (
    <div
      className="w-56 shrink-0 flex flex-col gap-2"
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
    >
      <div className="flex items-center justify-between px-0.5 mb-0.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {COL_LABELS[col]}
        </span>
        <span className="text-xs text-muted-foreground/60 tabular-nums">{notes.length}</span>
      </div>

      <div
        className={cn(
          "flex flex-col gap-1.5 min-h-[60px] rounded-xl p-1.5 transition-colors duration-100",
          dragOver ? "bg-accent/60 ring-2 ring-border ring-dashed" : "bg-transparent"
        )}
      >
        {notes.map((note) => (
          <StickyCard
            key={note.id}
            note={note}
            onMove={(target) => onMove(note.id, target)}
            onDelete={() => onDelete(note.id)}
            onDragStart={onDragStart}
          />
        ))}

        {isAdding ? (
          <div className="flex gap-1.5 mt-0.5">
            <Input
              autoFocus
              placeholder="Isi note..."
              value={newText}
              onChange={(e) => onChangeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
                if (e.key === "Escape") onCancelAdd();
              }}
              className="h-8 text-sm"
            />
            <button onClick={onCancelAdd} className="p-1.5 rounded hover:bg-accent shrink-0">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            onClick={onStartAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full mt-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah note
          </button>
        )}
      </div>
    </div>
  );
}

function NoteGrid({
  notes,
  emptyText,
  onMove,
  onDelete,
  onAdd,
}: {
  notes: Note[];
  emptyText: string;
  onMove?: (id: string, col: KanbanCol) => void;
  onDelete?: (id: string) => void;
  onAdd?: (content: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-4">
      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">{emptyText}</p>
      )}
      {notes.length > 0 && (
        <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {notes.map((n) => (
            <StickyCard
              key={n.id}
              note={n}
              compact
              onMove={onMove ? (col) => onMove(n.id, col) : undefined}
              onDelete={onDelete ? () => onDelete(n.id) : undefined}
            />
          ))}
        </div>
      )}
      {onAdd && (
        <div className="flex gap-2 pt-2 border-t border-border">
          <Input
            placeholder="Tambah note baru..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && text.trim()) { await onAdd(text.trim()); setText(""); }
            }}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={async () => { if (text.trim()) { await onAdd(text.trim()); setText(""); } }}>
            Tambah
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BoardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [addingTo, setAddingTo] = useState<KanbanCol | null>(null);
  const [newText, setNewText] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanCol | null>(null);

  const loadNotes = useCallback(async () => {
    const { data } = await supabase
      .from("Note")
      .select("id,content,x,y,color,done,workingOnBy,updatedAt")
      .eq("boardId", BOARD_ID)
      .order("createdAt", { ascending: true });
    if (data) setNotes(data as Note[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // Clear dragOver on mouseup anywhere (safety net)
  useEffect(() => {
    const clear = () => { setDragId(null); setDragOverCol(null); };
    window.addEventListener("dragend", clear);
    return () => window.removeEventListener("dragend", clear);
  }, []);

  const moveNote = async (id: string, col: KanbanCol) => {
    const isDone = col === "DONE";
    const center = isDone ? null : COL_CENTER[col];
    const patch: Record<string, unknown> = { done: isDone, updatedAt: new Date().toISOString() };
    if (center) { patch.x = center.x; patch.y = center.y; }
    await supabase.from("Note").update(patch).eq("id", id);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, done: isDone, x: center?.x ?? n.x, y: center?.y ?? n.y } : n
      )
    );
  };

  const deleteNote = async (id: string) => {
    await supabase.from("Note").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addNote = async (content: string, col: KanbanCol) => {
    const center = COL_CENTER[col] ?? { x: 0.75, y: 0.75 };
    const { data } = await supabase
      .from("Note")
      .insert({ id: crypto.randomUUID(), boardId: BOARD_ID, content, x: center.x, y: center.y, color: "yellow", done: false, updatedAt: new Date().toISOString() })
      .select().single();
    if (data) setNotes((prev) => [...prev, data as Note]);
  };

  const handleDrop = (col: KanbanCol) => {
    if (dragId) moveNote(dragId, col);
    setDragId(null);
    setDragOverCol(null);
  };

  const byCol = (col: KanbanCol) => notes.filter((n) => noteCol(n) === col);
  const backlogNotes = byCol("BACKLOG");
  const doneNotes    = byCol("DONE");
  const middleCols: KanbanCol[] = ["TODO", "IN_PROGRESS", "REVIEW"];

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-base font-semibold">Board</h1>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="flex gap-3 h-full items-start">

          {/* Backlog — compact count + drop target */}
          <div
            className="w-28 shrink-0"
            onDragOver={(e) => { e.preventDefault(); setDragOverCol("BACKLOG"); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => { e.preventDefault(); handleDrop("BACKLOG"); }}
          >
            <div
              onClick={() => !dragId && setBacklogOpen(true)}
              className={cn(
                "rounded-xl border bg-card p-5 text-center transition-colors cursor-pointer select-none",
                dragOverCol === "BACKLOG" ? "border-primary bg-accent ring-2 ring-primary/30" : "border-border hover:bg-accent"
              )}
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Backlog</p>
              <p className="text-5xl font-bold tabular-nums leading-none">{backlogNotes.length}</p>
            </div>
          </div>

          {/* Middle columns */}
          {middleCols.map((col) => (
            <DropColumn
              key={col}
              col={col}
              notes={byCol(col)}
              dragOver={dragOverCol === col}
              onDragOver={() => setDragOverCol(col)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col)}
              onMove={moveNote}
              onDelete={deleteNote}
              onDragStart={setDragId}
              addingTo={addingTo}
              newText={newText}
              onStartAdd={() => setAddingTo(col)}
              onChangeText={setNewText}
              onAdd={async () => { await addNote(newText, col); setNewText(""); setAddingTo(null); }}
              onCancelAdd={() => { setNewText(""); setAddingTo(null); }}
            />
          ))}

          {/* Done — compact count + drop target */}
          <div
            className="w-28 shrink-0"
            onDragOver={(e) => { e.preventDefault(); setDragOverCol("DONE"); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => { e.preventDefault(); handleDrop("DONE"); }}
          >
            <div
              onClick={() => !dragId && setDoneOpen(true)}
              className={cn(
                "rounded-xl border bg-card p-5 text-center transition-colors cursor-pointer select-none",
                dragOverCol === "DONE" ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/30" : "border-border hover:bg-accent"
              )}
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Done</p>
              <p className="text-5xl font-bold tabular-nums leading-none text-green-500">{doneNotes.length}</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={backlogOpen} onOpenChange={setBacklogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Backlog</DialogTitle></DialogHeader>
          <NoteGrid
            notes={backlogNotes}
            emptyText="Tidak ada note di Backlog"
            onMove={moveNote}
            onDelete={deleteNote}
            onAdd={(content) => addNote(content, "BACKLOG")}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={doneOpen} onOpenChange={setDoneOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Done</DialogTitle></DialogHeader>
          <NoteGrid
            notes={doneNotes}
            emptyText="Belum ada yang selesai"
            onMove={moveNote}
            onDelete={deleteNote}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
