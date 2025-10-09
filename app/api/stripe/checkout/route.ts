import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const priceIds = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};

export async function POST(request: Request) {
  try {
    // Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const { plan } = await request.json();

    if (!plan || !priceIds[plan as keyof typeof priceIds]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Use Clerk for authentication (standardized auth system)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id, status")
      .eq("user_id", userId)
      .single();

    // Don't allow creating checkout if already has active subscription
    if (existingSubscription?.status === "active" || existingSubscription?.status === "trialing") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    let customerId = existingSubscription?.stripe_customer_id;

    // Create checkout session with improved configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: priceIds[plan as keyof typeof priceIds],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
        plan_name: plan,
        price_id: priceIds[plan as keyof typeof priceIds],
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_name: plan,
        },
        trial_period_days: 14, // 14-day trial (matches marketing copy)
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      payment_method_types: ["card"],
    };

    // Use existing customer or create new one
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_creation = "always";
      // Note: Clerk doesn't expose email directly, use client_reference_id instead
      sessionConfig.client_reference_id = userId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
