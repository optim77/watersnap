import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { planId } = body;

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
                set() {},
                remove() {},
            },
        }
    );

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

    if (planError || !plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: plan.name,
                        description: plan.describe,
                    },
                    unit_amount: plan.price * 100,
                },
                quantity: 1,
            },
        ],
        metadata: {
            plan_id: plan.id,
            user_id: user.id,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans/success?planId=${plan.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans`,
    });

    return NextResponse.json({ url: session.url });
}
