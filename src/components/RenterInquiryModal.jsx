import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { X, Send, CheckCircle2, MessageSquare, Building2, MapPin, Tag } from "lucide-react";
import "./RenterInquiryModal.css";

export default function RenterInquiryModal({
  isOpen,
  onClose,
  property,
  currentUser,
  onOpenChat,
}) {
  const [renterName, setRenterName] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [message, setMessage] = useState(
    "Hello! I am interested in this accommodation. Is it available for viewing? Thank you!"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");

  useEffect(() => {
    if (currentUser) {
      setRenterName(
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split("@")[0] ||
        ""
      );
      setRenterEmail(currentUser.email || "");
    } else {
      const savedEmail = localStorage.getItem("mobin_renter_email") || "";
      const savedName = localStorage.getItem("mobin_renter_name") || "";
      if (savedEmail) setRenterEmail(savedEmail);
      if (savedName) setRenterName(savedName);
    }
    setIsSuccess(false);
    setErrorNotice("");
  }, [isOpen, currentUser, property]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!renterName.trim()) {
      setErrorNotice("Please enter your name.");
      return;
    }
    if (!renterEmail.trim()) {
      setErrorNotice("Please enter your email.");
      return;
    }
    if (!message.trim()) {
      setErrorNotice("Please type your inquiry message.");
      return;
    }

    setIsSubmitting(true);
    setErrorNotice("");

    // Save for convenience
    try {
      localStorage.setItem("mobin_renter_email", renterEmail.trim());
      localStorage.setItem("mobin_renter_name", renterName.trim());
    } catch (_) {}

    let targetLandlordEmail = (property.landlord_email || property.user_email || "").toLowerCase().trim();
    let targetLandlordId = property.landlord_id || property.user_id || null;

    if (!targetLandlordEmail) {
      try {
        const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
        const found = cachedProps.find(
          (p) => String(p.id) === String(property.id) || (p.property_name && p.property_name === property.property_name)
        );
        if (found) {
          targetLandlordEmail = (found.landlord_email || found.user_email || "").toLowerCase().trim();
          targetLandlordId = found.landlord_id || found.user_id || targetLandlordId;
        }
      } catch (_) {}
    }

    if (!targetLandlordEmail && property.id) {
      try {
        const { data: dbP } = await supabase
          .from("properties")
          .select("landlord_email, landlord_id")
          .eq("id", property.id)
          .maybeSingle();
        if (dbP) {
          targetLandlordEmail = (dbP.landlord_email || "").toLowerCase().trim();
          targetLandlordId = dbP.landlord_id || targetLandlordId;
        }
      } catch (_) {}
    }

    if (!targetLandlordEmail && (String(property.id) === "prop-1" || String(property.id) === "prop-2")) {
      targetLandlordEmail = "landlord@mobin.ph";
      targetLandlordId = "landlord-001";
    }

    const payload = {
      landlord_id: targetLandlordId,
      landlord_email: targetLandlordEmail || (String(property.id) === "prop-1" || String(property.id) === "prop-2" ? "landlord@mobin.ph" : ""),
      sender_name: renterName.trim(),
      sender_email: renterEmail.trim(),
      property_id: String(property.id),
      property_name: property.property_name || "Accommodation",
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from("messages").insert([payload]).select().single();
      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      console.error("Inquiry error:", err);
      setErrorNotice("Failed to send inquiry to Supabase. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const photo =
    property.images?.[0] ||
    property.photos?.[0] ||
    property.cover_photo ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="inquiry-modal-overlay" onClick={onClose}>
      <div className="inquiry-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="inquiry-modal-header">
          <div className="header-badge-row">
            <span className="inquiry-badge">DIRECT INQUIRY</span>
            <button type="button" className="inquiry-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <h2>Contact Landlord</h2>
          <p>Send a real-time inquiry directly to the landlord of this listing.</p>
        </div>

        {/* PROPERTY BRIEF PREVIEW */}
        <div className="inquiry-property-strip">
          <img src={photo} alt={property.property_name} className="property-strip-thumb" />
          <div className="property-strip-info">
            <span className="strip-category">{property.property_type || "Accommodation"}</span>
            <h4 className="strip-title">{property.property_name}</h4>
            <div className="strip-meta">
              <span className="strip-location">
                <MapPin size={12} /> {property.location || "Metro Manila"}
              </span>
              <span className="strip-dot">•</span>
              <span className="strip-price">₱{Number(property.price || 3500).toLocaleString()}/mo</span>
            </div>
            <div className="strip-landlord">
              Landlord: <strong>{property.landlord_name || "Verified Landlord"}</strong>
            </div>
          </div>
        </div>

        {/* FORM CONTENT */}
        {isSuccess ? (
          <div className="inquiry-success-state">
            <CheckCircle2 size={52} className="success-icon" />
            <h3>Inquiry Dispatched!</h3>
            <p>
              Your message has been saved to the database. The landlord will receive your inquiry
              in their dashboard and messages in real-time.
            </p>
            <div className="success-actions-row">
              <button
                type="button"
                className="btn-open-thread"
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat(property);
                }}
              >
                <MessageSquare size={16} />
                <span>Open Live Chat</span>
              </button>
              <button type="button" className="btn-done" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className="inquiry-form-body" onSubmit={handleSubmit}>
            {errorNotice && <div className="inquiry-error-banner">{errorNotice}</div>}

            <div className="inquiry-inputs-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Pauline Decinal"
                  value={renterName}
                  onChange={(e) => setRenterName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. paulinedecinal@gmail.com"
                  value={renterEmail}
                  onChange={(e) => setRenterEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message to Landlord *</label>
              <textarea
                rows={4}
                placeholder="Ask questions about availability, rent, security deposit, curfew, or viewing schedule..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="inquiry-footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-send-inquiry"
                disabled={isSubmitting}
              >
                <Send size={15} />
                <span>{isSubmitting ? "Sending..." : "Send Message to Landlord"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
