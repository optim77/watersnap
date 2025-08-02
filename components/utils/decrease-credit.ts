import { supabase } from "@/lib/superbase";
import toast from "react-hot-toast";
import { User } from "@supabase/auth-js";

export const decreaseCredit = async (user: User) => {
    const { error } = await supabase.rpc("decrement_credits", {
        uid: user.id,
        amount: 10,
    });

    if (error) {
        toast.error("Failed to decrement credits or not enough credits.");
    }
}