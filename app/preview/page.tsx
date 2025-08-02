'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/superbase';
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function PreviewPage() {
    const searchParams = useSearchParams();
    const imageId = searchParams.get('image');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                toast.error("Something went wrong, try again");
                return;
            }
            setLoading(false);
            setImageUrl(data?.signedUrl || null);
        }

        fetchUrl();
    }, [imageId]);

    const handleDownload = async () => {
        if (!imageUrl) {
            toast.error("Brrrr ;/ There is no URL for media");
            return;
        }

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-screen p-8 flex flex-col items-center  text-center bg-blend-darken">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 animate-fade-in mb-6">
                Your Image
            </h1>

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600"/>
                    <p className="text-gray-600">Loading image...</p>
                </div>
            ) : (
                <>
                    <img
                        src={imageUrl!}
                        alt="Final"
                        className="mb-6 max-w-full max-h-[80vh] rounded-lg shadow-md"
                    />

                    <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
                    >
                        Download Image
                    </button>
                </>
            )}
        </main>
    );
}
