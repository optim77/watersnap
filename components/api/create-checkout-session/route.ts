import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { planId } = body;

    const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

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
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans/cancel`,
    });

    return NextResponse.json({ url: session.url });
}
