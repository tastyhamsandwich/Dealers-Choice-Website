export const imageConfig = {
    avatar: {
        width: 500,
        height: 500,
        format: 'png' as const,
        fit: 'cover' as const,
        position: 'center' as const,
        contentType: 'image/png',
        validExtensions: ['jpg', 'jpeg', 'png', 'gif'],
        maxSizeInMB: 5,
        aspectRatio: 1,
    }
}; 