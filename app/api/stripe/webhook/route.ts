import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
    }

    // Obsługa zakończonej płatności
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const planId = session.metadata?.plan_id;
        const userId = session.metadata?.user_id;

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
            {
                cookies: {
                    get() {},
                    set() {},
                    remove() {},
                },
            }
        );

        // Pobierz plan
        const { data: plan } = await supabase
            .from("plans")
            .select("*")
            .eq("id", planId)
            .single();

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        // Dodaj kredyty do użytkownika (lub zaktualizuj)
        await supabase
            .from("credits")
            .upsert({
                user: userId,
                credits: plan.credits, // zakładam że dodałeś pole "credits" w tabeli plans
            }, {
                onConflict: "user",
                ignoreDuplicates: false,
            });

        // (Opcjonalnie) zapisz subskrypcję
        await supabase.from("subscriptions").insert({
            user: userId,
            plan: plan.id,
            created_at: new Date().toISOString(),
            end_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            count_update: 0,
        });
    }

    return NextResponse.json({ received: true });
}
