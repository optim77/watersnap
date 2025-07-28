'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/superbase';

export default function EditorCanvas() {
    const searchParams = useSearchParams();
    const mediumUUID = searchParams.get('medium');
    const watermarkUUID = searchParams.get('watermark');

    const [mediumUrl, setMediumUrl] = useState<string | null>(null);
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const watermarkRef = useRef<Konva.Image>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    const [mediumImage] = useImage(mediumUrl || '');
    const [watermarkImage] = useImage(watermarkUrl || '');

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEffect(() => {
        async function loadUrls() {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user || !mediumUUID || !watermarkUUID) return;

            const base = `public/${user.id}`;
            const mediumPath = `${base}/mediums/${mediumUUID}.jpg?token=}`;
            const watermarkPath = `${base}/watermarks/${watermarkUUID}.png`;

            const { data: mSigned, error: mError } = await supabase
                .storage
                .from('watersnap')
                .createSignedUrl(mediumPath, 60 * 5);

            const { data: wSigned, error: wError } = await supabase
                .storage
                .from('watersnap')
                .createSignedUrl(watermarkPath, 60 * 5);

            if (mError) console.error('medium error:', mError);
            if (wError) console.error('watermark error:', wError);

            setMediumUrl(mSigned?.signedUrl || '');
            setWatermarkUrl(wSigned?.signedUrl || '');
        }

        loadUrls();
    }, [mediumUUID, watermarkUUID]);

    useEffect(() => {
        if (transformerRef.current && watermarkRef.current) {
            transformerRef.current.nodes([watermarkRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [watermarkImage]);

    if (!mediumImage) return <p>Waiting for image...</p>;

    return (
        <div className="w-full h-screen bg-gray-100">
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    <KonvaImage image={mediumImage} />
                    {watermarkImage && (
                        <>
                            <KonvaImage
                                image={watermarkImage}
                                draggable
                                ref={watermarkRef}
                                x={50}
                                y={50}
                            />
                            <Transformer ref={transformerRef} />
                        </>
                    )}
                </Layer>
            </Stage>
        </div>
    );
}
