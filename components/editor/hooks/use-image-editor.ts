import { useState } from 'react';

export function useImageEditor() {
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

    return {
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
    };
}
