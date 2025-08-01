import { useEffect, RefObject } from 'react';
import Konva from 'konva';

type FilterParams = {
    contrast?: number;
    brightness?: number;
    saturation?: number;
    value?: number;
    alpha?: number;
};

export const useApplyFilters = (
    imageRef: RefObject<Konva.Image | null>,
    { contrast, brightness, saturation, value, alpha }: FilterParams
) => {
    useEffect(() => {
        const image = imageRef.current;
        if (!image) return;

        image.cache();
        image.filters([
            Konva.Filters.Contrast,
            Konva.Filters.Brighten,
            Konva.Filters.HSV,
            Konva.Filters.RGBA,
        ]);

        if (contrast !== undefined) image.contrast(contrast);
        if (brightness !== undefined) image.brightness(brightness);
        if (saturation !== undefined) image.saturation(saturation);
        if (value !== undefined) image.value(value);
        if (alpha !== undefined) image.alpha(alpha);

        image.getLayer()?.batchDraw();
    }, [imageRef, contrast, brightness, saturation, value, alpha]);
};
