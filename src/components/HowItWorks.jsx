import React, { useState, useRef } from "react";
import "./home.css";
import mobinLogo from "../assets/mobin_logo.png";
import {
  UserPlus,
  Smartphone,
  Search,
  FileText,
  MessageSquare,
  CreditCard,
  Building2,
  Info,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function HowItWorks({ onHomeClick, onNavigate }) {
  const [activeNav, setActiveNav] = useState("How It Works");
  const [activeRenterStep, setActiveRenterStep] = useState(null);
  const [activeLandlordStep, setActiveLandlordStep] = useState(null);
  const renterTrackRef = useRef(null);
  const landlordTrackRef = useRef(null);

  // Dynamic pill compression during scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollStopTimerRef = useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 20) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
      if (scrollStopTimerRef.current) {
        clearTimeout(scrollStopTimerRef.current);
      }
      scrollStopTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 360);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
    };
  }, []);

  const handleNavClick = (item) => {
    setActiveNav(item);
    if (item === "How It Works") {
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

  const handleRenterArrowClick = () => {
    setActiveRenterStep((prev) => {
      const next = prev === null || prev < 3 ? 3 : (prev + 1) % 5;
      const targetEl = document.getElementById(`standalone-renter-step-${next}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else if (renterTrackRef.current) {
        renterTrackRef.current.scrollBy({ left: 240, behavior: "smooth" });
      }
      return next;
    });
  };

  const handleLandlordArrowClick = () => {
    setActiveLandlordStep((prev) => {
      const next = prev === null || prev < 3 ? 3 : (prev + 1) % 5;
      const targetEl = document.getElementById(`standalone-landlord-step-${next}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else if (landlordTrackRef.current) {
        landlordTrackRef.current.scrollBy({ left: 240, behavior: "smooth" });
      }
      return next;
    });
  };

  const renterSteps = [
    {
      icon: <UserPlus size={24} strokeWidth={2} />,
      title: "Create Your Account",
      description: "Sign up in under a minute with just your email.",
      offsetClass: "step-wave-mid",
    },
    {
      icon: <Smartphone size={24} strokeWidth={2} />,
      title: "Download the App",
      description: "Get the free Mob'in Android app to start searching.",
      offsetClass: "step-wave-low",
    },
    {
      icon: <Search size={24} strokeWidth={2} />,
      title: "Find Your Place",
      description: "Browse verified dormitories, apartments, and boarding houses near you.",
      offsetClass: "step-wave-high",
    },
    {
      icon: <FileText size={24} strokeWidth={2} />,
      title: "View Property Details",
      description: "Check real photos, prices, house rules, and locations.",
      offsetClass: "step-wave-low",
    },
    {
      icon: <MessageSquare size={24} strokeWidth={2} />,
      title: "Connect with Landlords",
      description: "Chat directly with property owners and schedule a visit.",
      offsetClass: "step-wave-high",
    },
  ];

  const landlordSteps = [
    {
      icon: <FileText size={24} strokeWidth={2} />,
      title: "Register as Landlord",
      description: "Create your landlord account here on the Mob'in website.",
      offsetClass: "step-wave-mid",
    },
    {
      icon: <CreditCard size={24} strokeWidth={2} />,
      title: "Subscribe to Mob'in",
      description: "Start free, then pick a plan that fits your number of units.",
      offsetClass: "step-wave-low",
    },
    {
      icon: <Building2 size={24} strokeWidth={2} />,
      title: "Add Your Property",
      description: "List your dormitory, apartment, boarding house, or room.",
      offsetClass: "step-wave-high",
    },
    {
      icon: <Info size={24} strokeWidth={2} />,
      title: "Add Property Information",
      description: "Upload photos, set your price, and describe amenities and rules.",
      offsetClass: "step-wave-low",
    },
    {
      icon: <Mail size={24} strokeWidth={2} />,
      title: "Manage Inquiries",
      description: "Reply to renter messages and track interest from one inbox.",
      offsetClass: "step-wave-high",
    },
  ];

  return (
    <div className="home-page-container">
      {/* FLOATING WHITE PILL NAVBAR */}
      <div className="floating-navbar-wrapper">
        <nav className={`floating-pill-navbar ${isScrolling ? "is-scrolling-compressed" : ""}`}>
          <div className="pill-navbar-logo" onClick={() => handleNavClick("Home")}>
            <img src={mobinLogo} alt="Mob'in" className="pill-navbar-logo-img" />
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
              className="pill-register-btn"
              onClick={() => onNavigate && onNavigate("register")}
            >
              Register Now
            </button>
          </div>
        </nav>
      </div>

      {/* HOW IT WORKS MAIN CONTENT */}
      <section className="how-it-works-showcase-section" style={{ minHeight: "85vh", paddingTop: "140px" }}>
        {/* RENTER TRACK */}
        <div className="how-track-block reveal">
          <div className="track-badge-container">
            <span className="track-pill-badge">
              FOR RENTERS <span className="track-badge-dot">•</span> in the mobile app
            </span>
          </div>

          <div className="stepper-track-wrapper" ref={renterTrackRef}>
            <svg className="stepper-wavy-line" viewBox="0 0 1100 120" fill="none" preserveAspectRatio="none">
              <path
                id="standalone-renter-wavy-path"
                className="stepper-wavy-dash-path"
                d="M 70 55 C 160 101, 210 101, 295 101 C 390 101, 430 37, 520 37 C 610 37, 660 101, 750 101 C 840 101, 890 37, 980 37"
                stroke="#ebd29b"
                strokeWidth="2.5"
                strokeDasharray="7 7"
              />

              <g className="moving-arrow-group">
                <circle r="14" fill="rgba(245, 158, 11, 0.25)" />
                <circle r="9.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.8" />
                <path
                  d="M -3 -4.5 L 3.5 0 L -3 4.5"
                  fill="none"
                  stroke="#b45309"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <animateMotion
                  dur="6s"
                  repeatCount="indefinite"
                  rotate="auto"
                  begin="0s"
                >
                  <mpath href="#standalone-renter-wavy-path" />
                </animateMotion>
              </g>

            </svg>

            <div className="stepper-nodes-row">
              {renterSteps.map((step, idx) => (
                <div
                  key={idx}
                  id={`standalone-renter-step-${idx}`}
                  className={`stepper-node-item ${step.offsetClass} ${activeRenterStep === idx ? "active-step-highlight" : ""}`}
                  onClick={() => setActiveRenterStep(idx)}
                  role="button"
                  tabIndex={0}
                  title={`Step ${idx + 1}: ${step.title} (Click to focus)`}
                >
                  <div className="stepper-circle-icon">
                    {step.icon}
                  </div>
                  <h4 className="stepper-node-title">{step.title}</h4>
                  <p className="stepper-node-desc">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LANDLORD TRACK */}
        <div className="how-track-block reveal" style={{ marginTop: "90px" }}>
          <div className="track-badge-container">
            <span className="track-pill-badge">
              FOR LANDLORDS <span className="track-badge-dot">•</span> on the web app
            </span>
          </div>

          <div className="stepper-track-wrapper" ref={landlordTrackRef}>
            <svg className="stepper-wavy-line" viewBox="0 0 1100 120" fill="none" preserveAspectRatio="none">
              <path
                id="standalone-landlord-wavy-path"
                className="stepper-wavy-dash-path"
                d="M 70 55 C 160 101, 210 101, 295 101 C 390 101, 430 37, 520 37 C 610 37, 660 101, 750 101 C 840 101, 890 37, 980 37"
                stroke="#ebd29b"
                strokeWidth="2.5"
                strokeDasharray="7 7"
              />

              {/* SINGLE MOVING ARROW */}
              <g className="moving-arrow-group">
                <circle r="14" fill="rgba(245, 158, 11, 0.25)" />
                <circle r="9.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.8" />
                <path
                  d="M -3 -4.5 L 3.5 0 L -3 4.5"
                  fill="none"
                  stroke="#b45309"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <animateMotion
                  dur="6s"
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href="#standalone-landlord-wavy-path" />
                </animateMotion>
              </g>
            </svg>

            <div className="stepper-nodes-row">
              {landlordSteps.map((step, idx) => (
                <div
                  key={idx}
                  id={`standalone-landlord-step-${idx}`}
                  className={`stepper-node-item ${step.offsetClass} ${activeLandlordStep === idx ? "active-step-highlight" : ""}`}
                  onClick={() => setActiveLandlordStep(idx)}
                  role="button"
                  tabIndex={0}
                  title={`Step ${idx + 1}: ${step.title} (Click to focus)`}
                >
                  <div className="stepper-circle-icon">
                    {step.icon}
                  </div>
                  <h4 className="stepper-node-title">{step.title}</h4>
                  <p className="stepper-node-desc">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="landlord-track-caption reveal">
            Landlords use the Mob'in web application to manage rental listings and communicate with potential renters —
            all in one streamlined dashboard.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-inner" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div className="footer-brand-col">
            <h2 className="footer-logo">Mob'in</h2>
            <p>
              © 2026 Mob'in. All rights reserved. Centralized, safe, and efficient
              rental accommodation for students, workers, and verified landlords in Cebu City.
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
