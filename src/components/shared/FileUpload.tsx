import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface FileUploadProps {
  currentImage?: string;
  onFileSelect: (dataUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function FileUpload({ currentImage, onFileSelect, onRemove, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  /**
   * Resizes and compresses an image to a small thumbnail (150x150 max)
   * so the base64 string is small enough to store efficiently in the DB.
   */
  const compressImage = useCallback((dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Max dimensions for the thumbnail
        const MAX = 150;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        // Output as JPEG at 80% quality — small file, good enough for an avatar
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }, []);

  const handleFile = useCallback((file: File) => {
    setError('');

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        // Compress to a small thumbnail before saving
        const compressed = await compressImage(dataUrl);
        onFileSelect(compressed);
      } catch {
        setError('Failed to process image');
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  }, [onFileSelect, compressImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  if (currentImage) {
    return (
      <div className="relative w-20 h-20 group">
        <img
          src={currentImage}
          alt="Profile"
          className="w-full h-full rounded-xl object-cover border border-border"
        />
        <button
          onClick={onRemove}
          disabled={disabled}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
          title="Remove picture"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClick}
          disabled={disabled}
          className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Change picture"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center
          cursor-pointer transition-all duration-200
          ${dragOver
            ? 'border-accent bg-accent/10 scale-105'
            : 'border-border hover:border-accent/50 hover:bg-bg-elevated'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Upload className={`w-5 h-5 ${dragOver ? 'text-accent' : 'text-text-muted'}`} />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      {error && (
        <p className="text-xs text-danger mt-1.5">{error}</p>
      )}
      <p className="text-xs text-text-muted mt-1.5">
        Click or drag an image<br />Max 2MB
      </p>
    </div>
  );
}