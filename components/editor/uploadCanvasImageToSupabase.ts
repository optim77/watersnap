export async function uploadCanvasImageToSupabase(
    canvas: HTMLCanvasElement,
    userId: string,
    imageId: string,
    supabase: any
) {
    return new Promise(async (resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('Blob conversion failed'));
                return;
            }

            const filePath = `public/${userId}/processed/${imageId}.png`;

            const { error } = await supabase.storage
                .from('watersnap')
                .upload(filePath, blob, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) {
                reject(error);
            } else {
                resolve(filePath);
            }
        }, 'image/png');
    });
}