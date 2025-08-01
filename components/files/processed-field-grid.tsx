import { Download } from "lucide-react";
import { FileItem } from "@/components/types/file";
import { LazyImageWithSkeleton } from "@/components/files/lazy-image-with-sceleton";
import toast from "react-hot-toast";
import { supabase } from "@/lib/superbase";

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

    const handleDelete = async (item: FileItem) => {
        toast((t) => (
            <span className="text-black">
        Delete <strong>{item.name}</strong>?
        <div className="mt-2 flex gap-2 justify-end">
          <button
              className="px-2 py-1 bg-red-600 rounded text-white text-xs"
              onClick={async () => {
                  toast.dismiss(t.id);
                  const { error } = await supabase.storage
                      .from("watersnap")
                      .remove([item.path]);
                  if (error) {
                      toast.error("Failed to delete");
                  } else {
                      toast.success("Deleted");
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

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
            {items.map((item) => (
                <div
                    key={item.name}
                    className="relative group rounded overflow-hidden border-2 border-gray-700 hover:border-blue-500"
                    onClick={() => onSelect?.(item)}
                >
                    <LazyImageWithSkeleton
                        src={item.url}
                        alt={item.name}
                        className="w-full h-40 object-cover"
                    />

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
