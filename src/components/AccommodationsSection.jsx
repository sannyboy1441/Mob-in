import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Building2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Flag,
  AlertTriangle,
  X,
} from "lucide-react";
import "./AccommodationsSection.css";

export default function AccommodationsSection({ onInquire }) {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Report Modal States
  const [selectedReportProperty, setSelectedReportProperty] = useState(null);
  const [reportReason, setReportReason] = useState("Suspicious activity or scam");
  const [reportDetails, setReportDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProperties(data);
      }
    } catch (err) {
      console.warn("Accommodations fetch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedReportProperty) return;
    setReportSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert({
        property_id: String(selectedReportProperty.id),
        property_name: selectedReportProperty.property_name || "Accommodation",
        reporter_name: reporterName.trim() || "Student / Renter",
        reporter_email: reporterEmail.trim() || "renter@mobin.ph",
        reason: reportReason,
        details: reportDetails.trim(),
        status: "pending",
      });

      if (error) throw error;

      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setSelectedReportProperty(null);
        setReportDetails("");
        setReporterName("");
        setReporterEmail("");
      }, 1500);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Could not submit report. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesCategory =
      categoryFilter === "All" ||
      (p.property_type && p.property_type.toLowerCase() === categoryFilter.toLowerCase());

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (p.property_name && p.property_name.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.landlord_name && p.landlord_name.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="accommodations" className="accommodations-section">
      <div className="section-header-wrap reveal">
        <span className="section-gold-eyebrow">VERIFIED ACCOMMODATIONS</span>
        <h2 className="section-heading-title">Explore Verified Listings</h2>
        <p className="section-subheading-text">
          Browse rooms, dorms, and apartments verified by Mob'in. Connect and chat directly
          with property owners.
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="accommodations-controls reveal">
        <div className="category-pills-row">
          {["All", "Boarding House", "Dormitory", "Apartment"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill-btn ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="accomm-search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, location, or landlord..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* LISTINGS GRID */}
      {isLoading ? (
        <div className="accommodations-loading">
          <div className="loading-spinner"></div>
          <p>Loading accommodations from database...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="accommodations-grid reveal">
          {filteredProperties.map((prop) => {
            const photo =
              prop.images?.[0] ||
              prop.photos?.[0] ||
              prop.cover_photo ||
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";

            return (
              <div key={prop.id} className="accomm-card">
                <div className="accomm-card-image-wrap">
                  <img src={photo} alt={prop.property_name} className="accomm-card-img" />
                  <span className="accomm-card-type-badge">
                    {prop.property_type || "Accommodation"}
                  </span>
                  {prop.verification === "Verified" && (
                    <span className="accomm-card-verified-badge">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                  <button
                    type="button"
                    className="accomm-card-report-btn"
                    title="Report this listing"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReportProperty(prop);
                    }}
                  >
                    <Flag size={12} />
                  </button>
                </div>

                <div className="accomm-card-content">
                  <div className="accomm-card-top">
                    <h3 className="accomm-card-title">{prop.property_name}</h3>
                    <div className="accomm-card-price">
                      ₱{Number(prop.price || prop.rent || 3500).toLocaleString()}
                      <span className="accomm-card-period">/ mo</span>
                    </div>
                  </div>

                  <div className="accomm-card-location">
                    <MapPin size={14} />
                    <span>{prop.location || prop.address || prop.city || "Lucban, Quezon"}</span>
                  </div>

                  <div className="accomm-card-footer">
                    <div className="accomm-card-landlord">
                      <span className="landlord-lbl">Landlord:</span>
                      <span className="landlord-name">
                        {prop.landlord_name || (typeof window !== "undefined" ? localStorage.getItem("mobin_landlord_custom_name") : null) || "Sarah Jenkins"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-inquire-card"
                      onClick={() => onInquire(prop)}
                    >
                      <MessageSquare size={14} />
                      <span>Message Landlord</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="accommodations-empty">
          <Building2 size={40} />
          <p>No accommodations match your filter.</p>
        </div>
      )}

      {/* REPORT PROPERTY MODAL */}
      {selectedReportProperty && (
        <div className="report-modal-overlay" onClick={() => setSelectedReportProperty(null)}>
          <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="report-modal-close"
              onClick={() => setSelectedReportProperty(null)}
            >
              <X size={18} />
            </button>

            <div className="report-modal-header">
              <div className="report-modal-icon-badge">
                <AlertTriangle size={24} />
              </div>
              <h3 className="report-modal-title">Report Listing</h3>
              <p className="report-modal-subtitle">
                Reporting <strong>{selectedReportProperty.property_name}</strong>. Help us keep Mob'in safe and verified for all renters.
              </p>
            </div>

            {reportSuccess ? (
              <div className="report-success-state">
                <CheckCircle2 size={36} color="#16a34a" />
                <h4>Report Submitted</h4>
                <p>Thank you. Our moderation team has received your report and will investigate.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="report-form">
                <div className="report-field">
                  <label>Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  >
                    <option value="Suspicious activity or scam">Suspicious activity or scam</option>
                    <option value="Misleading photos">Misleading photos</option>
                    <option value="Incorrect price or hidden fees">Incorrect price or hidden fees</option>
                    <option value="Unresponsive landlord">Unresponsive landlord</option>
                    <option value="Property already occupied / unavailable">Property already occupied / unavailable</option>
                    <option value="Inappropriate or offensive content">Inappropriate or offensive content</option>
                    <option value="Other">Other violation</option>
                  </select>
                </div>

                <div className="report-field">
                  <label>Complaint Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the issue you encountered with this listing..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    required
                  />
                </div>

                <div className="report-form-row">
                  <div className="report-field">
                    <label>Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Maria Santos"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                    />
                  </div>
                  <div className="report-field">
                    <label>Your Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. maria@gmail.com"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="report-modal-actions">
                  <button
                    type="button"
                    className="report-btn-cancel"
                    onClick={() => setSelectedReportProperty(null)}
                    disabled={reportSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="report-btn-submit"
                    disabled={reportSubmitting || !reportDetails.trim()}
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
