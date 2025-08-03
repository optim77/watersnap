import { supabase } from "@/lib/superbase";
import { User } from "@supabase/auth-js";
import { throwAlert } from "@/components/utils/throw-alert";

export const decreaseCredit = async (user: User) => {
    console.error("DECREASE 2");
    const { error } = await supabase.rpc("decrement_credits", {
        uid: user.id,
        amount: 10,
    });

    if (error) throwAlert(error);
}