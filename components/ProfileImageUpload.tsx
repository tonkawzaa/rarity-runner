'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProfileImageUploadProps {
  currentImage: string | null;
  userName: string;
}

export function ProfileImageUpload({ currentImage, userName }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP, GIF)');
      return;
    }

    // Validate file size (20MB max — server will resize down to 256x256)
    if (file.size > 20 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกินไป (สูงสุด 20MB)');
      return;
    }

    setError(null);

    // Use createObjectURL for instant preview — much faster than FileReader for large files
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowModal(true);
  }, []);

  const handleUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Success - close modal, reset image error state, and refresh
      setShowModal(false);
      // Revoke object URL to free memory
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setImageLoadError(false);
      // Force re-mount the input so a new file can be selected after upload
      setInputKey(k => k + 1);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    // Revoke object URL to free memory
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    // Force re-mount the input so the same file can be re-selected
    setInputKey(k => k + 1);
  }, [previewUrl]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle image load error (e.g., file was deleted)
  const handleImageError = useCallback(() => {
    setImageLoadError(true);
  }, []);

  // Show image only if we have a URL and it hasn't failed to load
  const shouldShowImage = currentImage && !imageLoadError;

  return (
    <>
      {/* Profile Image with Edit Button */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-400 shadow-lg shadow-primary-500/20">
          {shouldShowImage ? (
            <Image
              src={currentImage}
              alt={userName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={handleImageError}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-4xl text-white font-bold">
                {userName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>
        
        {/* Edit Button Overlay */}
        <button
          onClick={triggerFileSelect}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="เปลี่ยนรูปโปรไฟล์"
        >
          <div className="flex flex-col items-center text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">เปลี่ยนรูป</span>
          </div>
        </button>
        
        {/* Camera Badge */}
        <button
          onClick={triggerFileSelect}
          className="absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg hover:scale-110 transition-transform"
          aria-label="เปลี่ยนรูปโปรไฟล์"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Hidden File Input - key forces re-mount so same file can be re-selected */}
        <input
          key={inputKey}
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card-premium max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-foreground mb-4 text-center">
              ยืนยันรูปโปรไฟล์ใหม่
            </h3>
            
            {/* Preview */}
            <div className="flex justify-center mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-400 shadow-lg">
                {previewUrl && (
                // Use plain <img> for data: URL previews — Next.js Image doesn't support them
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังอัปโหลด...
                  </span>
                ) : (
                  'ยืนยัน'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
