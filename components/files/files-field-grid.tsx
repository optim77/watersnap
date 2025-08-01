import { FileItem } from "@/components/types/file";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { LazyImageWithSkeleton } from "@/components/files/lazy-image-with-sceleton";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/superbase";

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
    const handleDelete = async (item: FileItem) => {
        toast((t) => (
            <span className="text-black">
        Are you sure you want to delete <strong>{item.name}</strong>?
        <div className="mt-2 flex gap-2 justify-end">
          <button
              className="px-2 py-1 bg-red-600 rounded text-white text-xs"
              onClick={async () => {
                  toast.dismiss(t.id);
                  const { error } = await supabase.storage
                      .from("watersnap")
                      .remove([item.path]);
                  if (error) {
                      toast.error("Failed to delete the file");
                  } else {
                      toast.success("File deleted");
                      onDelete?.(item);
                  }
              }}
          >
            Yes
          </button>
          <button
              className="px-2 py-1 bg-gray-500 rounded text-white text-xs"
              onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </span>
        ));
    };

    const handleDownload = async (item: FileItem) => {
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${item.name}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
        }
    };

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
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
