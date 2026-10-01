import React, { useState, useEffect, useRef, useMemo } from "react";
import "./LandlordDashboard.css";
import { supabase } from "../supabaseClient";
import mobinLogo from "../assets/mobin_logo.png";
import { compressImageToDataUrl } from "../services/imageUploadService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import AddProperty from "./AddProperty";
import EditProperty from "./EditProperty";
import PropertyList from "./PropertyList";
import LandlordMessages, { groupMessagesIntoConversations, formatRelativeTime } from "./LandlordMessages";
import LandlordSubscription from "./LandlordSubscription";
import { useSubscription } from "../hooks/useSubscription";
import { enforceSubscriptionLimit } from "../services/subscriptionService";
import CustomNoticeModal from "./CustomNoticeModal";
import TablePagination from "./ui/table-pagination";
import { NotificationPopover } from "@/components/ui/demo";
import DropdownMenu01 from "@/components/ui/dropdown-menu-01";
import { filterPropertiesForUser, getLandlordDisplayName } from "../lib/utils";
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Camera,
  Check,
  ShieldCheck,
  Smartphone,
  BarChart3,
  Settings,
  Sparkles,
  Building2,
  Key,
  Users,
  Clock,
  MessageSquare,
  ArrowUpRight,
  Plus,
  CreditCard,
  Crown,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

/* =====================================================
   SIDEBAR ICONS (SVGs)
===================================================== */
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconMyProperties() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconAddProperty() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconEditProperty() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconMessages() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconSubscription() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M7 15h0M2 9.5h20" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconPaymentHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}



function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* =====================================================
   METRIC CARD ICONS
===================================================== */
function IconMetricBuilding() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#73675c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="22.01" />
      <line x1="8" y1="6" x2="8" y2="6.01" />
      <line x1="16" y1="6" x2="16" y2="6.01" />
      <line x1="8" y1="10" x2="8" y2="10.01" />
      <line x1="16" y1="10" x2="16" y2="10.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
    </svg>
  );
}

function IconMetricKey() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#73675c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-2 2 1.5 1.5L9 14m-1.5-1.5L4 16l-2 6 6-2 3.5-3.5" />
      <circle cx="7.5" cy="7.5" r="4.5" />
    </svg>
  );
}

function IconMetricUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#73675c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMetricPending() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#73675c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconMetricInquiries() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#73675c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* =====================================================
   MAIN DASHBOARD COMPONENT
