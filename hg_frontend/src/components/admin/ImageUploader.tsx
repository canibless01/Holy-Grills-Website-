'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  label?: string;
  folder?: string;
}

export function ImageUploader({ value, onChange, label = 'Upload Image', folder = 'general' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get Cloudinary upload signature from backend
      const response = await apiClient.post<{
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
      }>('/upload/signature', { folder });

      const res = response.data;

      if (!res?.cloud_name || !res?.api_key || !res?.signature) {
        throw new Error('Upload configuration missing from backend response');
      }

      // Direct upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', res.api_key);
      formData.append('timestamp', res.timestamp.toString());
      formData.append('signature', res.signature);
      formData.append('folder', res.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${res.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!cloudRes.ok) {
        const errData = await cloudRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Failed to upload image to Cloudinary');
      }

      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url || cloudData.url;

      if (onChange) onChange(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>}
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-16 w-16 rounded-xl border border-border overflow-hidden bg-muted shrink-0">
            <img src={value} alt="Uploaded preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-xl border border-dashed border-border bg-secondary/50 flex items-center justify-center text-muted-foreground shrink-0">
            <ImageIcon size={20} />
          </div>
        )}

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-secondary transition-colors">
          {uploading ? <Loader2 size={14} className="animate-spin text-primary" /> : <Upload size={14} className="text-primary" />}
          <span>{uploading ? 'Uploading...' : 'Choose file'}</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
