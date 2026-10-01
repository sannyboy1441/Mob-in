import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import NumberFlow from "@number-flow/react";
import { CheckCheck, Home, Building2, Sparkles, ShieldCheck, MessageSquare, Key, Users } from "lucide-react";
import { motion } from "motion/react";
import { getSubscriptionPlans } from "../../services/subscriptionService";

const DEFAULT_RENTER_PLAN = {
  id: "plan-renter-free",
  name: "Renter Pass",
  category: "Renter",
  description: "Essential tools for students and workers looking for safe verified accommodations.",
  price: 0,
  yearlyPrice: 0,
  annualPrice: 0,
  buttonText: "Download Mobile App",
  buttonVariant: "outline",
  popular: false,
  badge: null,
  features: [
    { text: "Unlimited Rental Search & Filters", icon: <Home size={18} /> },
    { text: "Direct In-app Messaging with Landlords", icon: <MessageSquare size={18} /> },
    { text: "Verified Accommodations Access", icon: <ShieldCheck size={18} /> },
  ],
  includes: [
    "Free Renter Benefits:",
    "Instant Room Comparison",
    "Saved Favorite Properties",
    "Landlord Ratings & Reviews",
    "Zero Booking Platform Fees",
  ],
};

function buildDisplayPlans(rawPlans = []) {
  if (!Array.isArray(rawPlans) || rawPlans.length === 0) return defaultPlans;

  const active = rawPlans.filter((p) => p.isActive !== false && p.is_active !== false);
  if (active.length === 0) return defaultPlans;

  const renterPlans = active.filter((p) => (p.category || "").toLowerCase() === "renter");
  const landlordPlans = active.filter((p) => (p.category || "landlord").toLowerCase() === "landlord");

  const displayList = [];

  // 1. Renter tier (custom or free default)
  if (renterPlans.length > 0) {
    renterPlans.forEach((rp) => {
      displayList.push({
        id: rp.id,
        name: rp.name,
        category: "Renter",
        description: rp.description || "Essential tools for students and workers looking for safe verified accommodations.",
        price: Number(rp.price || 0),
        yearlyPrice: rp.annualPrice || rp.yearlyPrice || Math.round(Number(rp.price || 0) * 12 * 0.8),
        popular: !!rp.isPopular || !!rp.popular,
        badge: rp.badge || null,
        buttonText: Number(rp.price) === 0 ? "Download Mobile App" : "Get Renter Pass",
        buttonVariant: Number(rp.price) === 0 ? "outline" : "default",
        features: Array.isArray(rp.features) && rp.features.length > 0 ? rp.features : DEFAULT_RENTER_PLAN.features,
        includes: Array.isArray(rp.includes) && rp.includes.length > 0 ? rp.includes : DEFAULT_RENTER_PLAN.includes,
      });
    });
  } else {
    displayList.push(DEFAULT_RENTER_PLAN);
  }

  // 2. Active Landlord plans published by Admin
  landlordPlans.forEach((lp) => {
    const priceNum = Number(lp.price || 0);
    const propertiesLimit = lp.propertiesLimit || lp.properties_limit || (lp.unitLimit ? `${lp.unitLimit} ${lp.unitLimit === 1 ? "Property" : "Properties"}` : "1 Property");
    const isPopular = !!lp.isPopular || !!lp.popular;

    displayList.push({
      id: lp.id,
      name: lp.name,
      category: "Landlord",
      description: lp.description || `Essential listing management for ${propertiesLimit.toLowerCase()}.`,
      price: priceNum,
      yearlyPrice: lp.annualPrice || lp.yearlyPrice || Math.round(priceNum * 12 * 0.8),
      popular: isPopular,
      badge: lp.badge || (isPopular ? "Most Popular" : null),
      buttonText: `Subscribe to ${lp.name}`,
      buttonVariant: isPopular ? "default" : "default",
      propertiesLimit,
      features: Array.isArray(lp.features) && lp.features.length > 0
        ? lp.features
        : [
            `Manage ${propertiesLimit}`,
            "Direct Tenant In-App Chat",
            "Verified Property Trust Badge",
            "Availability Status Updates",
          ],
      includes: Array.isArray(lp.includes) && lp.includes.length > 0
        ? lp.includes
        : [
            `Includes ${propertiesLimit}:`,
            "Verified Landlord Trust Badge",
            "Direct Tenant In-App Chat",
            "Mob'in Web App Listing Access",
            "Instant Tenant Inquiry Notifications",
          ],
    });
  });

  return displayList;
}

