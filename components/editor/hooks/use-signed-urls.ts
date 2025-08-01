import { useEffect, useState } from 'react';
import { supabase } from '@/lib/superbase';

export function useSignedUrls(mediumUUID: string | null, watermarkUUID: string | null) {
    const [mediumUrl, setMediumUrl] = useState<string | null>(null);
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrls = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !mediumUUID || !watermarkUUID) return;

            const base = `public/${user.id}`;
            const mediumPath = `${base}/mediums/${mediumUUID}.jpg?token=}`;
            const watermarkPath = `${base}/watermarks/${watermarkUUID}.png`;

            const { data: mSigned } = await supabase.storage.from('watersnap').createSignedUrl(mediumPath, 300);
            const { data: wSigned } = await supabase.storage.from('watersnap').createSignedUrl(watermarkPath, 300);

            setMediumUrl(mSigned?.signedUrl || null);
            setWatermarkUrl(wSigned?.signedUrl || null);
        };

        fetchUrls();
    }, [mediumUUID, watermarkUUID]);

    return { mediumUrl, watermarkUrl };
}
