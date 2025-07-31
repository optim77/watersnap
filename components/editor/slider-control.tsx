'use client';

import React from 'react';

interface SliderControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    suffix?: string;
    decimals?: number;
}

const SliderControl: React.FC<SliderControlProps> = ({
                                                         label,
                                                         value,
                                                         min,
                                                         max,
                                                         step = 0.01,
                                                         onChange,
                                                         suffix = '',
                                                         decimals = 0
                                                     }) => {
    return (
        <div className="w-40">
            <label className="block text-sm font-medium text-white">{label}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full"
            />
            <div className="text-xs text-white mt-1 text-center">
                {value.toFixed(decimals)}{suffix}
            </div>
        </div>
    );
};

export default SliderControl;
