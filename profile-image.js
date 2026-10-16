/* Camera photos are decoded and resized locally; originals are never uploaded. */
(() => {
    'use strict';
    const MAX_INPUT_BYTES = 30 * 1024 * 1024;
    const MAX_OUTPUT_BYTES = 350 * 1024;
    const MAX_EDGE = 512;
    const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
    async function prepare(file) {
        const extension = /\.(jpe?g|png|webp|hei[cf])$/i.test(file.name || '');
        if (!SUPPORTED_TYPES.has(file.type) && !(file.type === '' && extension)) {
            throw new Error('Unsupported photo format. Choose a JPG, PNG or WebP photo, or a HEIC/HEIF photo your browser can open.');
        }
        if (!file.size) throw new Error('This photo is empty. Please capture or select it again.');
        if (file.size > MAX_INPUT_BYTES) throw new Error('This photo is larger than 30 MB. Choose a smaller photo.');
        const url = URL.createObjectURL(file);
        const image = new Image();
        try {
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = () => reject(new Error(/hei[cf]/i.test(file.type + file.name)
                    ? 'Your browser could not open this HEIC/HEIF photo. Export it as JPG or choose a JPG camera photo.'
                    : 'This photo could not be read. Please capture it again or choose another JPG, PNG or WebP image.'));
                image.src = url;
            });
            if (!image.naturalWidth || !image.naturalHeight) throw new Error('This photo has invalid dimensions. Choose another photo.');
            const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Your browser could not process the photo. Please try again.');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const compressed = await new Promise((resolve, reject) => {
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The photo could not be compressed. Choose another photo.')), 'image/jpeg', 0.82);
            });
            canvas.width = canvas.height = 1;
            if (compressed.size > MAX_OUTPUT_BYTES) throw new Error('The processed photo is still too large to store. Choose a different photo.');
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('The processed photo could not be read. Please try again.'));
                reader.readAsDataURL(compressed);
            });
        } finally {
            image.onload = image.onerror = null;
            image.src = '';
            URL.revokeObjectURL(url);
        }
    }
    window.ProfileImage = Object.freeze({prepare});
})();
