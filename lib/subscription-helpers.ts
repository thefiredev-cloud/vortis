import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PRICING_PLANS, PlanName } from "@/lib/stripe";

/**
 * Subscription and usage tracking helper functions
 *
 * NOTE: These functions use the admin Supabase client to bypass RLS.
 * They should only be called from server-side code (API routes, server actions).
 * With Clerk authentication, we manage authorization in application code.
 */

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_name: PlanName;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  plan_name: string;
  analyses_used: number;
  analyses_limit: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planName: PlanName;
  status: string;
  analysesUsed: number;
  analysesLimit: number;
  analysesRemaining: number;
  isUnlimited: boolean;
  canAnalyze: boolean;
  periodEnd: Date | null;
}

/**
 * Get user's current subscription
 * @param userId - Clerk user ID (string format: "user_...")
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserSubscription;
}

/**
 * Get user's current usage tracking
 * @param userId - Clerk user ID (string format: "user_...")
 */
export async function getUserUsage(
  userId: string
): Promise<UsageTracking | null> {
  const supabase = getSupabaseAdmin();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .lte("period_start", now)
    .gte("period_end", now)
    .order("period_start", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UsageTracking;
}

/**
 * Get complete subscription status for a user
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const subscription = await getUserSubscription(userId);
  const usage = await getUserUsage(userId);

  // Default to free tier
  const planName: PlanName =
    (subscription?.plan_name as PlanName) || "starter";
  const status = subscription?.status || "active";
  const hasActiveSubscription =
    !!subscription && ["active", "trialing"].includes(status);

  const analysesUsed = usage?.analyses_used || 0;
  const analysesLimit = usage?.analyses_limit || 10; // Free tier default
  const isUnlimited = analysesLimit === -1;
  const analysesRemaining = isUnlimited
    ? Infinity
    : Math.max(0, analysesLimit - analysesUsed);
  const canAnalyze = isUnlimited || analysesRemaining > 0;

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  return {
    hasActiveSubscription,
    planName,
    status,
    analysesUsed,
    analysesLimit,
    analysesRemaining,
    isUnlimited,
    canAnalyze,
    periodEnd,
  };
}

/**
 * Check if user can perform an analysis
 */
export async function canPerformAnalysis(userId: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status.canAnalyze;
}

/**
 * Increment user's analysis usage
 * @param userId - Clerk user ID (string format: "user_...")
 */
export async function incrementAnalysisUsage(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  // Check if user can analyze first
  const canAnalyze = await canPerformAnalysis(userId);
  if (!canAnalyze) {
    return false;
  }

  const now = new Date().toISOString();

  // Get current usage
  const usage = await getUserUsage(userId);
  if (!usage) {
    console.error("No usage tracking found for user:", userId);
    return false;
  }

  // Increment analyses_used
  const { error } = await supabase
    .from("usage_tracking")
    .update({
      analyses_used: usage.analyses_used + 1,
      updated_at: now,
    })
    .eq("id", usage.id);

  if (error) {
    console.error("Failed to increment usage:", error);
    return false;
  }

  return true;
}

/**
 * Get plan details by name
 */
export function getPlanDetails(planName: PlanName) {
  return PRICING_PLANS[planName];
}

/**
 * Format plan price for display
 */
export function formatPlanPrice(planName: PlanName): string {
  const plan = getPlanDetails(planName);
  if (!plan) return "$0";

  return `$${plan.price}/${plan.interval}`;
}

/**
 * Get plan features
 */
export function getPlanFeatures(planName: PlanName): string[] {
  const plan = getPlanDetails(planName);
  return plan?.features ? [...plan.features] : [];
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof (typeof PRICING_PLANS)["starter"]["limits"]
): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  const plan = getPlanDetails(status.planName);

  if (!plan) return false;

  const featureValue = plan.limits[feature];
  return featureValue === true || featureValue === -1;
}

/**
 * Get days until subscription renewal
 */
export async function getDaysUntilRenewal(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) return 0;

  const periodEnd = new Date(subscription.current_period_end);
  const now = new Date();
  const diffTime = periodEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export async function isSubscriptionExpiringSoon(
  userId: string
): Promise<boolean> {
  const daysUntilRenewal = await getDaysUntilRenewal(userId);
  return daysUntilRenewal <= 7 && daysUntilRenewal > 0;
}

/**
 * Get usage percentage
 */
export async function getUsagePercentage(userId: string): Promise<number> {
  const status = await getSubscriptionStatus(userId);

  if (status.isUnlimited) return 0;

  if (status.analysesLimit === 0) return 100;

  return Math.round((status.analysesUsed / status.analysesLimit) * 100);
}

/**
 * Check if user is approaching usage limit (>80%)
 */
export async function isApproachingLimit(userId: string): Promise<boolean> {
  const percentage = await getUsagePercentage(userId);
  return percentage >= 80;
}

/**
 * Get recommended upgrade plan
 */
export function getRecommendedUpgrade(
  currentPlan: PlanName
): PlanName | null {
  const upgradePath: Record<PlanName, PlanName | null> = {
    starter: "pro",
    pro: "enterprise",
    enterprise: null,
  };

  return upgradePath[currentPlan] || null;
}

/**
 * Calculate potential savings with annual billing
 */
export function calculateAnnualSavings(planName: PlanName): number {
  const plan = getPlanDetails(planName);
  if (!plan) return 0;

  const monthlyTotal = plan.price * 12;
  const annualPrice = monthlyTotal * 0.8; // 20% discount
  const savings = monthlyTotal - annualPrice;

  return Math.round(savings);
}

/**
 * Format usage display text
 */
export function formatUsageDisplay(
  analysesUsed: number,
  analysesLimit: number
): string {
  if (analysesLimit === -1) {
    return `${analysesUsed} analyses (Unlimited)`;
  }

  return `${analysesUsed} of ${analysesLimit} analyses used`;
}

/**
 * Get subscription badge color
 */
export function getSubscriptionBadgeColor(planName: PlanName): string {
  const colors: Record<PlanName, string> = {
    starter: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    pro: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  };

  return colors[planName] || colors.starter;
}

/**
 * Check if plan upgrade is available
 */
export function canUpgradePlan(currentPlan: PlanName): boolean {
  return getRecommendedUpgrade(currentPlan) !== null;
}

/**
 * Get plan comparison for upgrade prompt
 */
export function getPlanComparison(
  currentPlan: PlanName,
  targetPlan: PlanName
): {
  currentPlan: string;
  targetPlan: string;
  priceDifference: number;
  additionalFeatures: string[];
} | null {
  const current = getPlanDetails(currentPlan);
  const target = getPlanDetails(targetPlan);

  if (!current || !target) return null;

  const currentFeatures = [...current.features];
  const targetFeatures = [...target.features];

  return {
    currentPlan: current.name,
    targetPlan: target.name,
    priceDifference: target.price - current.price,
    additionalFeatures: targetFeatures.filter(
      (f) => !currentFeatures.includes(f)
    ),
  };
}
