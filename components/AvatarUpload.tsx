import React, { useRef } from 'react';
import { imageConfig } from '@/lib/config/image';
import ImageCropper from './ImageCropper'
import { useAuth } from '@/contexts/AuthContext';

export default function AvatarUpload() {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { profile } = useAuth();

    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);
        
        if (!file) return;

        // Validate file type
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !imageConfig.avatar.validExtensions.includes(fileExt)) {
            setError(`Please select a valid image file (${imageConfig.avatar.validExtensions.join(', ')})`);
            return;
        }

        // Validate file size
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > imageConfig.avatar.maxSizeInMB) {
            setError(`File size must be less than ${imageConfig.avatar.maxSizeInMB}MB`);
            return;
        }

        setSelectedFile(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            setIsUploading(true);
            setError(null);

            // Create a File from the Blob with PNG extension
            const timestamp = Date.now();
            const filename = `avatar-${timestamp}.png`;
            const file = new File([croppedBlob], filename, {
                type: imageConfig.avatar.contentType
            });

            // Create FormData
            const formData = new FormData();
            formData.append('avatar', file);

            // Upload to our API
            const response = await fetch('/api/avatar', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload avatar');
            }

            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setSelectedFile(null);

            // Instead of reloading the page, we could update the profile context
            // For now, we'll use a reload
            window.location.reload();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelCrop = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept={imageConfig.avatar.validExtensions.map(ext => `.${ext}`).join(',')}
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload avatar"
            />
            
            {/* Invisible button that covers the entire parent area */}
            <button
                onClick={handleClick}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Change avatar"
            />

            {error && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 text-center">
                    {error}
                </div>
            )}

            {selectedFile && (
                <ImageCropper
                    file={selectedFile}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                />
            )}
        </>
    );
} 