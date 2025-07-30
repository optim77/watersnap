'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/superbase';
import { v4 as uuidv4 } from 'uuid';

async function uploadCanvasImageToSupabase(
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

export default function EditorCanvas() {
    const searchParams = useSearchParams();
    const mediumUUID = searchParams.get('medium');
    const watermarkUUID = searchParams.get('watermark');

    const [mediumUrl, setMediumUrl] = useState<string | null>(null);
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);

    const watermarkRef = useRef<Konva.Image>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    const [mediumImage] = useImage(mediumUrl || '', 'anonymous');
    const [watermarkImage] = useImage(watermarkUrl || '', 'anonymous');
    const [ready, setReady] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const [watermarkScale, setWatermarkScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    const stageRef = useRef<Konva.Stage>(null);


    useEffect(() => {
        if (mediumImage && watermarkImage) {
            setReady(true);
        }
    }, [mediumImage, watermarkImage]);

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

    const handleExport = async () => {
        if (!stageRef.current) return;

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return alert('Lack of user!');

        const imageId = uuidv4();
        const canvas = stageRef.current.toCanvas();

        try {
            await uploadCanvasImageToSupabase(canvas, user.id, imageId, supabase);

            const { error: dbError } = await supabase
                .from('processed')
                .insert({
                    user: user.id,
                    media: imageId,
                    format: 'image/png',
                    created_at: new Date().toISOString(),
                });

            if (dbError) {
                console.error(dbError);
                return alert('Error during saving to database');
            }

            window.location.href = `/preview?image=${imageId}`;
        } catch (e) {
            console.error(e);
            alert('Upload failed');
        }
    };
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 720;

    const scaleX = mediumImage.width > MAX_WIDTH ? MAX_WIDTH / mediumImage.width : 1;
    const scaleY = mediumImage.height > MAX_HEIGHT ? MAX_HEIGHT / mediumImage.height : 1;
    const scale = Math.min(scaleX, scaleY);

    return (
        <div className="w-full h-screen bg-blend-darken">
            <Stage
                ref={stageRef}
                width={mediumImage.width * scale}
                height={mediumImage.height * scale}
                scale={{x: scale, y: scale}}
            >
                <Layer>
                    <KonvaImage image={mediumImage}/>
                    {watermarkImage && (
                        <>
                            <KonvaImage
                                image={watermarkImage}
                                draggable
                                ref={watermarkRef}
                                x={50}
                                y={50}
                                opacity={opacity}
                                scale={{ x: watermarkScale, y: watermarkScale }}
                                rotation={rotation}
                            />
                            <Transformer ref={transformerRef}/>
                        </>
                    )}
                </Layer>


            </Stage>


            <div className="p-4 bg-blend-darken shadow-md rounded mt-4 flex gap-6 items-center">
                <div>
                    <label className="block text-sm font-medium text-white">Opacity</label>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-40"
                    />
                    <div className="text-xs text-white mt-1 text-center">{opacity.toFixed(2)}</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white">Scale</label>
                    <input
                        type="range"
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={watermarkScale}
                        onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                        className="w-40"
                    />
                    <div className="text-xs text-white mt-1 text-center">{watermarkScale.toFixed(1)}×</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white">Rotation</label>
                    <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-40"
                    />
                    <div className="text-xs text-white mt-1 text-center">{rotation}°</div>
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={!ready}
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
                Proceed
            </button>
        </div>
    );
}
