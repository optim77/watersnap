import { supabase } from "@/lib/superbase";
import { User } from "@supabase/auth-js";

export const getUserCredit = async (user: User) => {
    const { data, error } = await supabase
        .from("credits")
        .select("credits")
        .eq("user", user.id)
        .single();
    return {data, error};

}