'use client'

import { useState, useRef } from 'react'

interface Photo { id: string; name: string; caption: string; ctx: string; dataUrl: string }

interface Props {
  ctx: string
  photos: unknown[]
  onPhotosChange: (p: unknown[]) => void
}

export default function PhotoUpload({ ctx, photos, onPhotosChange }: Props) {
  const all = photos as Photo[]
  const ctxPhotos = all.filter(p => p.ctx === ctx)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const MAX_SIZE_MB = 2
    const oversized = files.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (oversized.length > 0) {
      alert(`${oversized.map(f => f.name).join(', ')} exceed${oversized.length === 1 ? 's' : ''} the ${MAX_SIZE_MB}MB limit and will be skipped. Keep attachments small — they are stored as base64 in the database.`)
    }
    files
      .filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024)
      .forEach(f => {
        const reader = new FileReader()
        reader.onload = ev => {
          const newPhoto: Photo = {
            id: 'ph' + Date.now() + Math.random().toString(36).slice(2, 5),
            dataUrl: ev.target?.result as string,
            name: f.name,
            caption: '',
            ctx,
          }
          onPhotosChange([...all, newPhoto])
        }
        reader.readAsDataURL(f)
      })
    e.target.value = ''
  }

  function updateCaption(id: string, caption: string) {
    onPhotosChange(all.map(p => p.id === id ? { ...p, caption } : p))
  }

  function deletePhoto(id: string) {
    if (!confirm('Remove this attachment?')) return
    onPhotosChange(all.filter(p => p.id !== id))
  }

  const lightboxPhoto = all.find(p => p.id === lightbox)

  return (
    <>
      {/* Drop zone */}
      <div
        className="relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50/30"
        style={{ borderColor: '#4472c4', background: '#eef2fa' }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFiles} />
        <div className="text-2xl mb-2 opacity-50">📁</div>
        <p className="text-xs font-semibold text-blue-700">Drop photos or PDFs here, or click to browse</p>
        <p className="text-[10px] text-gray-400 mt-1">JPG · PNG · WEBP · PDF — Multiple files supported · Max 2MB each</p>
      </div>

      {/* Photo grid */}
      {ctxPhotos.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {ctxPhotos.map((ph, i) => {
            const isImg = ph.dataUrl.startsWith('data:image')
            return (
              <div key={ph.id} className="border border-gray-200 rounded overflow-hidden bg-white group">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {isImg ? (
                    <img
                      src={ph.dataUrl}
                      alt={ph.name}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightbox(ph.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-red-400">📄</div>
                  )}
                  <span className="absolute top-1 left-1 text-[9px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {String(i + 1).padStart(3, '0')}
                  </span>
                  <button
                    onClick={() => deletePhoto(ph.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-1.5">
                  <p className="text-[9px] text-gray-400 truncate mb-1">{ph.name}</p>
                  <input
                    type="text"
                    value={ph.caption}
                    onChange={e => updateCaption(ph.id, e.target.value)}
                    placeholder="Caption…"
                    className="w-full text-[10px] border-none border-b border-gray-200 bg-transparent outline-none focus:border-amber-400 px-0 py-0.5"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-5 text-white text-3xl hover:text-gray-300">✕</button>
          <img
            src={lightboxPhoto.dataUrl}
            alt={lightboxPhoto.name}
            className="max-w-[90vw] max-h-[88vh] object-contain rounded"
            onClick={e => e.stopPropagation()}
          />
          {lightboxPhoto.caption && (
            <p className="absolute bottom-6 text-white text-sm bg-black/60 px-4 py-2 rounded">{lightboxPhoto.caption}</p>
          )}
        </div>
      )}
    </>
  )
}
