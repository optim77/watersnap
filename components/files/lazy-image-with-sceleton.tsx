import { useState } from 'react';

export const LazyImageWithSkeleton = ({
                                          src,
                                          alt,
                                          className,
                                          onClick,
                                      }: {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
}) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-gray-700 animate-pulse rounded" />
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onClick={onClick}
                className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
                    loaded ? 'opacity-100' : 'opacity-0'
                } cursor-pointer`}
            />
        </div>
    );
};
