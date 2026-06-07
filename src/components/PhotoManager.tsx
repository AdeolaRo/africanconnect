"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, Lock } from "lucide-react";
import { MAX_PHOTOS, MAX_PHOTO_SIZE_MB, RECOMMENDED_PHOTO_SIZE } from "@/lib/photos";

interface Photo {
  id: string;
  url: string;
  order: number;
}

interface PhotoManagerProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
}

export default function PhotoManager({ photos, onChange }: PhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/profile/photos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur upload");
        return;
      }
      onChange([...photos, data]);
    } catch {
      setError("Erreur réseau");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/profile/photos/${id}`, { method: "DELETE" });
    if (res.ok) {
      onChange(photos.filter((p) => p.id !== id));
    } else {
      const data = await res.json();
      setError(data.error || "Erreur suppression");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-warm">Mes photos</h2>
        <span className="text-sm text-warm-muted">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>
      <p className="mt-1 text-xs text-warm-muted">
        {RECOMMENDED_PHOTO_SIZE} · Max {MAX_PHOTO_SIZE_MB} Mo · JPG, PNG, WebP
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs text-rose/80">
        <Lock className="h-3 w-3" />
        Visibles par les autres uniquement après match mutuel
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-rose/20">
            <Image src={photo.url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="150px" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-rose px-2 py-0.5 text-[10px] font-medium text-white">
                Principale
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(photo.id)}
              className="absolute right-2 top-2 rounded-full bg-warm/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose/30 bg-rose/5 text-rose transition-colors hover:border-rose hover:bg-rose/10 disabled:opacity-50"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs font-medium">{uploading ? "Envoi..." : "Ajouter"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
      />

      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
    </div>
  );
}
