'use client';

import { useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useSearchParams, redirect } from 'next/navigation';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

import { supabase } from '@/lib/superbase';
import { useSignedUrls } from "@/components/editor/hooks/use-signed-urls";
import { useImageEditor } from "@/components/editor/hooks/use-image-editor";
import { useApplyFilters } from "@/components/editor/hooks/use-apply-filters";
import { uploadCanvasImageToSupabase } from "@/components/editor/uploadCanvasImageToSupabase";
import { scaleToFit } from "@/components/utils/image";
import WatermarkControls from "@/components/editor/watermark-controls";
import ImageControls from "@/components/editor/image-controls";

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;

export default function EditorCanvas() {
    const searchParams = useSearchParams();
    const mediumUUID = searchParams.get('medium');
    const watermarkUUID = searchParams.get('watermark');

    const { mediumUrl, watermarkUrl } = useSignedUrls(mediumUUID, watermarkUUID);
    const [mediumImage] = useImage(mediumUrl || '', 'anonymous');
    const [watermarkImage] = useImage(watermarkUrl || '', 'anonymous');

    const {
        opacity, setOpacity,
        watermarkScale, setWatermarkScale,
        rotation, setRotation,
        contrast, setContrast,
        brightness, setBrightness,
        saturation, setSaturation,
        value, setValue,
        alpha, setAlpha,
        wmContrast, setWmContrast,
        wmBrightness, setWmBrightness,
        wmSaturation, setWmSaturation,
        wmValue, setWmValue,
        wmAlpha, setWmAlpha
    } = useImageEditor();

    const stageRef = useRef<Konva.Stage>(null);
    const mediumRef = useRef<Konva.Image>(null);
    const watermarkRef = useRef<Konva.Image>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    useApplyFilters(mediumRef, { contrast, brightness, saturation, value, alpha });
    useApplyFilters(watermarkRef, { contrast: wmContrast, brightness: wmBrightness, saturation: wmSaturation, value: wmValue, alpha: wmAlpha });

    useEffect(() => {
        if (transformerRef.current && watermarkRef.current) {
            transformerRef.current.nodes([watermarkRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [watermarkImage]);

    const handleExport = async () => {
        if (!stageRef.current) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return redirect('/auth/login');

        const imageId = uuidv4();
        transformerRef.current?.nodes([]);
        transformerRef.current?.getLayer()?.batchDraw();

        await new Promise(res => setTimeout(res, 30));
        const canvas = stageRef.current.toCanvas();

        transformerRef.current?.nodes([watermarkRef.current!]);
        transformerRef.current?.getLayer()?.batchDraw();

        try {
            await uploadCanvasImageToSupabase(canvas, user.id, imageId, supabase);
            await supabase.from('processed').insert({
                user: user.id,
                media: imageId,
                format: 'image/png',
                created_at: new Date().toISOString()
            });

            window.location.href = `/preview?image=${imageId}`;
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        }
    };

    if (!mediumImage) return <p>Loading image...</p>;

    const scale = scaleToFit(mediumImage.width, mediumImage.height, MAX_WIDTH, MAX_HEIGHT);

    return (
        <div className="w-full h-screen p-4 bg-gray-900">
            <Stage
                ref={stageRef}
                width={mediumImage.width * scale}
                height={mediumImage.height * scale}
                scale={{ x: scale, y: scale }}
            >
                <Layer>
                    <KonvaImage image={mediumImage} ref={mediumRef} />
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
                            <Transformer ref={transformerRef} />
                        </>
                    )}
                </Layer>
            </Stage>

            <WatermarkControls
                opacity={opacity} setOpacity={setOpacity}
                scale={watermarkScale} setScale={setWatermarkScale}
                rotation={rotation} setRotation={setRotation}
                contrast={wmContrast} setContrast={setWmContrast}
                brightness={wmBrightness} setBrightness={setWmBrightness}
                saturation={wmSaturation} setSaturation={setWmSaturation}
                value={wmValue} setValue={setWmValue}
                alpha={wmAlpha} setAlpha={setWmAlpha}
            />

            <ImageControls
                contrast={contrast} setContrast={setContrast}
                brightness={brightness} setBrightness={setBrightness}
                saturation={saturation} setSaturation={setSaturation}
                value={value} setValue={setValue}
                alpha={alpha} setAlpha={setAlpha}
            />

            <div className="text-center mt-6">
                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded text-sm"
                >
                    Export
                </button>
            </div>
        </div>
    );
}
