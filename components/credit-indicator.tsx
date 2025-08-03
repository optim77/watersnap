"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserCredit } from "@/components/utils/get-user-credit";

export function CreditIndicator() {
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            const supabase = createClient();
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;

            if (!user) return;

            const { data: creditData } = await getUserCredit(user);
            setCredits(creditData?.credits ?? 0);
        };

        fetchCredits();
    }, []);

    if (credits === null) return null;

    return (
        <div className="text-xs text-muted-foreground font-medium">
            Your credits: <span className="font-bold">{credits}</span>
        </div>
    );
}