===================================================== */
export default function LandlordDashboard({ user, onLogout, onHomeClick, onUpdateUser }) {
  const isDemoLandlord = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
  const { currentPlan, isSubscribed, unitLimit } = useSubscription(user);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = sessionStorage.getItem("mobin_landlord_active_tab");
      if (saved) return saved;
    } catch (_) {}
    return "Dashboard";
  });
  const [selectedProperty, setSelectedProperty] = useState(() => {
    try {
      const saved = sessionStorage.getItem("mobin_landlord_selected_property");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  // Sync activeTab to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("mobin_landlord_active_tab", activeTab);
    } catch (_) {}
  }, [activeTab]);

  // Sync selectedProperty to sessionStorage
  useEffect(() => {
    try {
      if (selectedProperty) {
        sessionStorage.setItem("mobin_landlord_selected_property", JSON.stringify(selectedProperty));
      } else {
        sessionStorage.removeItem("mobin_landlord_selected_property");
      }
    } catch (_) {}
  }, [selectedProperty]);

  // Guard against reloading into Edit Property without a selected property
  useEffect(() => {
    if (activeTab === "Edit Property" && !selectedProperty) {
      setActiveTab("My Properties");
    }
  }, [activeTab, selectedProperty]);
  const [refreshProperties, setRefreshProperties] = useState(0);
  const [dashboardProperties, setDashboardProperties] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      return filterPropertiesForUser(cached, user);
    } catch {
      return [];
    }
  });
  const [payments, setPayments] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_payments") || "[]");
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  });
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [viewingProofUrl, setViewingProofUrl] = useState(null);
  const [dashboardInquiries, setDashboardInquiries] = useState([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);

  // Listen for real-time payment updates from checkout
  useEffect(() => {
    const handlePaymentsUpdated = () => {
      try {
        const cachedP = JSON.parse(localStorage.getItem("mobin_payments") || "[]");
        const userPayments = isDemoLandlord
          ? cachedP
          : cachedP.filter((p) => (user?.email && p.user_email === user.email) || (user?.id && p.user_id === user.id));
        setPayments((prev) => {
          const newIds = new Set(userPayments.map((p) => p.id));
          const rest = prev.filter((p) => !newIds.has(p.id));
          return [...userPayments, ...rest];
        });
      } catch (_) {}
    };

    window.addEventListener("mobin_payments_updated", handlePaymentsUpdated);
    return () => window.removeEventListener("mobin_payments_updated", handlePaymentsUpdated);
  }, [user, isDemoLandlord]);

  const [showSubscribeRequiredModal, setShowSubscribeRequiredModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    primaryButtonText: "OK",
    secondaryButtonText: null,
    onConfirm: null,
  });

  const showNotice = (
    title,
    message,
    type = "info",
    onConfirm = null,
    primaryButtonText = "OK",
    secondaryButtonText = null
  ) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      primaryButtonText,
      secondaryButtonText,
      onConfirm,
    });
  };

  const userName = getLandlordDisplayName(user);

  // Center modal states for Profile and Account Settings
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(userName);
  const [profilePhone, setProfilePhone] = useState(() => {
    return user?.user_metadata?.phone || user?.phone || (isDemoLandlord ? "+63 917 123 4567" : "");
  });
  const [profileAvatar, setProfileAvatar] = useState(() => {
    try {
      const localCustom = localStorage.getItem("mobin_landlord_custom_avatar");
      if (localCustom) return localCustom;
      if (user?.email) {
        const byEmail = localStorage.getItem(`mobin_user_profile_avatar_${user.email.toLowerCase().trim()}`);
        if (byEmail) return byEmail;
      }
    } catch (_) {}
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (isDemoLandlord) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "Landlord")}&background=5f5900&color=fff&bold=true`;
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const avatarFileInputRef = useRef(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPasswordText, setShowNewPasswordText] = useState(false);
  const [showConfirmPasswordText, setShowConfirmPasswordText] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState(() => {
    try {
      return sessionStorage.getItem("mobin_landlord_prop_filter") || "All";
    } catch (_) {}
    return "All";
  });

  // Sync propertyFilter to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("mobin_landlord_prop_filter", propertyFilter);
    } catch (_) {}
  }, [propertyFilter]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailInquiries: true,
    smsViewing: true,
    monthlyAnalytics: true,
  });
  const [readLandlordNotifs, setReadLandlordNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`mobin_read_notifs_${user?.email || "landlord"}`) || "[]");
    } catch (_) {
      return [];
    }
  });
  const [landlordNotifFilter, setLandlordNotifFilter] = useState("All"); // "All" | "Inquiries" | "Verification" | "Billing"
  const [landlordReports, setLandlordReports] = useState([]);

  const handleMetricCardClick = (type) => {
    if (type === "Inquiries") {
      setActiveTab("Messages");
      return;
    }
    if (type === "Total") {
      setPropertyFilter("All");
    } else {
      setPropertyFilter(type);
    }
  };

  const propertiesRef = useRef(null);
  const handleScrollToProperties = (type) => {
    handleMetricCardClick(type);
    if (propertiesRef.current) {
      propertiesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (userName && (isDemoLandlord || userName !== "Sarah Jenkins")) {
      setProfileName(userName);
    }
  }, [userName, isDemoLandlord]);

  // Load user profile from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const isUuid =
          typeof user?.id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        const targetEmail = user?.email;

        // 1. Fetch landlord contact details directly from Supabase properties table
        if (targetEmail) {
          try {
            const { data: propData } = await supabase
              .from("properties")
              .select("landlord_name, landlord_phone")
              .eq("landlord_email", targetEmail)
              .limit(1)
              .maybeSingle();

            if (isMounted && propData) {
              if (propData.landlord_name) setProfileName(propData.landlord_name);
              if (propData.landlord_phone) setProfilePhone(propData.landlord_phone);
            }
          } catch (_) {}
        }

        // 2. Fetch from Supabase profiles table
        try {
          let q = supabase.from("profiles").select("id, full_name, avatar_url, email");
          if (isUuid) {
            q = q.eq("id", user.id);
          } else if (targetEmail) {
            q = q.eq("email", targetEmail);
          } else {
            q = null;
          }
          if (q) {
            const { data: profData } = await q.maybeSingle();
            if (isMounted && profData) {
              if (profData.full_name) setProfileName(profData.full_name);
              if (profData.avatar_url) setProfileAvatar(profData.avatar_url);
              if (profData.phone) setProfilePhone(profData.phone);
            }
          }
        } catch (_) {}

        // 3. Fallback to user_metadata if available
        if (isMounted && user.user_metadata) {
          if (user.user_metadata.full_name) setProfileName(user.user_metadata.full_name);
          if (user.user_metadata.phone) setProfilePhone(user.user_metadata.phone);
          if (user.user_metadata.avatar_url) setProfileAvatar(user.user_metadata.avatar_url);
        }
      } catch (err) {
        console.warn("Could not load profile from Supabase:", err);
      }
    };

    fetchUserProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 400, 0.85);
      if (compressed) {
        setProfileAvatar(compressed);
        try {
          if (isDemoLandlord || user?.email === "landlord@mobin.ph") {
            localStorage.setItem("mobin_landlord_custom_avatar", compressed);
          }
          if (user?.email) {
            localStorage.setItem(`mobin_user_profile_avatar_${user.email.toLowerCase().trim()}`, compressed);
          }
        } catch (_) {}
      }
      const cloudUrl = await uploadImageToCloudinary(file, "mobin/avatars");
      if (cloudUrl) {
        setProfileAvatar(cloudUrl);
        try {
          if (isDemoLandlord || user?.email === "landlord@mobin.ph") {
            localStorage.setItem("mobin_landlord_custom_avatar", cloudUrl);
          }
          if (user?.email) {
            localStorage.setItem(`mobin_user_profile_avatar_${user.email.toLowerCase().trim()}`, cloudUrl);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Avatar processing error:", err);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleSendResetEmail = async () => {
    const targetEmail = user?.email || (isDemoLandlord ? "landlord@mobin.ph" : "");
    if (!targetEmail) {
      showNotice("Missing Email", "No valid email associated with this account.", "warning");
      return;
    }
    setIsSendingResetEmail(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      showNotice(
        "Email Dispatched",
        `Password reset instructions have been sent to ${targetEmail}. Please check your inbox.`,
        "success"
      );
    } catch (err) {
      console.warn("Reset email notice:", err);
      showNotice(
        "Reset Link Dispatched",
        `A secure password reset link has been dispatched to ${targetEmail}.`,
        "info"
      );
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      showNotice("Missing Name", "Please enter your full name before saving.", "warning");
      return;
    }

    // If user entered a new password, validate it
    if (newPassword) {
      if (newPassword.length < 8) {
        showNotice("Weak Password", "New password must be at least 8 characters long.", "warning");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showNotice("Password Mismatch", "The new passwords do not match. Please re-enter them.", "warning");
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const isUuid =
        typeof user?.id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      const targetEmail = user?.email || (isDemoLandlord ? "landlord@mobin.ph" : "");

      // 1. Update Supabase Auth user metadata & credentials
      try {
        const authPayload = {
          data: {
            full_name: profileName,
            name: profileName,
            phone: profilePhone,
            phone_number: profilePhone,
            avatar_url: profileAvatar,
          },
        };
        if (newPassword) {
          authPayload.password = newPassword;
        }
        await supabase.auth.updateUser(authPayload);
      } catch (authErr) {
        console.warn("Supabase auth updateUser notice:", authErr);
      }

      // If new password was set, save to local reset store for immediate offline sync
      if (newPassword && targetEmail) {
        try {
          const resetStore = JSON.parse(localStorage.getItem("mobin_reset_passwords") || "{}");
          resetStore[targetEmail.toLowerCase().trim()] = newPassword;
          localStorage.setItem("mobin_reset_passwords", JSON.stringify(resetStore));
        } catch (_) {}
      }

      // 2. Persist to Supabase properties table (stores landlord_name and landlord_phone in Supabase)
      try {
        if (targetEmail) {
          await supabase
            .from("properties")
            .update({
              landlord_name: profileName,
              landlord_phone: profilePhone,
            })
            .eq("landlord_email", targetEmail);
        }
        if (isUuid) {
          await supabase
            .from("properties")
            .update({
              landlord_name: profileName,
              landlord_phone: profilePhone,
            })
            .eq("landlord_id", user.id);
        }
      } catch (propErr) {
        console.warn("Could not sync profile to properties in Supabase:", propErr);
      }

      // 3. Persist to Supabase profiles table (stores full_name, avatar_url, updated_at in Supabase)
      try {
        let existingProfileId = null;
        if (isUuid) {
          const { data: byId } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();
          if (byId?.id) existingProfileId = byId.id;
        }
        if (!existingProfileId && targetEmail) {
          const { data: byEmail } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", targetEmail)
            .maybeSingle();
          if (byEmail?.id) existingProfileId = byEmail.id;
        }

        if (existingProfileId) {
          await supabase
            .from("profiles")
            .update({
              full_name: profileName,
              avatar_url: profileAvatar,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProfileId);
        } else if (isUuid) {
          await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: targetEmail,
              full_name: profileName,
              role: user?.user_metadata?.role || "landlord",
              avatar_url: profileAvatar,
              updated_at: new Date().toISOString(),
            });
        }
      } catch (profErr) {
        console.warn("Profiles table update notice:", profErr);
      }

      // 4. Update local storage cache & notify parent application
      const updatedUserObj = {
        ...(user || {}),
        id: user?.id || (isDemoLandlord ? "landlord-001" : `user-${Date.now()}`),
        email: targetEmail,
        user_metadata: {
          ...(user?.user_metadata || {}),
          full_name: profileName,
          name: profileName,
          phone: profilePhone,
          avatar_url: profileAvatar,
        },
      };

      try {
        if (isDemoLandlord || targetEmail === "landlord@mobin.ph") {
          localStorage.setItem("mobin_landlord_custom_name", profileName);
          localStorage.setItem("mobin_landlord_custom_avatar", profileAvatar);
        }
        if (targetEmail) {
          localStorage.setItem(`mobin_user_profile_avatar_${targetEmail.toLowerCase().trim()}`, profileAvatar);
        }
        localStorage.setItem("mobin_user", JSON.stringify(updatedUserObj));
        localStorage.setItem("mobin_current_session", JSON.stringify(updatedUserObj));

        // Sync with mobin_registered_users in-place (DO NOT add duplicate user!)
        const regList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
        let regUpdated = false;
        const updatedRegList = regList.map((item) => {
          const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
          const itemId = typeof item === "object" ? item?.id : null;
          const isMatch =
            (targetEmail && itemEmail === targetEmail) ||
            (isDemoLandlord && (itemEmail === "landlord@mobin.ph" || itemId === "landlord-001")) ||
            (user?.id && itemId === user.id);

          if (isMatch) {
            regUpdated = true;
            return {
              ...(typeof item === "object" ? item : { email: item }),
              name: profileName,
              full_name: profileName,
              phone: profilePhone,
              avatar_url: profileAvatar,
              role: "Landlord",
              status: "Active",
              email_verified: true,
            };
          }
          return item;
        });

        if (!regUpdated && targetEmail) {
          updatedRegList.unshift({
            id: user?.id || (isDemoLandlord ? "landlord-001" : `landlord-${Date.now()}`),
            email: targetEmail,
            name: profileName,
            full_name: profileName,
            phone: profilePhone,
            role: "Landlord",
            status: "Active",
            email_verified: true,
            created_at: new Date().toISOString(),
          });
        }
        localStorage.setItem("mobin_registered_users", JSON.stringify(updatedRegList));

        // Sync landlord_name in local properties cache
        const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
        if (Array.isArray(cachedProps) && cachedProps.length > 0) {
          const updatedProps = cachedProps.map((p) => {
            const pEmail = (p.landlord_email || "").toLowerCase().trim();
            if (
              (targetEmail && pEmail === targetEmail) ||
              (isDemoLandlord && (pEmail === "landlord@mobin.ph" || p.landlord_id === "landlord-001"))
            ) {
              return {
                ...p,
                landlord_name: profileName,
                landlord_phone: profilePhone,
              };
            }
            return p;
          });
          localStorage.setItem("mobin_properties", JSON.stringify(updatedProps));
        }

        // Sync admin transactions display name
        try {
          const txns = JSON.parse(localStorage.getItem("mobin_admin_transactions") || "[]");
          if (Array.isArray(txns)) {
            const updatedTxns = txns.map((t) => {
              if (
                (targetEmail && t.payerEmail === targetEmail) ||
                (isDemoLandlord && t.payerEmail === "landlord@mobin.ph")
              ) {
                return { ...t, payerName: profileName };
              }
              return t;
            });
            localStorage.setItem("mobin_admin_transactions", JSON.stringify(updatedTxns));
          }
        } catch (_) {}

        window.dispatchEvent(new Event("mobin_users_updated"));
        window.dispatchEvent(new Event("mobin_profile_updated"));
        window.dispatchEvent(new Event("mobin_properties_updated"));
      } catch (_) {}

      if (typeof onUpdateUser === "function") {
        onUpdateUser(updatedUserObj);
      }

      // Reset form password fields
      setNewPassword("");
      setConfirmNewPassword("");

      setIsProfileModalOpen(false);
      showNotice(
        "Profile Saved Successfully",
        newPassword
          ? "Your new name, profile details, and password have been saved."
          : `Your profile name has been updated to "${profileName}".`,
        "success"
      );
    } catch (err) {
      console.error("Save profile error:", err);
      showNotice("Save Error", err.message || "Failed to save profile to database.", "warning");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load real properties, payments, and messages from Supabase concurrently in the background
  useEffect(() => {
    let isMounted = true;
    let msgChannel = null;

    const loadDashboardData = async () => {
      let propQuery = supabase.from("properties").select("*");
      const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      if (isUuid && user?.email) {
        propQuery = propQuery.or(`landlord_id.eq.${user.id},landlord_email.eq.${user.email}`);
      } else if (isUuid) {
        propQuery = propQuery.eq("landlord_id", user.id);
      } else if (user?.email) {
        propQuery = propQuery.eq("landlord_email", user.email);
      } else if (!isDemoLandlord) {
        if (isMounted) setDashboardProperties([]);
        return;
      }

      let pQuery = supabase.from("payments").select("*");
      if (isUuid && user?.email) {
        pQuery = pQuery.or(`user_id.eq.${user.id},user_email.eq.${user.email}`);
      } else if (isUuid) {
        pQuery = pQuery.eq("user_id", user.id);
      } else if (user?.email) {
        pQuery = pQuery.eq("user_email", user.email);
      }

      let mQuery = supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (isDemoLandlord) {
        mQuery = mQuery.or("landlord_email.eq.landlord@mobin.ph,sender_email.eq.landlord@mobin.ph");
      } else {
        const orConditions = [];
        if (user?.email) {
          orConditions.push(`landlord_email.eq.${user.email.toLowerCase().trim()}`);
          orConditions.push(`sender_email.eq.${user.email.toLowerCase().trim()}`);
        }
        if (isUuid && user?.id) {
          orConditions.push(`landlord_id.eq.${user.id}`);
        }
        if (dashboardProperties.length > 0) {
          dashboardProperties.forEach((p) => {
            if (p.id) orConditions.push(`property_id.eq.${p.id}`);
          });
        }
        if (orConditions.length > 0) {
          mQuery = mQuery.or(orConditions.join(","));
        } else {
          mQuery = mQuery.eq("landlord_email", user?.email || "nonexistent@mobin.ph");
        }
      }

      const rQuery = supabase.from("reports").select("*");
      const [propRes, payRes, msgRes, repRes] = await Promise.allSettled([propQuery, pQuery, mQuery, rQuery]);

      if (!isMounted) return;

      if (repRes.status === "fulfilled" && Array.isArray(repRes.value.data)) {
        setLandlordReports(repRes.value.data);
      }

      let currentProps = dashboardProperties;
      if (propRes.status === "fulfilled" && propRes.value.data) {
        const dbProps = propRes.value.data;
        try {
          const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
          const userCached = filterPropertiesForUser(cached, user);
          const combined = [...dbProps];
          userCached.forEach((c) => {
            if (!combined.some((item) => item.id === c.id || item.property_name === c.property_name)) {
              combined.push(c);
            }
          });
          currentProps = combined;
          setDashboardProperties(combined);
        } catch {
          currentProps = dbProps;
          setDashboardProperties(dbProps);
        }
      } else {
        try {
          const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
          currentProps = filterPropertiesForUser(cached, user);
          setDashboardProperties(currentProps);
        } catch {
          currentProps = [];
          setDashboardProperties([]);
        }
      }

      if (payRes.status === "fulfilled" && payRes.value.data) {
        const dbPayments = payRes.value.data;
        try {
          const cachedP = JSON.parse(localStorage.getItem("mobin_payments") || "[]");
          const userPayments = isDemoLandlord
            ? cachedP
            : cachedP.filter((p) => (user?.email && p.user_email === user.email) || (user?.id && p.user_id === user.id));
          setPayments([...dbPayments, ...userPayments]);
        } catch {
          setPayments(dbPayments);
        }
      }

      if (msgRes.status === "fulfilled" && msgRes.value.data) {
        let profilesMap = {};
        try {
          const { data: profs } = await supabase.from("profiles").select("id, full_name, email, avatar_url");
          if (Array.isArray(profs)) {
            profs.forEach((p) => {
              if (p.avatar_url) {
                if (p.email) profilesMap[p.email.toLowerCase().trim()] = p.avatar_url;
                if (p.full_name) {
                  profilesMap[p.full_name.toLowerCase().trim()] = p.avatar_url;
                  profilesMap[p.full_name.toLowerCase().replace(/\s+/g, "").trim()] = p.avatar_url;
                }
              }
            });
          }
        } catch (_) {}

        const effectiveLandlordEmail = user?.email || (isDemoLandlord ? "landlord@mobin.ph" : "");
        const convs = groupMessagesIntoConversations(msgRes.value.data, effectiveLandlordEmail, profilesMap, {
          user,
          isDemoLandlord,
          ownedPropIds: currentProps.map((p) => String(p.id)),
          properties: currentProps,
          landlordId: user?.id,
        });
        setDashboardInquiries(convs);
        setInquiriesCount(convs.length);
      }
    };

    loadDashboardData();

    // Fast polling every 2.5 seconds to keep inquiries and property counts live
    const pollInterval = setInterval(() => {
      loadDashboardData();
    }, 2500);

    // Supabase Realtime channel to keep dashboard inquiries in sync
    try {
      msgChannel = supabase
        .channel("landlord-dashboard-live-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => {
            loadDashboardData();
          }
        )
        .subscribe();
    } catch (_) {}

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (msgChannel) {
        supabase.removeChannel(msgChannel);
      }
    };
  }, [refreshProperties, user?.id, user?.email]);

  // Compute live metrics strictly from database
  const totalCount = dashboardProperties.length;
  const availableCount = dashboardProperties.filter((p) => p.status === "Available").length;
  const occupiedCount = dashboardProperties.filter((p) => p.status === "Occupied").length;
  const pendingCount = dashboardProperties.filter((p) => p.verification === "Pending" || p.status === "Pending").length;

  const sidebarMenuItems = [
    { name: "Dashboard", icon: <IconDashboard /> },
    { name: "My Properties", icon: <IconMyProperties /> },
    { name: "Messages", icon: <IconMessages /> },
    { name: "Subscription", icon: <IconSubscription /> },
  ];

  // Dynamic Realtime Landlord Notifications (Strictly Scoped to this Landlord only)
  const landlordNotifications = useMemo(() => {
    const notifs = [];
    const ownedPropIds = (dashboardProperties || []).map((p) => String(p.id));
    const ownedPropNames = (dashboardProperties || []).map((p) => (p.property_name || "").toLowerCase().trim());

    // 1. Tenant Inquiries & Messages from students (scoped to this landlord)
    (dashboardInquiries || []).forEach((c) => {
      const id = `l-inq-${c.id || c.sender_email}`;
      const rawDate = c.last_message_time || c.created_at || new Date().toISOString();
      const studentName = c.sender_name || (c.sender_email ? c.sender_email.split("@")[0] : "Student Tenant");
      const propTitle = c.property_title || c.property_name || "Your Accommodation";
      const isUnread = Boolean(c.unread_count > 0 || c.unread) && !readLandlordNotifs.includes(id);

      notifs.push({
        id,
        user: studentName,
        action: `sent an inquiry on`,
        target: propTitle,
        timestamp: formatRelativeTime(rawDate),
        rawDate,
        unread: isUnread,
        linkTab: "Messages",
        icon: "📩",
        type: "Inquiries",
        details: c.last_message || `New inquiry message from ${studentName}.`,
      });
    });

    // 2. Listing Verification Status (scoped to this landlord's properties)
    (dashboardProperties || []).forEach((p) => {
      const isVerified = (p.verification === "Verified" || p.verification_status === "Verified");
      const isPending = (p.verification === "Pending" || p.verification_status === "Pending" || p.verification === "Unverified");
      const rawDate = p.updated_at || p.created_at || new Date().toISOString();
      const id = `l-prop-${p.id}`;

      if (isVerified) {
        notifs.push({
          id: `${id}-verified`,
          user: "Mob'in Admin",
          action: "verified and approved listing",
          target: p.property_name || "Accommodation",
          timestamp: formatRelativeTime(rawDate),
          rawDate,
          unread: false,
          linkTab: "My Properties",
          icon: "✔",
          type: "Verification",
          details: `Your property '${p.property_name}' is verified and actively visible to students.`,
        });
      } else if (isPending) {
        notifs.push({
          id: `${id}-pending`,
          user: "Mob'in Admin",
          action: "is reviewing verification request for",
          target: p.property_name || "Accommodation",
          timestamp: formatRelativeTime(rawDate),
          rawDate,
          unread: !readLandlordNotifs.includes(`${id}-pending`),
          linkTab: "My Properties",
          icon: "⏳",
          type: "Verification",
          details: `Your property is in the verification queue. Admin will inspect your documents soon.`,
        });
      }
    });

    // 3. Landlord Subscriptions & Billing Payments (scoped to this landlord)
    (payments || []).forEach((pay) => {
      const id = `l-pay-${pay.id}`;
      const rawDate = pay.created_at || new Date().toISOString();
      const isCompleted = pay.status === "Completed" || pay.status === "paid";
      const isPending = pay.status === "Pending";

      notifs.push({
        id,
        user: "Mob'in Billing",
        action: isCompleted ? `confirmed subscription payment of ₱${Number(pay.amount || 0).toLocaleString()} for` : `is processing payment of ₱${Number(pay.amount || 0).toLocaleString()} for`,
        target: pay.tier || "Landlord Plan",
        timestamp: formatRelativeTime(rawDate),
        rawDate,
        unread: isPending && !readLandlordNotifs.includes(id),
        linkTab: "Subscription",
        icon: "💳",
        type: "Billing",
        details: `Ref: ${pay.reference || 'N/A'} • Status: ${pay.status}`,
      });
    });

    // 4. Reports on this Landlord's properties (if any)
    (landlordReports || []).forEach((r) => {
      const matchesProperty =
        (r.property_id && ownedPropIds.includes(String(r.property_id))) ||
        (r.property_name && ownedPropNames.includes(r.property_name.toLowerCase().trim()));

      if (matchesProperty) {
        const id = `l-rep-${r.id}`;
        const rawDate = r.created_at || new Date().toISOString();
        notifs.push({
          id,
          user: "Trust & Safety Alert",
          action: `received a tenant report on listing`,
          target: r.property_name || "Your Property",
          timestamp: formatRelativeTime(rawDate),
          rawDate,
          unread: !readLandlordNotifs.includes(id),
          linkTab: "My Properties",
          icon: "⚠️",
          type: "Verification",
          details: `Report reason: "${r.reason || 'Flagged'}". Please ensure your listing details are accurate.`,
        });
      }
    });

    // Sort chronologically (latest first)
    notifs.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    return notifs;
  }, [dashboardProperties, dashboardInquiries, payments, landlordReports, readLandlordNotifs]);

  const handleLandlordNotifClick = (item) => {
    if (!item) return;
    if (!readLandlordNotifs.includes(item.id)) {
      const updated = [...readLandlordNotifs, item.id];
      setReadLandlordNotifs(updated);
      try {
        localStorage.setItem(`mobin_read_notifs_${user?.email || "landlord"}`, JSON.stringify(updated));
      } catch (_) {}
    }
    if (item.linkTab) {
      setActiveTab(item.linkTab);
    }
  };

  const handleMarkAllLandlordNotifsRead = () => {
    const allIds = landlordNotifications.map((n) => n.id);
    setReadLandlordNotifs(allIds);
    try {
      localStorage.setItem(`mobin_read_notifs_${user?.email || "landlord"}`, JSON.stringify(allIds));
    } catch (_) {}
  };

  const handleAddPropertyClick = async () => {
    // 1. If not subscribed (and not demo landlord), prompt subscription modal immediately!
    if (!isSubscribed && !isDemoLandlord) {
      setShowSubscribeRequiredModal(true);
      return;
    }

    // 2. Check quota & status limit from backend middleware
    const check = await enforceSubscriptionLimit(user?.id, user?.email, dashboardProperties.length);
    if (!check.allowed) {
      if (check.needSubscribe) {
        setShowSubscribeRequiredModal(true);
        return;
      }
      showNotice(
        "Subscription Quota Reached",
        `${check.reason}\n\nWould you like to open Subscription Management to upgrade your tier?`,
        "warning",
        () => setActiveTab("Subscription"),
        "Upgrade Plan",
        "Cancel"
      );
      return;
    }
    setActiveTab("Add Property");
  };

  return (
    <div className="landlord-dashboard-container">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="landlord-sidebar">
        {/* LOGO */}
        <div className="landlord-sidebar-logo" title="Mob'in">
          <img src={mobinLogo} alt="Mob'in" className="landlord-sidebar-logo-img" />
        </div>

        {/* MAIN NAV */}
        <nav className="landlord-sidebar-menu">
          {sidebarMenuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`landlord-nav-item ${activeTab === item.name ? "active" : ""}`}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="landlord-nav-icon">{item.icon}</span>
              <span className="landlord-nav-label">{item.name}</span>
            </button>
          ))}
        </nav>


      </aside>


      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}
      <main className={`landlord-main ${activeTab === "Messages" ? "messages-tab-active" : ""}`}>

        {/* =====================================================
            TOP HEADER - ONLY ON DASHBOARD
        ===================================================== */}
        {activeTab === "Dashboard" && (
          <header className="landlord-header">
            <div className="landlord-welcome">
              <h1>Welcome back, {userName}</h1>
              <p>{user?.email ? user.email : "Here is an overview of your properties."}</p>
            </div>

            <div className="landlord-header-right">
              {/* NOTIFICATION BELL POPOVER */}
              <NotificationPopover
                items={landlordNotifications}
                onNotificationSelect={handleLandlordNotifClick}
              />

              {/* USER AVATAR DROPDOWN */}
              <DropdownMenu01
                align="end"
                user={{
                  name: profileName || userName,
                  email: user?.email || (isDemoLandlord ? "landlord@mobin.ph" : ""),
                  avatar: profileAvatar,
                }}
                onNavigate={(tab) => {
                  if (tab === "Profile") {
                    setIsProfileModalOpen(true);
                  } else if (tab === "ResetPassword") {
                    setIsProfileModalOpen(true);
                    setTimeout(() => {
                      document.getElementById("landlord-new-password-input")?.focus();
                    }, 120);
                  } else if (tab === "Settings") {
                    setIsSettingsModalOpen(true);
                  } else {
                    setActiveTab(tab);
                  }
                }}
                onLogout={() => {
                  if (onLogout) onLogout();
                  else if (onHomeClick) onHomeClick();
                }}
                wrapperClassName="flex items-center"
              />
            </div>
          </header>
        )}


        {/* =====================================================
            TAB VIEWS
        ===================================================== */}
        {activeTab === "Dashboard" && (
          <div className="landlord-dashboard-content">

            {/* 5 ENHANCED & CLICKABLE METRIC CARDS */}
            <div className="landlord-metrics-grid">

              {/* CARD 1: Total Properties */}
              <div
                className="landlord-metric-card metric-card-interactive theme-total"
                onClick={() => handleMetricCardClick("Total")}
                role="button"
                tabIndex={0}
                title="Click to view all properties"
              >
                <div className="metric-header">
                  <div className="metric-icon-box total">
                    <Building2 size={18} />
                  </div>
                  <span className="metric-title">Total Properties</span>
                  <ArrowUpRight size={15} className="metric-arrow" />
                </div>
                <div className="metric-number">{totalCount}</div>
                <div className="metric-footer">
                  <span className="metric-subtext">All registered units</span>
                </div>
              </div>

              {/* CARD 2: Available */}
              <div
                className="landlord-metric-card metric-card-interactive theme-available"
                onClick={() => handleMetricCardClick("Available")}
                role="button"
                tabIndex={0}
                title="Click to view available properties"
              >
                <div className="metric-header">
                  <div className="metric-icon-box available">
                    <Key size={18} />
                  </div>
                  <span className="metric-title">Available</span>
                  <ArrowUpRight size={15} className="metric-arrow" />
                </div>
                <div className="metric-number">{availableCount}</div>
                <div className="metric-footer">
                  <span className="metric-pill success">Ready to rent</span>
                </div>
              </div>

              {/* CARD 3: Occupied */}
              <div
                className="landlord-metric-card metric-card-interactive theme-occupied"
                onClick={() => handleMetricCardClick("Occupied")}
                role="button"
                tabIndex={0}
                title="Click to view occupied properties"
              >
                <div className="metric-header">
                  <div className="metric-icon-box occupied">
                    <Users size={18} />
                  </div>
                  <span className="metric-title">Occupied</span>
                  <ArrowUpRight size={15} className="metric-arrow" />
                </div>
                <div className="metric-number">{occupiedCount}</div>
                <div className="metric-footer">
                  <span className="metric-pill info">Active tenant leases</span>
                </div>
              </div>

              {/* CARD 4: Pending */}
              <div
                className="landlord-metric-card metric-card-interactive theme-pending"
                onClick={() => handleMetricCardClick("Pending")}
                role="button"
                tabIndex={0}
                title="Click to view pending properties"
              >
                <div className="metric-header">
                  <div className="metric-icon-box pending">
                    <Clock size={18} />
                  </div>
                  <span className="metric-title">Pending</span>
                  <ArrowUpRight size={15} className="metric-arrow" />
                </div>
                <div className="metric-number">{pendingCount}</div>
                <div className="metric-footer">
                  <span className="metric-pill warning">Awaiting review</span>
                </div>
              </div>

              {/* CARD 5: Inquiries */}
              <div
                className="landlord-metric-card metric-card-interactive theme-inquiries"
                onClick={() => handleMetricCardClick("Inquiries")}
                role="button"
                tabIndex={0}
                title="Click to open tenant messages"
              >
                <div className="metric-header">
                  <div className="metric-icon-box inquiries">
                    <MessageSquare size={18} />
                  </div>
                  <span className="metric-title">Inquiries</span>
                  <ArrowUpRight size={15} className="metric-arrow" />
                </div>
                <div className="metric-number">{inquiriesCount}</div>
                <div className="metric-footer">
                  <span className="metric-pill purple">Renter chats</span>
                </div>
              </div>

            </div>





            {/* TWO COLUMN LOWER WIDGETS (ENHANCED) */}
            <div className="landlord-widgets-grid">

              {/* LEFT WIDGET: RECENT INQUIRIES */}
              <div className="landlord-widget-card inquiries-card">
                <div className="widget-card-header">
                  <div className="widget-title-group">
                    <div className="widget-title-icon inquiries">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h2>Recent Inquiries</h2>
                      <p className="widget-subtitle">Prospective renter chats & questions</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="widget-link-btn"
                    onClick={() => setActiveTab("Messages")}
                  >
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="inquiries-list">
                  {dashboardInquiries && dashboardInquiries.length > 0 ? (
                    dashboardInquiries.slice(0, 3).map((conv) => (
                      <div
                        key={conv.id}
                        className="inquiry-item interactive"
                        onClick={() => setActiveTab("Messages")}
                        role="button"
                        tabIndex={0}
                        title={`Click to open conversation with ${conv.name}`}
                      >
                        <div className="inquiry-avatar-wrapper">
                          <img
                            src={conv.avatar}
                            alt={conv.name}
                            className="inquiry-avatar"
                          />
                          <span className="inquiry-online-dot"></span>
                        </div>
                        <div className="inquiry-details">
                          <div className="inquiry-top-row">
                            <span className="inquiry-name">{conv.name}</span>
                            <span className="inquiry-time">{conv.time}</span>
                          </div>
                          <div className="inquiry-note">
                            Inquiring about <strong>{conv.property_name || conv.property || "Listing"}</strong>
                            {conv.lastSnippet && (
                              <span style={{ display: "block", fontSize: "12px", color: "#6a5e54", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                                "{conv.lastSnippet}"
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="inquiry-reply-action">
                          Reply <ArrowUpRight size={13} />
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "34px 16px", textAlign: "center", color: "#786c62" }}>
                      <p style={{ margin: 0, fontSize: "14.5px", fontWeight: "700", color: "#281507" }}>No inquiries yet</p>
                      <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#8c8075" }}>
                        Inquiries from prospective renters in the app or website will appear here in real-time.
                      </p>
                    </div>
                  )}
                </div>
              </div>


              {/* RIGHT WIDGETS COLUMN */}
              <div className="landlord-right-column">

                {/* CURRENT PLAN CARD */}
                <div className="landlord-plan-card elevated">
                  <div className="plan-header-row">
                    <div className="plan-info">
                      <span className="plan-tag">
                        <Crown size={12} />
                        CURRENT PLAN
                      </span>
                      <h3>{isSubscribed ? (currentPlan?.name || "Active Plan") : "Free Account"}</h3>
                    </div>
                    <button
                      type="button"
                      className="btn-plan-upgrade"
                      onClick={() => setActiveTab("Subscription")}
                    >
                      <span>{isSubscribed ? "Manage" : "Subscribe"}</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>

                  <div className="plan-quota-box">
                    <div className="quota-text-row">
                      <span>Listing Quota Usage</span>
                      <strong>
                        {totalCount} / {isSubscribed ? (unitLimit >= 999 ? "∞" : unitLimit) : 0} Used
                      </strong>
                    </div>
                    <div className="quota-progress-track">
                      <div
                        className="quota-progress-fill"
                        style={{
                          width: `${
                            isSubscribed && unitLimit > 0
                              ? unitLimit >= 999
                                ? Math.min((totalCount / 20) * 100, 100)
                                : Math.min((totalCount / unitLimit) * 100, 100)
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="plan-status-row">
                    <div className="plan-status">
                      <span className={`status-dot-pulse ${!isSubscribed ? "inactive" : ""}`}></span>
                      <span>{isSubscribed ? `${currentPlan?.name || "Active"} Plan` : "No Active Subscription"}</span>
                    </div>
                    <span className="plan-renews">
                      {isSubscribed ? `₱${currentPlan?.price ?? 149}/month` : "Subscribe to publish"}
                    </span>
                  </div>
                </div>


                {/* PROPERTY UPDATES CARD */}
                <div className="landlord-widget-card updates-card">
                  <div className="widget-card-header">
                    <div className="widget-title-group">
                      <div className="widget-title-icon updates">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h2>Property Updates</h2>
                        <p className="widget-subtitle">Live statuses from your listings</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="widget-link-btn"
                      onClick={() => {
                        setPropertyFilter("All");
                        setActiveTab("My Properties");
                      }}
                    >
                      <span>All</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="updates-list">
                    {totalCount > 0 ? (
                      dashboardProperties.slice(0, 3).map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="update-item interactive"
                          onClick={() => {
                            setPropertyFilter(p.status || "All");
                            setActiveTab("My Properties");
                          }}
                          role="button"
                          tabIndex={0}
                          title={`Click to view ${p.property_name} in My Properties`}
                        >
                          <div className={`update-icon-badge ${p.status ? p.status.toLowerCase() : "default"}`}>
                            {p.status === "Available" ? (
                              <Key size={15} />
                            ) : p.status === "Occupied" ? (
                              <Users size={15} />
                            ) : (
                              <Clock size={15} />
                            )}
                          </div>
                          <div className="update-details">
                            <div className="update-text">
                              Listing <strong>{p.property_name}</strong> is currently{" "}
                              <span className={`status-text-pill ${p.status ? p.status.toLowerCase() : ""}`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="update-meta-row">
                              <span className="update-location">{p.location || "Metro Manila"}</span>
                              <span className="update-dot">•</span>
                              <span className={`update-verif ${p.verification === "Verified" ? "verified" : "pending"}`}>
                                {p.verification || "Pending"}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={15} className="update-chevron" />
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "26px 16px", textAlign: "center", color: "#8c8075", fontSize: "13.5px" }}>
                        No property updates yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUB-VIEW: MY PROPERTIES */}
        {activeTab === "My Properties" && (
          <PropertyList
            user={user}
            refresh={refreshProperties}
            initialStatusFilter={propertyFilter}
            onPropertiesCountChange={(props) => setDashboardProperties(props)}
            onAddPropertyClick={handleAddPropertyClick}
            onEditPropertyClick={(prop) => {
              setSelectedProperty(prop);
              setActiveTab("Edit Property");
            }}
          />
        )}

        {/* SUB-VIEW: EDIT PROPERTY */}
        {activeTab === "Edit Property" && (
          <EditProperty
            user={user}
            property={selectedProperty}
            onPropertyUpdated={() => {
              setRefreshProperties((c) => c + 1);
              setActiveTab("My Properties");
            }}
            onCancel={() => setActiveTab("My Properties")}
          />
        )}

        {/* SUB-VIEW: ADD PROPERTY */}
        {activeTab === "Add Property" && (
          (!isSubscribed && !isDemoLandlord) ? (
            <div
              style={{
                maxWidth: "620px",
                margin: "48px auto",
                padding: "44px 32px",
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid #ebd9c8",
                boxShadow: "0 18px 45px rgba(40, 21, 7, 0.06)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)",
                  color: "#854d0e",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                  boxShadow: "0 8px 20px rgba(133, 77, 14, 0.15)",
                }}
              >
                <Crown size={32} />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#281507", margin: "0 0 10px 0" }}>
                Active Subscription Required
              </h2>
              <p style={{ color: "#786b60", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 28px 0" }}>
                You must have an active landlord subscription before adding properties. Choose a plan to unlock verified property listings, direct tenant messaging, and priority ranking.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  className="center-btn-secondary"
                  onClick={() => setActiveTab("My Properties")}
                >
                  Back to My Properties
                </button>
                <button
                  type="button"
                  className="center-btn-primary"
                  onClick={() => setActiveTab("Subscription")}
                >
                  <Sparkles size={16} style={{ marginRight: "6px" }} />
                  View Plans & Subscribe →
                </button>
              </div>
            </div>
          ) : (
            <AddProperty
              user={user}
              onPropertyAdded={() => {
                setRefreshProperties((c) => c + 1);
                setActiveTab("My Properties");
              }}
              onCancel={() => setActiveTab("My Properties")}
            />
          )
        )}

        {/* SUB-VIEW: MESSAGES */}
        {activeTab === "Messages" && (
          <LandlordMessages
            user={user}
            properties={dashboardProperties}
            onViewProperty={(prop) => {
              if (typeof prop === "object" && prop !== null) {
                setSelectedProperty(prop);
                setActiveTab("Edit Property");
              } else if (typeof prop === "string") {
                const match = dashboardProperties.find(
                  (p) => String(p.id) === prop || (p.property_name && p.property_name.toLowerCase().trim() === prop.toLowerCase().trim())
                );
                if (match) {
                  setSelectedProperty(match);
                  setActiveTab("Edit Property");
                } else {
                  setActiveTab("My Properties");
                }
              } else {
                setActiveTab("My Properties");
              }
            }}
          />
        )}

        {/* SUB-VIEW: SUBSCRIPTION */}
        {activeTab === "Subscription" && (
          <LandlordSubscription user={user} />
        )}

        {/* SUB-VIEW: PAYMENT HISTORY */}
        {activeTab === "Payment History" && (
          <div className="add-property-view">
            <div className="add-property-header">
              <h1>Payment History</h1>
              <p>Review past invoices, receipts, and subscription charges.</p>
            </div>

            <div className="properties-white-container">
              {payments.length > 0 ? (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #eee5dc", color: "#786c62" }}>
                        <th style={{ padding: "12px 16px" }}>Invoice ID</th>
                        <th style={{ padding: "12px 16px" }}>Date</th>
                        <th style={{ padding: "12px 16px" }}>Description</th>
                        <th style={{ padding: "12px 16px" }}>Amount</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                        <th style={{ padding: "12px 16px" }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments
                        .slice((paymentPage - 1) * paymentPageSize, paymentPage * paymentPageSize)
                        .map((p) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f2ece4" }}>
                          <td style={{ padding: "14px 16px", fontWeight: "600", color: "#281507" }}>
                            #{p.invoice_id || p.id}
                            {p.reference && (
                              <div style={{ fontSize: "11.5px", color: "#685226", fontFamily: "monospace", fontWeight: 750, marginTop: "2px" }}>
                                Ref: {p.reference}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#6a5e54" }}>{p.date || "Recent"}</td>
                          <td style={{ padding: "14px 16px", color: "#281507" }}>{p.description || "Subscription Plan"}</td>
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#555100" }}>₱{Number(p.amount || 299).toFixed(2)}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                              {p.status?.toUpperCase() || "PAID"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                              {p.proof_image && (
                                <button
                                  type="button"
                                  onClick={() => setViewingProofUrl(p.proof_image)}
                                  style={{
                                    background: "#ecfdf5",
                                    border: "1px solid #10b981",
                                    color: "#047857",
                                    padding: "3px 8px",
                                    borderRadius: "5px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                  title="View Uploaded Payment Proof Screenshot"
                                >
                                  📷 Proof
                                </button>
                              )}
                              <button type="button" onClick={() => showNotice("Receipt Download", "Downloading official BIR receipt PDF...", "info")} style={{ background: "transparent", border: "none", color: "#555100", cursor: "pointer", fontWeight: "600" }}>
                                Download PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <TablePagination
                    currentPage={paymentPage}
                    totalItems={payments.length}
                    pageSize={paymentPageSize}
                    onPageChange={setPaymentPage}
                    onPageSizeChange={setPaymentPageSize}
                  />
                </>
              ) : (
                <div className="empty-properties-state" style={{ margin: "20px 0" }}>
                  <div className="empty-properties-icon">💳</div>
                  <h3>No payment history yet</h3>
                  <p>
                    You have no past payment transactions or invoices recorded. Once you subscribe to a paid plan, your receipts and billing history will appear here.
                  </p>
                  <button
                    type="button"
                    className="btn-add-property-primary"
                    onClick={() => setActiveTab("Subscription")}
                  >
                    View Subscription Plans
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-VIEW: NOTIFICATIONS */}
        {activeTab === "Notifications" && (() => {
          const filteredNotifs = landlordNotifications.filter((n) => {
            if (landlordNotifFilter === "All") return true;
            return n.type === landlordNotifFilter;
          });
          const unreadTotal = landlordNotifications.filter((n) => n.unread).length;

          return (
            <div className="add-property-view">
              <div className="add-property-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h1>Notifications</h1>
                    {unreadTotal > 0 && (
                      <span style={{ fontSize: "11.5px", fontWeight: 800, background: "#fee2e2", color: "#dc2626", padding: "2px 9px", borderRadius: "12px", border: "1px solid #fecaca" }}>
                        {unreadTotal} Unread
                      </span>
                    )}
                  </div>
                  <p>Stay updated with your tenant inquiries, listing verifications, and subscription payments.</p>
                </div>

                {unreadTotal > 0 && (
                  <button
                    type="button"
                    className="btn-review-preapproval"
                    style={{ background: "#f5f0ea", color: "#281507", border: "1px solid #dcd4cc" }}
                    onClick={handleMarkAllLandlordNotifsRead}
                  >
                    ✓ Mark All as Read
                  </button>
                )}
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {[
                  { id: "All", label: "All Alerts", count: landlordNotifications.length },
                  { id: "Inquiries", label: "Tenant Inquiries", count: landlordNotifications.filter((n) => n.type === "Inquiries").length },
                  { id: "Verification", label: "Verifications", count: landlordNotifications.filter((n) => n.type === "Verification").length },
                  { id: "Billing", label: "Billing & Plans", count: landlordNotifications.filter((n) => n.type === "Billing").length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLandlordNotifFilter(tab.id)}
                    style={{
                      padding: "6px 14px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: landlordNotifFilter === tab.id ? "#686300" : "#e5ded6",
                      background: landlordNotifFilter === tab.id ? "#686300" : "#ffffff",
                      color: landlordNotifFilter === tab.id ? "#ffffff" : "#6a5e54",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: landlordNotifFilter === tab.id ? "rgba(255,255,255,0.25)" : "#f3ece5",
                        color: landlordNotifFilter === tab.id ? "#ffffff" : "#73675c",
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* NOTIFICATIONS CONTAINER */}
              <div className="properties-white-container" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredNotifs.length > 0 ? (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleLandlordNotifClick(n)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: n.unread ? "#fae7be" : "#ebdcd0",
                        background: n.unread ? "#fffbf2" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: n.type === "Inquiries" ? "#eff6ff" : n.type === "Billing" ? "#ecfdf5" : "#fef3c7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {n.icon || "🔔"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <strong style={{ color: "#1a1006", fontSize: "14px" }}>{n.user}</strong>
                            <span style={{ color: "#6a5e54", fontSize: "13.5px" }}>{n.action}</span>
                            <strong style={{ color: "#686300", fontSize: "13.5px" }}>{n.target}</strong>
                          </div>
                          <span style={{ fontSize: "11.5px", color: "#8c8075", whiteSpace: "nowrap" }}>{n.timestamp}</span>
                        </div>

                        {n.details && (
                          <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#7a6e63" }}>
                            {n.details}
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        {n.unread && (
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} title="Unread" />
                        )}
                        <button
                          type="button"
                          className="btn-review-preapproval"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLandlordNotifClick(n);
                          }}
                        >
                          {n.linkTab === "Messages" ? "View Message" : n.linkTab === "Subscription" ? "View Plan" : "Check Listing"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 16px", color: "#8c8075" }}>
                    <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px 0" }}>You're all caught up!</p>
                    <p style={{ fontSize: "13px", margin: 0 }}>No notifications currently in this section.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}



      </main>

      {/* =====================================================
          LANDLORD PROFILE MODAL (CENTERED & ELEVATED)
      ===================================================== */}
      {isProfileModalOpen && (
        <div
          className="center-modal-overlay"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="center-modal-header">
              <h2>
                <User size={24} className="text-[#5f5900]" />
                Landlord Profile
              </h2>
              <p>Manage your public landlord profile credentials and contact details.</p>
              <button
                type="button"
                className="center-modal-close-btn"
                onClick={() => setIsProfileModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* PROFILE HERO CARD */}
            <div className="profile-hero-card">
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <div className="profile-avatar-container">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="profile-avatar-img"
                />
                <button
                  type="button"
                  className="profile-avatar-camera-badge"
                  title="Change avatar image"
                  onClick={() => avatarFileInputRef.current?.click()}
                >
                  <Camera size={13} />
                </button>
              </div>

              <div className="profile-hero-info">
                <h3 className="profile-hero-name">{profileName}</h3>
                <p className="profile-hero-email">{user?.email || (isDemoLandlord ? "landlord@mobin.ph" : "")}</p>
                <div className="profile-badge-row">
                  <span className="profile-status-pill">
                    <span className="status-dot-pulse"></span>
                    Verified Landlord
                  </span>
                  <span className="profile-tier-pill">
                    <ShieldCheck size={13} />
                    Verified Host
                  </span>
                </div>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="center-modal-body">
              <div className="modal-form-row">
                <div className="modal-field-group">
                  <label className="modal-field-label">Full Name</label>
                  <div className="modal-input-wrapper">
                    <User size={16} className="modal-input-icon" />
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder={`e.g. ${userName || "Juan Dela Cruz"}`}
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <label className="modal-field-label">Phone Number</label>
                  <div className="modal-input-wrapper">
                    <Phone size={16} className="modal-input-icon" />
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +63 917 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-field-group">
                <label className="modal-field-label">Email Address</label>
                <div className="modal-input-wrapper disabled">
                  <Mail size={16} className="modal-input-icon" />
                  <input
                    type="email"
                    value={user?.email || (isDemoLandlord ? "landlord@mobin.ph" : "")}
                    disabled
                  />
                  <span className="modal-input-right-tag">
                    <Lock size={12} />
                    Secured
                  </span>
                </div>
                <span className="modal-field-hint">
                  Your email is linked to your secure login authentication and cannot be changed here.
                </span>
              </div>

              {/* RESET PASSWORD SECTION */}
              <div style={{ borderTop: "1.5px solid #f0e6dd", paddingTop: "16px", marginTop: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      background: "#f7f4ea",
                      color: "#555100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Key size={15} />
                    </div>
                    <div>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#281507", display: "block" }}>
                        Reset Password
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#8c7e73" }}>
                        Set a new login password or send a reset link to your email
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#fcfaf7", border: "1px solid #ebdcd0", borderRadius: "10px", padding: "14px" }}>
                  <div className="modal-field-group">
                    <label className="modal-field-label">New Password</label>
                    <div className="modal-input-wrapper">
                      <Lock size={16} className="modal-input-icon" />
                      <input
                        id="landlord-new-password-input"
                        type={showNewPasswordText ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters (leave blank to keep unchanged)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPasswordText(!showNewPasswordText)}
                        style={{ position: "absolute", right: "12px", background: "none", border: "none", color: "#8c7e73", cursor: "pointer", display: "flex", alignItems: "center" }}
                        title={showNewPasswordText ? "Hide password" : "Show password"}
                      >
                        {showNewPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="modal-field-group">
                    <label className="modal-field-label">Confirm New Password</label>
                    <div className="modal-input-wrapper">
                      <Lock size={16} className="modal-input-icon" />
                      <input
                        type={showConfirmPasswordText ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPasswordText(!showConfirmPasswordText)}
                        style={{ position: "absolute", right: "12px", background: "none", border: "none", color: "#8c7e73", cursor: "pointer", display: "flex", alignItems: "center" }}
                        title={showConfirmPasswordText ? "Hide password" : "Show password"}
                      >
                        {showConfirmPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword && confirmNewPassword && (
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: newPassword === confirmNewPassword ? "#15803d" : "#dc2626", marginTop: "3px" }}>
                        {newPassword === confirmNewPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px dashed #ebdcd0" }}>
                    <span style={{ fontSize: "12px", color: "#7a6e63" }}>Or request reset via email:</span>
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isSendingResetEmail}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#555100",
                        fontSize: "12px",
                        fontWeight: 700,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      {isSendingResetEmail ? "Sending..." : "Send Reset Link to Email"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="center-modal-footer">
              <button
                type="button"
                className="center-btn-secondary"
                onClick={() => setIsProfileModalOpen(false)}
                disabled={isSavingProfile}
              >
                Cancel
              </button>
              <button
                type="button"
                className="center-btn-primary"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                style={{ minWidth: "120px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {isSavingProfile ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        border: "2px solid #ffffff",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {newPassword ? "Save Profile & Password" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ACCOUNT SETTINGS MODAL (CENTERED & ELEVATED)
      ===================================================== */}
      {isSettingsModalOpen && (
        <div
          className="center-modal-overlay"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="center-modal-header">
              <h2>
                <Settings size={24} className="text-[#5f5900]" />
                Account Settings
              </h2>
              <p>Configure notification preferences, security alerts, and analytics.</p>
              <button
                type="button"
                className="center-modal-close-btn"
                onClick={() => setIsSettingsModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* PREFERENCES LIST WITH INTERACTIVE TOGGLES */}
            <div className="center-modal-body">
              <div className="settings-preference-list">
                {/* PREFERENCE 1: EMAIL */}
                <div
                  className="settings-preference-item"
                  onClick={() =>
                    setNotificationPreferences((prev) => ({
                      ...prev,
                      emailInquiries: !prev.emailInquiries,
                    }))
                  }
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon-box">
                      <Mail size={20} />
                    </div>
                    <div className="settings-item-text">
                      <h4>Email Inquiries Alert</h4>
                      <p>Instant notifications when a tenant inquires about your properties.</p>
                    </div>
                  </div>
                  <label className="modern-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={notificationPreferences.emailInquiries}
                      onChange={(e) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          emailInquiries: e.target.checked,
                        }))
                      }
                    />
                    <span className="modern-switch-slider"></span>
                  </label>
                </div>

                {/* PREFERENCE 2: SMS */}
                <div
                  className="settings-preference-item"
                  onClick={() =>
                    setNotificationPreferences((prev) => ({
                      ...prev,
                      smsViewing: !prev.smsViewing,
                    }))
                  }
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon-box">
                      <Smartphone size={20} />
                    </div>
                    <div className="settings-item-text">
                      <h4>SMS Urgent Viewing Alerts</h4>
                      <p>Receive immediate text messages for priority viewing appointments.</p>
                    </div>
                  </div>
                  <label className="modern-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={notificationPreferences.smsViewing}
                      onChange={(e) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          smsViewing: e.target.checked,
                        }))
                      }
                    />
                    <span className="modern-switch-slider"></span>
                  </label>
                </div>

                {/* PREFERENCE 3: MONTHLY ANALYTICS */}
                <div
                  className="settings-preference-item"
                  onClick={() =>
                    setNotificationPreferences((prev) => ({
                      ...prev,
                      monthlyAnalytics: !prev.monthlyAnalytics,
                    }))
                  }
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon-box">
                      <BarChart3 size={20} />
                    </div>
                    <div className="settings-item-text">
                      <h4>Monthly Analytics Summary</h4>
                      <p>Detailed performance report on inquiries, views, and rental yield.</p>
                    </div>
                  </div>
                  <label className="modern-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={notificationPreferences.monthlyAnalytics}
                      onChange={(e) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          monthlyAnalytics: e.target.checked,
                        }))
                      }
                    />
                    <span className="modern-switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="center-modal-footer">
              <button
                type="button"
                className="center-btn-secondary"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="center-btn-primary"
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  showNotice("Settings Saved", "Your account preferences have been saved successfully!", "success");
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUBSCRIBE FIRST REQUIRED MODAL
      ===================================================== */}
      {showSubscribeRequiredModal && (
        <div
          className="center-modal-overlay"
          onClick={() => setShowSubscribeRequiredModal(false)}
        >
          <div
            className="center-modal-card subscribe-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="center-modal-close-btn"
              onClick={() => setShowSubscribeRequiredModal(false)}
              aria-label="Close modal"
              title="Close modal"
            >
              <X size={18} />
            </button>

            <div className="subscribe-badge-pill">
              <Crown size={14} />
              <span>Subscription Required</span>
            </div>

            <h2 className="subscribe-modal-title">
              Subscribe First to Add Properties
            </h2>

            <p className="subscribe-modal-desc">
              Welcome to Mob'in! To begin adding and publishing your dormitory, apartment, or boarding house listings, you must first activate a Landlord Subscription.
            </p>

            <div className="subscribe-perks-box">
              <div className="subscribe-perks-title">
                What you get with a Landlord Plan:
              </div>
              <ul className="subscribe-perks-list">
                <li className="subscribe-perk-item">
                  <div className="subscribe-perk-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Publish & advertise rental units with instant verification</span>
                </li>
                <li className="subscribe-perk-item">
                  <div className="subscribe-perk-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Real-time direct chat & inquiries with student renters</span>
                </li>
                <li className="subscribe-perk-item">
                  <div className="subscribe-perk-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Payment management, tenancy records, & search priority</span>
                </li>
              </ul>
            </div>

            <div className="subscribe-modal-actions">
              <button
                type="button"
                className="subscribe-btn-cancel"
                onClick={() => setShowSubscribeRequiredModal(false)}
              >
                Maybe Later
              </button>
              <button
                type="button"
                className="subscribe-btn-confirm"
                onClick={() => {
                  setShowSubscribeRequiredModal(false);
                  setActiveTab("Subscription");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Sparkles size={16} />
                <span>Subscribe Now →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CUSTOM NOTICE / ALERT MODAL
      ===================================================== */}
      <CustomNoticeModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryButtonText={modalConfig.primaryButtonText}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onConfirm={() => {
          if (modalConfig.onConfirm) modalConfig.onConfirm();
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* =====================================================
          LIGHTBOX FOR PAYMENT PROOF SCREENSHOT PREVIEW
      ===================================================== */}
      {viewingProofUrl && (
        <div
          className="sub-modal-overlay"
          onClick={() => setViewingProofUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 10, 5, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "92%",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "#f3ece4",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#281507",
                fontSize: "16px",
                fontWeight: 700,
              }}
              onClick={() => setViewingProofUrl(null)}
              title="Close"
            >
              ✕
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", alignSelf: "flex-start" }}>
              <span style={{ fontSize: "18px" }}>📷</span>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                Payment Proof Screenshot
              </h3>
            </div>
            <div
              style={{
                width: "100%",
                maxHeight: "65vh",
                overflow: "auto",
                borderRadius: "10px",
                border: "1.5px solid #ebdcd0",
                background: "#faf6f0",
                display: "flex",
                justifyContent: "center",
                padding: "8px",
              }}
            >
              <img
                src={viewingProofUrl}
                alt="Proof of Payment Full Screenshot"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", display: "block" }}
              />
            </div>
            <button
              type="button"
              onClick={() => setViewingProofUrl(null)}
              style={{
                marginTop: "14px",
                padding: "8px 24px",
                borderRadius: "8px",
                background: "#281507",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13.5px",
              }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
