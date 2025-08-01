export function scaleToFit(width: number, height: number, maxWidth: number, maxHeight: number) {
    const scaleX = width > maxWidth ? maxWidth / width : 1;
    const scaleY = height > maxHeight ? maxHeight / height : 1;
    return Math.min(scaleX, scaleY);
}
