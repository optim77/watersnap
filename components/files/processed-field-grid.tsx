import { Download } from "lucide-react";
import { FileItem } from "@/components/files/types/file";
import { LazyImageWithSkeleton } from "@/components/files/lazy-image-with-sceleton";
import { useAction } from "@/components/files/hooks/useAction";
import Link from "next/link";

export const ProcessedFileGrid = ({
                                      items,
                                      onSelect,
                                      onDelete,
                                      showDownload = true,
                                  }: {
    items: FileItem[];
    onSelect?: (item: FileItem) => void;
    onDelete?: (item: FileItem) => void;
    showDownload?: boolean;
}) => {
    const {handleDelete, handleDownload} = useAction(onDelete);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
            {items.map((item) => (
                <div
                    key={item.name}
                    className="relative group rounded overflow-hidden border-2 border-gray-700 hover:border-blue-500"
                    onClick={() => onSelect?.(item)}
                >
                    <Link href={`/preview?image=${item.name.split('.')[0]}`} >
                        <LazyImageWithSkeleton
                            src={item.url}
                            alt={item.name}
                            className="w-full h-40 object-cover"
                        />
                    </Link>


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

                    <div className="text-center text-xs text-white p-1 truncate">{item.name}</div>
                </div>
            ))}
        </div>
    );
};
