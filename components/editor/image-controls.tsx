'use client';

import React from 'react';
import SliderControl from "@/components/editor/slider-control";

interface Props {
    contrast: number;
    setContrast: (val: number) => void;
    brightness: number;
    setBrightness: (val: number) => void;
    saturation: number;
    setSaturation: (val: number) => void;
    value: number;
    setValue: (val: number) => void;
    alpha: number;
    setAlpha: (val: number) => void;
}

const ImageControls: React.FC<Props> = ({
                                            contrast, setContrast,
                                            brightness, setBrightness,
                                            saturation, setSaturation,
                                            value, setValue,
                                            alpha, setAlpha
                                        }) => {
    return (
        <div className="p-4 bg-gray-800 rounded-lg mt-4 text-white">
            <h2 className="text-lg font-semibold mb-4">Image Adjustments</h2>
            <div className="flex flex-wrap gap-6">
                <SliderControl label="Contrast" value={contrast} min={-100} max={100} onChange={setContrast} />
                <SliderControl label="Brightness" value={brightness} min={-1} max={1} step={0.01} onChange={setBrightness} decimals={2} />
                <SliderControl label="Saturation" value={saturation} min={-2} max={2} step={0.01} onChange={setSaturation} decimals={2} />
                <SliderControl label="HVS" value={value} min={-1} max={1} step={0.01} onChange={setValue} decimals={2} />
                <SliderControl label="Alpha" value={alpha} min={0} max={1} step={0.01} onChange={setAlpha} decimals={2} />
            </div>
        </div>
    );
};

export default ImageControls;
