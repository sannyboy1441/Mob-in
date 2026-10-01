import React, { useState } from "react";
import "./features.css";
import "./home.css";
import mobinLogo from "../assets/mobin_logo.png";

function Features({ onHomeClick, onNavigate }) {
  const [activeNav, setActiveNav] = useState("Features");

  const handleNavClick = (item) => {
    setActiveNav(item);

    if (item === "Features") {
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

  const featuresList = [
    {
      title: "Search Accommodations",
      description: "Find boarding houses, apartments, and dormitories in one place.",
      offset: "high",
    },
    {
      title: "Browse Categories",
      description: "Choose from boarding houses, apartments, or dormitories.",
      offset: "low",
    },
    {
      title: "Filter Properties",
      description: "Filter properties by price, availability, rating, and other preferences.",
      offset: "high",
    },
    {
      title: "Property Details",
      description: "View property information, photos, amenities, location, and rental price.",
      offset: "low",
    },
    {
      title: "Verified Properties",
      description: "Find properties verified by Mob'in.",
      offset: "high",
    },
    {
      title: "Save Properties",
      description: "Save properties you like and view them later.",
      offset: "low",
    },
    {
      title: "Message Landlords",
      description: "Connect directly with property owners through messaging.",
      offset: "high",
    },
  ];

  return (
    <div className="features-page-wrapper">
      {/* FLOATING NAVBAR */}
      <div className="floating-navbar-wrapper">
        <nav className="floating-pill-navbar">
          <div className="pill-navbar-logo" onClick={() => handleNavClick("Home")}>
            <img src={mobinLogo} alt="M'in" className="pill-navbar-logo-img" />
          </div>

          <div className="pill-navbar-links">
            {["Home", "Features", "How It Works", "Pricing"].map((item) => (
              <button
                key={item}
                type="button"
                className={`pill-nav-btn ${activeNav === item ? "active" : ""}`}
                onClick={() => handleNavClick(item)}
              >
                {item}
                {activeNav === item && <span className="nav-active-bar" />}
              </button>
            ))}
          </div>

          <div className="pill-navbar-actions">
            <button
              type="button"
              className="pill-login-btn"
              onClick={() => onNavigate && onNavigate("login")}
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

      {/* FEATURES MAIN CONTENT (PHOTO 2) */}
      <section className="features-wave-section" style={{ minHeight: "80vh", paddingTop: "60px" }}>
        <div className="section-header-wrap reveal">
          <span className="section-gold-eyebrow">FEATURES</span>
          <h2 className="section-heading-title">
            Everything You Need for a Better Rental Search
          </h2>
          <p className="section-subheading-text">
            Mob'in organizes complex accommodation information into a clean, centralized
            platform, making it effortless for students and workers to find their ideal home.
          </p>
        </div>

        <div className="features-staggered-track reveal">
          {featuresList.map((feat, idx) => (
            <div
              key={idx}
              className={`feature-stagger-card offset-${feat.offset}`}
            >
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

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

export default Features;