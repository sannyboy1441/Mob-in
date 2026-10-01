import React, { useState, useEffect, useRef } from "react";
import "./home.css";
import mobinLogo from "../assets/mobin_logo.png";
import PricingSection from "./ui/pricing-section";
import RenterInquiryModal from "./RenterInquiryModal";
import RenterMessagesModal from "./RenterMessagesModal";
import {
  Search,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  Heart,
  MessageSquare,
  Smartphone,
  ArrowRight,
  UserPlus,
  CreditCard,
  Building2,
  Info,
  Mail,
  MapPin,
  CheckCircle2,
  GraduationCap,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useScrollReveal } from "../useScrollReveal";

export default function Home({
  currentUser,
  onLogout,
  onFeaturesClick,
  onHowItWorksClick,
  onPricingClick,
  onDashboardClick,
  onNavigate,
  initialSection,
  onClearInitialSection,
}) {
  const [activeNav, setActiveNav] = useState("Home");
  const [inquiryProperty, setInquiryProperty] = useState(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isRenterChatOpen, setIsRenterChatOpen] = useState(false);
  const [chatInitialProperty, setChatInitialProperty] = useState(null);

  // Interactive step states for How It Works
  const [activeRenterStep, setActiveRenterStep] = useState(null);
  const [activeLandlordStep, setActiveLandlordStep] = useState(null);
  const renterTrackRef = useRef(null);
  const landlordTrackRef = useRef(null);

  // Dynamic pill compression during scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollStopTimerRef = useRef(null);

  const handleRenterArrowClick = () => {
    setActiveRenterStep((prev) => {
      const next = prev === null || prev < 3 ? 3 : (prev + 1) % 5;
      const targetEl = document.getElementById(`renter-step-${next}`);
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
      const targetEl = document.getElementById(`landlord-step-${next}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else if (landlordTrackRef.current) {
        landlordTrackRef.current.scrollBy({ left: 240, behavior: "smooth" });
      }
      return next;
    });
  };

  // Activate scroll-reveal animations for all sections
  useScrollReveal([]);

  // Helper to scroll smoothly with floating navbar offset
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (initialSection) {
      const timer = setTimeout(() => {
        if (initialSection === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          scrollToSection(initialSection);
        }
        if (onClearInitialSection) {
          onClearInitialSection();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [initialSection, onClearInitialSection]);

  // SCROLLSPY & DYNAMIC COMPRESSION ON SCROLL
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Compress navbar into center logo pill while scrolling up/down
      if (currentY > 20) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }

      // Reset debounce timer to expand back to normal when scrolling stops
      if (scrollStopTimerRef.current) {
        clearTimeout(scrollStopTimerRef.current);
      }

      scrollStopTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 360);

      // Scrollspy logic
      const scrollPos = currentY + 160;

      const contactSection = document.getElementById("contact");
      const pricingSection = document.getElementById("pricing");
      const aboutSection = document.getElementById("about-us");
      const howItWorksSection = document.getElementById("how-it-works");
      const featuresSection = document.getElementById("features");

      if (contactSection && scrollPos >= contactSection.offsetTop) {
        setActiveNav("Contact");
      } else if (pricingSection && scrollPos >= pricingSection.offsetTop) {
        setActiveNav("Pricing");
      } else if (aboutSection && scrollPos >= aboutSection.offsetTop) {
        setActiveNav("About Us");
      } else if (howItWorksSection && scrollPos >= howItWorksSection.offsetTop) {
        setActiveNav("How It Works");
      } else if (featuresSection && scrollPos >= featuresSection.offsetTop) {
        setActiveNav("Features");
      } else {
        setActiveNav("Home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
    };
  }, []);

  const handleNavClick = (item) => {
    setActiveNav(item);

    if (item === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (item === "Features") {
      scrollToSection("features");
      return;
    }
    if (item === "How It Works") {
      scrollToSection("how-it-works");
      return;
    }
    if (item === "About Us") {
      scrollToSection("about-us");
      return;
    }
    if (item === "Pricing") {
      scrollToSection("pricing");
      return;
    }
    if (item === "Contact") {
      scrollToSection("contact");
      return;
    }

    if (onNavigate) {
      onNavigate(item);
    }
  };

  // 6 Main Features matching Screenshot 2
  const featuresList = [
    {
      icon: <Search size={20} strokeWidth={2.2} />,
      title: "Search accommodations",
      description: "Dorms, apartments, and boarding houses around Cebu City — all in one place.",
      tag: "Urgello & nearby coverage",
    },
    {
      icon: <SlidersHorizontal size={20} strokeWidth={2.2} />,
      title: "Filter by what matters",
      description: "Filter by price, location, type, and availability.",
      tag: "Price · type · availability",
    },
    {
      icon: <FileText size={20} strokeWidth={2.2} />,
      title: "Clear property details",
      description: "Photos, price, rules, and location up front.",
      tag: "Photos · rules · location",
    },
    {
      icon: <ShieldCheck size={20} strokeWidth={2.2} />,
      title: "Verified listings",
      description: "Checked properties with badges you can trust.",
      tag: "Verified badge",
    },
    {
      icon: <Heart size={20} strokeWidth={2.2} />,
      title: "Save favorites",
      description: "Shortlist favorites in the app to compare later.",
      tag: "In-app shortlist",
    },
    {
      icon: <MessageSquare size={20} strokeWidth={2.2} />,
      title: "Message landlords",
      description: "Chat with owners, schedule viewings — no middlemen.",
      tag: "In-app chat",
    },
  ];

  // How It Works Steps matching Screenshot 4 with organic wave offsets
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
      {/* =====================================================
          FLOATING WHITE PILL NAVBAR (MATCHING SCREENSHOT 1 & 2)
      ===================================================== */}
      <div className="floating-navbar-wrapper">
        <nav className={`floating-pill-navbar ${isScrolling ? "is-scrolling-compressed" : ""}`}>
          {/* BRAND LOGO */}
          <div className="pill-navbar-logo" onClick={() => handleNavClick("Home")}>
            <img src={mobinLogo} alt="Mob'in" className="pill-navbar-logo-img" />
          </div>

          {/* NAV CENTER LINKS */}
          <div className="pill-navbar-links">
            {["Home", "Features", "How It Works", "About Us", "Pricing", "Contact"].map((item) => (
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

          {/* RIGHT ACTIONS */}
          <div className="pill-navbar-actions">
            {currentUser ? (
              <div className="pill-user-session-wrap">
                <button
                  type="button"
                  className="pill-user-greeting-btn"
                  onClick={() => {
                    const role = currentUser.user_metadata?.role;
                    if (role === "superadmin" || currentUser.email?.includes("admin")) {
                      if (onNavigate) onNavigate("admin");
                    } else {
                      if (onNavigate) onNavigate("dashboard");
                      else if (onDashboardClick) onDashboardClick();
                    }
                  }}
                  title="Go to dashboard"
                >
                  {currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0]}
                </button>
                <button
                  type="button"
                  className="pill-logout-btn"
                  onClick={onLogout}
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
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
                  className="pill-register-btn"
                  onClick={() => {
                    if (onNavigate) onNavigate("register");
                    else if (onDashboardClick) onDashboardClick();
                  }}
                >
                  Register Now
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* =====================================================
          HERO SECTION (MATCHING SCREENSHOT 1)
      ===================================================== */}
      <section className="hero-centered-section">
        {/* WARM RADIAL GLOW CONTAINER */}
        <div className="hero-radial-glow"></div>

        <div className="hero-centered-content reveal">
          <div className="hero-eyebrow-serif">
            STOP ROAMING, START MOB'IN
          </div>

          <h1 className="hero-main-headline">
            Find your next <br />
            place to <span className="hero-gold-highlight">stay</span>
          </h1>

          <p className="hero-description-paragraph">
            Mob'in bridges the gap between students, workers, and verified landlords.
            Experience a centralized, safe, and efficient way to find or manage rentals.
          </p>

          <div className="hero-action-buttons">
            <button
              type="button"
              className="btn-hero-explore-pill"
              onClick={() => scrollToSection("features")}
            >
              <span>Explore</span>
              <ArrowRight size={18} strokeWidth={2.6} />
            </button>

            <button
              type="button"
              className="btn-hero-download-pill"
              onClick={() => alert("Mob'in Mobile App download coming soon!")}
            >
              <Smartphone size={18} strokeWidth={2.4} />
              <span>Download the App</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES SECTION (MATCHING SCREENSHOT 2 & 3)
      ===================================================== */}
      <section id="features" className="features-showcase-section">
        <div className="features-header-wrap reveal">
          <span className="features-pill-eyebrow">FEATURES</span>
          <h2 className="features-main-title">
            Your next room, <br />
            <span className="features-gold-highlight">without the roaming</span>
          </h2>
          <p className="features-subtitle-text">
            Search verified boarding houses, bedspaces, and apartments around Cebu City —
            filter by budget, compare honestly, and message landlords directly.
          </p>
        </div>

        {/* 6 CARD GRID (3 COLUMNS X 2 ROWS) */}
        <div className="features-cards-grid">
          {featuresList.map((card, idx) => (
            <div
              key={idx}
              className="feature-clean-card reveal"
              style={{ transitionDelay: `${idx * 0.07}s` }}
            >
              <div className="feature-icon-badge">
                {card.icon}
              </div>
              <h3 className="feature-card-heading">{card.title}</h3>
              <p className="feature-card-description">{card.description}</p>
              <div className="feature-card-tag">{card.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS SECTION (MATCHING SCREENSHOT 4)
      ===================================================== */}
      <section id="how-it-works" className="how-it-works-showcase-section">
        {/* RENTER TRACK */}
        <div className="how-track-block reveal">
          <div className="track-badge-container">
            <span className="track-pill-badge">
              FOR RENTERS <span className="track-badge-dot">•</span> in the mobile app
            </span>
          </div>

          <div className="stepper-track-wrapper" ref={renterTrackRef}>
            {/* ORGANIC WAVY DASHED CONNECTOR WITH MOVING ARROWS FROM START TO END */}
            <svg className="stepper-wavy-line" viewBox="0 0 1100 120" fill="none" preserveAspectRatio="none">
              <path
                id="renter-wavy-dash-path"
                className="stepper-wavy-dash-path"
                d="M 70 55 C 160 101, 210 101, 295 101 C 390 101, 430 37, 520 37 C 610 37, 660 101, 750 101 C 840 101, 890 37, 980 37"
                stroke="#ebd29b"
                strokeWidth="2.5"
                strokeDasharray="7 7"
              />

              {/* MOVING ARROW 1: GLIDES FROM START UP TO END ALONG THE BROKEN LINE */}
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
                  <mpath href="#renter-wavy-dash-path" />
                </animateMotion>
              </g>

            </svg>

            <div className="stepper-nodes-row">
              {renterSteps.map((step, idx) => (
                <div
                  key={idx}
                  id={`renter-step-${idx}`}
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
            {/* ORGANIC WAVY DASHED CONNECTOR WITH SINGLE MOVING ARROW FROM START TO END */}
            <svg className="stepper-wavy-line" viewBox="0 0 1100 120" fill="none" preserveAspectRatio="none">
              <path
                id="landlord-wavy-dash-path"
                className="stepper-wavy-dash-path"
                d="M 70 55 C 160 101, 210 101, 295 101 C 390 101, 430 37, 520 37 C 610 37, 660 101, 750 101 C 840 101, 890 37, 980 37"
                stroke="#ebd29b"
                strokeWidth="2.5"
                strokeDasharray="7 7"
              />

              {/* SINGLE MOVING ARROW: GLIDES FROM START UP TO END ALONG THE BROKEN LINE */}
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
                  <mpath href="#landlord-wavy-dash-path" />
                </animateMotion>
              </g>
            </svg>

            <div className="stepper-nodes-row">
              {landlordSteps.map((step, idx) => (
                <div
                  key={idx}
                  id={`landlord-step-${idx}`}
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

      {/* =====================================================
          ABOUT US SECTION
      ===================================================== */}
      <section id="about-us" className="about-showcase-section">
        <div className="about-inner-wrap reveal">
          <div className="section-header-centered">
            <span className="features-pill-eyebrow">ABOUT US</span>
            <h2 className="features-main-title" style={{ fontSize: "44px" }}>
              Bridging the Gap for <br />
              <span className="features-gold-highlight">Cebu's Rental Community</span>
            </h2>
            <p className="features-subtitle-text" style={{ maxWidth: "700px" }}>
              Founded to end the exhaustion of walking under the hot sun searching for boarding houses.
              Mob'in brings trust, verified badges, and direct messaging to Cebu City rentals.
            </p>
          </div>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <GraduationCap size={26} strokeWidth={2.2} />
              </div>
              <h3>For Students & Workers</h3>
              <p>
                Browse verified rooms, boarding houses, and bedspaces around Sambag, Urgello, Colon, and near university campuses without roaming.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <ShieldCheck size={26} strokeWidth={2.2} />
              </div>
              <h3>Verified & Transparent</h3>
              <p>
                Each listing undergoes landlord verification so renters can view accurate prices, rules, and real photos upfront without surprise fees.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <Building2 size={26} strokeWidth={2.2} />
              </div>
              <h3>Empowering Landlords</h3>
              <p>
                A modern dashboard to showcase units, manage tenant inquiries in real-time, and build a trusted reputation in Cebu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRICING SECTION
      ===================================================== */}
      <section id="pricing" className="home-pricing-wrap reveal">
        <PricingSection
          onAction={(plan) => {
            if (plan.price === 0) {
              alert("Mob'in Mobile App download coming soon!");
            } else if (currentUser) {
              if (onDashboardClick) {
                onDashboardClick("Subscription");
              } else if (onNavigate) {
                onNavigate("dashboard");
              }
            } else if (onNavigate) {
              onNavigate("register");
            } else if (onDashboardClick) {
              onDashboardClick();
            }
          }}
        />
      </section>

      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}
      <section id="contact" className="contact-showcase-section">
        <div className="contact-inner-wrap reveal">
          <div className="section-header-centered">
            <span className="features-pill-eyebrow">CONTACT</span>
            <h2 className="features-main-title" style={{ fontSize: "44px" }}>
              Get in Touch with <span className="features-gold-highlight">Mob'in</span>
            </h2>
            <p className="features-subtitle-text">
              Have questions about landlord verification, listing properties, or using the mobile app?
              We're here to help.
            </p>
          </div>

          <div className="contact-cards-row">
            <div className="contact-card">
              <div className="contact-card-icon">
                <Mail size={24} strokeWidth={2.2} />
              </div>
              <h4>Email Support</h4>
              <p>Our team usually responds within 24 hours.</p>
              <a href="mailto:support@mobin.ph" className="contact-card-link">
                support@mobin.ph
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <MapPin size={24} strokeWidth={2.2} />
              </div>
              <h4>Location Coverage</h4>
              <p>Cebu City, Central Visayas, Philippines</p>
              <span className="contact-card-link">Urgello, Sambag & Metro Cebu</span>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <ShieldCheck size={24} strokeWidth={2.2} />
              </div>
              <h4>Landlord Onboarding</h4>
              <p>Need assistance verifying your property?</p>
              <button
                type="button"
                className="contact-card-btn"
                onClick={() => {
                  if (onNavigate) onNavigate("register");
                }}
              >
                Register as Landlord
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="home-footer">
        <div className="footer-inner reveal">
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <img src={mobinLogo} alt="Mob'in" className="footer-logo-img" />
              <h2 className="footer-logo">Mob'in</h2>
            </div>
            <p>
              © 2026 Mob'in. All rights reserved. Stop roaming, start Mob'in. Centralized, safe,
              and efficient rental accommodation for students, workers, and verified landlords in Cebu City.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4>Quick Links</h4>
            <button type="button" onClick={() => handleNavClick("Home")}>Home</button>
            <button type="button" onClick={() => handleNavClick("Features")}>Features</button>
            <button type="button" onClick={() => handleNavClick("How It Works")}>How It Works</button>
            <button type="button" onClick={() => handleNavClick("About Us")}>About Us</button>
            <button type="button" onClick={() => handleNavClick("Pricing")}>Pricing</button>
            <button type="button" onClick={() => handleNavClick("Contact")}>Contact</button>
          </div>
        </div>
      </footer>

      {/* RENTER INQUIRY MODAL */}
      <RenterInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        property={inquiryProperty}
        currentUser={currentUser}
        onOpenChat={(prop) => {
          setChatInitialProperty(prop);
          setIsRenterChatOpen(true);
        }}
      />

      {/* RENTER LIVE MESSAGES MODAL */}
      <RenterMessagesModal
        isOpen={isRenterChatOpen}
        onClose={() => setIsRenterChatOpen(false)}
        currentUser={currentUser}
        initialProperty={chatInitialProperty}
      />
    </div>
  );
}