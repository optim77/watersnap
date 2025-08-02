import { FileItem } from "@/components/files/types/file";
import toast from "react-hot-toast";
import { supabase } from "@/lib/superbase";

export const useAction = (onDelete?: (item: FileItem) => void) => {

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

    return { handleDelete, handleDownload };
}