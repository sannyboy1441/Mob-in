import React, { useState, useEffect } from "react";
import "./Pricing.css";
import { supabase } from "../supabaseClient";
import mobinLogo from "../assets/mobin_logo.png";
import PricingSection from "./ui/pricing-section";

const DEFAULT_LANDING_PLANS = [
  {
    id: "plan-renter-free",
    name: "Renter Pass",
    category: "Renter",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Download Mobile App",
    buttonVariant: "outline",
    badge: null,
    popular: false,
    description: "Essential tools for students and workers looking for safe verified accommodations.",
    features: [
      "Rental search through mobile application",
      "Direct In-app Messaging with Landlords",
      "Verified Accommodations Access",
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
    id: "plan-landlord-starter",
    name: "Landlord Starter",
    category: "Landlord",
    price: 299,
    yearlyPrice: 2870,
    buttonText: "Subscribe Now",
    buttonVariant: "default",
    badge: "Most Popular",
    popular: true,
    description: "Best for solo landlords managing 1 unit, dormitory, or boarding house.",
    features: [
      "1 Verified Property Listing",
      "Instant Tenant Inquiries & Chat",
      "Verified Landlord Trust Badge",
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
    id: "plan-landlord-growth",
    name: "Landlord Portfolio",
    category: "Landlord",
    price: 599,
    yearlyPrice: 5750,
    buttonText: "Get Started",
    buttonVariant: "outline",
    badge: "Multi-Unit",
    popular: false,
    description: "For property managers & owners managing multiple units, apartments, or dorms.",
    features: [
      "Up to 5 Property Listings",
      "Priority Featured Search Placement",
      "Viewing Appointment Scheduler",
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

export default function Pricing({ onHomeClick, onNavigate, onDashboardClick }) {
  const [plans, setPlans] = useState(() => {
    try {
      const cached = localStorage.getItem("mobin_subscription_plans");
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.filter((p) => p.isActive !== false);
      }
      return DEFAULT_LANDING_PLANS;
    } catch {
      return DEFAULT_LANDING_PLANS;
    }
  });

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map((d) => ({
            id: d.id,
            name: d.name,
            category: d.category || "Landlord",
            price: d.price,
            yearlyPrice: Math.round(d.price * 12 * 0.8),
            period: d.period || "month",
            badge: d.badge || (d.is_popular ? "MOST POPULAR" : null),
            popular: d.is_popular || false,
            description: d.description || "",
            features: Array.isArray(d.features)
              ? d.features
              : JSON.parse(d.features || "[]"),
          }));
          setPlans(mapped);
          localStorage.setItem("mobin_subscription_plans", JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn("Pricing plans DB fetch notice:", err);
      }
    }
    fetchPlans();

    const handlePlansUpdate = () => {
      fetchPlans();
    };
    window.addEventListener("mobin_subscription_plans_updated", handlePlansUpdate);
    window.addEventListener("storage", handlePlansUpdate);

    return () => {
      window.removeEventListener("mobin_subscription_plans_updated", handlePlansUpdate);
      window.removeEventListener("storage", handlePlansUpdate);
    };
  }, []);

  const handleNavClick = (item) => {
    if (item === "Pricing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (item === "Home") {
      if (onHomeClick) onHomeClick();
      else if (onNavigate) onNavigate("home");
      return;
    }

    const sectionId = item.toLowerCase().replace(/\s+/g, "-");
    if (onNavigate) {
      onNavigate(sectionId);
    } else if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <div className="pricing-page-wrapper">
      {/* FLOATING NAVBAR */}
      <div className="pricing-navbar-wrapper">
        <nav className="floating-pill-navbar">
          <div className="pill-navbar-logo" onClick={() => handleNavClick("Home")}>
            <img src={mobinLogo} alt="M'in" className="pill-navbar-logo-img" />
          </div>

          <div className="pill-navbar-links">
            {["Home", "Features", "How It Works", "Pricing"].map((item) => (
              <button
                key={item}
                type="button"
                className={`pill-nav-btn ${item === "Pricing" ? "active" : ""}`}
                onClick={() => handleNavClick(item)}
              >
                {item}
                {item === "Pricing" && <span className="nav-active-bar" />}
              </button>
            ))}
          </div>

          <div className="pill-navbar-actions">
            <button
              type="button"
              className="pill-login-btn"
              onClick={() => {
                if (onNavigate) onNavigate("login");
                else if (onDashboardClick) onDashboardClick();
              }}
            >
              Login
            </button>
            <button
              type="button"
              className="pill-download-btn"
              onClick={() => alert("Mob'in Mobile App download link coming soon!")}
            >
              Download the App
            </button>
          </div>
        </nav>
      </div>

      {/* MODERN PRICING SECTION COMPONENT */}
      <PricingSection
        plans={plans.slice(0, 4)}
        onAction={(plan) => {
          if (plan.price === 0) {
            alert("Mobile App download link coming soon!");
          } else if (onNavigate) {
            onNavigate("login");
          } else if (onDashboardClick) {
            onDashboardClick();
          }
        }}
      />

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-inner" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div className="footer-brand-col">
            <h2 className="footer-logo">Mob'in</h2>
            <p>
              © 2024 Mob'in. All rights reserved. Centralized, safe, and efficient
              rental accommodation for students and workers.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4>Quick Links</h4>
            <button type="button" onClick={() => handleNavClick("Home")}>Home</button>
            <button type="button" onClick={() => handleNavClick("Features")}>Features</button>
            <button type="button" onClick={() => handleNavClick("How It Works")}>How It Works</button>
            <button type="button" onClick={() => handleNavClick("Pricing")}>Pricing</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
