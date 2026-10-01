import React, { useState, useRef } from "react";
import "./TermsAndConditionsModal.css";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCircle,
  X,
  Check,
  Lock,
  ScrollText,
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function TermsAndConditionsModal({
  isOpen,
  user,
  onAccept,
  onDecline,
}) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const scrollContainerRef = useRef(null);

  if (!isOpen) return null;

  const role =
    user?.user_metadata?.role ||
    user?.role ||
    (user?.email?.toLowerCase().includes("landlord") ? "landlord" : "renter");

  const isLandlord = role === "landlord";
  const fullName =
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const handleAcceptClick = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);

    const acceptedAt = new Date().toISOString();
    const updatedUser = {
      ...user,
      terms_accepted: true,
      terms_accepted_at: acceptedAt,
      user_metadata: {
        ...(user?.user_metadata || {}),
        terms_accepted: true,
        terms_accepted_at: acceptedAt,
      },
    };

    // 1. Update local storage session
    try {
      localStorage.setItem("mobin_current_session", JSON.stringify(updatedUser));
    } catch (_) {}

    // 2. Update registered users list in local storage
    try {
      const stored = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      const cleanEmail = updatedUser.email?.toLowerCase().trim();
      const nextList = stored.map((item) => {
        const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
        const itemId = typeof item === "object" ? item?.id : null;
        if (itemEmail === cleanEmail || (updatedUser.id && itemId === updatedUser.id)) {
          return {
            ...(typeof item === "object" ? item : { email: item }),
            terms_accepted: true,
            terms_accepted_at: acceptedAt,
          };
        }
        return item;
      });
      localStorage.setItem("mobin_registered_users", JSON.stringify(nextList));
      window.dispatchEvent(new Event("mobin_users_updated"));
    } catch (_) {}

    // 3. Update Supabase profiles table if user ID is present
    if (updatedUser.id) {
      try {
        await supabase.from("profiles").upsert({
          id: updatedUser.id,
          terms_accepted: true,
          terms_accepted_at: acceptedAt,
          updated_at: acceptedAt,
        });
      } catch (_) {}
    }

    setTimeout(() => {
      setSubmitting(false);
      if (onAccept) onAccept(updatedUser);
    }, 400);
  };

  const handleConfirmDecline = () => {
    setShowDeclineConfirm(false);
    if (onDecline) onDecline();
  };

  return (
    <div className="terms-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="terms-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        {/* HEADER SECTION */}
        <div className="terms-modal-header">
          <div className="terms-header-badge-row">
            <span className="terms-step-pill">
              <ShieldCheck size={14} className="terms-pill-icon" />
              OFFICIAL MOB'IN POLICY • EFFECTIVE 2026
            </span>
            <div className={`terms-role-pill ${isLandlord ? "landlord" : "renter"}`}>
              {isLandlord ? <Building2 size={13} /> : <UserCircle size={13} />}
              <span>{isLandlord ? "Landlord Account" : "Renter Account"}</span>
            </div>
          </div>

          <h2 id="terms-modal-title" className="terms-modal-title">
            Terms & Conditions
          </h2>
          <p className="terms-modal-subtitle">
            Welcome to Mob'in, <strong>{fullName}</strong>! Your account has been successfully created.
            Please review and accept our Platform Terms & Conditions and Privacy Policy to activate your account.
          </p>
        </div>

        {/* NOTICE CALLOUT */}
        <div className="terms-callout-box">
          <div className="terms-callout-icon">
            <ScrollText size={18} />
          </div>
          <div className="terms-callout-text">
            <strong>Account Activation Agreement:</strong> Acceptance of these terms is required to protect both property owners and tenants across Lucban and Southern Luzon.
          </div>
        </div>

        {/* SCROLLABLE TERMS BODY */}
        <div className="terms-modal-body" ref={scrollContainerRef}>
          <div className="terms-section-card">
            <div className="terms-section-num">01</div>
            <div className="terms-section-content">
              <h3 className="terms-section-title">Acceptance of Terms</h3>
              <p>
                By completing your registration and using the Mob'in platform (website, web applications, and services), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, our Privacy Policy, and any applicable community standards. If you do not agree to these terms, you must not use or access Mob'in services.
              </p>
            </div>
          </div>

          <div className="terms-section-card">
            <div className="terms-section-num">02</div>
            <div className="terms-section-content">
              <h3 className="terms-section-title">Account Registration & Security</h3>
              <p>
                You agree to provide true, accurate, current, and complete information during registration. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify Mob'in administrators immediately if you suspect unauthorized access.
              </p>
            </div>
          </div>

          <div className={`terms-section-card ${isLandlord ? "highlighted-role-card" : ""}`}>
            <div className="terms-section-num">03</div>
            <div className="terms-section-content">
              <div className="terms-section-role-tag">
                <Building2 size={13} /> Landlord Standards
              </div>
              <h3 className="terms-section-title">Property Listings & Availability Accuracy</h3>
              <p>
                As a Landlord or Property Owner, you represent and warrant that:
              </p>
              <ul className="terms-clause-list">
                <li>All listed boarding houses, dormitories, and apartments have genuine rental rates, authentic photos, accurate amenities, and true physical locations.</li>
                <li><strong>Availability Management:</strong> You must promptly toggle and update the availability status (<em>Available</em> vs. <em>Occupied</em>) of your units so student renters and inquiries receive up-to-date occupancy information.</li>
                <li>Your accommodations adhere to basic safety, sanitation, and local municipality tenancy guidelines.</li>
                <li>You will respect tenant safety, privacy, and peaceful enjoyment without unlawful discrimination.</li>
              </ul>
            </div>
          </div>

          <div className={`terms-section-card ${!isLandlord ? "highlighted-role-card" : ""}`}>
            <div className="terms-section-num">04</div>
            <div className="terms-section-content">
              <div className="terms-section-role-tag">
                <UserCircle size={13} /> Renter Standards
              </div>
              <h3 className="terms-section-title">Renter Inquiries & Tenancy Conduct</h3>
              <p>
                As a Renter or Student, you represent and warrant that:
              </p>
              <ul className="terms-clause-list">
                <li>All inquiry messages and scheduling requests sent to landlords are made in good faith with legitimate rental intent.</li>
                <li>You will respect the designated property rules, visitor policies, and quiet hours established by boarding house and dorm managers.</li>
                <li>You will honor agreed rental commitments, payment terms, and deposit policies directly arranged with property landlords.</li>
              </ul>
            </div>
          </div>

          <div className="terms-section-card">
            <div className="terms-section-num">05</div>
            <div className="terms-section-content">
              <h3 className="terms-section-title">Direct Messaging & Community Conduct</h3>
              <p>
                Mob'in provides built-in real-time messaging to facilitate seamless communication between landlords and renters. You agree that:
              </p>
              <ul className="terms-clause-list">
                <li>Messages will be professional, courteous, and strictly related to accommodation inquiries and tenancies.</li>
                <li>Harassment, abusive language, hate speech, offensive content, or extortion are strictly forbidden and grounds for permanent account termination.</li>
                <li>Spamming, unsolicited commercial marketing, or fraudulent solicitations are strictly prohibited.</li>
              </ul>
            </div>
          </div>

          <div className="terms-section-card">
            <div className="terms-section-num">06</div>
            <div className="terms-section-content">
              <h3 className="terms-section-title">Privacy & Data Protection (RA 10173)</h3>
              <p>
                Mob'in respects your privacy and complies with the <strong>Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong>. Your email, phone number, and account information are collected solely for account authentication, customer support, and legitimate accommodation matchmaking. Mob'in will never sell, rent, or trade your personal data to third parties.
              </p>
            </div>
          </div>

          <div className="terms-section-card">
            <div className="terms-section-num">07</div>
            <div className="terms-section-content">
              <h3 className="terms-section-title">Limitation of Platform Liability</h3>
              <p>
                Mob'in serves as an online directory and communication conduit connecting property owners with potential tenants. Mob'in is not a party to lease agreements, rental payments, or security deposit contracts between landlords and renters. Users are advised to inspect properties and verify lease terms directly before concluding financial transactions.
              </p>
            </div>
          </div>

          <div className="terms-section-card">
            <div className="terms-section-num">08</div>
            <div className="terms-section-content">
              <h3 className="terms-section-title">Violations & Account Termination</h3>
              <p>
                Mob'in reserves the right, at its sole discretion, to investigate reports of misleading listings, non-responsive landlords, harassment, or safety violations. Accounts found in breach of these terms may be temporarily suspended or permanently deactivated without prior notice.
              </p>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER WITH CHECKBOX & ACTIONS */}
        <div className="terms-modal-footer">
          <label className="terms-checkbox-label">
            <input
              type="checkbox"
              className="terms-native-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              id="terms-agreement-checkbox"
            />
            <span className="terms-custom-checkbox">
              {agreed && <Check size={14} strokeWidth={3} />}
            </span>
            <span className="terms-checkbox-text">
              I have read, understood, and accept the <strong>Mob'in Terms and Conditions</strong> and <strong>Privacy Policy</strong>. I agree to abide by all platform guidelines.
            </span>
          </label>

          <div className="terms-modal-actions-row">
            <button
              type="button"
              className="terms-btn-decline"
              onClick={() => setShowDeclineConfirm(true)}
              disabled={submitting}
            >
              Decline
            </button>
            <button
              type="button"
              className="terms-btn-accept"
              disabled={!agreed || submitting}
              onClick={handleAcceptClick}
              id="btn-accept-terms"
            >
              {submitting ? (
                <>
                  <span className="terms-spinner" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Accept & Continue to Mob'in →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* DECLINE CONFIRMATION OVERLAY */}
        {showDeclineConfirm && (
          <div className="terms-decline-confirm-backdrop">
            <div className="terms-decline-confirm-card">
              <div className="terms-decline-icon-circle">
                <AlertCircle size={28} />
              </div>
              <h4 className="terms-decline-title">Decline Terms & Conditions?</h4>
              <p className="terms-decline-desc">
                Accepting our Terms and Conditions is required to access Mob'in services and safeguard our community. If you decline, you will be signed out and returned to the home page.
              </p>
              <div className="terms-decline-buttons">
                <button
                  type="button"
                  className="terms-decline-btn-cancel"
                  onClick={() => setShowDeclineConfirm(false)}
                >
                  Go Back & Review
                </button>
                <button
                  type="button"
                  className="terms-decline-btn-confirm"
                  onClick={handleConfirmDecline}
                >
                  Yes, Decline & Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
