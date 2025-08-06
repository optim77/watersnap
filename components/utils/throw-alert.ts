import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";
import toast from "react-hot-toast";

export const throwAlert = (err: PostgrestError | StorageError | string | null) => {
    console.error(err);
    toast.error('Upload failed!');
};