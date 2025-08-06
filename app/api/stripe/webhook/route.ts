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
        console.error("❌ Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("✅ Webhook received:", event.type);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("🎯 Processing checkout.session.completed");
        console.log("🔍 Metadata:", session.metadata);

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

        const { data: plan, error: planError } = await supabase
            .from("plans")
            .select("*")
            .eq("id", planId)
            .single();

        if (planError) {
            console.error("❌ Plan not found:", planError.message);
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        console.log("✅ Plan found:", plan);

        const { error: creditError } = await supabase
            .from("credits")
            .upsert(
                {
                    user: userId,
                    credits: plan.credits,
                },
                {
                    onConflict: "user",
                    ignoreDuplicates: false,
                }
            );

        if (creditError) {
            console.error("❌ Failed to upsert credits:", creditError.message);
        } else {
            console.log("✅ Credits added.");
        }

        const { error: subError } = await supabase.from("user_plan").insert({
            user: userId,
            plan: plan.id,
            created_at: new Date().toISOString(),
            end_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            count_update: 0,
        });

        if (subError) {
            console.error("❌ Failed to insert subscription:", subError.message);
        } else {
            console.log("✅ Subscription inserted.");
        }
    }

    return NextResponse.json({ received: true });
}