const defaultPlans = [
  {
    name: "Renter Pass",
    description:
      "Essential tools for students and workers looking for safe verified accommodations.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Download Mobile App",
    buttonVariant: "outline",
    popular: false,
    badge: null,
    features: [
      { text: "Unlimited Rental Search & Filters", icon: <Home size={18} /> },
      { text: "Direct In-app Messaging with Landlords", icon: <MessageSquare size={18} /> },
      { text: "Verified Accommodations Access", icon: <ShieldCheck size={18} /> },
    ],
    includes: [
      "Free Renter Benefits:",
      "Instant Room Comparison",
      "Saved Favorite Properties",
      "Landlord Ratings & Reviews",
      "Zero Booking Platform Fees",
    ],
  },
  {
    name: "Landlord Starter",
    description:
      "Best for solo landlords managing 1 unit, dormitory, or boarding house.",
    price: 299,
    yearlyPrice: 2870,
    buttonText: "Subscribe Now",
    buttonVariant: "default",
    popular: true,
    badge: "Most Popular",
    features: [
      { text: "1 Verified Property Listing", icon: <Building2 size={18} /> },
      { text: "Instant Tenant Inquiries & Chat", icon: <MessageSquare size={18} /> },
      { text: "Verified Landlord Trust Badge", icon: <ShieldCheck size={18} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Pre-approval Application Tools",
      "Availability Status Updates",
      "Photo Gallery (up to 6 photos)",
      "Standard Search Algorithm Boost",
    ],
  },
  {
    name: "Landlord Portfolio",
    description:
      "For property managers & owners managing multiple units, apartments, or dorms.",
    price: 599,
    yearlyPrice: 5750,
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
    badge: "Multi-Unit",
    features: [
      { text: "Up to 5 Property Listings", icon: <Building2 size={18} /> },
      { text: "Priority Featured Search Placement", icon: <Sparkles size={18} /> },
      { text: "Viewing Appointment Scheduler", icon: <Users size={18} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Featured Search Algorithm Top Rank",
      "Automated Monthly Analytics",
      "Document & Lease Management",
      "24/7 Priority Mob'in Support",
    ],
  },
];

const PricingSwitch = ({ isYearly, onToggle }) => {
  return (
    <div className="flex justify-center">
      <div className="relative z-50 mx-auto flex w-fit rounded-full bg-[#f4ece3] border border-[#e8dcd0] p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`relative z-10 w-fit sm:h-11 h-9 rounded-full sm:px-6 px-4 font-semibold text-sm transition-colors cursor-pointer select-none ${
            !isYearly
              ? "text-white"
              : "text-[#6a5e54] hover:text-[#281507]"
          }`}
        >
          {!isYearly && (
            <motion.span
              layoutId="pricing-switch-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#685226] via-[#7a622f] to-[#5f5900] shadow-md shadow-[#685226]/30 pointer-events-none"
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className="relative pointer-events-none">Monthly</span>
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`relative z-10 w-fit sm:h-11 h-9 flex-shrink-0 rounded-full sm:px-6 px-4 font-semibold text-sm transition-colors cursor-pointer select-none ${
            isYearly
              ? "text-white"
              : "text-[#6a5e54] hover:text-[#281507]"
          }`}
        >
          {isYearly && (
            <motion.span
              layoutId="pricing-switch-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#685226] via-[#7a622f] to-[#5f5900] shadow-md shadow-[#685226]/30 pointer-events-none"
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className="relative flex items-center gap-2 pointer-events-none">
            Yearly
            <span className="rounded-full bg-[#fef5e7] border border-[#f3d9a8] px-2 py-0.5 text-xs font-bold text-[#8c5310]">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection({ onAction, plans = defaultPlans }) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef(null);

  // Synchronized state with live Admin subscription plans
  const [displayPlans, setDisplayPlans] = useState(() => {
    if (plans && plans !== defaultPlans && plans.length > 0) {
      return buildDisplayPlans(plans);
    }
    try {
      const cached = localStorage.getItem("mobin_subscription_plans");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return buildDisplayPlans(parsed);
        }
      }
    } catch {}
    return defaultPlans;
  });

  useEffect(() => {
    let isMounted = true;

    async function syncAdminPlans() {
      // If external plans prop provided and not defaultPlans, prioritize it
      if (plans && plans !== defaultPlans && plans.length > 0) {
        if (isMounted) setDisplayPlans(buildDisplayPlans(plans));
        return;
      }

      try {
        const fetched = await getSubscriptionPlans();
        if (isMounted && fetched && fetched.length > 0) {
          setDisplayPlans(buildDisplayPlans(fetched));
        }
      } catch (err) {
        console.warn("PricingSection syncAdminPlans notice:", err);
      }
    }

    syncAdminPlans();

    // Listen for real-time updates from Admin Dashboard
    const handleAdminUpdate = (e) => {
      const updated = e?.detail || null;
      if (updated && Array.isArray(updated) && updated.length > 0) {
        if (isMounted) setDisplayPlans(buildDisplayPlans(updated));
      } else {
        syncAdminPlans();
      }
    };

    window.addEventListener("mobin_subscription_plans_updated", handleAdminUpdate);
    window.addEventListener("storage", handleAdminUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("mobin_subscription_plans_updated", handleAdminUpdate);
      window.removeEventListener("storage", handleAdminUpdate);
    };
  }, [plans]);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.12,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hidden: {
      filter: "blur(8px)",
      y: 24,
      opacity: 0,
    },
  };

  return (
    <div
      className="px-4 pt-12 pb-20 min-h-screen mx-auto relative bg-[#fbf6f3]"
      ref={pricingRef}
    >
      {/* AMBIENT WARM GLOW BACKGROUND */}
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at center top, rgba(229, 154, 24, 0.12) 0%, transparent 65%)
          `,
        }}
      />

      <div className="text-center mb-10 max-w-3xl mx-auto relative z-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#d99214] mb-3 bg-[#fdf5eb] border border-[#f5e0c5] px-3.5 py-1 rounded-full">
          SIMPLE &amp; TRANSPARENT PRICING
        </span>

        <h2 className="md:text-5xl sm:text-4xl text-3xl font-extrabold text-[#281507] mb-4 tracking-tight">
          Plans that work best for your{" "}
          <span className="border-2 border-dashed border-[#d99214] px-3 py-0.5 rounded-2xl bg-[#fff7ea] text-[#685226] inline-block">
            rental needs
          </span>
        </h2>

        <p className="sm:text-base text-sm text-[#6a5e54] sm:w-[75%] w-[90%] mx-auto leading-relaxed">
          Whether you're a student looking for a safe room or a landlord managing properties,
          choose the plan that fits your goals.
        </p>
      </div>

      <div className="mb-12 relative z-10">
        <PricingSwitch isYearly={isYearly} onToggle={setIsYearly} />
      </div>

      <div className={`grid gap-6 py-2 mx-auto relative z-10 justify-center ${
        displayPlans.length <= 1
          ? "max-w-md grid-cols-1"
          : displayPlans.length === 2
          ? "max-w-4xl md:grid-cols-2"
          : displayPlans.length === 3
          ? "max-w-6xl md:grid-cols-3"
          : "max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      }`}>
        {displayPlans.map((plan, index) => {
          const isFree = plan.price === 0;
          const displayPrice = isFree
            ? 0
            : isYearly
            ? plan.yearlyPrice || Math.round(plan.price * 12 * 0.8)
            : plan.price;

          return (
            <div key={plan.id || plan.name || index} className="h-full">
              <Card
                className={`relative flex flex-col justify-between h-full rounded-2xl transition-all duration-200 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-2 border-[#685226] bg-[#ffffff] shadow-xl shadow-[#685226]/10 ring-1 ring-[#685226]/20"
                    : "border border-[#e8dcd0] bg-[#ffffff] shadow-md shadow-[#281507]/5 hover:shadow-lg"
                }`}
              >
                {/* POPULAR / CUSTOM BADGE */}
                {(plan.popular || plan.badge) && (
                  <div className="absolute -top-3.5 right-6 z-20">
                    <span className="bg-gradient-to-r from-[#e59a18] to-[#f5a623] text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide shadow-md shadow-[#e59a18]/40">
                      {plan.badge || "Most Popular"}
                    </span>
                  </div>
                )}

                <CardHeader className="text-left p-7 pb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-2xl font-bold text-[#281507]">
                      {plan.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#6a5e54] mb-5 min-h-[36px] leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline mb-2">
                    {isFree ? (
                      <span className="text-4xl font-extrabold text-[#281507]">
                        FREE
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-[#281507] mr-1">
                          ₱
                        </span>
                        <NumberFlow
                          value={displayPrice}
                          className="text-4xl font-extrabold text-[#281507] tracking-tight"
                        />
                        <span className="text-[#6a5e54] text-sm ml-1.5 font-medium">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </>
                    )}
                  </div>

                  {!isFree && (
                    <span className="text-xs text-[#8c8075] block">
                      {isYearly
                        ? "Billed annually • 20% discount applied"
                        : `₱${(plan.price * 12).toLocaleString()}/year if billed monthly`}
                    </span>
                  )}
                </CardHeader>

                <CardContent className="p-7 pt-2 flex flex-col justify-between flex-1">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onAction) onAction(plan);
                        else if (isFree) alert("Mobile App download coming soon!");
                        else alert(`Subscribing to ${plan.name}`);
                      }}
                      className={`w-full mb-6 py-3.5 px-4 text-sm font-bold rounded-xl cursor-pointer transition-all duration-200 ${
                        plan.popular
                          ? "bg-gradient-to-r from-[#685226] to-[#55431b] hover:from-[#58441d] hover:to-[#453614] text-white shadow-lg shadow-[#685226]/25 border border-[#55431b]"
                          : plan.buttonVariant === "outline"
                          ? "bg-transparent border-2 border-[#685226] text-[#685226] hover:bg-[#fbf6f0]"
                          : "bg-[#281507] hover:bg-[#3d2410] text-white shadow-md"
                      }`}
                    >
                      {plan.buttonText || (isFree ? "Download Mobile App" : "Subscribe Now")}
                    </button>

                    {/* TOP FEATURES */}
                    <ul className="space-y-3 font-medium py-3 border-t border-[#f0e4d8]">
                      {plan.features?.map((feature, featureIndex) => {
                        const icon = typeof feature === "string" ? <CheckCheck size={16} className="text-[#5f5900]" /> : feature.icon;
                        const text = typeof feature === "string" ? feature : feature.text;
                        return (
                          <li key={featureIndex} className="flex items-center gap-3 text-xs text-[#3b3026]">
                            <span className="text-[#685226] w-5 h-5 rounded-md bg-[#fdf5eb] flex items-center justify-center flex-shrink-0">
                              {icon}
                            </span>
                            <span className="font-semibold">{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* INCLUDES BULLETS */}
                  {plan.includes && plan.includes.length > 0 && (
                    <div className="space-y-2.5 pt-4 mt-3 border-t border-[#f0e4d8]">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#281507]">
                        {plan.includes[0]}
                      </h4>
                      <ul className="space-y-2">
                        {plan.includes.slice(1).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2.5">
                            <span className="h-4 w-4 bg-[#eef6ec] border border-[#685226] rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCheck className="h-2.5 w-2.5 text-[#5f5900]" />
                            </span>
                            <span className="text-xs text-[#6a5e54]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
