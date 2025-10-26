export interface Subscription {
  id: string;
  userId: string;
  planName: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionLimits {
  analyses: number; // -1 for unlimited
  realTimeData: boolean;
  advancedSignals: boolean;
  priorityProcessing: boolean;
  apiAccess: boolean;
  customModels?: boolean;
  dedicatedSupport?: boolean;
}

export interface SubscriptionUsage {
  userId: string;
  planName: 'starter' | 'pro' | 'enterprise';
  periodStart: string;
  periodEnd: string;
  analysesUsed: number;
  analysesLimit: number;
  apiCallsUsed?: number;
  apiCallsLimit?: number;
}

export interface CreateSubscriptionParams {
  userId: string;
  planName: 'starter' | 'pro' | 'enterprise';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  status?: 'active' | 'trialing' | 'incomplete';
}

export interface UpdateSubscriptionParams {
  planName?: 'starter' | 'pro' | 'enterprise';
  status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  stripePriceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
}

export class SubscriptionModel {
  static fromDatabase(data: Record<string, unknown>): Subscription {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      planName: data.plan_name as 'starter' | 'pro' | 'enterprise',
      status: data.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
      stripeCustomerId: data.stripe_customer_id as string,
      stripeSubscriptionId: data.stripe_subscription_id as string,
      stripePriceId: data.stripe_price_id as string,
      currentPeriodStart: data.current_period_start as string,
      currentPeriodEnd: data.current_period_end as string,
      cancelAtPeriodEnd: data.cancel_at_period_end as boolean,
      canceledAt: data.canceled_at as string | undefined,
      trialStart: data.trial_start as string | undefined,
      trialEnd: data.trial_end as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  static toDatabase(subscription: Partial<Subscription>): Record<string, unknown> {
    return {
      ...(subscription.id && { id: subscription.id }),
      ...(subscription.userId && { user_id: subscription.userId }),
      ...(subscription.planName && { plan_name: subscription.planName }),
      ...(subscription.status && { status: subscription.status }),
      ...(subscription.stripeCustomerId && { stripe_customer_id: subscription.stripeCustomerId }),
      ...(subscription.stripeSubscriptionId && { stripe_subscription_id: subscription.stripeSubscriptionId }),
      ...(subscription.stripePriceId && { stripe_price_id: subscription.stripePriceId }),
      ...(subscription.currentPeriodStart && { current_period_start: subscription.currentPeriodStart }),
      ...(subscription.currentPeriodEnd && { current_period_end: subscription.currentPeriodEnd }),
      ...(subscription.cancelAtPeriodEnd !== undefined && { cancel_at_period_end: subscription.cancelAtPeriodEnd }),
      ...(subscription.canceledAt !== undefined && { canceled_at: subscription.canceledAt }),
      ...(subscription.trialStart !== undefined && { trial_start: subscription.trialStart }),
      ...(subscription.trialEnd !== undefined && { trial_end: subscription.trialEnd }),
    };
  }

  static getLimits(planName: 'starter' | 'pro' | 'enterprise'): SubscriptionLimits {
    const limitsMap: Record<'starter' | 'pro' | 'enterprise', SubscriptionLimits> = {
      starter: {
        analyses: 100,
        realTimeData: false,
        advancedSignals: false,
        priorityProcessing: false,
        apiAccess: false,
      },
      pro: {
        analyses: -1, // unlimited
        realTimeData: true,
        advancedSignals: true,
        priorityProcessing: true,
        apiAccess: false,
      },
      enterprise: {
        analyses: -1, // unlimited
        realTimeData: true,
        advancedSignals: true,
        priorityProcessing: true,
        apiAccess: true,
        customModels: true,
        dedicatedSupport: true,
      },
    };

    return limitsMap[planName];
  }

  static isActive(subscription: Subscription): boolean {
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  static isExpired(subscription: Subscription): boolean {
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    return periodEnd < now;
  }

  static canAccess(subscription: Subscription | null, feature: keyof SubscriptionLimits): boolean {
    if (!subscription || !this.isActive(subscription)) {
      return false;
    }

    const limits = this.getLimits(subscription.planName);
    return Boolean(limits[feature]);
  }
}
