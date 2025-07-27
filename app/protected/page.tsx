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
            <div className="w-full">
            </div>
            <div className="flex flex-col gap-2 items-start">
          {/*<pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">*/}
          {/*{JSON.stringify(data.claims, null, 2)}*/}
          {/*  </pre>*/}
                <UploadSection />
            </div>
        </div>
    );
}
