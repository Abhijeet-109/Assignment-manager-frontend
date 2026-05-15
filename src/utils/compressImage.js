export const compressImage = (file, maxWidth = 200, quality = 0.75) => {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, maxWidth / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob(
                (blob) => resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' })),
                'image/jpeg',
                quality
            );
        };
        img.src = url;
    });
};