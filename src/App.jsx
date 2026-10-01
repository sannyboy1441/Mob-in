import React, { useState, useEffect } from "react";
import Home from "./components/home";
import Features from "./components/features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import Login from "./components/Login";
import LandlordDashboard from "./components/LandlordDashboard";
import AdminDashboard from "./components/AdminDashboard";
import FloatingAiAssistant from "./components/FloatingAiAssistant";
import { supabase } from "./supabaseClient";
import { useScrollReveal } from "./useScrollReveal";
import { Building2, UserCircle, X } from "lucide-react";
import TermsAndConditionsModal from "./components/TermsAndConditionsModal";
import "./components/Login.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Mob'in Error Boundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "#f8fafc", fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: "480px", background: "#fff", padding: "32px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <h2 style={{ color: "#1e293b", marginBottom: "12px", fontSize: "22px" }}>Something went wrong</h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              {this.state.error?.message || "An unexpected error occurred while loading this page."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              style={{ background: "#685226", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SUPER_ADMIN_EMAIL =
  import.meta.env.VITE_SUPER_ADMIN_EMAIL || "admin@mobin.ph";

export function isSuperAdminUser(user) {
  if (!user) return false;
  const email = user.email?.toLowerCase();
  return (
    email === SUPER_ADMIN_EMAIL.toLowerCase() ||
    email === "admin@mobin.ph" ||
    email === "superadmin@mobin.ph" ||
    user.user_metadata?.role === "superadmin" ||
    user.user_metadata?.role === "admin"
  );
}

