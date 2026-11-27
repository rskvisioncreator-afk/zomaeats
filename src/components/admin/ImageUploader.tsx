import { useRef, useState } from 'react'
import { ImagePlus, Link2, Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { dataProvider } from '@/services'
import { cn, friendlyError } from '@/lib/utils'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  folder: 'restaurants' | 'dishes'
  label?: string
  hint?: string
}

/**
 * Drag & drop uploader wired to Firebase Storage (or data-URL in demo mode).
 * Images are compressed client-side before upload.
 */
export function ImageUploader({ value, onChange, folder, label = 'Cover image', hint }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const toast = useToast()

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const url = await dataProvider.uploadImage(file, folder, setProgress)
      onChange(url)
      toast.success('Image upload ho gayi')
    } catch (error) {
      toast.error(friendlyError(error, 'Image upload nahi hui'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-uploader">
      <div className="image-uploader__label">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>

      {value ? (
        <div className="image-uploader__preview">
          <SmartImage src={value} alt="Uploaded preview" />
          <div className="image-uploader__preview-actions">
            <Button
              size="sm"
              variant="light"
              icon={<RefreshCw size={14} />}
              onClick={() => inputRef.current?.click()}
              loading={uploading}
            >
              Replace
            </Button>
            <button type="button" className="image-uploader__remove" onClick={() => onChange('')}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
          {uploading && (
            <div className="image-uploader__progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn('image-uploader__dropzone', dragging && 'is-dragging', uploading && 'is-uploading')}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void handleFile(event.dataTransfer.files[0])
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="spin" />
              <strong>Uploading... {progress}%</strong>
              <div className="image-uploader__progress">
                <span style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <span className="image-uploader__icon">
                {dragging ? <UploadCloud size={22} /> : <ImagePlus size={22} />}
              </span>
              <strong>Drop an image or click to upload</strong>
              <small>JPG, PNG ya WebP · max 6MB · auto-compressed</small>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div className="image-uploader__url">
        <Link2 size={15} />
        <input
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          placeholder="Ya image URL paste karo (https://...)"
          aria-label="Image URL"
        />
        <button
          type="button"
          onClick={() => {
            if (!urlDraft.trim()) return
            onChange(urlDraft.trim())
            setUrlDraft('')
          }}
        >
          Use URL
        </button>
      </div>
    </div>
  )
}
