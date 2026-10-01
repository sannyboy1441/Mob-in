// =====================================================
// MOB'IN SUBSCRIPTION MODULE - SHARED TYPE CONTRACTS
// =====================================================

/**
 * @typedef {'monthly' | 'annual'} BillingInterval
 */

/**
 * @typedef {'Active' | 'Grace_Period' | 'Cancelled' | 'Expired' | 'Free_Trial' | 'Comped_Partner'} SubscriptionStatus
 */

/**
 * @typedef {'gcash' | 'maya' | 'card' | 'qrph'} PaymentChannel
 */

/**
 * @typedef {'tier_upgrade' | 'tier_downgrade' | 'status_override' | 'grace_extension' | 'manual_comp' | 'auto_renew_toggle' | 'plan_configured'} AuditActionType
 */

/**
 * @typedef {Object} FeatureFlags
 * @property {boolean} instantChat
 * @property {boolean} verifiedBadge
 * @property {boolean} topRankSearch
 * @property {boolean} viewingScheduler
 * @property {number} maxPhotosPerListing
 * @property {boolean} leadAnalytics
 * @property {boolean} leaseTemplates
 * @property {boolean} multiStaffAccess
 */

/**
 * @typedef {Object} SubscriptionPlan
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} [annualPrice]
 * @property {BillingInterval} billingInterval
 * @property {number} unitLimit - Maximum active property listings allowed
 * @property {boolean} [isPopular]
 * @property {boolean} isActive
 * @property {string} [badge]
 * @property {string} description
 * @property {string[]} features
 * @property {FeatureFlags} [featureFlags]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} LandlordSubscription
 * @property {string} id
 * @property {string} landlordId
 * @property {string} landlordEmail
 * @property {string} landlordName
 * @property {string} planId
 * @property {SubscriptionStatus} status
 * @property {PaymentChannel} paymentChannel
 * @property {string} paymentGatewayRef
 * @property {string} currentPeriodStart
 * @property {string} currentPeriodEnd
 * @property {boolean} autoRenew
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} SubscriptionInvoice
 * @property {string} id
 * @property {string} subscriptionId
 * @property {string} landlordId
 * @property {string} orNumber - Official Receipt Number (BIR compliant)
 * @property {number} amount
 * @property {number} vatAmount
 * @property {'Paid' | 'Pending' | 'Failed'} status
 * @property {PaymentChannel} paymentChannel
 * @property {string} paidAt
 * @property {string} [invoiceUrl]
 */

/**
 * @typedef {Object} SubscriptionAuditLog
 * @property {string} id
 * @property {string} adminId
 * @property {string} adminEmail
 * @property {AuditActionType} actionType
 * @property {string} targetLandlordId
 * @property {string} targetLandlordEmail
 * @property {SubscriptionStatus} previousStatus
 * @property {SubscriptionStatus} newStatus
 * @property {string} reason - Compulsory reason for audit tracking
 * @property {string} timestamp
 */

/**
 * @typedef {Object} CheckoutPayload
 * @property {string} landlordId
 * @property {string} landlordEmail
 * @property {string} landlordName
 * @property {string} planId
 * @property {BillingInterval} billingInterval
 * @property {PaymentChannel} paymentChannel
 * @property {string} [tin]
 */

/**
 * @typedef {Object} OverridePayload
 * @property {string} landlordId
 * @property {string} landlordEmail
 * @property {SubscriptionStatus} newStatus
 * @property {string} [extendedUntil]
 * @property {string} reason - Mandatory rationale for compliance log
 */

export {};
