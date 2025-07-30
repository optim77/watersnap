import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import UploadSection from "@/components/upload-section";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const {data, error} = await supabase.auth.getClaims();
    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-12">
            <div className="flex flex-col gap-2 items-start">
                <UploadSection />
            </div>
        </div>
    );
}
