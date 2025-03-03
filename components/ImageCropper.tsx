import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { imageConfig } from '@/lib/config/image';

interface ImageCropperProps {
    file: File;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropper({ file, onCropComplete, onCancel }: ImageCropperProps) {
    const [imgSrc, setImgSrc] = useState<string>('');
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        aspect: 1 // 1:1 aspect ratio for avatar
    });

    // Load the image when file is provided
    React.useEffect(() => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImgSrc(reader.result?.toString() || '');
        });
        reader.readAsDataURL(file);
    }, [file]);

    // Function to get the cropped image
    const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelRatio = window.devicePixelRatio;
        
        // Set canvas size to match our config dimensions
        canvas.width = imageConfig.avatar.width;
        canvas.height = imageConfig.avatar.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        // Set the canvas transform for high DPI displays
        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        // Calculate the actual crop dimensions
        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        const cropWidth = crop.width * scaleX;
        const cropHeight = crop.height * scaleY;

        // Draw the cropped image
        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            imageConfig.avatar.width,
            imageConfig.avatar.height
        );

        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    resolve(blob);
                },
                imageConfig.avatar.contentType,
                1 // Quality
            );
        });
    };

    const handleCropComplete = async () => {
        if (!imgRef.current || !crop.width || !crop.height) return;
        
        try {
            const croppedBlob = await getCroppedImg(imgRef.current, crop);
            onCropComplete(croppedBlob);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    if (!imgSrc) {
        return <div>Loading...</div>;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-lg font-semibold mb-4">Crop Your Avatar</h3>
                <div className="mb-4">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img
                            ref={imgRef}
                            src={imgSrc}
                            alt="Crop me"
                            className="max-h-[60vh] w-auto"
                        />
                    </ReactCrop>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCropComplete}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
} 