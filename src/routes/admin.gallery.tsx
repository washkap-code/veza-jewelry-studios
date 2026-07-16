import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, type DragEvent } from "react";
import { supabase } from "../lib/supabase";
import { AuthLoader } from "../components/AuthLoader";

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGallery,
});

type GalleryRow = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  content_hash: string | null;
  source: string;
  created_at: string;
};

const BUCKET = "gallery";
const MAX_DIM = 1920;
const MAX_BATCH = 20;
const TARGET_QUALITY = 0.82;

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function compressImage(
  file: File,
): Promise<{ blob: Blob; width: number; height: number; mime: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const mime = "image/webp";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, TARGET_QUALITY),
  );
  bitmap.close?.();
  if (!blob) throw new Error("Compression failed");
  return { blob, width: w, height: h, mime };
}

function AdminGallery() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GalleryRow[];
    },
  });

  const del = useMutation({
    mutationFn: async (row: GalleryRow) => {
      // Storage delete only for uploaded rows (not seed rows)
      if (row.source === "upload") {
        const path = row.url.split(`/${BUCKET}/`)[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
      }
      const { error } = await supabase.from("gallery_images").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });

  const updateAlt = useMutation({
    mutationFn: async ({ id, alt }: { id: string; alt: string }) => {
      const { error } = await supabase.from("gallery_images").update({ alt }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).slice(0, MAX_BATCH);
      if (arr.length === 0) return;
      setBusy(true);
      let uploaded = 0;
      let skipped = 0;
      let failed = 0;
      for (const file of arr) {
        try {
          setStatus(`Processing ${file.name}…`);
          const { blob, width, height, mime } = await compressImage(file);
          const arrayBuf = await blob.arrayBuffer();
          const hash = await sha256(arrayBuf);

          // dedupe against existing hash
          const { data: existing } = await supabase
            .from("gallery_images")
            .select("id")
            .eq("content_hash", hash)
            .maybeSingle();
          if (existing) {
            skipped++;
            continue;
          }

          const ext = "webp";
          const path = `${new Date().getFullYear()}/${hash.slice(0, 2)}/${hash}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, blob, { contentType: mime, upsert: false });
          if (upErr && !upErr.message.includes("already exists")) throw upErr;
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

          const { error: insErr } = await supabase.from("gallery_images").insert({
            storage_path: path,
            url: data.publicUrl,
            content_hash: hash,
            alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
            width,
            height,
            byte_size: blob.size,
            mime,
            source: "upload",
          });
          if (insErr) throw insErr;
          uploaded++;
        } catch (e) {
          console.error(e);
          failed++;
        }
      }
      setStatus(
        `${uploaded} uploaded · ${skipped} duplicate skipped${failed ? ` · ${failed} failed` : ""}`,
      );
      setBusy(false);
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    [qc],
  );

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  const filtered = (rows ?? []).filter((r) =>
    search
      ? [r.alt, r.url].join(" ").toLowerCase().includes(search.toLowerCase())
      : true,
  );

  if (!rows) return <AuthLoader minHeight="30vh" />;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Media Gallery</h2>
          <p className="mt-2 text-xs font-light text-charcoal-soft">
            {rows.length} images · client-side WebP compression to {MAX_DIM}px · SHA-256 dedupe
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by alt text"
          className="w-64 border-b border-border bg-transparent px-2 py-2 text-sm font-light text-charcoal outline-none focus:border-teal"
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed p-12 text-center transition-colors ${
          dragOver ? "border-teal bg-teal/5" : "border-border/60 bg-warm-white"
        }`}
      >
        <p className="font-serif text-lg text-charcoal">
          Drop images here or click to select
        </p>
        <p className="mt-2 text-xs font-light text-charcoal-soft">
          Up to {MAX_BATCH} files per batch · duplicates automatically skipped
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="btn-outline-charcoal mt-6 disabled:opacity-60"
        >
          {busy ? "Processing…" : "Select images"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {status ? (
          <p className="mt-4 text-xs font-light text-teal">{status}</p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm font-light text-charcoal-soft">
          No images match.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((r) => (
            <figure key={r.id} className="group relative border border-border/60 bg-warm-white">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={r.url}
                  alt={r.alt ?? ""}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="p-3">
                <input
                  defaultValue={r.alt ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== (r.alt ?? "")) {
                      updateAlt.mutate({ id: r.id, alt: e.target.value });
                    }
                  }}
                  placeholder="Alt text"
                  className="w-full border-b border-transparent bg-transparent text-xs font-light text-charcoal outline-none focus:border-teal"
                />
                <div className="mt-2 flex items-center justify-between text-[0.62rem] font-light uppercase tracking-[0.18em] text-charcoal-soft/70">
                  <span>{r.source}</span>
                  <button
                    onClick={() => {
                      if (confirm("Delete this image?")) del.mutate(r);
                    }}
                    className="hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
