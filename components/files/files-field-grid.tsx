import { FileItem } from "@/components/files/types/file";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { LazyImageWithSkeleton } from "@/components/files/lazy-image-with-sceleton";
import { Download } from "lucide-react";
import { useAction } from "@/components/files/hooks/useAction";

export const FileGrid = ({
                             items,
                             selected,
                             onSelect,
                             onDelete,
                             loading = false,
                             showDownload = true,
                         }: {
    items: FileItem[];
    selected?: FileItem | null;
    onSelect?: (item: FileItem) => void;
    onDelete?: (item: FileItem) => void;
    loading?: boolean;
    showDownload?: boolean;
}) => {
    const {handleDelete, handleDownload} = useAction(onDelete);

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                {Array(6)
                    .fill(null)
                    .map((_, i) => (
                        <ImageSkeleton key={i} />
                    ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
            {items.map((item) => {
                const isSelected = selected?.name === item.name;

                return (
                    <div
                        key={item.name}
                        className={`relative group rounded overflow-hidden border-2 transition-all ${
                            isSelected ? "border-blue-500 ring-2 ring-blue-300" : "border-transparent"
                        }`}
                        onClick={() => onSelect?.(item)}
                    >
                        <LazyImageWithSkeleton
                            src={item.url}
                            alt={item.name}
                            className="w-full h-40 object-cover"
                        />

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                            }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                        >
                            🗑️
                        </button>

                        {showDownload && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(item);
                                }}
                                className="absolute top-1 left-1 bg-black/60 hover:bg-black/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Download"
                            >
                                <Download className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