function App() {
  const [page, setPage] = useState(() => {
    try {
      const savedPage = sessionStorage.getItem("mobin_current_page");
      if (savedPage) return savedPage;
    } catch (_) {}
    return "home";
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const localSession = JSON.parse(localStorage.getItem("mobin_current_session") || "null");
      if (localSession?.email) return localSession;
    } catch (_) {}
    return null;
  });
  const [targetSection, setTargetSection] = useState(() => {
    try {
      return sessionStorage.getItem("mobin_target_section") || null;
    } catch (_) {}
    return null;
  });

  // Keep sessionStorage in sync with current page
  useEffect(() => {
    try {
      sessionStorage.setItem("mobin_current_page", page);
    } catch (_) {}
  }, [page]);

  // Keep target section in sync
  useEffect(() => {
    try {
      if (targetSection) {
        sessionStorage.setItem("mobin_target_section", targetSection);
      } else {
        sessionStorage.removeItem("mobin_target_section");
      }
    } catch (_) {}
  }, [targetSection]);

  // Post-OAuth Role Assignment Modal (for Google Sign Up)
  const [showOAuthRoleModal, setShowOAuthRoleModal] = useState(false);
  const [pendingOAuthUser, setPendingOAuthUser] = useState(null);
  const [roleAssignLoading, setRoleAssignLoading] = useState(false);

  // Terms and Conditions Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingTermsUser, setPendingTermsUser] = useState(null);

  // Activate scroll reveal animations whenever page changes
  useScrollReveal([page]);

  const handleAssignOAuthRole = async (selectedRole, targetUser = null) => {
    const userToUpdate = targetUser || pendingOAuthUser || currentUser;
    if (!userToUpdate) return;
    setRoleAssignLoading(true);

    try {
      // 1. Update user metadata in Supabase Auth
      const { data: updateData } = await supabase.auth.updateUser({
        data: {
          role: selectedRole,
          full_name:
            userToUpdate.user_metadata?.full_name ||
            userToUpdate.email?.split("@")[0] ||
            "",
        },
      });

      // 2. Persist in database
      try {
        await supabase.from("profiles").upsert({
          id: userToUpdate.id,
          email: userToUpdate.email,
          full_name:
            userToUpdate.user_metadata?.full_name || userToUpdate.email,
          role: selectedRole,
          avatar_url: userToUpdate.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        });
      } catch (_) {}

      const updatedUser = updateData?.user || {
        ...userToUpdate,
        user_metadata: {
          ...userToUpdate.user_metadata,
          role: selectedRole,
        },
      };

      setCurrentUser(updatedUser);
      setShowOAuthRoleModal(false);
      setPendingOAuthUser(null);
      setShowAuthModal(false);

      // Present Terms and Conditions after account role creation
      setPendingTermsUser(updatedUser);
      setShowTermsModal(true);
    } catch (err) {
      console.error("Failed to assign role:", err);
    } finally {
      setRoleAssignLoading(false);
    }
  };

  const handleAcceptTermsApp = (updatedUser) => {
    setShowTermsModal(false);
    setPendingTermsUser(null);
    setCurrentUser(updatedUser);
    const role = updatedUser?.user_metadata?.role;
    if (role === "landlord") {
      setPage("dashboard");
    } else {
      setPage("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeclineTermsApp = () => {
    setShowTermsModal(false);
    setPendingTermsUser(null);
    handleLogout();
  };

  const checkUserRoleAndPrompt = async (user) => {
    if (!user) return;
    if (isSuperAdminUser(user)) return;

    // Check if there was a pre-selected role from Google Signup click
    const pendingOAuthRole = localStorage.getItem("pending_oauth_role");
    if (pendingOAuthRole) {
      localStorage.removeItem("pending_oauth_role");
      await handleAssignOAuthRole(pendingOAuthRole, user);
      return;
    }

    let userRole = user.user_metadata?.role;
    const hasValidRole =
      userRole === "landlord" || userRole === "renter" || userRole === "superadmin";

    if (!hasValidRole) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (data?.role === "landlord" || data?.role === "renter") {
          userRole = data.role;
        }
      } catch (_) {}
    }

    // If role is still not 'landlord' or 'renter', show role choice modal immediately!
    if (userRole !== "landlord" && userRole !== "renter" && userRole !== "superadmin") {
      setShowAuthModal(false);
      setPendingOAuthUser(user);
      setShowOAuthRoleModal(true);
    }
  };

  // Helper to mark a user as Active once email is confirmed or authenticated
  const markUserActive = (userObj) => {
    if (!userObj) return;
    const email = userObj.email?.toLowerCase().trim();
    const id = userObj.id;
    if (!email && !id) return;

    try {
      const stored = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      let updated = false;
      const newList = stored.map((item) => {
        const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
        const itemId = typeof item === "object" ? item?.id : null;
        if ((email && itemEmail === email) || (id && itemId === id)) {
          updated = true;
          return {
            ...(typeof item === "object" ? item : { email: item }),
            status: "Active",
            email_verified: true,
          };
        }
        return item;
      });

      if (updated) {
        localStorage.setItem("mobin_registered_users", JSON.stringify(newList));
        window.dispatchEvent(new Event("mobin_users_updated"));
      }
    } catch (_) {}
  };

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        markUserActive(session.user);
        checkUserRoleAndPrompt(session.user);

        // Security check on restored page
        try {
          const savedPage = sessionStorage.getItem("mobin_current_page");
          if (savedPage === "admin" && !isSuperAdminUser(session.user)) {
            const role = session.user.user_metadata?.role;
            setPage(role === "landlord" ? "dashboard" : "home");
          } else if (savedPage === "dashboard" && session.user.user_metadata?.role === "renter") {
            setPage("home");
          }
        } catch (_) {}
      } else {
        try {
          const localSession = JSON.parse(localStorage.getItem("mobin_current_session") || "null");
          if (localSession?.email) {
            setCurrentUser(localSession);
            markUserActive(localSession);
            checkUserRoleAndPrompt(localSession);

            const savedPage = sessionStorage.getItem("mobin_current_page");
            if (savedPage === "admin" && !isSuperAdminUser(localSession)) {
              const role = localSession.user_metadata?.role;
              setPage(role === "landlord" ? "dashboard" : "home");
            } else if (savedPage === "dashboard" && localSession.user_metadata?.role === "renter") {
              setPage("home");
            }
          } else {
            // Unauthenticated: redirect auth-protected pages back to home
            const savedPage = sessionStorage.getItem("mobin_current_page");
            if (savedPage === "dashboard" || savedPage === "admin") {
              setPage("home");
            }
          }
        } catch (_) {
          const savedPage = sessionStorage.getItem("mobin_current_page");
          if (savedPage === "dashboard" || savedPage === "admin") {
            setPage("home");
          }
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        markUserActive(session.user);
        checkUserRoleAndPrompt(session.user);
        if (event === "SIGNED_IN") {
          const role = session.user.user_metadata?.role;
          if (role === "landlord") {
            setPage("dashboard");
          }
        }
      } else if (event === "SIGNED_OUT") {
        try {
          localStorage.removeItem("mobin_current_session");
          sessionStorage.removeItem("mobin_current_page");
          sessionStorage.removeItem("mobin_target_section");
          sessionStorage.removeItem("mobin_landlord_active_tab");
          sessionStorage.removeItem("mobin_admin_active_tab");
          sessionStorage.removeItem("mobin_landlord_selected_property");
          sessionStorage.removeItem("mobin_landlord_prop_filter");
          sessionStorage.removeItem("mobin_landlord_active_conv_id");
          sessionStorage.removeItem("mobin_landlord_msg_filter_tab");
        } catch (_) {}
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (destination, section = null) => {
    const dest = destination.toLowerCase().replace(/\s+/g, "-");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    if (dest === "features") {
      setShowAuthModal(false);
      setPage("features");
    } else if (dest === "how-it-works") {
      setShowAuthModal(false);
      setPage("how-it-works");
    } else if (dest === "pricing") {
      setShowAuthModal(false);
      setPage("pricing");
    } else if (dest === "login") {
      setAuthMode("signin");
      setShowAuthModal(true);
    } else if (dest === "register" || dest === "signup" || dest === "sign-up") {
      setAuthMode("signup");
      setShowAuthModal(true);
    } else if (dest === "admin" || dest === "admin-dashboard" || dest === "super-admin") {
      setShowAuthModal(false);
      setPage("admin");
    } else if (dest === "dashboard") {
      setShowAuthModal(false);
      if (isSuperAdminUser(currentUser)) {
        setPage("admin");
      } else {
        setPage("dashboard");
      }
    } else if (dest === "home") {
      setShowAuthModal(false);
      setPage("home");
      setTargetSection(section);
    } else {
      setShowAuthModal(false);
      setPage("home");
      setTargetSection(dest);
    }
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("mobin_current_session", JSON.stringify(user));
    } catch (_) {}
    setShowAuthModal(false);

    let role = user?.user_metadata?.role;
    if (!role && user?.id) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (data?.role) role = data.role;
      } catch (_) {}
    }
    if (!role && user?.email) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        if (data?.role) role = data.role;
      } catch (_) {}
    }

    if (isSuperAdminUser(user) || role === "superadmin") {
      setPage("admin");
    } else if (role === "landlord") {
      setPage("dashboard");
    } else {
      setPage("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    try {
      localStorage.removeItem("mobin_current_session");
      sessionStorage.removeItem("mobin_current_page");
      sessionStorage.removeItem("mobin_target_section");
      sessionStorage.removeItem("mobin_landlord_active_tab");
      sessionStorage.removeItem("mobin_admin_active_tab");
      sessionStorage.removeItem("mobin_landlord_selected_property");
      sessionStorage.removeItem("mobin_landlord_prop_filter");
      sessionStorage.removeItem("mobin_landlord_active_conv_id");
      sessionStorage.removeItem("mobin_landlord_msg_filter_tab");
    } catch (_) {}
    setCurrentUser(null);
    setShowAuthModal(false);
    setShowOAuthRoleModal(false);
    setPendingOAuthUser(null);
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ErrorBoundary>
      {/* BACKGROUND CONTENT (BLURS WHEN AUTH DRAWER IS OPEN) */}
      <div className={`app-page-wrapper ${showAuthModal || showOAuthRoleModal || showTermsModal ? "app-page-blur" : ""}`}>
        {page === "home" && (
          <Home
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={(dest) => navigateTo(dest)}
            onFeaturesClick={() => navigateTo("features")}
            onHowItWorksClick={() => navigateTo("how-it-works")}
            onPricingClick={() => navigateTo("pricing")}
            onDashboardClick={() => navigateTo("login")}
            initialSection={targetSection}
            onClearInitialSection={() => setTargetSection(null)}
          />
        )}

        {page === "features" && (
          <Features
            onHomeClick={() => navigateTo("home")}
            onNavigate={(dest) => navigateTo(dest)}
          />
        )}

        {page === "how-it-works" && (
          <HowItWorks
            onHomeClick={() => navigateTo("home")}
            onNavigate={(dest) => navigateTo(dest)}
          />
        )}

        {page === "pricing" && (
          <Pricing
            onHomeClick={() => navigateTo("home")}
            onNavigate={(dest) => navigateTo(dest)}
            onDashboardClick={() => navigateTo("login")}
          />
        )}

        {page === "dashboard" && (
          <LandlordDashboard
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onHomeClick={() => navigateTo("home")}
            onLogout={handleLogout}
          />
        )}

        {page === "admin" && (
          <AdminDashboard
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onHomeClick={() => navigateTo("home")}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* CENTER AUTH MODAL */}
      {showAuthModal && (
        <Login
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setShowAuthModal(false)}
        />
      )}

      {/* GOOGLE SIGN UP ROLE SELECTION MODAL */}
      {showOAuthRoleModal && (
        <div className="role-modal-overlay">
          <div className="role-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="role-modal-close-icon"
              onClick={() => {
                setShowOAuthRoleModal(false);
                handleLogout();
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="role-modal-header-block">
              <span className="role-step-pill">GOOGLE SIGN UP</span>
              <h2 className="role-modal-headline">Choose Your Role</h2>
              <p className="role-modal-tagline">
                Welcome to Mob'in, <strong>{pendingOAuthUser?.user_metadata?.full_name || pendingOAuthUser?.email || "there"}</strong>! Select how you want to use the platform.
              </p>
            </div>

            <div className="role-cards-selection-row">
              {/* LANDLORD OPTION */}
              <div
                className="role-option-card landlord-theme"
                onClick={() => handleAssignOAuthRole("landlord")}
              >
                <div className="role-card-icon-badge">
                  <Building2 size={32} />
                </div>
                <span className="role-intent-badge">Property Owner</span>
                <h3 className="role-card-title">Landlord</h3>
                <p className="role-card-description">
                  List and advertise dormitories, boarding houses, and apartments. Manage bookings and direct renter inquiries.
                </p>
                <button
                  type="button"
                  className="role-confirm-btn landlord"
                  disabled={roleAssignLoading}
                >
                  {roleAssignLoading ? "Assigning Role..." : "Join as Landlord →"}
                </button>
              </div>

              {/* RENTER OPTION */}
              <div
                className="role-option-card renter-theme"
                onClick={() => handleAssignOAuthRole("renter")}
              >
                <div className="role-card-icon-badge">
                  <UserCircle size={32} />
                </div>
                <span className="role-intent-badge">Student / Worker</span>
                <h3 className="role-card-title">Renter / Rental</h3>
                <p className="role-card-description">
                  Explore verified accommodations, compare prices and amenities, save favorite properties, and message landlords.
                </p>
                <button
                  type="button"
                  className="role-confirm-btn renter"
                  disabled={roleAssignLoading}
                >
                  {roleAssignLoading ? "Assigning Role..." : "Join as Renter →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT (LOWER RIGHT CORNER) */}
      <FloatingAiAssistant />

      {/* TERMS & CONDITIONS MODAL (AFTER SUCCESSFUL ACCOUNT CREATION) */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        user={pendingTermsUser}
        onAccept={handleAcceptTermsApp}
        onDecline={handleDeclineTermsApp}
      />
    </ErrorBoundary>
  );
}

export default App;