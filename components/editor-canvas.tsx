'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { redirect, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/superbase';
import { v4 as uuidv4 } from 'uuid';
import { uploadCanvasImageToSupabase } from "@/components/editor/uploadCanvasImageToSupabase";
import toast from "react-hot-toast";
import ImageControls from "@/components/editor/image-controls";
import WatermarkControls from "@/components/editor/watermark-controls";

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
    const [contrast, setContrast] = useState(0);
    const [brightness, setBrightness] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [value, setValue] = useState(0);
    const [alpha, setAlpha] = useState(0);

    const [wmContrast, setWmContrast] = useState(0);
    const [wmBrightness, setWmBrightness] = useState(0);
    const [wmSaturation, setWmSaturation] = useState(0);
    const [wmValue, setWmValue] = useState(0);
    const [wmAlpha, setWmAlpha] = useState(0);


    const mediumRef = useRef<Konva.Image>(null);
    const stageRef = useRef<Konva.Stage>(null);


    useEffect(() => {
        if (mediumImage && watermarkImage) {
            setReady(true);
        }
    }, [mediumImage, watermarkImage]);


    useEffect(() => {
        if (mediumImage && mediumRef.current) {
            const img = mediumRef.current;
            img.cache();
            img.filters([
                Konva.Filters.Contrast,
                Konva.Filters.Brighten,
                Konva.Filters.HSV,
                Konva.Filters.RGBA,
            ]);
            img.contrast(contrast);
            img.brightness(brightness);
            img.saturation(saturation);
            img.value(value);
            img.alpha(alpha);
            img.getLayer()?.batchDraw();
        }
    }, [contrast, brightness, saturation, value, alpha, mediumImage]);

    useEffect(() => {
        if (watermarkRef.current) {
            watermarkRef.current.cache();
            watermarkRef.current.filters([
                Konva.Filters.Contrast,
                Konva.Filters.Brighten,
                Konva.Filters.HSV,
                Konva.Filters.RGBA
            ]);

            watermarkRef.current.contrast(wmContrast);
            watermarkRef.current.brightness(wmBrightness);
            watermarkRef.current.saturation(wmSaturation);
            watermarkRef.current.value(wmValue);
            watermarkRef.current.alpha(wmAlpha);

            watermarkRef.current.getLayer()?.batchDraw();
        }
    }, [wmContrast, wmBrightness, wmSaturation, wmValue, wmAlpha]);

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
        if (!user) return redirect("/auth/login");

        const imageId = uuidv4();

        const transformerNode = transformerRef.current;
        if (transformerNode) {
            transformerNode.nodes([]);
            transformerNode.getLayer()?.batchDraw();
        }

        await new Promise((resolve) => setTimeout(resolve, 30));

        const canvas = stageRef.current.toCanvas();

        if (transformerNode && watermarkRef.current) {
            transformerNode.nodes([watermarkRef.current]);
            transformerNode.getLayer()?.batchDraw();
        }

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
                toast.error('Error during saving to database');
            }

            window.location.href = `/preview?image=${imageId}`;
        } catch (e) {
            console.error(e);
            toast.error('Upload failed');
        }
    };

    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 720;

    const scaleX = mediumImage.width > MAX_WIDTH ? MAX_WIDTH / mediumImage.width : 1;
    const scaleY = mediumImage.height > MAX_HEIGHT ? MAX_HEIGHT / mediumImage.height : 1;
    const scale = Math.min(scaleX, scaleY);

    return (
        <div className="w-full h-screen bg-blend-darken mb-20">
            <Stage
                ref={stageRef}
                width={mediumImage.width * scale}
                height={mediumImage.height * scale}
                scale={{x: scale, y: scale}}
            >
                <Layer>
                    <KonvaImage image={mediumImage} ref={mediumRef}/>
                    {watermarkImage && (
                        <>
                            <KonvaImage
                                image={watermarkImage}
                                draggable
                                ref={watermarkRef}
                                x={50}
                                y={50}
                                opacity={opacity}
                                scale={{x: watermarkScale, y: watermarkScale}}
                                rotation={rotation}
                            />
                            <Transformer ref={transformerRef}/>
                        </>
                    )}
                </Layer>
            </Stage>


            <WatermarkControls
                opacity={opacity}
                setOpacity={setOpacity}
                scale={watermarkScale}
                setScale={setWatermarkScale}
                rotation={rotation}
                setRotation={setRotation}
                contrast={wmContrast}
                setContrast={setWmContrast}
                brightness={wmBrightness}
                setBrightness={setWmBrightness}
                saturation={wmSaturation}
                setSaturation={setWmSaturation}
                value={wmValue}
                setValue={setWmValue}
                alpha={wmAlpha}
                setAlpha={setWmAlpha} />

                <ImageControls
                    contrast={contrast}
                    setContrast={setContrast}
                    brightness={brightness}
                    setBrightness={setBrightness}
                    saturation={saturation}
                    setSaturation={setSaturation}
                    value={value}
                    setValue={setValue}
                    alpha={alpha}
                    setAlpha={setAlpha} />
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
