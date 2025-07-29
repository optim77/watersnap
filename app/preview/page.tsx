'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/superbase';

export default function PreviewPage() {
    const searchParams = useSearchParams();
    const imageId = searchParams.get('image');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUrl() {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user || !imageId) return;

            const path = `public/${user.id}/processed/${imageId}.png`;

            const { data, error } = await supabase
                .storage
                .from('watersnap')
                .createSignedUrl(path, 60 * 5);

            if (error) {
                console.error(error);
                return;
            }

            setImageUrl(data?.signedUrl || null);
        }

        fetchUrl();
    }, [imageId]);

    return (
        <main className="min-h-screen p-8 bg-white flex flex-col items-center">
            <h1 className="text-2xl mb-6">Image is ready</h1>
            {imageUrl ? (
                <>
                    <img src={imageUrl} alt="Final" className="mb-4 max-w-full" />
                    <a
                        href={imageUrl}
                        download={`${imageId}.png`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Download
                    </a>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </main>
    );
}
