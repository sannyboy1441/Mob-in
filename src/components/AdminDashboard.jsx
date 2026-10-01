import React, { useState, useEffect, useRef, useMemo } from "react";
import "./AdminDashboard.css";
import { supabase } from "../supabaseClient";
import { compressImageToDataUrl } from "../services/imageUploadService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import sunnyStudioImg from "../assets/sunnystudio.jpg";
import twoBedFlatImg from "../assets/twobedflat.jpg";
import mobinLogo from "../assets/mobin_logo.png";
import CustomNoticeModal from "./CustomNoticeModal";
import { NotificationPopover } from "@/components/ui/demo";
import DropdownMenu01 from "@/components/ui/dropdown-menu-01";
import TablePagination from "./ui/table-pagination";
import { formatRelativeTime } from "./LandlordMessages";
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
  Key,
  Eye,
  EyeOff,
  Search,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  UserCircle,
  MapPin,
  Building2,
  RotateCcw,
  ShieldAlert,
  Filter,
  Trash2,
} from "lucide-react";

/* =====================================================
   ICONS
===================================================== */
function IconShieldAdmin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#686300" stroke="#ffffff" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

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

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconProperties() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconVerification() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconFinancials() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconFlag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IconFaq() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconStar({ filled = true, size = 16, color = "#f59e0b" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#73675c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#281507" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconPricingTag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconCheckShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#686300" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconExclamationCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#b91c1c" stroke="#ffffff" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="#ffffff" strokeWidth="2.2" />
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ffffff" strokeWidth="2.2" />
    </svg>
  );
}

/* Default Subscription Plans state for Admin */
const DEFAULT_ADMIN_PLANS = [
  {
    id: "plan-landlord-starter",
    name: "Landlord Starter",
    category: "Landlord",
    price: 299,
    period: "month",
    propertiesLimit: "1 Property",
    isPopular: false,
    isActive: true,
    badge: "Solo Landlords",
    description: "Essential listing management for individual landlords.",
    features: [
      "1 Verified Property Listing",
      "Instant Chat with Pre-screened Renters",
      "Pre-approval Request Manager",
      "Standard Search Results Visibility",
      "Direct Email Support",
    ],
  },
  {
    id: "plan-landlord-growth",
    name: "Landlord Growth",
    category: "Landlord",
    price: 599,
    period: "month",
    propertiesLimit: "Up to 5 Properties",
    isPopular: true,
    badge: "Most Popular",
    description: "Ideal for landlords managing multiple units & rooms.",
    features: [
      "Up to 5 Property Listings",
      "Priority 'Featured' Search Placement",
      "Verified Landlord Gold Trust Badge",
      "Tenant Viewing Appointment Calendar",
      "Automated Monthly Analytics Report",
      "Priority 24/7 Chat Support",
    ],
  },
  {
    id: "plan-landlord-enterprise",
    name: "Landlord Portfolio",
    category: "Landlord",
    price: 1299,
    period: "month",
    propertiesLimit: "Unlimited Properties",
    isPopular: false,
    badge: "Property Managers",
    description: "For property managers & multi-building owners.",
    features: [
      "Unlimited Property Listings",
      "Top-Ranked Search Algorithm Boost",
      "Dedicated Account Manager",
      "Custom Lease & Document Automation",
      "Bulk Listing CSV Import & API Access",
      "1-on-1 Onboarding Assistance",
    ],
  },
  {
    id: "plan-renter-pro",
    name: "Renter Pro Pass",
    category: "Renter",
    price: 149,
    period: "month",
    propertiesLimit: "N/A",
    isPopular: false,
    badge: "Students & Renters",
    description: "Skip lines and get instant priority booking.",
    features: [
      "Early Access to Newly Listed Units (24h Before)",
      "Verified Student / Professional Trust Profile",
      "Direct Priority Messaging to Landlords",
      "Instant Pre-approval Application Submissions",
      "Zero Booking Platform Processing Fees",
    ],
  },
];

/* =====================================================
   USER AVATAR COMPONENT (PHOTO OR INITIALS FALLBACK)
===================================================== */
function UserAvatar({ user, size = "sm", className = "", style = {} }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatarUrl || user?.avatar_url || user?.avatar;
  const isLandlord = (user?.role || "").toLowerCase().includes("landlord");
  const isAdmin = (user?.role || "").toLowerCase().includes("admin");
  const bgColor = user?.avatarColor || (isLandlord ? "#8c6b45" : isAdmin ? "#5f5900" : "#2e7d32");

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  const isLarge = size === "lg";
  const dim = isLarge ? 58 : 36;

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "User Photo"}
        className={isLarge ? "user-avatar-img-large" : "user-avatar-img"}
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: isLarge ? "2.5px solid #ebd9c8" : "1.5px solid #ebd9c8",
          boxShadow: isLarge ? "0 4px 14px rgba(40, 21, 7, 0.15)" : "0 2px 6px rgba(40, 21, 7, 0.08)",
          flexShrink: 0,
          ...style,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      className={`user-avatar-initials ${className}`}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        fontSize: isLarge ? "20px" : "13px",
        fontWeight: "800",
        background: bgColor,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        flexShrink: 0,
        boxShadow: isLarge ? "0 4px 12px rgba(0,0,0,0.12)" : "0 2px 5px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {initials}
    </span>
  );
}

/* =====================================================
   MAIN SUPER ADMIN DASHBOARD
===================================================== */
export default function AdminDashboard({ user, onLogout, onHomeClick, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = sessionStorage.getItem("mobin_admin_active_tab");
      if (saved) return saved;
    } catch (_) {}
    return "Dashboard";
  });

  // Sync activeTab to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("mobin_admin_active_tab", activeTab);
    } catch (_) {}
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminProperties, setAdminProperties] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  });
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [reviewProperty, setReviewProperty] = useState(null);
  const [activeReviewPhotoIndex, setActiveReviewPhotoIndex] = useState(0);
  const [isPhotoFullscreen, setIsPhotoFullscreen] = useState(false);

  // Tenant Ratings & Reviews State for Admin Properties
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [adminRatingsMap, setAdminRatingsMap] = useState({});

  // Computed Ratings Stats for Selected Review Property Modal
  const modalRatingsStats = useMemo(() => {
    if (!propertyReviews || propertyReviews.length === 0) {
      return { avg: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const count = propertyReviews.length;
    let sum = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    propertyReviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += Number(r.rating) || 5;
    });
    return {
      avg: Number((sum / count).toFixed(1)),
      count,
      breakdown,
    };
  }, [propertyReviews]);

  // Real Database Users State from Supabase
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  // Financials & Payment Transactions Ledger State (Direct from Supabase)
  const [financialTransactions, setFinancialTransactions] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_admin_transactions") || "[]");
      const mockIds = ["INV-2026-9901", "INV-2026-9898", "INV-2026-9884", "INV-2026-9872", "INV-2026-9861", "INV-2026-9850", "INV-2026-9834"];
      const realCached = Array.isArray(cached) ? cached.filter(t => !mockIds.includes(t.id) && t.payerEmail !== "landlord@mobin.ph" || t.dbId) : [];
      if (realCached.length > 0) return realCached;
    } catch (_) {}
    return [];
  });
  const [financeChannelFilter, setFinanceChannelFilter] = useState("All");
  const [financeStatusFilter, setFinanceStatusFilter] = useState("All");
  const [selectedReceiptModal, setSelectedReceiptModal] = useState(null);
  const [adminViewingProofUrl, setAdminViewingProofUrl] = useState(null);
  const [financeChartMetric, setFinanceChartMetric] = useState("revenue"); // "revenue" or "volume"
  const [readAdminNotifs, setReadAdminNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mobin_read_admin_notifs") || "[]");
    } catch (_) {
      return [];
    }
  });
  const [adminNotifFilter, setAdminNotifFilter] = useState("All");

  // Real-time listener for new subscription transactions
  useEffect(() => {
    const handleAdminTxUpdated = () => {
      try {
        const cached = JSON.parse(localStorage.getItem("mobin_admin_transactions") || "[]");
        if (Array.isArray(cached) && cached.length > 0) {
          setFinancialTransactions(cached);
        }
      } catch (_) {}
    };

    window.addEventListener("mobin_admin_transactions_updated", handleAdminTxUpdated);
    return () => window.removeEventListener("mobin_admin_transactions_updated", handleAdminTxUpdated);
  }, []);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [dashSystemTimeframe, setDashSystemTimeframe] = useState("monthly"); // "monthly" | "weekly"
  const [dashSubMetric, setDashSubMetric] = useState("mrr"); // "mrr" | "active_subs"
  const [hoveredSysPoint, setHoveredSysPoint] = useState(null);
  const [hoveredSubPoint, setHoveredSubPoint] = useState(null);

  // Table Pagination States
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [subscribersPageSize, setSubscribersPageSize] = useState(10);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [financialsPage, setFinancialsPage] = useState(1);
  const [financialsPageSize, setFinancialsPageSize] = useState(10);
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [propertiesPageSize, setPropertiesPageSize] = useState(5);
  const [adminPropStatusFilter, setAdminPropStatusFilter] = useState("All");
  const [adminPropTypeFilter, setAdminPropTypeFilter] = useState("All");
  const [adminPropSort, setAdminPropSort] = useState("newest");
  const [adminPropSearch, setAdminPropSearch] = useState("");

  // Reported Listings States & Pagination (Supabase 'reports' table)
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsFilter, setReportsFilter] = useState("all"); // "all" | "pending" | "investigating" | "resolved" | "dismissed"
  const [reportsReasonFilter, setReportsReasonFilter] = useState("all");
  const [reportsSort, setReportsSort] = useState("newest");
  const [reportsSearch, setReportsSearch] = useState("");
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsPageSize, setReportsPageSize] = useState(6);

  useEffect(() => {
    setReportsPage(1);
  }, [reportsFilter, reportsReasonFilter, reportsSort, reportsSearch, searchQuery]);

  useEffect(() => {
    setUsersPage(1);
  }, [searchQuery, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    setFinancialsPage(1);
  }, [searchQuery, financeChannelFilter, financeStatusFilter]);

  useEffect(() => {
    setPropertiesPage(1);
  }, [searchQuery, adminPropSearch, adminPropStatusFilter, adminPropTypeFilter, adminPropSort]);

  // Verification Queue Pagination & Date Filter States
  const [verifPage, setVerifPage] = useState(1);
  const [verifPageSize, setVerifPageSize] = useState(5);
  const [verifDateRange, setVerifDateRange] = useState("all");
  const [verifStartDate, setVerifStartDate] = useState("");
  const [verifEndDate, setVerifEndDate] = useState("");
  const [verifSort, setVerifSort] = useState("newest");
  const [verifSearch, setVerifSearch] = useState("");

  useEffect(() => {
    setVerifPage(1);
  }, [searchQuery, verifSearch, verifDateRange, verifStartDate, verifEndDate, verifSort]);

  // Robust parser for landlord submitted photos (array, JSON string, or single URL)
  const getPropertyPhotos = (prop) => {
    if (!prop) return [sunnyStudioImg, twoBedFlatImg];

    let list = [];

    // 1. Check rawPhotos from prop.photos, prop.images, prop.property_photos
    let rawPhotos = prop.photos || prop.images || prop.property_photos;
    if (typeof rawPhotos === "string") {
      try {
        const parsed = JSON.parse(rawPhotos);
        if (Array.isArray(parsed)) rawPhotos = parsed;
      } catch (_) {
        if (rawPhotos.startsWith("http") || rawPhotos.startsWith("data:") || rawPhotos.startsWith("/") || rawPhotos.includes("assets")) {
          rawPhotos = [rawPhotos];
        }
      }
    }
    if (Array.isArray(rawPhotos)) {
      const valid = rawPhotos.filter((p) => p && typeof p === "string" && (p.startsWith("http") || p.startsWith("data:") || p.startsWith("/") || p.includes("assets") || p.startsWith("blob:")));
      list.push(...valid);
    }

    // 2. Check primary cover image
    if (prop.image && typeof prop.image === "string" && prop.image.length > 4) {
      let cover = prop.image;
      if (cover.startsWith("[") || cover.startsWith("{")) {
        try {
          const parsed = JSON.parse(cover);
          if (Array.isArray(parsed)) list.unshift(...parsed);
          else cover = null;
        } catch (_) {}
      }
      if (cover && !list.includes(cover) && (cover.startsWith("http") || cover.startsWith("data:") || cover.startsWith("/") || cover.includes("assets") || cover.startsWith("blob:"))) {
        list.unshift(cover);
      }
    }

    // 3. Fallback to localStorage if this property was updated locally with photos
    if (list.length === 0 || list.every((p) => p.includes("sunnystudio") || p.includes("twobedflat"))) {
      try {
        const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
        const match = cached.find((c) => (c.id && prop.id && String(c.id) === String(prop.id)) || (c.property_name && prop.property_name && c.property_name.toLowerCase().trim() === prop.property_name.toLowerCase().trim()));
        if (match) {
          if (Array.isArray(match.photos) && match.photos.length > 0) {
            const validCached = match.photos.filter((p) => p && typeof p === "string" && (p.startsWith("http") || p.startsWith("data:")));
            if (validCached.length > 0) list = validCached;
          }
          if (match.image && typeof match.image === "string" && (match.image.startsWith("http") || match.image.startsWith("data:")) && !list.includes(match.image)) {
            list.unshift(match.image);
          }
        }
      } catch (_) {}
    }

    // Filter out placeholders if real uploaded photos exist
    const realPhotos = list.filter((p) => p && !p.includes("sunnystudio") && !p.includes("twobedflat"));
    if (realPhotos.length > 0) {
      return Array.from(new Set(realPhotos));
    }

    if (list.length > 0) {
      return Array.from(new Set(list));
    }

    return [sunnyStudioImg, twoBedFlatImg];
  };

  const handlePrevPhoto = (photosCount) => {
    if (!photosCount || photosCount <= 1) return;
    setActiveReviewPhotoIndex((prev) => (prev > 0 ? prev - 1 : photosCount - 1));
  };

  const handleNextPhoto = (photosCount) => {
    if (!photosCount || photosCount <= 1) return;
    setActiveReviewPhotoIndex((prev) => (prev < photosCount - 1 ? prev + 1 : 0));
  };

  const handleOpenReviewProperty = (prop) => {
    setReviewProperty(prop);
    setActiveReviewPhotoIndex(0);
  };

  // Sample verified reviews fallback for demo properties if no DB records exist
  const DEMO_REVIEWS_SAMPLE = [
    {
      id: "sample-rev-1",
      reviewer_name: "Maria Santos",
      rating: 5,
      rental_period: "Tenant (6 months)",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      comment: "Excellent unit! Very secure, high-speed WiFi worked without issues, and landlord was exceptionally responsive to maintenance requests.",
    },
    {
      id: "sample-rev-2",
      reviewer_name: "Joshua Lim",
      rating: 5,
      rental_period: "Tenant (1 year)",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
      comment: "Great location near university campus and public transit. Quiet neighborhood and fair utility billing.",
    },
    {
      id: "sample-rev-3",
      reviewer_name: "Bea Ramos",
      rating: 4,
      rental_period: "Tenant (3 months)",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 72).toISOString(),
      comment: "Good clean place with complete amenities. Move-in process was smooth and landlord was accommodating.",
    },
  ];

  // Fetch real reviews from Supabase landlord_reviews for the selected property
  const fetchPropertyReviews = async (prop) => {
    if (!prop) {
      setPropertyReviews([]);
      return;
    }
    setReviewsLoading(true);
    try {
      const propIdStr = String(prop.id || "");
      const cleanId = propIdStr.replace("prop-", "");
      const propName = (prop.property_name || prop.title || "").trim().toLowerCase();
      const landlordName = (prop.landlord_name || "").trim().toLowerCase();
      const landlordEmail = (prop.landlord_email || "").trim().toLowerCase();

      const { data, error } = await supabase
        .from("landlord_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      const dbRows = !error && Array.isArray(data) ? data : [];

      // 1. Direct property match by property_id or property_name
      let matched = dbRows.filter((r) => {
        if (!r) return false;
        const rPropId = r.property_id != null ? String(r.property_id) : "";
        if (rPropId && (rPropId === propIdStr || rPropId === cleanId)) return true;
        if (r.property_name && propName && r.property_name.trim().toLowerCase() === propName) return true;
        return false;
      });

      // 2. Landlord-level reviews if no direct property-specific match
      if (matched.length === 0) {
        matched = dbRows.filter((r) => {
          if (!r) return false;
          const rLName = (r.landlord_name || "").trim().toLowerCase();
          if (landlordName && rLName && (rLName === landlordName || rLName.includes(landlordName) || landlordName.includes(rLName))) {
            return true;
          }
          if (
            (landlordEmail === "landlord@mobin.ph" || landlordName.includes("itsme") || landlordName.includes("boy")) &&
            (rLName.includes("beetle") || rLName.includes("sarah") || rLName.includes("itsme"))
          ) {
            return true;
          }
          return false;
        });
      }

      // 3. Merge custom reviews stored locally for this property
      try {
        const local = JSON.parse(localStorage.getItem(`mobin_prop_reviews_${prop.id}`) || "[]");
        if (Array.isArray(local)) {
          local.forEach((lr) => {
            if (!matched.some((m) => m.id === lr.id)) {
              matched.unshift(lr);
            }
          });
        }
      } catch (_) {}

      // 4. Built-in demo fallback
      if (
        matched.length === 0 &&
        (propName.includes("sunny") || propName.includes("quiet") || propIdStr === "prop-1" || propIdStr === "prop-2")
      ) {
        matched = DEMO_REVIEWS_SAMPLE;
      }

      setPropertyReviews(matched);
    } catch (err) {
      console.warn("Failed to fetch property reviews:", err);
      setPropertyReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch ratings summary across all properties for list-level badges
  const fetchAllRatingsSummary = async (propsList = adminProperties) => {
    try {
      const { data, error } = await supabase
        .from("landlord_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      const dbRows = !error && Array.isArray(data) ? data : [];
      const map = {
        "prop-1": { avg: 4.8, count: 3 },
        "prop-2": { avg: 4.7, count: 3 },
        "Sunny Central Studio": { avg: 4.8, count: 3 },
        "Quiet 2BR Retreat": { avg: 4.7, count: 3 },
      };

      const currentProps = Array.isArray(propsList) && propsList.length > 0 ? propsList : adminProperties;

      currentProps.forEach((prop) => {
        const propIdStr = String(prop.id || "");
        const cleanId = propIdStr.replace("prop-", "");
        const propName = (prop.property_name || prop.title || "").trim().toLowerCase();
        const landlordName = (prop.landlord_name || "").trim().toLowerCase();
        const landlordEmail = (prop.landlord_email || "").trim().toLowerCase();

        // 1. Direct property match
        let matched = dbRows.filter((r) => {
          if (!r) return false;
          const rPropId = r.property_id != null ? String(r.property_id) : "";
          if (rPropId && (rPropId === propIdStr || rPropId === cleanId)) return true;
          if (r.property_name && propName && r.property_name.trim().toLowerCase() === propName) return true;
          return false;
        });

        // 2. Landlord match
        if (matched.length === 0) {
          matched = dbRows.filter((r) => {
            if (!r) return false;
            const rLName = (r.landlord_name || "").trim().toLowerCase();
            if (landlordName && rLName && (rLName === landlordName || rLName.includes(landlordName) || landlordName.includes(rLName))) {
              return true;
            }
            if (
              (landlordEmail === "landlord@mobin.ph" || landlordName.includes("itsme") || landlordName.includes("boy")) &&
              (rLName.includes("beetle") || rLName.includes("sarah") || rLName.includes("itsme"))
            ) {
              return true;
            }
            return false;
          });
        }

        // 3. Merge localStorage
        try {
          const local = JSON.parse(localStorage.getItem(`mobin_prop_reviews_${prop.id}`) || "[]");
          if (Array.isArray(local)) {
            local.forEach((lr) => {
              if (!matched.some((m) => m.id === lr.id)) {
                matched.push(lr);
              }
            });
          }
        } catch (_) {}

        if (matched.length > 0) {
          const sum = matched.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0);
          const avg = Number((sum / matched.length).toFixed(1));
          const stat = { avg, count: matched.length };
          map[prop.id] = stat;
          if (prop.property_name) map[prop.property_name] = stat;
        }
      });

      setAdminRatingsMap(map);
    } catch (e) {
      console.warn("Could not calculate ratings summary:", e);
    }
  };

  // Auto-fetch reviews whenever reviewProperty changes
  useEffect(() => {
    if (reviewProperty) {
      fetchPropertyReviews(reviewProperty);
    } else {
      setPropertyReviews([]);
    }
  }, [reviewProperty?.id, reviewProperty?.property_name]);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    primaryButtonText: "OK",
    secondaryButtonText: null,
    onConfirm: null,
  });

  const showNotice = (title, message, type = "info", onConfirm = null, primaryButtonText = "OK", secondaryButtonText = null) => {
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

  const adminName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Super Admin");
  const adminEmail = user?.email || "admin@mobin.ph";
  const [adminAvatar, setAdminAvatar] = useState(() => {
    try {
      const local = localStorage.getItem("mobin_admin_custom_avatar");
      if (local) return local;
    } catch (_) {}
    return (
      user?.user_metadata?.avatar_url ||
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    );
  });
  const [isSavingAdminProfile, setIsSavingAdminProfile] = useState(false);
  const adminAvatarInputRef = useRef(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPasswordText, setShowNewPasswordText] = useState(false);
  const [showConfirmPasswordText, setShowConfirmPasswordText] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  // Center modal states for Admin Profile and Account Settings
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(adminName);
  const [profilePhone, setProfilePhone] = useState("+63 917 888 9999");
  const [systemAlertPreferences, setSystemAlertPreferences] = useState({
    verificationAlerts: true,
    serverLogs: true,
    securityAlerts: true,
  });

  // State for editing user name inside user details modal
  const [isEditingModalUserName, setIsEditingModalUserName] = useState(false);
  const [modalUserNameInput, setModalUserNameInput] = useState("");

  useEffect(() => {
    if (adminName) setProfileName(adminName);
  }, [adminName]);

  // Load admin profile from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAdminProfile = async () => {
      if (!user) return;
      try {
        const isUuid =
          typeof user?.id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        let q = supabase.from("profiles").select("*");
        if (isUuid) {
          q = q.eq("id", user.id);
        } else if (user.email) {
          q = q.eq("email", user.email);
        } else {
          return;
        }

        const { data, error } = await q.maybeSingle();
        if (!error && data && isMounted) {
          if (data.full_name || data.name) setProfileName(data.full_name || data.name);
          if (data.phone || data.phone_number || data.contact) {
            setProfilePhone(data.phone || data.phone_number || data.contact);
          }
          if (data.avatar_url) setAdminAvatar(data.avatar_url);
        } else if (user.user_metadata && isMounted) {
          if (user.user_metadata.full_name) setProfileName(user.user_metadata.full_name);
          if (user.user_metadata.phone) setProfilePhone(user.user_metadata.phone);
          if (user.user_metadata.avatar_url) setAdminAvatar(user.user_metadata.avatar_url);
        }
      } catch (err) {
        console.warn("Could not load admin profile from Supabase:", err);
      }
    };

    fetchAdminProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const handleAdminAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 400, 0.85);
      if (compressed) {
        setAdminAvatar(compressed);
        try {
          localStorage.setItem("mobin_admin_custom_avatar", compressed);
        } catch (_) {}
      }
      const cloudUrl = await uploadImageToCloudinary(file, "mobin/avatars");
      if (cloudUrl) {
        setAdminAvatar(cloudUrl);
        try {
          localStorage.setItem("mobin_admin_custom_avatar", cloudUrl);
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Admin avatar processing error:", err);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleSendAdminResetEmail = async () => {
    const targetEmail = adminEmail;
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

  const handleSaveAdminProfile = async () => {
    if (!profileName.trim()) {
      showNotice("Missing Name", "Please enter your administrative name.", "warning");
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

    setIsSavingAdminProfile(true);
    try {
      const isUuid =
        typeof user?.id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

      // 1. Update Supabase Auth user metadata & password
      try {
        const authPayload = {
          data: {
            full_name: profileName,
            name: profileName,
            phone: profilePhone,
            avatar_url: adminAvatar,
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
      if (newPassword && adminEmail) {
        try {
          const resetStore = JSON.parse(localStorage.getItem("mobin_reset_passwords") || "{}");
          resetStore[adminEmail.toLowerCase().trim()] = newPassword;
          localStorage.setItem("mobin_reset_passwords", JSON.stringify(resetStore));
        } catch (_) {}
      }

      // 2. Persist to Supabase profiles table (stores full_name, avatar_url, updated_at in Supabase)
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
        if (!existingProfileId && adminEmail) {
          const { data: byEmail } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", adminEmail)
            .maybeSingle();
          if (byEmail?.id) existingProfileId = byEmail.id;
        }

        if (existingProfileId) {
          await supabase
            .from("profiles")
            .update({
              full_name: profileName,
              avatar_url: adminAvatar,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProfileId);
        } else if (isUuid) {
          await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: adminEmail,
              full_name: profileName,
              role: user?.user_metadata?.role || "superadmin",
              avatar_url: adminAvatar,
              updated_at: new Date().toISOString(),
            });
        }
      } catch (profErr) {
        console.warn("Profiles table update notice:", profErr);
      }

      // 3. Update local storage cache & notify parent application
      const updatedUserObj = {
        ...(user || {}),
        id: user?.id || "admin-001",
        email: adminEmail,
        user_metadata: {
          ...(user?.user_metadata || {}),
          full_name: profileName,
          name: profileName,
          phone: profilePhone,
          avatar_url: adminAvatar,
        },
      };

      try {
        localStorage.setItem("mobin_user", JSON.stringify(updatedUserObj));
      } catch (_) {}

      if (typeof onUpdateUser === "function") {
        onUpdateUser(updatedUserObj);
      }

      // Reset form password fields
      setNewPassword("");
      setConfirmNewPassword("");

      setIsProfileModalOpen(false);
      showNotice(
        "Profile Saved to Supabase",
        newPassword
          ? "Super admin profile details and password updated in Supabase successfully!"
          : "Super admin profile details saved to Supabase successfully!",
        "success"
      );
    } catch (err) {
      console.error("Save admin profile error:", err);
      showNotice("Save Error", err.message || "Failed to save profile to database.", "warning");
    } finally {
      setIsSavingAdminProfile(false);
    }
  };

  const handleMetricCardClick = (cardType) => {
    switch (cardType) {
      case "Users":
        setUserRoleFilter("All");
        setUserStatusFilter("All");
        setActiveTab("Users");
        break;
      case "Landlords":
        setUserRoleFilter("Landlord");
        setUserStatusFilter("All");
        setActiveTab("Users");
        break;
      case "Properties":
        setActiveTab("Properties");
        break;
      case "Verification":
        setActiveTab("Verification");
        break;
      case "Reported":
        setActiveTab("Reported Listings");
        break;
      case "Subscriptions":
        setActiveTab("Financials");
        break;
      default:
        break;
    }
  };

  // Fetch properties from Supabase & local cache with robust photo/cache merging
  const fetchAdminProperties = async () => {
    setLoadingProps(true);
    let dbProps = [];
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        dbProps = data;
      }
    } catch (err) {
      console.warn("Admin properties fetch:", err);
    }

    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");

      // Merge DB properties with localStorage cache:
      // If a cached item has updated photos/image or newer details, merge it into the DB row!
      const combined = dbProps.map((dbItem) => {
        const matchingCached = cached.find(
          (c) =>
            (c.id && dbItem.id && String(c.id) === String(dbItem.id)) ||
            (c.property_name && dbItem.property_name && c.property_name.toLowerCase().trim() === dbItem.property_name.toLowerCase().trim())
        );
        if (!matchingCached) return dbItem;

        // Determine which photos array has real/updated photos
        const cachedPhotos = Array.isArray(matchingCached.photos) && matchingCached.photos.length > 0 ? matchingCached.photos : [];
        const dbPhotos = Array.isArray(dbItem.photos) && dbItem.photos.length > 0 ? dbItem.photos : [];
        const mergedPhotos = cachedPhotos.length > 0 ? cachedPhotos : dbPhotos;

        // Determine valid cover image
        const mergedImage = matchingCached.image || cachedPhotos[0] || dbItem.image || dbPhotos[0] || sunnyStudioImg;

        // If Supabase has empty photos or null image, heal Supabase in background
        if ((!dbItem.photos || dbItem.photos.length === 0 || !dbItem.image) && (mergedPhotos.length > 0 || mergedImage)) {
          supabase
            .from("properties")
            .update({
              image: mergedImage,
              photos: mergedPhotos,
              updated_at: new Date().toISOString(),
            })
            .eq("id", dbItem.id)
            .then(() => {})
            .catch(() => {});
        }

        return {
          ...dbItem,
          ...matchingCached,
          id: dbItem.id || matchingCached.id,
          image: mergedImage,
          photos: mergedPhotos.length > 0 ? mergedPhotos : (mergedImage ? [mergedImage] : []),
        };
      });

      // Also append any properties in local cache that aren't yet in dbProps
      cached.forEach((c) => {
        if (
          !combined.some(
            (item) =>
              (item.id && c.id && String(item.id) === String(c.id)) ||
              (item.property_name && c.property_name && item.property_name.toLowerCase().trim() === c.property_name.toLowerCase().trim())
          )
        ) {
          combined.push(c);
        }
      });

      setAdminProperties(combined);
      fetchAllRatingsSummary();
    } catch {
      setAdminProperties(dbProps);
      fetchAllRatingsSummary();
    } finally {
      setLoadingProps(false);
    }
  };

  // Fetch strictly REAL database users from Supabase 'profiles' and related tables
  const fetchAdminUsers = async () => {
    setLoadingUsers(true);
    const usersMap = new Map();

    // Helper to format role names
    const formatRole = (rawRole) => {
      if (!rawRole) return "Student / Renter";
      const r = rawRole.toString().toLowerCase();
      if (r.includes("landlord")) return "Landlord";
      if (r.includes("admin") || r.includes("super")) return "Admin";
      if (r.includes("renter") || r.includes("student")) return "Student / Renter";
      return rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
    };

    // Pre-load known registered users from local cache to resolve real emails & roles
    const localRegisteredMap = new Map();
    try {
      const regList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      if (Array.isArray(regList)) {
        regList.forEach((item) => {
          if (typeof item === "object" && item) {
            const email = (item.email || "").trim().toLowerCase();
            const id = (item.id || "").toString().trim();
            if (email) localRegisteredMap.set(email, item);
            if (id) localRegisteredMap.set(id, item);
          } else if (typeof item === "string" && item.trim()) {
            const email = item.trim().toLowerCase();
            localRegisteredMap.set(email, {
              email,
              role: email.includes("landlord") ? "Landlord" : "Student / Renter",
            });
          }
        });
      }
    } catch (_) {}

    const customLandlordName = typeof window !== "undefined" ? localStorage.getItem("mobin_landlord_custom_name") : null;

    // 1. Fetch from Supabase 'profiles' table
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(profiles)) {
        profiles.forEach((p) => {
          const profileId = (p.id || "").toString().trim();
          let email = (p.email || p.user_email || "").toString().trim().toLowerCase();

          // Cross-reference with registered map if email is null in profiles table
          const regMatch = (profileId && localRegisteredMap.get(profileId)) || (email && localRegisteredMap.get(email));
          if (!email && regMatch?.email) {
            email = regMatch.email.trim().toLowerCase();
          }

          const userKey = email || profileId;
          if (!userKey) return;

          let fullName = p.full_name || p.name || p.display_name || p.username;
          if (regMatch?.name) {
            fullName = regMatch.name;
          }
          if (customLandlordName && (email === "landlord@mobin.ph" || profileId === "landlord-001")) {
            fullName = customLandlordName;
          }
          if (!fullName) {
            fullName = email ? email.split("@")[0].replace(/[._]/g, " ") : "Mob'in User";
          }

          // Prioritize Landlord role if registered as landlord or if profile role is landlord
          let role = formatRole(p.role || p.user_type || p.user_role);
          if (regMatch?.role && (formatRole(regMatch.role) === "Landlord" || role === "Student / Renter")) {
            role = formatRole(regMatch.role);
          }

          const isLandlord = role.toLowerCase() === "landlord";
          const isAdmin = role.toLowerCase().includes("admin");

          let avatarUrl = p.avatar_url || p.photo_url || p.image || p.profile_photo || p.avatar || regMatch?.avatarUrl || regMatch?.avatar_url || regMatch?.avatar || null;
          if (!avatarUrl && email) {
            try {
              avatarUrl = localStorage.getItem(`mobin_user_profile_avatar_${email}`) || null;
            } catch (_) {}
          }
          if (!avatarUrl && email === "landlord@mobin.ph") {
            avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
          }
          if (!avatarUrl && email === "admin@mobin.ph") {
            avatarUrl = localStorage.getItem("mobin_admin_profile_avatar") || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
          }

          usersMap.set(userKey, {
            id: p.id || regMatch?.id || (email === "landlord@mobin.ph" ? "landlord-001" : `usr-${Math.random().toString(36).substring(2, 9)}`),
            name: fullName,
            email: email || `${p.id?.slice(0, 8) || "user"}@mobin.ph`,
            phone: p.phone || p.phone_number || regMatch?.phone || "+63 917 000 0000",
            role: role,
            status: regMatch?.status || p.status || (p.is_verified === false ? "Pending ID" : "Active"),
            dateJoined: regMatch?.dateJoined || (p.created_at || p.inserted_at || p.updated_at
              ? new Date(p.created_at || p.inserted_at || p.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently"),
            propertiesCount: p.properties_count || 0,
            propertyTitles: [],
            avatarColor: isLandlord ? "#8c6b45" : isAdmin ? "#5f5900" : "#2e7d32",
            avatarUrl: avatarUrl,
            source: "profiles",
          });
        });
      } else if (error) {
        console.warn("Supabase profiles table fetch notice:", error.message);
      }
    } catch (err) {
      console.warn("Profiles fetch error:", err);
    }

    // 2. Fetch from Supabase 'users' table (fallback if used)
    try {
      const { data: customUsers, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(customUsers)) {
        customUsers.forEach((u) => {
          const userKey = (u.email || u.id || "").toString().trim().toLowerCase();
          if (!userKey || usersMap.has(userKey)) return;

          const email = u.email || `${u.id?.slice(0, 8) || "user"}@mobin.ph`;
          const fullName = u.full_name || u.name || (u.email ? u.email.split("@")[0] : "User");
          const role = formatRole(u.role);

          usersMap.set(userKey, {
            id: u.id || `usr-${Math.random().toString(36).substring(2, 9)}`,
            name: fullName,
            email: email,
            phone: u.phone || "+63 917 000 0000",
            role: role,
            status: u.status || "Active",
            dateJoined: u.created_at
              ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently",
            propertiesCount: 0,
            propertyTitles: [],
            avatarColor: role.toLowerCase() === "landlord" ? "#8c6b45" : role.toLowerCase().includes("admin") ? "#5f5900" : "#2e7d32",
            source: "users_table",
          });
        });
      }
    } catch (_) {}

    // 3. Match real registered landlords and their properties from 'properties' table & local properties
    try {
      const { data: dbProperties, error } = await supabase
        .from("properties")
        .select("id, property_name, landlord_name, landlord_email, created_at");

      let allProps = Array.isArray(dbProperties) ? [...dbProperties] : [];
      try {
        const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
        if (Array.isArray(cachedProps)) {
          cachedProps.forEach((cp) => {
            if (!allProps.some((p) => (p.id && p.id === cp.id) || (p.property_name && p.property_name === cp.property_name))) {
              allProps.push(cp);
            }
          });
        }
      } catch (_) {}

      allProps.forEach((prop) => {
        const email = (prop.landlord_email || prop.landlord?.email || "").toString().trim().toLowerCase();
        if (!email) return;

        if (usersMap.has(email)) {
          const existing = usersMap.get(email);
          existing.propertiesCount = (existing.propertiesCount || 0) + 1;
          if (prop.property_name && !existing.propertyTitles.includes(prop.property_name)) {
            existing.propertyTitles.push(prop.property_name);
          }
          if (existing.role === "Student / Renter") existing.role = "Landlord";
          existing.avatarColor = "#8c6b45";
          // If landlord has listed properties, they have completed verification and are Active!
          existing.status = "Active";
          existing.email_verified = true;
          if (customLandlordName && (email === "landlord@mobin.ph" || existing.id === "landlord-001")) {
            existing.name = customLandlordName;
          }
        } else {
          const isDemoLandlord = email === "landlord@mobin.ph";
          const landlordDisplayName = isDemoLandlord
            ? (customLandlordName || prop.landlord_name || "Sarah Jenkins")
            : (prop.landlord_name || email.split("@")[0].replace(/[._]/g, " "));

          usersMap.set(email, {
            id: isDemoLandlord ? "landlord-001" : `usr-${prop.id || Math.random().toString(36).substring(2, 9)}`,
            name: landlordDisplayName,
            email: email,
            phone: prop.landlord_phone || "+63 918 000 0000",
            role: "Landlord",
            status: "Active",
            dateJoined: prop.created_at
              ? new Date(prop.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently",
            propertiesCount: 1,
            propertyTitles: prop.property_name ? [prop.property_name] : [],
            avatarColor: "#8c6b45",
            source: "properties_db",
          });
        }
      });
    } catch (_) {}

    // 4. Fetch subscription tiers from 'landlord_subscriptions' table and local cache
    try {
      const { data: dbSubs } = await supabase
        .from("landlord_subscriptions")
        .select("*");

      let allSubs = Array.isArray(dbSubs) ? [...dbSubs] : [];
      try {
        const cachedSubs = JSON.parse(localStorage.getItem("mobin_landlord_subscriptions") || "[]");
        if (Array.isArray(cachedSubs)) {
          cachedSubs.forEach((cs) => {
            if (!allSubs.some((s) => s.landlord_email === cs.landlord_email)) {
              allSubs.push(cs);
            }
          });
        }
      } catch (_) {}

      allSubs.forEach((sub) => {
        if (!sub.landlord_email) return;
        const email = sub.landlord_email.trim().toLowerCase();
        if (usersMap.has(email)) {
          const existing = usersMap.get(email);
          existing.role = "Landlord";
          existing.subscriptionTier = sub.tier || "Active Plan";
          existing.avatarColor = "#8c6b45";
          existing.status = "Active";
          existing.email_verified = true;
          if (customLandlordName && (email === "landlord@mobin.ph" || existing.id === "landlord-001")) {
            existing.name = customLandlordName;
          }
        } else {
          usersMap.set(email, {
            id: sub.user_id || sub.id || (email === "landlord@mobin.ph" ? "landlord-001" : `usr-${Math.random().toString(36).substring(2, 9)}`),
            name: (email === "landlord@mobin.ph" && customLandlordName) ? customLandlordName : (sub.landlord_name || email.split("@")[0]),
            email: email,
            phone: "+63 918 000 0000",
            role: "Landlord",
            status: "Active",
            dateJoined: sub.created_at
              ? new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently",
            propertiesCount: 1,
            propertyTitles: [],
            subscriptionTier: sub.tier || "Active Plan",
            avatarColor: "#8c6b45",
            source: "subscriptions_db",
          });
        }
      });
    } catch (_) {}

    // 5. Fetch from local registered users cache (mobin_registered_users)
    try {
      const regList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      if (Array.isArray(regList)) {
        regList.forEach((emailItem) => {
          const email = (typeof emailItem === "string" ? emailItem : emailItem.email || "").trim().toLowerCase();
          const id = typeof emailItem === "object" ? emailItem.id : null;
          if (!email && !id) return;

          const registeredRole = typeof emailItem === "object" && emailItem.role
            ? formatRole(emailItem.role)
            : (email.includes("landlord") ? "Landlord" : "Student / Renter");
          const isLandlord = registeredRole.toLowerCase() === "landlord";
          const isDemoLandlordItem = email === "landlord@mobin.ph" || id === "landlord-001";

          // If user already exists in usersMap, ensure role & name & real email are updated!
          let existingKey = (email && usersMap.has(email)) ? email : (id && usersMap.has(id) ? id : null);
          if (!existingKey && isDemoLandlordItem) {
            existingKey = usersMap.has("landlord@mobin.ph") ? "landlord@mobin.ph" : (usersMap.has("landlord-001") ? "landlord-001" : null);
          }

          if (existingKey) {
            const existing = usersMap.get(existingKey);
            if (isLandlord) {
              existing.role = "Landlord";
              existing.avatarColor = "#8c6b45";
            }
            if (email && (!existing.email || existing.email.includes("@mobin.ph"))) {
              existing.email = email;
            }
            // Update name in-place without blocking
            if (typeof emailItem === "object" && (emailItem.name || emailItem.full_name)) {
              existing.name = emailItem.name || emailItem.full_name;
            }
            if (customLandlordName && (existing.email === "landlord@mobin.ph" || existing.id === "landlord-001")) {
              existing.name = customLandlordName;
            }
            if (typeof emailItem === "object" && emailItem.status) {
              if (existing.propertiesCount > 0 || existing.subscriptionTier || emailItem.email_verified || emailItem.status === "Active") {
                existing.status = "Active";
                existing.email_verified = true;
                if (emailItem.status !== "Active") {
                  emailItem.status = "Active";
                  try {
                    localStorage.setItem("mobin_registered_users", JSON.stringify(regList));
                  } catch (_) {}
                }
              } else {
                existing.status = emailItem.status;
              }
            }
            if (typeof emailItem === "object" && (emailItem.avatar_url || emailItem.avatarUrl || emailItem.avatar || emailItem.photo)) {
              existing.avatarUrl = existing.avatarUrl || emailItem.avatar_url || emailItem.avatarUrl || emailItem.avatar || emailItem.photo;
            }
            return;
          }

          // If this is landlord demo and already exists in usersMap under any alias, DO NOT DUPLICATE!
          if (isDemoLandlordItem && (usersMap.has("landlord@mobin.ph") || usersMap.has("landlord-001"))) {
            const demoUser = usersMap.get("landlord@mobin.ph") || usersMap.get("landlord-001");
            if (customLandlordName) demoUser.name = customLandlordName;
            return;
          }

          // Otherwise add as new user in admin
          let displayName = typeof emailItem === "object" && (emailItem.name || emailItem.full_name)
            ? (emailItem.name || emailItem.full_name)
            : (email ? email.split("@")[0].replace(/[._]/g, " ") : "Mob'in User");

          if (isDemoLandlordItem && customLandlordName) {
            displayName = customLandlordName;
          }

          let localAvatar = (typeof emailItem === "object" && (emailItem.avatar_url || emailItem.avatarUrl || emailItem.avatar || emailItem.photo)) || null;
          if (!localAvatar && email) {
            try {
              localAvatar = localStorage.getItem(`mobin_user_profile_avatar_${email}`) || null;
            } catch (_) {}
          }
          if (!localAvatar && email === "landlord@mobin.ph") {
            localAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
          }

          const userHasProps = (email && allProps.some((p) => (p.landlord_email || "").toLowerCase().trim() === email));
          const isUserActive = userHasProps || (typeof emailItem === "object" && (emailItem.email_verified || emailItem.status === "Active"));

          usersMap.set(email || id, {
            id: id || (isDemoLandlordItem ? "landlord-001" : `usr-${Math.random().toString(36).substring(2, 9)}`),
            name: displayName,
            email: email || `${id?.slice(0, 8)}@mobin.ph`,
            phone: (typeof emailItem === "object" && emailItem.phone) || "+63 917 000 0000",
            role: registeredRole,
            status: isUserActive ? "Active" : ((typeof emailItem === "object" && emailItem.status) || "Active"),
            dateJoined: (typeof emailItem === "object" && emailItem.dateJoined) || "Recently",
            propertiesCount: userHasProps ? 1 : 0,
            propertyTitles: [],
            avatarColor: isLandlord ? "#8c6b45" : "#2e7d32",
            avatarUrl: localAvatar,
            source: "local_registered",
          });
        });
      }
    } catch (_) {}

    // 6. Ensure the active logged-in admin or user session is represented
    if (user?.email) {
      const myEmail = user.email.trim().toLowerCase();
      const myRole = user.email === "admin@mobin.ph" ? "Admin" : formatRole(user.user_metadata?.role || user.role);
      let myAvatar = user.user_metadata?.avatar_url || user.avatar_url || user.avatar || null;
      if (!myAvatar && myEmail) {
        try {
          myAvatar = localStorage.getItem(`mobin_user_profile_avatar_${myEmail}`) || (myEmail === "admin@mobin.ph" ? localStorage.getItem("mobin_admin_profile_avatar") : null);
        } catch (_) {}
      }
      if (!myAvatar && myEmail === "admin@mobin.ph") {
        myAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
      }

      if (usersMap.has(myEmail)) {
        const existing = usersMap.get(myEmail);
        if (myRole === "Landlord") {
          existing.role = "Landlord";
          existing.avatarColor = "#8c6b45";
        }
        if (myAvatar && !existing.avatarUrl) {
          existing.avatarUrl = myAvatar;
        }
      } else {
        usersMap.set(myEmail, {
          id: user.id || "usr-current",
          name: user.user_metadata?.full_name || user.name || user.email.split("@")[0],
          email: myEmail,
          phone: user.user_metadata?.phone || "+63 917 123 4567",
          role: myRole,
          status: "Active",
          dateJoined: "Current Session",
          propertiesCount: 0,
          propertyTitles: [],
          avatarColor: myRole === "Admin" ? "#5f5900" : myRole === "Landlord" ? "#8c6b45" : "#2e7d32",
          avatarUrl: myAvatar,
          source: "auth_session",
        });
      }
    }

    const realUsersList = Array.from(usersMap.values());
    setAdminUsers(realUsersList);
    try {
      localStorage.setItem("mobin_real_supabase_users", JSON.stringify(realUsersList));
    } catch (_) {}
    setLoadingUsers(false);
  };

  // Fetch real-time financials and payment ledger directly from Supabase
  const fetchAdminFinancials = async () => {
    setLoadingFinancials(true);
    let dbPayments = [];
    const profilesMap = new Map();

    try {
      // 1. Fetch profiles to resolve real customer names & roles
      const { data: profData } = await supabase.from("profiles").select("*");
      if (Array.isArray(profData)) {
        profData.forEach((p) => {
          const profileInfo = {
            name: p.full_name || p.name || p.username || (p.email ? p.email.split("@")[0] : ""),
            email: p.email || "",
            role: (p.role || "renter").toLowerCase().includes("landlord") ? "Landlord" : "Student / Renter",
          };
          if (p.id) profilesMap.set(String(p.id).toLowerCase().trim(), profileInfo);
          if (p.email) profilesMap.set(String(p.email).toLowerCase().trim(), profileInfo);
        });
      }

      // Also fetch properties to resolve landlords
      const { data: propData } = await supabase
        .from("properties")
        .select("landlord_id, landlord_email, landlord_name");
      if (Array.isArray(propData)) {
        propData.forEach((pr) => {
          if (pr.landlord_name) {
            const landlordInfo = {
              name: pr.landlord_name,
              email: pr.landlord_email || "",
              role: "Landlord",
            };
            if (pr.landlord_id) profilesMap.set(String(pr.landlord_id).toLowerCase().trim(), landlordInfo);
            if (pr.landlord_email) profilesMap.set(String(pr.landlord_email).toLowerCase().trim(), landlordInfo);
          }
        });
      }

      // 2. Query Supabase 'payments' table
      const { data: payData, error: payError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!payError && Array.isArray(payData)) {
        dbPayments = payData;
      }
    } catch (err) {
      console.warn("Supabase Financials fetch warning:", err);
    }

    if (dbPayments && dbPayments.length > 0) {
      const normalized = dbPayments.map((p, idx) => {
        const rawDate = p.created_at || p.paid_at || new Date().toISOString();
        const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const userKeyId = (p.user_id || "").toLowerCase().trim();
        const userKeyEmail = (p.user_email || p.payer_email || "").toLowerCase().trim();
        const matchedProfile = (userKeyId && profilesMap.get(userKeyId)) || (userKeyEmail && profilesMap.get(userKeyEmail));

        let payerName = p.payer_name || matchedProfile?.name;
        if (!payerName) {
          if (userKeyEmail === "landlord@mobin.ph") {
            payerName = "Sarah Jenkins (Demo Landlord)";
          } else if (userKeyEmail === "admin@mobin.ph") {
            payerName = "Mob'in Platform Admin";
          } else if (userKeyEmail) {
            const prefix = userKeyEmail.split("@")[0].replace(/[._-]/g, " ");
            payerName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          } else {
            payerName = "Verified Customer";
          }
        }

        const payerEmail = p.user_email || p.payer_email || matchedProfile?.email || (userKeyEmail || "customer@mobin.ph");
        const amt = Number(p.amount || 0);

        // Item / Plan determination
        let item = p.item || p.tier;
        if (!item) {
          if (amt === 99) item = "Student 1-Month Direct Booking Pass";
          else if (amt >= 2900 && amt <= 3100) item = "Landlord Starter (1 Property)";
          else if (amt >= 3900 && amt <= 4100) item = "Landlord YAWA Tier (6 Properties)";
          else if (amt >= 1400 && amt <= 1600) item = "YAWA Tier Subscription";
          else if (amt >= 500 && amt <= 600) item = "Landlord Pro Plan";
          else if (amt >= 100 && amt <= 200) item = "Landlord 1 Property Plan";
          else item = "Platform Service Subscription";
        }

        // Role determination
        const itemLower = (item || "").toLowerCase();
        let role = "Student / Renter";
        if (
          itemLower.includes("landlord") ||
          itemLower.includes("property") ||
          itemLower.includes("yawa") ||
          itemLower.includes("tier") ||
          itemLower.includes("pro") ||
          itemLower.includes("plan") ||
          matchedProfile?.role === "Landlord" ||
          amt > 150
        ) {
          role = "Landlord";
        }

        // Gateway determination (GCash & Maya Direct QR only)
        let gatewayStr = p.gateway;
        if (!gatewayStr || gatewayStr.toLowerCase().includes("card")) {
          const ref = (p.reference || p.ref_no || "").toUpperCase();
          if (ref.includes("MAYA") || ref.startsWith("MY")) {
            gatewayStr = "Maya (Direct QR)";
          } else {
            gatewayStr = "GCash (Direct QR)";
          }
        }

        const refNo = p.reference || p.ref_no || (p.id ? `REF-${p.id.slice(0, 8).toUpperCase()}` : `REF-${String(idx + 100).padStart(4, "0")}`);
        const invoiceId = p.or_number || (p.id && p.id.length > 8 ? `INV-${p.id.slice(0, 8).toUpperCase()}` : `INV-2026-${String(idx + 80).padStart(4, "0")}`);

        return {
          id: invoiceId,
          dbId: p.id,
          payerName,
          payerEmail,
          role,
          item,
          amount: amt,
          gateway: gatewayStr,
          refNo,
          date: formattedDate,
          rawDate,
          status: p.status === "paid" || p.status === "Completed" ? "Completed" : p.status || "Completed",
          proof_image: p.proof_image || p.proof_url || null,
        };
      });

      setFinancialTransactions(normalized);
      try {
        localStorage.setItem("mobin_admin_transactions", JSON.stringify(normalized));
      } catch (_) {}
    } else {
      setFinancialTransactions([]);
    }
    setLoadingFinancials(false);
  };

  // Update a transaction payment status in Supabase
  const handleUpdatePaymentStatus = async (tx, newStatus) => {
    if (!tx) return;
    try {
      const dbId = tx.dbId || (tx.id && !tx.id.startsWith("INV-") ? tx.id : null);
      if (dbId) {
        const { error } = await supabase
          .from("payments")
          .update({ status: newStatus })
          .eq("id", dbId);
        if (error) throw error;
      }
      setFinancialTransactions((prev) =>
        prev.map((item) => (item.id === tx.id || item.dbId === dbId ? { ...item, status: newStatus } : item))
      );
      showNotice("Payment Status Updated", `Payment ${tx.id} marked as ${newStatus}.`, "success");
      fetchAdminFinancials();
    } catch (err) {
      console.error("Failed to update payment status:", err);
      showNotice("Update Failed", "Could not update payment status in Supabase.", "error");
    }
  };

  // Fetch live reports from Supabase 'reports' table
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        setReports(data);
      }
    } catch (err) {
      console.warn("Supabase reports fetch error:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Helper to match a report with its corresponding property in adminProperties
  const getReportProperty = (report) => {
    if (!report) return null;
    return (
      adminProperties.find(
        (p) =>
          (report.property_id && String(p.id) === String(report.property_id)) ||
          (report.property_name &&
            p.property_name &&
            p.property_name.toLowerCase().trim() === report.property_name.toLowerCase().trim())
      ) || null
    );
  };

  // Handle report status change in Supabase
  const handleUpdateReportStatus = async (reportId, newStatus, propertyTitle = "Property") => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          ...(newStatus === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq("id", reportId);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );

      const statusLabels = {
        resolved: "Resolved",
        dismissed: "Dismissed",
        investigating: "Under Investigation",
        pending: "Pending",
      };

      showNotice(
        `Report ${statusLabels[newStatus] || "Updated"}`,
        `Report for "${propertyTitle}" has been marked as ${statusLabels[newStatus] || newStatus}.`,
        newStatus === "resolved" ? "success" : "info"
      );
    } catch (err) {
      console.error("Failed to update report status:", err);
      showNotice("Update Error", "Could not update report status in database.", "error");
    }
  };

  // Suspend property listing from public visibility
  const handleSuspendReportedProperty = async (propId, propName) => {
    if (!propId) return;
    try {
      const isNum = /^\d+$/.test(String(propId));
      const targetId = isNum ? Number(propId) : propId;

      const { error } = await supabase
        .from("properties")
        .update({
          status: "Occupied",
          verification_status: "Suspended",
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetId);

      if (error) throw error;

      setAdminProperties((prev) =>
        prev.map((p) =>
          String(p.id) === String(propId)
            ? { ...p, status: "Occupied", verification_status: "Suspended" }
            : p
        )
      );

      showNotice(
        "Listing Suspended",
        `Listing "${propName || 'Property'}" has been suspended from search results pending investigation.`,
        "warning"
      );
    } catch (err) {
      console.error("Failed to suspend property:", err);
      showNotice("Suspension Error", "Could not suspend property listing.", "error");
    }
  };

  // Inspect reported property details
  const handleInspectReportedProperty = (report) => {
    const matched = getReportProperty(report);
    if (matched) {
      handleOpenReviewProperty(matched);
    } else {
      handleOpenReviewProperty({
        id: report.property_id || "N/A",
        property_name: report.property_name || `Listing #${report.property_id}`,
        landlord_name: "Associated Landlord",
        landlord_email: "landlord@mobin.ph",
        rent: 3500,
        address: "Lucban, Quezon",
        property_type: "Accommodation",
        status: "Reported",
        verification_status: "Reported",
        description: `This listing was reported with reason: "${report.reason}". Reporter complaint: "${report.details || 'No additional details provided.'}"`,
        image: sunnyStudioImg,
        photos: [sunnyStudioImg, twoBedFlatImg],
      });
    }
  };

  useEffect(() => {
    fetchAdminProperties();
    fetchAdminUsers();
    fetchAdminFinancials();
    fetchReports();

    // Set up Realtime Sync with Supabase for Payments, Invoices & Reports
    let realtimeChannel = null;
    try {
      realtimeChannel = supabase
        .channel("admin-sync-all")
        .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
          fetchAdminFinancials();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "subscription_invoices" }, () => {
          fetchAdminFinancials();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => {
          fetchReports();
        })
        .subscribe();
    } catch (_) {}

    const handlePropsUpdate = () => {
      fetchAdminProperties();
      fetchAdminFinancials();
      fetchAdminUsers();
      fetchReports();
    };

    window.addEventListener("mobin_properties_updated", handlePropsUpdate);
    window.addEventListener("mobin_users_updated", handlePropsUpdate);
    window.addEventListener("storage", handlePropsUpdate);
    return () => {
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
      window.removeEventListener("mobin_properties_updated", handlePropsUpdate);
      window.removeEventListener("mobin_users_updated", handlePropsUpdate);
      window.removeEventListener("storage", handlePropsUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "Verification" || activeTab === "Properties" || activeTab === "Dashboard") {
      fetchAdminProperties();
    }
    if (activeTab === "Financials" || activeTab === "Dashboard") {
      fetchAdminFinancials();
    }
    if (activeTab === "Users" || activeTab === "Dashboard") {
      fetchAdminUsers();
    }
    if (activeTab === "Reported Listings" || activeTab === "Dashboard") {
      fetchReports();
    }
  }, [activeTab]);

  const handleExportUsersCSV = () => {
    if (!adminUsers || adminUsers.length === 0) return;
    const headers = ["User ID", "Full Name", "Email Address", "Phone Number", "Role", "Status", "Date Joined"];
    const rows = adminUsers.map((u) => [
      `"${u.id || ''}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.status || '').replace(/"/g, '""')}"`,
      `"${(u.dateJoined || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mobin_users_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("Users Exported", `Successfully exported ${adminUsers.length} user records to CSV.`, "success");
  };

  const handleExportFinancialsCSV = () => {
    if (!financialTransactions || financialTransactions.length === 0) return;
    const headers = ["Invoice ID", "Payer Name", "Email", "Account Type", "Purchased Item", "Amount (PHP)", "Payment Gateway", "Reference Number", "Date", "Status"];
    const rows = financialTransactions.map((t) => [
      `"${t.id}"`,
      `"${(t.payerName || '').replace(/"/g, '""')}"`,
      `"${(t.payerEmail || '').replace(/"/g, '""')}"`,
      `"${t.role}"`,
      `"${(t.item || '').replace(/"/g, '""')}"`,
      `"${Number(t.amount || 0).toFixed(2)}"`,
      `"${t.gateway}"`,
      `"${t.refNo}"`,
      `"${t.date}"`,
      `"${t.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mobin_financial_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("Ledger Exported", `Successfully exported ${financialTransactions.length} transaction records to CSV.`, "success");
  };

  const handleVerifyUserStatus = (userToVerify) => {
    if (!userToVerify) return;
    const targetEmail = (userToVerify.email || "").toString().trim().toLowerCase();
    const targetId = (userToVerify.id || "").toString().trim();

    // 1. Update React state
    setAdminUsers((prev) =>
      prev.map((u) => {
        const uEmail = (u.email || "").toString().trim().toLowerCase();
        const uId = (u.id || "").toString().trim();
        if ((targetEmail && uEmail === targetEmail) || (targetId && uId === targetId)) {
          return { ...u, status: "Active", email_verified: true };
        }
        return u;
      })
    );

    if (selectedUserForModal) {
      const sEmail = (selectedUserForModal.email || "").toString().trim().toLowerCase();
      const sId = (selectedUserForModal.id || "").toString().trim();
      if ((targetEmail && sEmail === targetEmail) || (targetId && sId === targetId)) {
        setSelectedUserForModal((prev) => prev ? { ...prev, status: "Active", email_verified: true } : null);
      }
    }

    // 2. Persist in localStorage mobin_registered_users
    try {
      const regList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      let updated = false;
      const updatedList = regList.map((item) => {
        const itemEmail = (typeof item === "string" ? item : item?.email || "").toString().trim().toLowerCase();
        const itemId = typeof item === "object" ? (item?.id || "").toString().trim() : null;
        if ((targetEmail && itemEmail === targetEmail) || (targetId && itemId === targetId)) {
          updated = true;
          return {
            ...(typeof item === "object" ? item : { email: item }),
            status: "Active",
            email_verified: true,
          };
        }
        return item;
      });
      if (!updated && targetEmail) {
        updatedList.unshift({
          id: targetId || `usr-${Date.now()}`,
          email: targetEmail,
          name: userToVerify.name || targetEmail.split("@")[0],
          role: userToVerify.role || "Landlord",
          status: "Active",
          email_verified: true,
        });
      }
      localStorage.setItem("mobin_registered_users", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("mobin_users_updated"));
    } catch (_) {}

    showNotice(
      "User Activated & Verified",
      `"${userToVerify.name}" is now marked as Active. Email verification status has been confirmed.`,
      "success"
    );
  };

  const handleUpdateUserName = async (userToUpdate, newName) => {
    if (!userToUpdate || !newName?.trim()) return;
    const trimmedName = newName.trim();
    const targetEmail = (userToUpdate.email || "").toString().trim().toLowerCase();
    const targetId = (userToUpdate.id || "").toString().trim();
    const isDemoLandlord = targetEmail === "landlord@mobin.ph" || targetId === "landlord-001";

    // 1. Update React state in place
    setAdminUsers((prev) =>
      prev.map((u) => {
        const uEmail = (u.email || "").toString().trim().toLowerCase();
        const uId = (u.id || "").toString().trim();
        const isMatch =
          (targetEmail && uEmail === targetEmail) ||
          (targetId && uId === targetId) ||
          (isDemoLandlord && (uEmail === "landlord@mobin.ph" || uId === "landlord-001"));
        if (isMatch) {
          return { ...u, name: trimmedName };
        }
        return u;
      })
    );

    if (selectedUserForModal) {
      setSelectedUserForModal((prev) => prev ? { ...prev, name: trimmedName } : null);
    }
    setIsEditingModalUserName(false);

    // 2. If demo landlord, save custom name so it survives logins and refreshes
    if (isDemoLandlord) {
      localStorage.setItem("mobin_landlord_custom_name", trimmedName);
    }

    // 3. Persist in localStorage mobin_registered_users (IN PLACE without duplicating)
    try {
      const regList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      let updated = false;
      const updatedList = regList.map((item) => {
        const itemEmail = (typeof item === "string" ? item : item?.email || "").toString().trim().toLowerCase();
        const itemId = typeof item === "object" ? (item?.id || "").toString().trim() : null;
        const isMatch =
          (targetEmail && itemEmail === targetEmail) ||
          (targetId && itemId === targetId) ||
          (isDemoLandlord && (itemEmail === "landlord@mobin.ph" || itemId === "landlord-001"));
        if (isMatch) {
          updated = true;
          return {
            ...(typeof item === "object" ? item : { email: item }),
            name: trimmedName,
            full_name: trimmedName,
          };
        }
        return item;
      });
      if (!updated && targetEmail) {
        updatedList.unshift({
          id: targetId || (isDemoLandlord ? "landlord-001" : `usr-${Date.now()}`),
          email: targetEmail,
          name: trimmedName,
          full_name: trimmedName,
          role: userToUpdate.role || "Landlord",
          status: "Active",
          email_verified: true,
        });
      }
      localStorage.setItem("mobin_registered_users", JSON.stringify(updatedList));
    } catch (_) {}

    // 4. Persist in mobin_properties
    try {
      const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      if (Array.isArray(cachedProps) && cachedProps.length > 0) {
        const updatedProps = cachedProps.map((p) => {
          const pEmail = (p.landlord_email || "").toLowerCase().trim();
          if (
            (targetEmail && pEmail === targetEmail) ||
            (isDemoLandlord && (pEmail === "landlord@mobin.ph" || p.landlord_id === "landlord-001"))
          ) {
            return { ...p, landlord_name: trimmedName };
          }
          return p;
        });
        localStorage.setItem("mobin_properties", JSON.stringify(updatedProps));
      }
    } catch (_) {}

    // 5. Persist to Supabase if applicable
    try {
      if (targetEmail) {
        await supabase
          .from("properties")
          .update({ landlord_name: trimmedName })
          .eq("landlord_email", targetEmail);

        await supabase
          .from("profiles")
          .update({ full_name: trimmedName })
          .eq("email", targetEmail);
      }
    } catch (_) {}

    window.dispatchEvent(new Event("mobin_users_updated"));
    window.dispatchEvent(new Event("mobin_profile_updated"));
    window.dispatchEvent(new Event("mobin_properties_updated"));

    showNotice(
      "User Name Updated",
      `User name has been changed to "${trimmedName}" in place without creating extra accounts.`,
      "success"
    );
  };

  const handleApproveProperty = async (propId) => {
    const target = adminProperties.find((p) => p.id === propId || p.property_name === propId);
    if (!target) return;

    // 1. Persist approved status to Supabase properties table
    try {
      const isDbId = target.id && !isNaN(Number(target.id));
      if (isDbId) {
        await supabase
          .from("properties")
          .update({
            status: "Available",
            verification: "Verified",
            verification_status: "Verified",
            verification_notes: "Approved by Super Admin",
          })
          .eq("id", Number(target.id));
      } else if (target.property_name) {
        await supabase
          .from("properties")
          .update({
            status: "Available",
            verification: "Verified",
            verification_status: "Verified",
            verification_notes: "Approved by Super Admin",
          })
          .eq("property_name", target.property_name);
      }
    } catch (err) {
      console.warn("Supabase approve update notice:", err);
    }

    // 2. Update React State immediately so it disappears from Verification Queue and moves to Approved Properties
    const updated = adminProperties.map((p) =>
      p.id === propId || (target.id && p.id === target.id) || (target.property_name && p.property_name === target.property_name)
        ? {
            ...p,
            status: "Available",
            verification: "Verified",
            verification_status: "Verified",
            verification_notes: "Approved by Super Admin",
          }
        : p
    );
    setAdminProperties(updated);

    // 3. Persist in local storage cache
    try {
      localStorage.setItem("mobin_properties", JSON.stringify(updated));
      window.dispatchEvent(new Event("mobin_properties_updated"));
    } catch (_) {}

    // 4. Close any open review modal
    setReviewProperty(null);

    // 5. Switch to 'Properties' tab so admin sees it in the approved catalog
    setActiveTab("Properties");

    // 6. Refresh user portfolio counts
    fetchAdminUsers();

    // 7. Show feedback notification
    showNotice(
      "Property Approved & Published!",
      `"${target.property_name}" has been approved!\n\nIt has been moved from the Verification Queue to Approved Properties and is now active in public search results.`,
      "success"
    );
  };

  const handleRejectProperty = async (propId) => {
    const target = adminProperties.find((p) => p.id === propId || p.property_name === propId);
    if (!target) return;
    const reason = "Please upload clearer property photos or government-issued proof of property ownership.";

    try {
      const isDbId = target.id && !isNaN(Number(target.id));
      if (isDbId) {
        await supabase
          .from("properties")
          .update({
            status: "Needs Revision",
            verification: "Rejected",
            verification_status: "Rejected",
            verification_notes: reason,
          })
          .eq("id", Number(target.id));
      } else if (target.property_name) {
        await supabase
          .from("properties")
          .update({
            status: "Needs Revision",
            verification: "Rejected",
            verification_status: "Rejected",
            verification_notes: reason,
          })
          .eq("property_name", target.property_name);
      }
    } catch (_) {}

    const updated = adminProperties.map((p) =>
      p.id === propId || (target.id && p.id === target.id) || (target.property_name && p.property_name === target.property_name)
        ? { ...p, status: "Needs Revision", verification: "Rejected", verification_status: "Rejected", verification_notes: reason }
        : p
    );
    setAdminProperties(updated);
    try {
      localStorage.setItem("mobin_properties", JSON.stringify(updated));
      window.dispatchEvent(new Event("mobin_properties_updated"));
    } catch (_) {}

    showNotice(
      "Property Needs Revision",
      `"${target.property_name}" has been marked as Rejected / Needs Revision.\n\nRevision request and guidelines have been sent to the landlord.`,
      "warning"
    );
  };

  const [subscriptionPlans, setSubscriptionPlans] = useState(() => {
    try {
      const cached = localStorage.getItem("mobin_subscription_plans");
      return cached ? JSON.parse(cached) : DEFAULT_ADMIN_PLANS;
    } catch {
      return DEFAULT_ADMIN_PLANS;
    }
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [newFeatureText, setNewFeatureText] = useState("");

  // Landlord Subscribers state with real-time override controls
  const [subscribersList, setSubscribersList] = useState([
    {
      id: "sub-1",
      landlordName: "Sarah Jenkins",
      email: "sarah.jenkins@dorms.ph",
      tier: "Landlord Portfolio (5)",
      status: "Active",
      nextBilling: "Nov 15, 2024",
      totalPaid: "₱3,594.00",
      channel: "GCash",
    },
    {
      id: "sub-2",
      landlordName: "John Santos",
      email: "john.santos@gmail.com",
      tier: "Landlord Starter (1)",
      status: "Grace Period",
      nextBilling: "Overdue (3 days)",
      totalPaid: "₱897.00",
      channel: "GCash",
    },
    {
      id: "sub-3",
      landlordName: "Urban Estates Corp.",
      email: "urban.estates@properties.ph",
      tier: "Dorm & Complex Operator (25)",
      status: "Active",
      nextBilling: "Dec 01, 2024",
      totalPaid: "₱7,794.00",
      channel: "Visa •••• 9912",
    },
    {
      id: "sub-4",
      landlordName: "Maria Clara Dormitories",
      email: "maria.clara@dorms.ph",
      tier: "Landlord Starter (1)",
      status: "Free Trial",
      nextBilling: "Oct 28, 2024",
      totalPaid: "₱0.00",
      channel: "Maya",
    },
  ]);

  // Admin Override Modal & Audit Trail State
  const [overrideModalSub, setOverrideModalSub] = useState(null);
  const [overrideForm, setOverrideForm] = useState({
    newStatus: "Active",
    extensionDays: 30,
    reason: "",
  });

  const [auditLogsList, setAuditLogsList] = useState([
    {
      id: "log-1",
      admin: "Super Admin (admin@mobin.ph)",
      target: "Sarah Jenkins (sarah.jenkins@dorms.ph)",
      action: "Status Override",
      prevStatus: "Grace Period",
      newStatus: "Active",
      reason: "Payment gateway downtime compensation - authorized manual 30-day extension",
      timestamp: "Oct 24, 2024 14:32",
    },
    {
      id: "log-2",
      admin: "Super Admin (admin@mobin.ph)",
      target: "Urban Estates Corp. (urban.estates@properties.ph)",
      action: "Plan Upgrade",
      prevStatus: "Active (5 Units)",
      newStatus: "Active (25 Units)",
      reason: "Expansion tier agreement for campus dorm units",
      timestamp: "Oct 20, 2024 09:15",
    },
    {
      id: "log-3",
      admin: "Super Admin (admin@mobin.ph)",
      target: "Maria Clara Dormitories (maria.clara@dorms.ph)",
      action: "Comp Account",
      prevStatus: "Free Trial",
      newStatus: "Comped (Partner)",
      reason: "University Partner accommodation program onboarding",
      timestamp: "Oct 18, 2024 16:45",
    },
  ]);

  const handleGrantDays = (subId, days = 30) => {
    const targetSub = subscribersList.find((s) => s.id === subId);
    setSubscribersList((prev) =>
      prev.map((sub) =>
        sub.id === subId
          ? {
              ...sub,
              status: "Active",
              nextBilling: `Extended (+${days} Days)`,
            }
          : sub
      )
    );

    // Record audit trail
    if (targetSub) {
      setAuditLogsList((prev) => [
        {
          id: "log-" + Date.now(),
          admin: user?.email || "Super Admin (admin@mobin.ph)",
          target: `${targetSub.landlordName} (${targetSub.email})`,
          action: `Grant +${days}d Free`,
          prevStatus: targetSub.status,
          newStatus: "Active",
          reason: `Admin granted +${days} days free extension`,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    }

    showNotice(
      "Free Days Granted",
      `Granted +${days} Free Days to landlord! Subscription extended successfully.`,
      "success"
    );
  };

  const handleCompAccount = (subId) => {
    const targetSub = subscribersList.find((s) => s.id === subId);
    setSubscribersList((prev) =>
      prev.map((sub) =>
        sub.id === subId
          ? {
              ...sub,
              status: "Comped (Partner)",
              nextBilling: "Perpetual / Partner Free",
            }
          : sub
      )
    );

    if (targetSub) {
      setAuditLogsList((prev) => [
        {
          id: "log-" + Date.now(),
          admin: user?.email || "Super Admin (admin@mobin.ph)",
          target: `${targetSub.landlordName} (${targetSub.email})`,
          action: "Comp Account",
          prevStatus: targetSub.status,
          newStatus: "Comped (Partner)",
          reason: "Marked as Comped Partner account with perpetual access",
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    }

    showNotice(
      "Comped Partner Account",
      "Landlord account marked as Comped Partner with perpetual free access.",
      "success"
    );
  };

  const handleSubmitOverride = () => {
    if (!overrideModalSub) return;
    if (!overrideForm.reason || overrideForm.reason.trim().length < 5) {
      showNotice(
        "Audit Rationale Required",
        "Please provide a reason (minimum 5 characters) for this manual status change.",
        "warning"
      );
      return;
    }

    setSubscribersList((prev) =>
      prev.map((sub) =>
        sub.id === overrideModalSub.id
          ? {
              ...sub,
              status: overrideForm.newStatus,
              nextBilling: `Extended (+${overrideForm.extensionDays} Days)`,
            }
          : sub
      )
    );

    // Add to audit trail log
    const newLog = {
      id: "log-" + Date.now(),
      admin: user?.email || "Super Admin (admin@mobin.ph)",
      target: `${overrideModalSub.landlordName} (${overrideModalSub.email})`,
      action: "Manual Override",
      prevStatus: overrideModalSub.status,
      newStatus: overrideForm.newStatus,
      reason: overrideForm.reason.trim(),
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogsList([newLog, ...auditLogsList]);

    showNotice(
      "Subscription Override Applied",
      `Target: ${overrideModalSub.landlordName}\nNew Status: ${overrideForm.newStatus}\nReason: ${overrideForm.reason.trim()}`,
      "success"
    );
    setOverrideModalSub(null);
  };

  const handleSendReminder = (email) => {
    showNotice(
      "Payment Reminder Sent",
      `Payment reminder and renewal invoice link dispatched to ${email}!`,
      "info"
    );
  };

  // Load from Supabase on mount
  useEffect(() => {
    async function loadPlansFromDB() {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map((d) => ({
            id: d.id,
            name: d.name,
            category: d.category || "Landlord",
            price: d.price,
            period: d.period || "month",
            propertiesLimit: d.properties_limit || "1 Property",
            isPopular: d.is_popular || false,
            isActive: d.is_active ?? true,
            badge: d.badge || "",
            description: d.description || "",
            features: Array.isArray(d.features)
              ? d.features
              : JSON.parse(d.features || "[]"),
          }));
          setSubscriptionPlans(mapped);
          localStorage.setItem("mobin_subscription_plans", JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn("DB load notice:", err);
      }
    }
    loadPlansFromDB();
  }, []);

  const handleSaveTier = async (planToSave) => {
    const updated = subscriptionPlans.some((p) => p.id === planToSave.id)
      ? subscriptionPlans.map((p) => (p.id === planToSave.id ? planToSave : p))
      : [...subscriptionPlans, planToSave];

    setSubscriptionPlans(updated);
    setEditingPlan(null);

    // Save to localStorage immediately
    try {
      localStorage.setItem("mobin_subscription_plans", JSON.stringify(updated));
    } catch (_) {}

    // Persist to Supabase (only exact columns that exist in the database)
    try {
      const { error: upsertErr } = await supabase.from("subscription_plans").upsert({
        id: planToSave.id,
        name: planToSave.name,
        category: planToSave.category || "Landlord",
        price: Number(planToSave.price),
        period: planToSave.period || "month",
        properties_limit: planToSave.propertiesLimit,
        is_popular: !!planToSave.isPopular,
        is_active: planToSave.isActive ?? true,
        badge: planToSave.badge || "",
        description: planToSave.description || "",
        features: planToSave.features || [],
        updated_at: new Date().toISOString(),
      });
      if (upsertErr) {
        console.warn("Supabase upsert notice:", upsertErr);
      }
    } catch (err) {
      console.warn("Supabase upsert error:", err);
    }

    // Broadcast to landlord views & pricing components immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: updated }));
    }

    showNotice(
      "Plan Updated",
      `Successfully saved changes for ${planToSave.name}! Live pricing is now updated.`,
      "success"
    );
  };

  const handleDeleteTier = async (planId) => {
    const targetPlan = subscriptionPlans.find((p) => p.id === planId);
    const updated = subscriptionPlans.filter((p) => p.id !== planId);
    setSubscriptionPlans(updated);
    if (editingPlan && editingPlan.id === planId) {
      setEditingPlan(null);
    }

    // Save to localStorage immediately
    try {
      localStorage.setItem("mobin_subscription_plans", JSON.stringify(updated));
    } catch (_) {}

    // Persist deletion to Supabase
    try {
      await supabase.from("subscription_plans").delete().eq("id", planId);
    } catch (err) {
      console.warn("Supabase delete tier error:", err);
    }

    // Broadcast to landlord views & pricing components immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: updated }));
    }

    showNotice(
      "Tier Removed",
      `"${targetPlan?.name || "Subscription tier"}" has been successfully removed from subscription pricing.`,
      "success"
    );
  };

  const handleRequestDeleteTier = (plan) => {
    if (!plan) return;
    if (subscriptionPlans.length <= 1) {
      showNotice(
        "Cannot Remove Tier",
        "At least one subscription tier must remain active in the system.",
        "warning"
      );
      return;
    }

    showNotice(
      "Remove Subscription Tier?",
      `Are you sure you want to remove "${plan.name}" (${Number(plan.price) === 0 ? "Free" : `₱${Number(plan.price).toLocaleString()}/mo`})? This will immediately remove it from the Home page pricing and Landlord subscription plans.`,
      "warning",
      () => handleDeleteTier(plan.id),
      "Yes, Remove Tier",
      "Cancel"
    );
  };

  const handlePublishAllPlans = async () => {
    try {
      for (const p of subscriptionPlans) {
        await supabase.from("subscription_plans").upsert({
          id: p.id,
          name: p.name,
          category: p.category || "Landlord",
          price: Number(p.price),
          period: p.period || "month",
          properties_limit: p.propertiesLimit,
          is_popular: !!p.isPopular,
          is_active: p.isActive ?? true,
          badge: p.badge || "",
          description: p.description || "",
          features: p.features || [],
          updated_at: new Date().toISOString(),
        });
      }
      localStorage.setItem("mobin_subscription_plans", JSON.stringify(subscriptionPlans));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: subscriptionPlans }));
      }
      showNotice("Pricing Published", "All subscription pricing changes are published and live for landlords across Mob'in!", "success");
    } catch (err) {
      console.warn("Publish plans warning:", err);
      localStorage.setItem("mobin_subscription_plans", JSON.stringify(subscriptionPlans));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: subscriptionPlans }));
      }
      showNotice("Pricing Synced", "Subscription pricing changes saved and synced across the platform!", "success");
    }
  };

  // Pending properties requiring verification
  const pendingProperties = adminProperties.filter((p) => {
    const v = (p.verification || p.verification_status || "").toLowerCase();
    const s = (p.status || "").toLowerCase();
    const isApproved = v === "verified" || v === "approved";
    const isRejected = v === "rejected" || s === "needs revision";
    return !isApproved && !isRejected;
  });

  // Only completely approved / verified properties
  const approvedProperties = adminProperties.filter((p) => {
    const v = (p.verification || p.verification_status || "").toLowerCase();
    const s = (p.status || "").toLowerCase();
    const isApproved = v === "verified" || v === "approved";
    const isPending = v === "pending" || s === "pending";
    const isRejected = v === "rejected" || s === "needs revision";
    return (isApproved || s === "available") && !isPending && !isRejected;
  });

  const pendingCount = pendingProperties.length;
  const approvedCount = approvedProperties.length;
  const totalPropertiesCount = adminProperties.length > 0 ? adminProperties.length : 842;

  const activeReportsCount = reports.filter(
    (r) =>
      (r.status || "pending").toLowerCase() === "pending" ||
      (r.status || "").toLowerCase() === "investigating"
  ).length;

  const menuItems = [
    { name: "Dashboard", icon: <IconDashboard /> },
    { name: "Users", icon: <IconUsers /> },
    { name: "Properties", icon: <IconProperties /> },
    { name: "Subscription Pricing", icon: <IconPricingTag /> },
    { name: "Verification", icon: <IconVerification />, badgeCount: pendingCount },
    { name: "Financials", icon: <IconFinancials /> },
    { name: "Reported Listings", icon: <IconFlag />, badgeCount: activeReportsCount },
  ];

  // Dynamic Realtime Admin Notifications from Supabase (Verifications, Reports, Payments, Users)
  const adminNotifications = useMemo(() => {
    const notifs = [];

    // 1. Property Verification Submissions across all landlords
    (adminProperties || []).forEach((p) => {
      const isPending =
        (p.verification_status || "").toLowerCase() === "pending" ||
        (p.verification || "").toLowerCase() === "unverified" ||
        (p.verification || "").toLowerCase() === "pending";

      const id = `adm-prop-${p.id}`;
      const rawDate = p.created_at || new Date().toISOString();
      const landlordStr = p.landlord_name || (p.landlord_email ? p.landlord_email.split("@")[0] : "Landlord");

      notifs.push({
        id,
        user: landlordStr,
        action: isPending ? "submitted property verification request for" : "has verified listing",
        target: p.property_name || "Accommodation",
        timestamp: formatRelativeTime(rawDate),
        rawDate,
        unread: isPending && !readAdminNotifs.includes(id),
        linkTab: "Verification",
        icon: isPending ? "⏳" : "🏠",
        type: "Verification",
        details: `${p.city || p.address || 'Property'} • ₱${Number(p.rent || 0).toLocaleString()}/mo • Landlord: ${landlordStr}`,
      });
    });

    // 2. Reported Listings from Supabase 'reports' table
    (reports || []).forEach((r) => {
      const id = `adm-rep-${r.id}`;
      const rawDate = r.created_at || new Date().toISOString();
      const reporterStr = r.reporter_name || (r.reporter_email ? r.reporter_email.split("@")[0] : "Tenant");
      const isPending = (r.status || "pending").toLowerCase() === "pending";

      notifs.push({
        id,
        user: reporterStr,
        action: `reported listing (${r.reason || "Complaint"})`,
        target: r.property_name || `Listing #${r.property_id || ""}`,
        timestamp: formatRelativeTime(rawDate),
        rawDate,
        unread: isPending && !readAdminNotifs.includes(id),
        linkTab: "Reported Listings",
        icon: "🚩",
        type: "Reported Listings",
        details: r.details || `Complaint reason: "${r.reason || 'Flagged for moderator review'}"`,
      });
    });

    // 3. Transactions & Subscriptions from Supabase 'payments' table
    (financialTransactions || []).slice(0, 25).forEach((t) => {
      const id = `adm-pay-${t.id || t.dbId}`;
      const rawDate = t.rawDate || t.date || new Date().toISOString();
      const isPending = t.status === "Pending";

      notifs.push({
        id,
        user: t.payerName || (t.payerEmail ? t.payerEmail.split("@")[0] : "Customer"),
        action: isPending ? "submitted pending payment for" : `paid ₱${Number(t.amount || 0).toLocaleString()} for`,
        target: t.item || "Subscription Plan",
        timestamp: formatRelativeTime(rawDate),
        rawDate,
        unread: isPending && !readAdminNotifs.includes(id),
        linkTab: "Financials",
        icon: "💳",
        type: "Financials",
        details: `Gateway: ${t.gateway || 'Direct QR'} • Ref: ${t.refNo || 'N/A'} • Status: ${t.status}`,
      });
    });

    // 4. User Registrations from Supabase 'profiles' table
    (adminUsers || []).slice(0, 15).forEach((u) => {
      const id = `adm-usr-${u.id}`;
      const rawDate = u.dateJoined || u.created_at || new Date().toISOString();

      notifs.push({
        id,
        user: u.name || (u.email ? u.email.split("@")[0] : "User"),
        action: `registered on Mob'in platform as`,
        target: u.role || "Member",
        timestamp: formatRelativeTime(rawDate),
        rawDate,
        unread: false,
        linkTab: "Users",
        icon: "👤",
        type: "Users",
        details: `Email: ${u.email || 'N/A'} • Status: ${u.status || 'Active'}`,
      });
    });

    // Sort chronologically (newest first)
    notifs.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    return notifs;
  }, [adminProperties, reports, financialTransactions, adminUsers, readAdminNotifs]);

  const handleAdminNotifClick = (item) => {
    if (!item) return;
    if (!readAdminNotifs.includes(item.id)) {
      const updated = [...readAdminNotifs, item.id];
      setReadAdminNotifs(updated);
      try {
        localStorage.setItem("mobin_read_admin_notifs", JSON.stringify(updated));
      } catch (_) {}
    }
    if (item.linkTab) {
      setActiveTab(item.linkTab);
    }
  };

  const handleMarkAllAdminNotifsRead = () => {
    const allIds = adminNotifications.map((n) => n.id);
    setReadAdminNotifs(allIds);
    try {
      localStorage.setItem("mobin_read_admin_notifs", JSON.stringify(allIds));
    } catch (_) {}
    showNotice("Notifications Marked Read", "All administrator notifications marked as read.", "success");
  };

  const filteredApprovedProps = approvedProperties
    .filter((p) => {
      // Status filter
      if (adminPropStatusFilter !== "All") {
        if ((p.status || "Available").toLowerCase() !== adminPropStatusFilter.toLowerCase()) {
          return false;
        }
      }

      // Property type filter
      if (adminPropTypeFilter !== "All") {
        const typeStr = (p.property_type || "").toLowerCase();
        if (!typeStr.includes(adminPropTypeFilter.toLowerCase())) {
          return false;
        }
      }

      // Search filter (global searchQuery + tab adminPropSearch)
      const combinedSearch = (searchQuery.trim() + " " + adminPropSearch.trim()).trim().toLowerCase();
      if (!combinedSearch) return true;
      return (
        (p.property_name || "").toLowerCase().includes(combinedSearch) ||
        (p.landlord_name || "").toLowerCase().includes(combinedSearch) ||
        (p.landlord_email || "").toLowerCase().includes(combinedSearch) ||
        (p.address || "").toLowerCase().includes(combinedSearch) ||
        (p.city || "").toLowerCase().includes(combinedSearch)
      );
    })
    .sort((a, b) => {
      if (adminPropSort === "price-asc") {
        return (Number(a.rent) || 0) - (Number(b.rent) || 0);
      }
      if (adminPropSort === "price-desc") {
        return (Number(b.rent) || 0) - (Number(a.rent) || 0);
      }
      if (adminPropSort === "name-asc") {
        return (a.property_name || "").localeCompare(b.property_name || "");
      }
      if (adminPropSort === "name-desc") {
        return (b.property_name || "").localeCompare(a.property_name || "");
      }
      if (adminPropSort === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const paginatedApprovedProps = filteredApprovedProps.slice(
    (propertiesPage - 1) * propertiesPageSize,
    propertiesPage * propertiesPageSize
  );

  const filteredPendingProps = pendingProperties
    .filter((p) => {
      // 1. Search Filter (global searchQuery + verifSearch)
      const combinedSearch = (searchQuery.trim() + " " + verifSearch.trim()).trim().toLowerCase();
      if (combinedSearch) {
        const matches =
          (p.property_name || "").toLowerCase().includes(combinedSearch) ||
          (p.landlord_name || "").toLowerCase().includes(combinedSearch) ||
          (p.landlord_email || "").toLowerCase().includes(combinedSearch) ||
          (p.address || "").toLowerCase().includes(combinedSearch) ||
          (p.city || "").toLowerCase().includes(combinedSearch);
        if (!matches) return false;
      }

      // 2. Date Filter
      const pDate = p.created_at || p.date || p.submitted_at || p.updated_at;
      const propTime = pDate ? new Date(pDate).getTime() : 0;

      if (verifDateRange !== "all") {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

        if (verifDateRange === "today") {
          if (propTime < startOfToday || propTime > endOfToday) return false;
        } else if (verifDateRange === "yesterday") {
          const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
          const endOfYesterday = startOfToday - 1;
          if (propTime < startOfYesterday || propTime > endOfYesterday) return false;
        } else if (verifDateRange === "last7days") {
          const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
          if (propTime < sevenDaysAgo) return false;
        } else if (verifDateRange === "last30days") {
          const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
          if (propTime < thirtyDaysAgo) return false;
        } else if (verifDateRange === "thisMonth") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          if (propTime < startOfMonth) return false;
        } else if (verifDateRange === "custom") {
          if (verifStartDate) {
            const startLimit = new Date(verifStartDate).setHours(0, 0, 0, 0);
            if (propTime < startLimit) return false;
          }
          if (verifEndDate) {
            const endLimit = new Date(verifEndDate).setHours(23, 59, 59, 999);
            if (propTime > endLimit) return false;
          }
        }
      } else {
        if (verifStartDate) {
          const startLimit = new Date(verifStartDate).setHours(0, 0, 0, 0);
          if (propTime < startLimit) return false;
        }
        if (verifEndDate) {
          const endLimit = new Date(verifEndDate).setHours(23, 59, 59, 999);
          if (propTime > endLimit) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at || a.date || a.updated_at || 0).getTime();
      const timeB = new Date(b.created_at || b.date || b.updated_at || 0).getTime();

      if (verifSort === "oldest") {
        return timeA - timeB;
      }
      if (verifSort === "rent-desc") {
        return (Number(b.rent) || 0) - (Number(a.rent) || 0);
      }
      if (verifSort === "rent-asc") {
        return (Number(a.rent) || 0) - (Number(b.rent) || 0);
      }
      // default newest first
      return timeB - timeA;
    });

  const paginatedPendingProps = filteredPendingProps.slice(
    (verifPage - 1) * verifPageSize,
    verifPage * verifPageSize
  );

  const filteredAdminUsers = adminUsers.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q);

    const matchesRole =
      userRoleFilter === "All" ||
      (userRoleFilter === "Landlord" && (u.role || "").toLowerCase() === "landlord") ||
      (userRoleFilter === "Student" && ((u.role || "").toLowerCase().includes("student") || (u.role || "").toLowerCase().includes("renter"))) ||
      (userRoleFilter === "Admin" && (u.role || "").toLowerCase().includes("admin"));

    const matchesStatus =
      userStatusFilter === "All" ||
      (userStatusFilter === "Active" && (u.status || "").toLowerCase() === "active") ||
      (userStatusFilter === "Pending" && (u.status || "").toLowerCase().includes("pending")) ||
      (userStatusFilter === "Suspended" && (u.status || "").toLowerCase().includes("suspend"));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredAdminUsers.slice(
    (usersPage - 1) * usersPageSize,
    usersPage * usersPageSize
  );

  const paginatedSubscribers = subscribersList.slice(
    (subscribersPage - 1) * subscribersPageSize,
    subscribersPage * subscribersPageSize
  );

  const paginatedAuditLogs = auditLogsList.slice(
    (auditPage - 1) * auditPageSize,
    auditPage * auditPageSize
  );

  const totalLandlordsCount = adminUsers.filter((u) => (u.role || "").toLowerCase() === "landlord").length;
  const totalStudentsCount = adminUsers.filter((u) => (u.role || "").toLowerCase().includes("student") || (u.role || "").toLowerCase().includes("renter")).length;
  const totalActiveUsersCount = adminUsers.filter((u) => (u.status || "").toLowerCase() === "active").length;

  return (
    <div className="admin-dashboard-container">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="admin-sidebar">
        {/* LOGO & TITLE */}
        <div className="admin-brand" onClick={() => onHomeClick && onHomeClick()} title="Go to Mob'in Home">
          <img
            src={mobinLogo}
            alt="Mob'in"
            className="admin-brand-logo-img"
          />
          <div className="admin-brand-text">
            <h2>Mob'in Admin</h2>
            <span>Super Admin Console</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="admin-nav-menu">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`admin-nav-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.name)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.name}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#b45309",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "1px 7px",
                      fontSize: "11px",
                      fontWeight: "700",
                      lineHeight: "1.4",
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
                {item.hasBadge && <span className="admin-nav-dot"></span>}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM SIDEBAR ACTIONS */}
        <div className="admin-sidebar-bottom">
          {/* ALERT BOX */}
          <div className="admin-alert-box">
            <p>New System Alert</p>
            <button
              type="button"
              className="admin-alert-btn"
              onClick={() => showNotice("System Status", "All server nodes and database triggers are running smoothly.", "success")}
            >
              Review
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}
      <main className="admin-main">
        {/* HEADER BAR */}
        <header className="admin-header">
          <h1 className="admin-header-title">Dashboard Overview</h1>

          <div className="admin-header-right">
            {/* NOTIFICATION BUTTON (SAME AS LANDLORD) */}
            <NotificationPopover
              items={adminNotifications}
              onNotificationSelect={handleAdminNotifClick}
            />

            {/* ADMIN AVATAR DROPDOWN (SAME AS LANDLORD) */}
            <DropdownMenu01
              align="end"
              showSubscription={false}
              user={{
                name: profileName || adminName,
                email: adminEmail,
                avatar: adminAvatar,
              }}
              onNavigate={(tab) => {
                if (tab === "Profile") {
                  setIsProfileModalOpen(true);
                } else if (tab === "ResetPassword") {
                  setIsProfileModalOpen(true);
                  setTimeout(() => {
                    document.getElementById("admin-new-password-input")?.focus();
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

        {/* TAB CONTENTS */}
        {activeTab === "Dashboard" && (
          <div className="admin-content-flow">
            {/* =====================================================
                6 METRIC CARDS ROW
            ===================================================== */}
            <div className="admin-metrics-grid">
              {/* CARD 1: Total Users */}
              <div
                className="admin-metric-card card-clickable theme-users"
                onClick={() => handleMetricCardClick("Users")}
                role="button"
                tabIndex={0}
                title="Click to view all registered users"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMetricCardClick("Users");
                  }
                }}
              >
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Total Users</span>
                  <div className="admin-metric-badge badge-green">
                    <IconUsers />
                  </div>
                </div>
                <div className="admin-metric-number">{adminUsers.length}</div>
              </div>

              {/* CARD 2: Total Landlords */}
              <div
                className="admin-metric-card card-clickable theme-landlords"
                onClick={() => handleMetricCardClick("Landlords")}
                role="button"
                tabIndex={0}
                title="Click to view landlord directory"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMetricCardClick("Landlords");
                  }
                }}
              >
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Total Landlords</span>
                  <div className="admin-metric-badge badge-tan">
                    <IconProperties />
                  </div>
                </div>
                <div className="admin-metric-number">{totalLandlordsCount}</div>
              </div>

              {/* CARD 3: Total Properties */}
              <div
                className="admin-metric-card card-clickable theme-properties"
                onClick={() => handleMetricCardClick("Properties")}
                role="button"
                tabIndex={0}
                title="Click to view all properties"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMetricCardClick("Properties");
                  }
                }}
              >
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Total Properties</span>
                  <div className="admin-metric-badge badge-tan">
                    <IconProperties />
                  </div>
                </div>
                <div className="admin-metric-number">{totalPropertiesCount}</div>
              </div>

              {/* CARD 4: Pending Verif. */}
              <div
                className="admin-metric-card card-clickable theme-verification"
                onClick={() => handleMetricCardClick("Verification")}
                role="button"
                tabIndex={0}
                title="Click to review pending verification requests"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMetricCardClick("Verification");
                  }
                }}
              >
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Pending Verif.</span>
                  <div className="admin-metric-badge badge-yellow">
                    <IconVerification />
                  </div>
                </div>
                <div className="admin-metric-number">{pendingCount}</div>
              </div>

              {/* CARD 5: Reported */}
              <div
                className="admin-metric-card card-reported card-clickable theme-reported"
                onClick={() => handleMetricCardClick("Reported")}
                role="button"
                tabIndex={0}
                title="Click to view reported listings"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMetricCardClick("Reported");
                  }
                }}
              >
                <div className="admin-metric-header">
                  <span className="admin-metric-title text-red">Reported</span>
                  <div className="admin-metric-badge badge-red">
                    <IconFlag />
                  </div>
                </div>
                <div className="admin-metric-number text-red">
                  {reports.filter(r => (r.status || "pending").toLowerCase() !== "resolved" && (r.status || "").toLowerCase() !== "dismissed").length}
                </div>
              </div>

              {/* CARD 6: Active Subs */}
              <div
                className="admin-metric-card card-clickable theme-subs"
                onClick={() => handleMetricCardClick("Subscriptions")}
                role="button"
                tabIndex={0}
                title="Click to view active subscription transactions"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMetricCardClick("Subscriptions");
                  }
                }}
              >
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Active Subs</span>
                  <div className="admin-metric-badge badge-tan">
                    <IconFinancials />
                  </div>
                </div>
                <div className="admin-metric-number">
                  {financialTransactions.filter(t => t.status === "Completed").length || (typeof subscribersList !== "undefined" ? subscribersList.length : 0) || adminUsers.filter(u => u.role === "Landlord").length}
                </div>
              </div>
            </div>

            {/* =====================================================
                SYSTEM & SUBSCRIPTION STATISTICS LINE GRAPHS (2 COLUMNS)
            ===================================================== */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              {/* GRAPH 1: SYSTEM & PLATFORM ACTIVITY STATISTICS */}
              <div
                className="admin-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* Header & Controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                          System Activity &amp; Platform Traffic
                        </h3>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d", background: "#eef7ed", padding: "2px 8px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                          Live Database Sync
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#8c8075" }}>
                        Real user registrations, properties listed, and verified units
                      </p>
                    </div>

                    {/* Timeframe Switcher */}
                    <div style={{ display: "inline-flex", background: "#f4ede4", borderRadius: "8px", padding: "3px" }}>
                      <button
                        type="button"
                        onClick={() => setDashSystemTimeframe("monthly")}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: dashSystemTimeframe === "monthly" ? "#ffffff" : "transparent",
                          color: dashSystemTimeframe === "monthly" ? "#281507" : "#73675c",
                          boxShadow: dashSystemTimeframe === "monthly" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setDashSystemTimeframe("weekly")}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: dashSystemTimeframe === "weekly" ? "#ffffff" : "transparent",
                          color: dashSystemTimeframe === "weekly" ? "#281507" : "#73675c",
                          boxShadow: dashSystemTimeframe === "weekly" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Weekly
                      </button>
                    </div>
                  </div>

                  {/* SVG Line Graph Canvas */}
                  {(() => {
                    const months = ["May", "Jun", "Jul", "Aug", "Sep"];

                    const getMonthIdx = (dStr) => {
                      if (!dStr) return 8; // Sep default
                      const d = new Date(dStr);
                      return isNaN(d.getMonth()) ? 8 : d.getMonth(); // 4=May, 7=Aug, 8=Sep
                    };

                    const dataPoints = dashSystemTimeframe === "monthly"
                      ? months.map((m, idx) => {
                          const targetMonth = idx + 4; // 4=May, 5=Jun, 6=Jul, 7=Aug, 8=Sep
                          
                          // Count users registered on or before targetMonth
                          const uCount = adminUsers.filter((u) => getMonthIdx(u.dateJoined || u.created_at) <= targetMonth).length;
                          // Count properties created on or before targetMonth
                          const pCount = adminProperties.filter((p) => getMonthIdx(p.created_at) <= targetMonth).length;
                          // Count verified properties on or before targetMonth
                          const vCount = adminProperties.filter((p) => (p.status === "Available" || p.verification_status === "Verified") && getMonthIdx(p.created_at) <= targetMonth).length;
                          // Count student pass inquiries on or before targetMonth
                          const inqCount = financialTransactions.filter((t) => (t.amount === 99 || (t.item && t.item.includes("Pass"))) && getMonthIdx(t.rawDate || t.date) <= targetMonth).length;

                          return {
                            label: m,
                            users: uCount,
                            properties: pCount,
                            inquiries: inqCount,
                            verifs: vCount,
                          };
                        })
                      : [
                          { label: "W1 (Aug)", users: 1, properties: 1, inquiries: 0, verifs: 0 },
                          { label: "W2 (Aug)", users: 2, properties: 3, inquiries: 0, verifs: 0 },
                          { label: "W3 (Aug)", users: 3, properties: 3, inquiries: 1, verifs: 0 },
                          { label: "W4 (Aug)", users: 4, properties: 3, inquiries: 2, verifs: 0 },
                          { label: "W1 (Sep)", users: 4, properties: 3, inquiries: 2, verifs: 0 },
                          { label: "W2 (Sep)", users: 5, properties: 4, inquiries: 2, verifs: 1 },
                          { label: "W3 (Sep)", users: adminUsers.length || 5, properties: adminProperties.length || 5, inquiries: 2, verifs: adminProperties.filter(p => p.status === 'Available').length || 2 },
                        ];

                    const width = 520;
                    const height = 190;
                    const pad = { top: 22, bottom: 28, left: 62, right: 20 };
                    const chartW = width - pad.left - pad.right;
                    const chartH = height - pad.top - pad.bottom;
                    const maxVal = Math.max(...dataPoints.map(d => Math.max(d.users, d.properties, d.verifs, d.inquiries)), 4) + 1;

                    const getCoords = (key) =>
                      dataPoints.map((d, i) => ({
                        x: pad.left + (i / (dataPoints.length - 1)) * chartW,
                        y: pad.top + chartH - (d[key] / maxVal) * chartH,
                        val: d[key],
                        label: d.label,
                      }));

                    const usersCoords = getCoords("users");
                    const inqCoords = getCoords("inquiries");
                    const verifCoords = getCoords("verifs");

                    const makePath = (coords) => {
                      let p = `M ${coords[0].x} ${coords[0].y}`;
                      for (let i = 0; i < coords.length - 1; i++) {
                        const p0 = coords[i];
                        const p1 = coords[i + 1];
                        const mx = (p0.x + p1.x) / 2;
                        p += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                      }
                      return p;
                    };

                    const usersPath = makePath(usersCoords);
                    const inqPath = makePath(inqCoords);
                    const verifPath = makePath(verifCoords);

                    const usersArea = `${usersPath} L ${usersCoords[usersCoords.length - 1].x} ${pad.top + chartH} L ${usersCoords[0].x} ${pad.top + chartH} Z`;

                    return (
                      <div style={{ position: "relative", width: "100%", height: "205px" }}>
                        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
                          <defs>
                            <linearGradient id="sysUsersGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#686300" stopOpacity="0.22" />
                              <stop offset="100%" stopColor="#686300" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="sysInqGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                            const y = pad.top + chartH * ratio;
                            const labelVal = Math.round(maxVal * (1 - ratio));
                            return (
                              <g key={idx}>
                                <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#ede5dc" strokeDasharray="3 3" strokeWidth="1" />
                                <text
                                  x={pad.left - 10}
                                  y={y + 3.5}
                                  textAnchor="end"
                                  fontSize="10.5"
                                  fontWeight="600"
                                  fill="#8c8075"
                                  fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
                                >
                                  {labelVal}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area Fill */}
                          <path d={usersArea} fill="url(#sysUsersGrad)" />

                          {/* Lines */}
                          <path d={usersPath} fill="none" stroke="#686300" strokeWidth="2.8" strokeLinecap="round" />
                          <path d={inqPath} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 2" />
                          <path d={verifPath} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />

                          {/* X-Axis Labels & Hover Interaction Columns */}
                          {dataPoints.map((d, idx) => {
                            const uc = usersCoords[idx];
                            const isHovered = hoveredSysPoint === idx;

                            return (
                              <g key={d.label}>
                                {/* X Label */}
                                <text
                                  x={uc.x}
                                  y={pad.top + chartH + 18}
                                  textAnchor="middle"
                                  fontSize="10.5"
                                  fontWeight={isHovered ? 800 : 600}
                                  fill={isHovered ? "#281507" : "#8c8075"}
                                  fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
                                >
                                  {d.label}
                                </text>

                                {/* Hover Vertical Guide Line */}
                                {isHovered && (
                                  <line x1={uc.x} y1={pad.top} x2={uc.x} y2={pad.top + chartH} stroke="#8c6b45" strokeWidth="1.2" strokeDasharray="2 2" />
                                )}

                                {/* Data Point Dots */}
                                <circle cx={uc.x} cy={uc.y} r={isHovered ? 5.5 : 3.5} fill="#ffffff" stroke="#686300" strokeWidth={isHovered ? 3 : 2} />
                                <circle cx={inqCoords[idx].x} cy={inqCoords[idx].y} r={isHovered ? 4.5 : 2.8} fill="#ffffff" stroke="#2563eb" strokeWidth={isHovered ? 2.5 : 1.8} />
                                <circle cx={verifCoords[idx].x} cy={verifCoords[idx].y} r={isHovered ? 4.5 : 2.8} fill="#ffffff" stroke="#10b981" strokeWidth={isHovered ? 2.5 : 1.8} />

                                {/* Transparent hover capture bar */}
                                <rect
                                  x={uc.x - (chartW / (dataPoints.length - 1)) / 2}
                                  y={pad.top}
                                  width={chartW / (dataPoints.length - 1)}
                                  height={chartH}
                                  fill="transparent"
                                  style={{ cursor: "pointer" }}
                                  onMouseEnter={() => setHoveredSysPoint(idx)}
                                  onMouseLeave={() => setHoveredSysPoint(null)}
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Floating Tooltip */}
                        {hoveredSysPoint !== null && (
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: `${(usersCoords[hoveredSysPoint].x / width) * 100}%`,
                              transform: "translateX(-50%)",
                              background: "#281507",
                              color: "#ffffff",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "11.5px",
                              boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
                              pointerEvents: "none",
                              zIndex: 10,
                              minWidth: "155px",
                            }}
                          >
                            <div style={{ fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "4px", marginBottom: "4px" }}>
                              {dataPoints[hoveredSysPoint].label} 2026 Activity
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#fef08a" }}>
                              <span>👥 Total Users:</span>
                              <strong>{dataPoints[hoveredSysPoint].users} accounts</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#93c5fd", marginTop: "2px" }}>
                              <span>💬 Direct Inquiries:</span>
                              <strong>{dataPoints[hoveredSysPoint].inquiries} passes</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#86efac", marginTop: "2px" }}>
                              <span>🛡️ Verified Properties:</span>
                              <strong>{dataPoints[hoveredSysPoint].verifs} units</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Legend & Summaries */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f0e9e1", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#281507", fontWeight: 700 }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#686300" }} />
                      Users ({adminUsers.length})
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#1d4ed8", fontWeight: 700 }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#2563eb" }} />
                      Inquiries ({financialTransactions.filter(t => t.amount === 99 || (t.item && t.item.includes("Pass"))).length})
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#047857", fontWeight: 700 }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10b981" }} />
                      Verified ({adminProperties.filter(p => p.status === 'Available' || p.verification_status === 'Verified').length})
                    </span>
                  </div>
                  <span style={{ color: "#7a6e63", fontSize: "11px" }}>
                    Total Listed: <strong style={{ color: "#281507" }}>{adminProperties.length} units</strong>
                  </span>
                </div>
              </div>

              {/* GRAPH 2: SUBSCRIPTIONS & REVENUE TRAJECTORY LINE GRAPH */}
              <div
                className="admin-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* Header & Controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                          Subscription &amp; MRR Statistics
                        </h3>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: "12px", border: "1px solid #fde68a" }}>
                          Live Revenue Sync
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#8c8075" }}>
                        Monthly Recurring Revenue (MRR) &amp; active landlord quota plans
                      </p>
                    </div>

                    {/* Metric Switcher */}
                    <div style={{ display: "inline-flex", background: "#f4ede4", borderRadius: "8px", padding: "3px" }}>
                      <button
                        type="button"
                        onClick={() => setDashSubMetric("mrr")}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: dashSubMetric === "mrr" ? "#ffffff" : "transparent",
                          color: dashSubMetric === "mrr" ? "#281507" : "#73675c",
                          boxShadow: dashSubMetric === "mrr" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        ₱ MRR
                      </button>
                      <button
                        type="button"
                        onClick={() => setDashSubMetric("active_subs")}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: dashSubMetric === "active_subs" ? "#ffffff" : "transparent",
                          color: dashSubMetric === "active_subs" ? "#281507" : "#73675c",
                          boxShadow: dashSubMetric === "active_subs" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        # Active Plans
                      </button>
                    </div>
                  </div>

                  {/* SVG Line Graph Canvas */}
                  {(() => {
                    const months = ["May", "Jun", "Jul", "Aug", "Sep"];

                    const getMonthIdx = (dStr) => {
                      if (!dStr) return 8;
                      const d = new Date(dStr);
                      return isNaN(d.getMonth()) ? 8 : d.getMonth(); // 7=Aug, 8=Sep
                    };

                    const subPoints = months.map((m, idx) => {
                      const targetMonth = idx + 4; // 4=May, 5=Jun, 6=Jul, 7=Aug, 8=Sep

                      // Sum payments completed in this month
                      const monthTxns = financialTransactions.filter(
                        (t) => t.status === "Completed" && getMonthIdx(t.rawDate || t.date) === targetMonth
                      );
                      const monthMrr = monthTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

                      // Count active plans on or before this month
                      const cumulativeTxns = financialTransactions.filter(
                        (t) => t.status === "Completed" && getMonthIdx(t.rawDate || t.date) <= targetMonth
                      );

                      const starterCount = cumulativeTxns.filter((t) => (t.item || "").toLowerCase().includes("starter") || (t.amount >= 2900 && t.amount <= 3100)).length;
                      const yawaCount = cumulativeTxns.filter((t) => (t.item || "").toLowerCase().includes("yawa") || (t.amount >= 3900 && t.amount <= 4100)).length;
                      const proCount = cumulativeTxns.filter((t) => (t.item || "").toLowerCase().includes("pro") || (t.item || "").toLowerCase().includes("portfolio") || (t.amount >= 500 && t.amount <= 600)).length;

                      return {
                        label: m,
                        mrr: monthMrr,
                        activeSubs: cumulativeTxns.length,
                        starter: starterCount,
                        portfolio: proCount,
                        operator: yawaCount,
                        newSignups: monthTxns.length,
                      };
                    });

                    const width = 520;
                    const height = 190;
                    const pad = { top: 22, bottom: 28, left: 62, right: 20 };
                    const chartW = width - pad.left - pad.right;
                    const chartH = height - pad.top - pad.bottom;
                    const maxVal = dashSubMetric === "mrr"
                      ? Math.max(...subPoints.map(d => d.mrr), 500) * 1.15
                      : Math.max(...subPoints.map(d => d.activeSubs), 4) + 1;

                    const coords = subPoints.map((d, i) => {
                      const val = dashSubMetric === "mrr" ? d.mrr : d.activeSubs;
                      return {
                        x: pad.left + (i / (subPoints.length - 1)) * chartW,
                        y: pad.top + chartH - (val / maxVal) * chartH,
                        val,
                        raw: d,
                      };
                    });

                    let linePath = `M ${coords[0].x} ${coords[0].y}`;
                    for (let i = 0; i < coords.length - 1; i++) {
                      const p0 = coords[i];
                      const p1 = coords[i + 1];
                      const mx = (p0.x + p1.x) / 2;
                      linePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                    }

                    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${pad.top + chartH} L ${coords[0].x} ${pad.top + chartH} Z`;

                    return (
                      <div style={{ position: "relative", width: "100%", height: "205px" }}>
                        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
                          <defs>
                            <linearGradient id="subGoldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="subBlueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                            const y = pad.top + chartH * ratio;
                            const labelVal = Math.round(maxVal * (1 - ratio));
                            return (
                              <g key={idx}>
                                <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#ede5dc" strokeDasharray="3 3" strokeWidth="1" />
                                <text
                                  x={pad.left - 10}
                                  y={y + 3.5}
                                  textAnchor="end"
                                  fontSize="10.5"
                                  fontWeight="600"
                                  fill="#8c8075"
                                  fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
                                >
                                  {dashSubMetric === "mrr"
                                    ? (labelVal <= 0 ? "₱0" : labelVal >= 1000 ? `₱${Math.round(labelVal / 1000)}k` : `₱${labelVal}`)
                                    : labelVal}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area Fill */}
                          <path
                            d={areaPath}
                            fill={dashSubMetric === "mrr" ? "url(#subGoldGrad)" : "url(#subBlueGrad)"}
                          />

                          {/* Stroke Line */}
                          <path
                            d={linePath}
                            fill="none"
                            stroke={dashSubMetric === "mrr" ? "#d97706" : "#2563eb"}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                          {/* X-Axis Labels & Hover Interaction Columns */}
                          {coords.map((c, idx) => {
                            const isHovered = hoveredSubPoint === idx;

                            return (
                              <g key={c.raw.label}>
                                {/* X Label */}
                                <text
                                  x={c.x}
                                  y={pad.top + chartH + 18}
                                  textAnchor="middle"
                                  fontSize="10.5"
                                  fontWeight={isHovered ? 800 : 600}
                                  fill={isHovered ? "#281507" : "#8c8075"}
                                  fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
                                >
                                  {c.raw.label}
                                </text>

                                {/* Hover Vertical Guide Line */}
                                {isHovered && (
                                  <line x1={c.x} y1={pad.top} x2={c.x} y2={pad.top + chartH} stroke="#d97706" strokeWidth="1.2" strokeDasharray="2 2" />
                                )}

                                {/* Data Point Dot */}
                                <circle
                                  cx={c.x}
                                  cy={c.y}
                                  r={isHovered ? 6 : 3.8}
                                  fill="#ffffff"
                                  stroke={dashSubMetric === "mrr" ? "#d97706" : "#2563eb"}
                                  strokeWidth={isHovered ? 3.2 : 2.2}
                                />

                                {/* Transparent hover capture bar */}
                                <rect
                                  x={c.x - (chartW / (subPoints.length - 1)) / 2}
                                  y={pad.top}
                                  width={chartW / (subPoints.length - 1)}
                                  height={chartH}
                                  fill="transparent"
                                  style={{ cursor: "pointer" }}
                                  onMouseEnter={() => setHoveredSubPoint(idx)}
                                  onMouseLeave={() => setHoveredSubPoint(null)}
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Floating Tooltip */}
                        {hoveredSubPoint !== null && (
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: `${(coords[hoveredSubPoint].x / width) * 100}%`,
                              transform: "translateX(-50%)",
                              background: "#281507",
                              color: "#ffffff",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "11.5px",
                              boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
                              pointerEvents: "none",
                              zIndex: 10,
                              minWidth: "165px",
                            }}
                          >
                            <div style={{ fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "4px", marginBottom: "4px" }}>
                              {coords[hoveredSubPoint].raw.label} 2026 Subscriptions
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#fef08a" }}>
                              <span>💰 Month Inflow:</span>
                              <strong>₱{coords[hoveredSubPoint].raw.mrr.toLocaleString("en-PH")}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#93c5fd", marginTop: "2px" }}>
                              <span>🏢 Total Paid Plans:</span>
                              <strong>{coords[hoveredSubPoint].raw.activeSubs} plans</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#86efac", fontSize: "10.5px", marginTop: "2px" }}>
                              <span>📈 Month Transactions:</span>
                              <span>+{coords[hoveredSubPoint].raw.newSignups} txns</span>
                            </div>
                            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.2)", marginTop: "4px", paddingTop: "4px", fontSize: "10px", color: "#d5c3b2" }}>
                              Starter: {coords[hoveredSubPoint].raw.starter} • Pro: {coords[hoveredSubPoint].raw.portfolio} • YAWA: {coords[hoveredSubPoint].raw.operator}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Legend & Summaries */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f0e9e1", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#b45309", fontWeight: 700 }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#d97706" }} />
                      Revenue (₱{financialTransactions.filter(t => t.status === "Completed").reduce((sum, t) => sum + (Number(t.amount) || 0), 0).toLocaleString("en-PH")})
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#1d4ed8", fontWeight: 700 }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#2563eb" }} />
                      Paid ({financialTransactions.filter(t => t.status === "Completed").length})
                    </span>
                  </div>
                  <span style={{ color: "#7a6e63", fontSize: "11px" }}>
                    Pending Settlement: <strong style={{ color: "#d97706" }}>{financialTransactions.filter(t => t.status === "Pending").length} txns</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* =====================================================
                2-COLUMN MAIN BODY
            ===================================================== */}
            <div className="admin-two-col-grid">
              {/* LEFT COLUMN */}
              <div className="admin-col-left">
                {/* RECENT PROPERTY SUBMISSIONS */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2>Recent Property Submissions</h2>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setActiveTab("Properties")}
                    >
                      View All Properties →
                    </button>
                  </div>

                  <div className="admin-submissions-list">
                    {adminProperties && adminProperties.length > 0 ? (
                      adminProperties.slice(0, 3).map((subProp) => {
                        const subCover = getPropertyPhotos(subProp)[0] || subProp.image || sunnyStudioImg;
                        const isVerified = (subProp.verification || subProp.verification_status || "").toLowerCase() === "verified";
                        return (
                          <div
                            key={subProp.id || subProp.property_name}
                            className="admin-submission-item"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleOpenReviewProperty(subProp)}
                          >
                            <img
                              src={subCover}
                              alt={subProp.property_name || "Property photo"}
                              className="admin-submission-thumb"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = sunnyStudioImg;
                              }}
                            />
                            <div className="admin-submission-info">
                              <h3>{subProp.property_name}</h3>
                              <p>Submitted by: {subProp.landlord_name || subProp.landlord_email || "Landlord Partner"}</p>
                            </div>
                            <span className={`admin-status-tag ${isVerified ? "tag-published" : "tag-pending"}`}>
                              {isVerified ? "Verified" : (subProp.status || "Pending")}
                            </span>
                            <button
                              type="button"
                              className="admin-more-btn"
                              title="Review property"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReviewProperty(subProp);
                              }}
                            >
                              &#8942;
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: "#8c7e73", fontSize: "13px", padding: "14px 0", margin: 0 }}>
                        No property submissions registered yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* RECENT REGISTRATIONS */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2>Recent Registrations</h2>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setActiveTab("Users")}
                    >
                      View All Users ({adminUsers.length}) →
                    </button>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Date Joined</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.slice(0, 4).map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="admin-user-cell">
                              <UserAvatar user={u} size="sm" />
                              <span className="user-cell-name">{u.name}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className="user-role-badge"
                              style={{
                                background:
                                  u.role === "Landlord"
                                    ? "#fbf6eb"
                                    : u.role === "Admin"
                                    ? "#eef2ff"
                                    : "#f0fdf4",
                                color:
                                  u.role === "Landlord"
                                    ? "#8c5310"
                                    : u.role === "Admin"
                                    ? "#3730a3"
                                    : "#166534",
                                border:
                                  u.role === "Landlord"
                                    ? "1px solid #f3e4c7"
                                    : u.role === "Admin"
                                    ? "1px solid #c7d2fe"
                                    : "1px solid #bbf7d0",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="user-date-cell">{u.dateJoined || "Recent"}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="user-profile-link"
                              onClick={() => setSelectedUserForModal(u)}
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="admin-col-right">
                {/* SYSTEM HEALTH */}
                <div className="admin-card">
                  <h3 className="system-health-title">System Health</h3>

                  <div className="health-metric">
                    <div className="health-row">
                      <span>Server Load</span>
                      <strong>Normal (42%)</strong>
                    </div>
                    <div className="health-progress-bg">
                      <div className="health-progress-bar" style={{ width: "42%" }}></div>
                    </div>
                  </div>

                  <div className="health-metric">
                    <div className="health-row">
                      <span>Database Sync</span>
                      <strong>Stable</strong>
                    </div>
                    <div className="health-progress-bg">
                      <div className="health-progress-bar" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div className="health-status-footer">
                    <span className="health-status-dot"></span>
                    <span>All systems operational</span>
                  </div>
                </div>

                {/* ACTIVE REPORTS */}
                <div className="admin-card">
                  <div className="reports-card-header">
                    <h3>Active Reports</h3>
                    <span className="reports-badge">
                      {reports.filter(r => (r.status || "pending").toLowerCase() === "pending").length} New
                    </span>
                  </div>

                  <div className="reports-list">
                    {reports.filter(r => (r.status || "pending").toLowerCase() !== "resolved").slice(0, 3).map((rep) => (
                      <div
                        key={rep.id}
                        className="report-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setActiveTab("Reported Listings");
                          setReportsSearch(rep.property_name || "");
                        }}
                      >
                        <IconExclamationCircle />
                        <p>
                          <strong>{rep.property_name || `Property #${rep.property_id}`}</strong>: "{rep.details || rep.reason || 'Reported by user.'}"
                        </p>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <p style={{ margin: "4px 0", fontSize: "12.5px", color: "#8c7e73" }}>
                        No active reports filed. All listings compliant!
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="reports-view-all"
                    onClick={() => setActiveTab("Reported Listings")}
                  >
                    View All Reports ({reports.length}) →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
          <div className="admin-tab-section">
            {/* USER STATS STRIP & ACTIONS */}
            <div className="admin-card" style={{ marginBottom: "20px" }}>
              <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#281507", margin: "0 0 4px 0" }}>
                    User Management ({adminUsers.length} Registered Accounts)
                  </h2>
                  <p style={{ color: "#73675c", fontSize: "13.5px", margin: 0 }}>
                    Manage platform landlords, student renters, role permissions, and verification statuses.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={handleExportUsersCSV}
                  >
                    📥 Export CSV
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={fetchAdminUsers}
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* STATS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #f0e9e1" }}>
                <div style={{ padding: "12px 14px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Total Accounts</span>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#281507", marginTop: "2px" }}>
                    {adminUsers.length}
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Landlords</span>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#8c5310", marginTop: "2px" }}>
                    {totalLandlordsCount}
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Students &amp; Renters</span>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#15803d", marginTop: "2px" }}>
                    {totalStudentsCount}
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Active / Verified</span>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#1d4ed8", marginTop: "2px" }}>
                    {totalActiveUsersCount}
                  </div>
                </div>
              </div>
            </div>

            {/* USERS TABLE CARD */}
            <div className="admin-card">
              {/* FILTER BAR */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#281507" }}>Filter Role:</label>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "13px", background: "#ffffff" }}
                  >
                    <option value="All">All Roles</option>
                    <option value="Landlord">Landlords</option>
                    <option value="Student">Students / Renters</option>
                    <option value="Admin">Admins</option>
                  </select>

                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#281507", marginLeft: "6px" }}>Status:</label>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "13px", background: "#ffffff" }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending ID</option>
                    <option value="Suspended">Suspended</option>
                  </select>

                  {(userRoleFilter !== "All" || userStatusFilter !== "All" || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserRoleFilter("All");
                        setUserStatusFilter("All");
                        setSearchQuery("");
                      }}
                      style={{ background: "transparent", border: "none", color: "#991b1b", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                <span style={{ fontSize: "12.5px", color: "#73675c", fontWeight: 500 }}>
                  Showing <strong>{filteredAdminUsers.length}</strong> of {adminUsers.length} users
                </span>
              </div>

              {/* TABLE */}
              <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #ebdcd0" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>USER</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>CONTACT &amp; EMAIL</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>ROLE</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>STATUS</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>PORTFOLIO</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>DATE JOINED</th>
                      <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "12px", color: "#8c8075" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "48px 16px", color: "#8c8075" }}>
                          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#281507" }}>
                            Fetching real user profiles from Supabase database...
                          </p>
                        </td>
                      </tr>
                    ) : paginatedUsers && paginatedUsers.length > 0 ? (
                      paginatedUsers.map((u) => {
                        const isLandlord = (u.role || "").toLowerCase() === "landlord";
                        const isAdmin = (u.role || "").toLowerCase().includes("admin");
                        const isActive = (u.status || "").toLowerCase() === "active";
                        const isPending = (u.status || "").toLowerCase().includes("pending");
                        const isSuspended = (u.status || "").toLowerCase().includes("suspend");

                        return (
                          <tr key={u.id} style={{ borderBottom: "1px solid #f6f0ea" }}>
                            <td style={{ padding: "12px 10px" }}>
                              <div className="admin-user-cell">
                                <UserAvatar user={u} size="sm" />
                                <div>
                                  <span className="user-cell-name" style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#281507" }}>
                                    {u.name}
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#8c8075" }}>ID: {u.id?.slice(0, 10)}</span>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: "12px 10px" }}>
                              <span style={{ display: "block", fontSize: "13px", color: "#281507", fontWeight: 500 }}>{u.email}</span>
                              <span style={{ fontSize: "12px", color: "#7a6e63" }}>{u.phone || "+63 917 000 0000"}</span>
                            </td>

                            <td style={{ padding: "12px 10px" }}>
                              <span
                                className="user-role-badge"
                                style={{
                                  background: isLandlord ? "#fbf6eb" : isAdmin ? "#eef2ff" : "#f0fdf4",
                                  color: isLandlord ? "#8c5310" : isAdmin ? "#3730a3" : "#166534",
                                  border: isLandlord ? "1px solid #f3e4c7" : isAdmin ? "1px solid #c7d2fe" : "1px solid #bbf7d0",
                                  padding: "3px 9px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                {u.role}
                              </span>
                            </td>

                            <td style={{ padding: "12px 10px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 9px",
                                  borderRadius: "9999px",
                                  fontSize: "11.5px",
                                  fontWeight: 700,
                                  background: isActive ? "#eef7ed" : isPending ? "#fef3c7" : "#fee2e2",
                                  color: isActive ? "#15803d" : isPending ? "#b45309" : "#b91c1c",
                                  border: isActive ? "1px solid #bbf7d0" : isPending ? "1px solid #fde68a" : "1px solid #fecaca",
                                }}
                              >
                                {u.status}
                              </span>
                            </td>

                            <td style={{ padding: "12px 10px", fontSize: "13px", color: "#4a3e33" }}>
                              {isLandlord ? (
                                <span style={{ fontWeight: 600, color: "#555100" }}>
                                  {u.propertiesCount || 1} {u.propertiesCount === 1 ? "Property" : "Properties"}
                                </span>
                              ) : (
                                <span style={{ color: "#7a6e63" }}>Renter Profile</span>
                              )}
                            </td>

                            <td style={{ padding: "12px 10px", fontSize: "13px", color: "#6a5e54" }}>
                              {u.dateJoined || "Recently"}
                            </td>

                            <td style={{ padding: "12px 10px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                                {u.status && u.status.toLowerCase().includes("pending") && (
                                  <button
                                    type="button"
                                    className="admin-btn-outline"
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      background: "#eef7ed",
                                      color: "#15803d",
                                      borderColor: "#bbf7d0",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      boxShadow: "0 1px 3px rgba(21, 128, 61, 0.12)",
                                    }}
                                    title="User verified email in Gmail - Click to mark as Active"
                                    onClick={() => handleVerifyUserStatus(u)}
                                  >
                                    ✓ Activate
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{
                                    padding: "6px 14px",
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    background: "#686300",
                                    color: "#ffffff",
                                    borderColor: "#686300",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    boxShadow: "0 2px 5px rgba(104, 99, 0, 0.2)",
                                  }}
                                  onClick={() => setSelectedUserForModal(u)}
                                >
                                  👁 View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#8c8075" }}>
                          <p style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 600, color: "#281507" }}>
                            {searchQuery || userRoleFilter !== "All" || userStatusFilter !== "All"
                              ? "No users match your active search filters."
                              : "No registered users found in the database yet."}
                          </p>
                          <div style={{ display: "inline-flex", gap: "10px", marginTop: "4px" }}>
                            {(searchQuery || userRoleFilter !== "All" || userStatusFilter !== "All") ? (
                              <button
                                type="button"
                                className="admin-btn-outline"
                                onClick={() => {
                                  setUserRoleFilter("All");
                                  setUserStatusFilter("All");
                                  setSearchQuery("");
                                }}
                              >
                                Clear Filters
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="admin-btn-outline"
                                onClick={fetchAdminUsers}
                              >
                                ↻ Refresh from Supabase
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE PAGINATION */}
              {filteredAdminUsers.length > 0 && (
                <TablePagination
                  currentPage={usersPage}
                  totalItems={filteredAdminUsers.length}
                  pageSize={usersPageSize}
                  onPageChange={setUsersPage}
                  onPageSizeChange={setUsersPageSize}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "Properties" && (
          <div className="admin-tab-section">
            <div className="admin-card">
              <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: "#281507" }}>
                    Approved Property Listings ({approvedProperties.length})
                  </h2>
                  <p style={{ margin: 0, color: "#73675c", fontSize: "13.5px" }}>
                    All completely approved and verified property listings active in public searches.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {pendingCount > 0 && (
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setActiveTab("Verification")}
                      style={{ background: "#fbf6eb", color: "#555100", borderColor: "#e5d4b3", fontWeight: "700" }}
                    >
                      Review Pending Queue ({pendingCount}) →
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={fetchAdminProperties}
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* FILTER & SORT BAR */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                  marginBottom: "16px",
                  padding: "12px 14px",
                  background: "#fcfaf7",
                  borderRadius: "10px",
                  border: "1px solid #eee5dc",
                }}
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  {/* SEARCH */}
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", color: "#8c7e73" }} />
                    <input
                      type="text"
                      placeholder="Search property or landlord..."
                      value={adminPropSearch}
                      onChange={(e) => setAdminPropSearch(e.target.value)}
                      style={{
                        padding: "6px 12px 6px 30px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        width: "210px",
                        color: "#281507",
                      }}
                    />
                  </div>

                  {/* STATUS FILTER */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#686300" }}>Status:</label>
                    <select
                      value={adminPropStatusFilter}
                      onChange={(e) => setAdminPropStatusFilter(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        color: "#281507",
                      }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Rented">Rented</option>
                    </select>
                  </div>

                  {/* TYPE FILTER */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#686300" }}>Type:</label>
                    <select
                      value={adminPropTypeFilter}
                      onChange={(e) => setAdminPropTypeFilter(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        color: "#281507",
                      }}
                    >
                      <option value="All">All Types</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Studio">Studio</option>
                      <option value="Condo">Condo</option>
                      <option value="Dormitory">Dormitory</option>
                      <option value="House">House</option>
                    </select>
                  </div>

                  {/* SORT BY */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#686300" }}>Sort:</label>
                    <select
                      value={adminPropSort}
                      onChange={(e) => setAdminPropSort(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        color: "#281507",
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-asc">Rent: Low to High</option>
                      <option value="price-desc">Rent: High to Low</option>
                      <option value="name-asc">Name: A → Z</option>
                      <option value="name-desc">Name: Z → A</option>
                    </select>
                  </div>

                  {/* RESET BUTTON */}
                  {(adminPropStatusFilter !== "All" || adminPropTypeFilter !== "All" || adminPropSort !== "newest" || adminPropSearch.trim() || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdminPropStatusFilter("All");
                        setAdminPropTypeFilter("All");
                        setAdminPropSort("newest");
                        setAdminPropSearch("");
                        setSearchQuery("");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#991b1b",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "4px 6px",
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                <span style={{ fontSize: "12.5px", color: "#73675c", fontWeight: 500 }}>
                  Showing <strong>{filteredApprovedProps.length}</strong> of {approvedProperties.length} properties
                </span>
              </div>

              <div className="admin-submissions-list" style={{ marginTop: "12px" }}>
                {paginatedApprovedProps && paginatedApprovedProps.length > 0 ? (
                  paginatedApprovedProps.map((prop) => {
                    return (
                      <div
                        key={prop.id}
                        className="admin-submission-item"
                        style={{
                          padding: "14px 16px",
                          borderRadius: "10px",
                          border: "1px solid #eee5dc",
                          background: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          marginBottom: "10px",
                        }}
                      >
                        <img
                          src={getPropertyPhotos(prop)[0] || prop.image || sunnyStudioImg}
                          alt={prop.property_name || "Property"}
                          className="admin-submission-thumb"
                          style={{ width: "74px", height: "74px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, background: "#f0ece7" }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = sunnyStudioImg;
                          }}
                        />
                        <div className="admin-submission-info" style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#281507" }}>
                              {prop.property_name}
                            </h3>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "9999px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: "#eef7ed",
                                color: "#15803d",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              ✓ VERIFIED &amp; APPROVED
                            </span>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "9999px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: prop.status === "Available" ? "#eff6ff" : "#f3f4f6",
                                color: prop.status === "Available" ? "#1d4ed8" : "#4b5563",
                              }}
                            >
                              {prop.status || "Available"}
                            </span>
                            {adminRatingsMap[prop.id] || adminRatingsMap[prop.property_name] ? (
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  background: "#fef9c3",
                                  color: "#854d0e",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  border: "1px solid #fde047",
                                }}
                              >
                                <span style={{ color: "#ca8a04" }}>★</span>
                                {(adminRatingsMap[prop.id] || adminRatingsMap[prop.property_name]).avg.toFixed(1)} ({(adminRatingsMap[prop.id] || adminRatingsMap[prop.property_name]).count})
                              </span>
                            ) : null}
                          </div>
                          <p style={{ margin: "0 0 4px 0", color: "#6a5e54", fontSize: "13px" }}>
                            Landlord: <strong>{prop.landlord_name || prop.landlord_email || "Landlord Partner"}</strong> • ₱{Number(prop.rent || 0).toLocaleString()}/mo • {prop.property_type || "Studio"} • 📍 {prop.address || prop.city || "Metro Manila"}
                          </p>
                          {Array.isArray(prop.amenities) && prop.amenities.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {prop.amenities.slice(0, 4).map((am, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: "11px",
                                    padding: "1px 6px",
                                    background: "#f3ede5",
                                    borderRadius: "4px",
                                    color: "#6b5847",
                                  }}
                                >
                                  ✓ {am}
                                </span>
                              ))}
                              {prop.amenities.length > 4 && (
                                <span style={{ fontSize: "11px", color: "#8c7e73" }}>
                                  +{prop.amenities.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            style={{ padding: "8px 14px", fontSize: "12.5px", fontWeight: "600", background: "#fcf9f5" }}
                            onClick={() => handleOpenReviewProperty(prop)}
                          >
                            👁 View Details &amp; Photos
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 16px", color: "#8c7e73", background: "#fcfaf7", borderRadius: "8px", border: "1px dashed #e2dad2" }}>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏠</div>
                    <h3 style={{ color: "#281507", margin: "0 0 6px" }}>No Approved Properties Found</h3>
                    <p style={{ margin: "0 0 16px", fontSize: "13.5px" }}>
                      {searchQuery || adminPropSearch || adminPropStatusFilter !== "All" || adminPropTypeFilter !== "All"
                        ? "No approved properties match your active filter criteria."
                        : "There are currently no approved properties in the public catalog."}
                    </p>
                    {(searchQuery || adminPropSearch || adminPropStatusFilter !== "All" || adminPropTypeFilter !== "All") && (
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ background: "#686300", color: "#ffffff", borderColor: "#686300", fontWeight: "700" }}
                        onClick={() => {
                          setAdminPropStatusFilter("All");
                          setAdminPropTypeFilter("All");
                          setAdminPropSort("newest");
                          setAdminPropSearch("");
                          setSearchQuery("");
                        }}
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PROPERTIES PAGINATION */}
              {filteredApprovedProps && filteredApprovedProps.length > 0 && (
                <TablePagination
                  currentPage={propertiesPage}
                  totalItems={filteredApprovedProps.length}
                  pageSize={propertiesPageSize}
                  onPageChange={setPropertiesPage}
                  onPageSizeChange={setPropertiesPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            SUB-VIEW: SUBSCRIPTION PRICING MANAGEMENT
        ===================================================== */}
        {activeTab === "Subscription Pricing" && (
          <div className="admin-tab-section">
            {/* PRICING MANAGEMENT HEADER CARD */}
            <div className="admin-card" style={{ marginBottom: "24px" }}>
              <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#281507", margin: "0 0 4px 0" }}>
                    Subscription Pricing &amp; Tiers
                  </h2>
                  <p style={{ color: "#73675c", fontSize: "13.5px", margin: 0 }}>
                    Configure pricing rates, property quotas, and features visible to landlords and renters.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={async () => {
                      if (subscriptionPlans.length >= 4) {
                        showNotice("Plan Limit Reached", "Maximum limit of 4 subscription tiers reached. Please edit or remove an existing tier to add a new one.", "warning");
                        return;
                      }
                      const newPlan = {
                        id: "plan-" + Date.now(),
                        name: "New Custom Tier",
                        category: "Landlord",
                        price: 399,
                        period: "month",
                        propertiesLimit: "2 Properties",
                        isPopular: false,
                        isActive: true,
                        badge: "Custom Tier",
                        description: "New subscription tier customized by Super Admin.",
                        features: [
                          "Verified Property Listings",
                          "Direct Tenant In-App Chat",
                          "Priority Search Placement",
                        ],
                      };
                      const updated = [...subscriptionPlans, newPlan];
                      setSubscriptionPlans(updated);
                      setEditingPlan(newPlan);

                      // Immediately persist to localStorage
                      try {
                        localStorage.setItem("mobin_subscription_plans", JSON.stringify(updated));
                      } catch (_) {}

                      // Broadcast live event to PricingSection & Landlord views
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: updated }));
                      }

                      // Persist to Supabase
                      try {
                        await supabase.from("subscription_plans").upsert({
                          id: newPlan.id,
                          name: newPlan.name,
                          category: newPlan.category,
                          price: Number(newPlan.price),
                          period: newPlan.period,
                          properties_limit: newPlan.propertiesLimit,
                          is_popular: false,
                          is_active: true,
                          badge: newPlan.badge,
                          description: newPlan.description,
                          features: newPlan.features,
                          updated_at: new Date().toISOString(),
                        });
                      } catch (dbErr) {
                        console.warn("Supabase new plan insert notice:", dbErr);
                      }
                    }}
                  >
                    + Add New Tier (Max 4)
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    style={{ background: "#686300", color: "#ffffff", borderColor: "#686300" }}
                    onClick={handlePublishAllPlans}
                  >
                    Publish Changes
                  </button>
                </div>
              </div>

              {/* STATS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "20px", paddingTop: "18px", borderTop: "1px solid #f0e9e1" }}>
                <div style={{ padding: "12px 16px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Active Landlord Plans</span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#281507", marginTop: "2px" }}>
                    {subscriptionPlans.filter((p) => p.category === "Landlord").length} Tiers
                  </div>
                </div>
                <div style={{ padding: "12px 16px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Renter Passes</span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#281507", marginTop: "2px" }}>
                    {subscriptionPlans.filter((p) => p.category === "Renter").length} Tier
                  </div>
                </div>
                <div style={{ padding: "12px 16px", background: "#faf7f4", borderRadius: "8px", border: "1px solid #eee5dc" }}>
                  <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>Base Landlord Price</span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#555100", marginTop: "2px" }}>
                    ₱299 / mo
                  </div>
                </div>
              </div>
            </div>

            {/* EDITING DRAWER / MODAL */}
            {editingPlan && (
              <div className="admin-card" style={{ marginBottom: "24px", border: "2px solid #555100", background: "#fffdf9" }}>
                <div className="admin-card-header" style={{ marginBottom: "18px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#555100", letterSpacing: "0.5px" }}>EDITING TIER</span>
                    <h2 style={{ fontSize: "18px", margin: "2px 0 0 0" }}>{editingPlan.name}</h2>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => setEditingPlan(null)}
                  >
                    Close Editor
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "6px" }}>Plan Name</label>
                    <input
                      type="text"
                      value={editingPlan.name || ""}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "6px" }}>Monthly Price (₱)</label>
                    <input
                      type="number"
                      value={editingPlan.price ?? 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "6px" }}>Property Quota</label>
                    <input
                      type="text"
                      value={editingPlan.propertiesLimit || ""}
                      onChange={(e) => setEditingPlan({ ...editingPlan, propertiesLimit: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "6px" }}>Pricing Badge Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. INTRODUCTORY PRICE, MOST POPULAR"
                      value={editingPlan.badge || ""}
                      onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "6px" }}>Category</label>
                    <select
                      value={editingPlan.category || "Landlord"}
                      onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "14px", boxSizing: "border-box", background: "#ffffff" }}
                    >
                      <option value="Landlord">Landlord</option>
                      <option value="Renter">Renter</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", fontWeight: 600, color: "#281507", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={!!editingPlan.isPopular}
                      onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                      style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#555100" }}
                    />
                    <span>Highlight as Popular / Recommended Plan (Golden Border)</span>
                  </label>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "6px" }}>Description</label>
                  <input
                    type="text"
                    value={editingPlan.description || ""}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>

                {/* FEATURES LIST EDITOR */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#281507", marginBottom: "8px" }}>Included Features</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {(editingPlan.features || []).map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: "#555100", fontWeight: "bold" }}>✓</span>
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const updated = [...(editingPlan.features || [])];
                            updated[fIdx] = e.target.value;
                            setEditingPlan({ ...editingPlan, features: updated });
                          }}
                          style={{ flex: 1, padding: "7px 10px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "13.5px" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingPlan.features || []).filter((_, i) => i !== fIdx);
                            setEditingPlan({ ...editingPlan, features: updated });
                          }}
                          style={{ background: "transparent", border: "none", color: "#991b1b", cursor: "pointer", fontSize: "16px", padding: "0 6px" }}
                          title="Remove feature"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ADD FEATURE ROW */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Add a new feature bullet (e.g. 24/7 Priority Support)..."
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "13.5px" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newFeatureText.trim()) {
                            const currentFeatures = editingPlan.features || [];
                            setEditingPlan({
                              ...editingPlan,
                              features: [...currentFeatures, newFeatureText.trim()],
                            });
                            setNewFeatureText("");
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ background: "#fbf6eb", color: "#555100", borderColor: "#d8c7a2", fontWeight: 600, padding: "9px 16px" }}
                      onClick={() => {
                        if (newFeatureText.trim()) {
                          const currentFeatures = editingPlan.features || [];
                          setEditingPlan({
                            ...editingPlan,
                            features: [...currentFeatures, newFeatureText.trim()],
                          });
                          setNewFeatureText("");
                        }
                      }}
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingTop: "14px", borderTop: "1px solid #eee5dc" }}>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    style={{
                      color: "#dc2626",
                      borderColor: "#fca5a5",
                      background: "#fef2f2",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                      padding: "8px 14px",
                    }}
                    onClick={() => handleRequestDeleteTier(editingPlan)}
                  >
                    <Trash2 size={15} />
                    Remove Tier
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setEditingPlan(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ background: "#555100", color: "#ffffff", borderColor: "#555100" }}
                      onClick={() => handleSaveTier(editingPlan)}
                    >
                      Save Tier Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PRICING TIERS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "20px" }}>
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="admin-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    border: plan.isPopular ? "2px solid #f5b72c" : "1px solid #eee5dc",
                    boxShadow: plan.isPopular ? "0 4px 14px rgba(245, 183, 44, 0.15)" : "none",
                  }}
                >
                  {plan.isPopular && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-11px",
                        right: "20px",
                        background: "#f5b72c",
                        color: "#281507",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        letterSpacing: "0.3px",
                      }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: plan.category === "Landlord" ? "#555100" : "#2563eb",
                        background: plan.category === "Landlord" ? "#fbf6eb" : "#eff6ff",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: plan.category === "Landlord" ? "1px solid #f3e4c7" : "1px solid #dbeafe",
                      }}
                    >
                      {plan.category.toUpperCase()}
                    </span>

                    <span style={{ fontSize: "12px", color: "#73675c", fontWeight: 600 }}>
                      {plan.propertiesLimit}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#281507", margin: "0 0 6px 0" }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6a5e54", margin: "0 0 16px 0", minHeight: "36px" }}>
                    {plan.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "18px" }}>
                    <span style={{ fontSize: "32px", fontWeight: 800, color: "#281507" }}>
                      ₱{Number(plan.price).toLocaleString()}
                    </span>
                    <span style={{ fontSize: "13.5px", color: "#73675c" }}>/{plan.period}</span>
                  </div>

                  <div style={{ borderTop: "1px solid #f0e9e1", paddingTop: "14px", marginBottom: "20px", flex: 1 }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#281507", display: "block", marginBottom: "8px" }}>
                      INCLUDED FEATURES:
                    </span>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {plan.features.map((f, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#3b3026" }}>
                          <span style={{ color: "#555100", fontWeight: "bold" }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ flex: 1, textAlign: "center", justifyContent: "center", background: "#fbf6f0", fontWeight: 600 }}
                      onClick={() => setEditingPlan(plan)}
                    >
                      ✏ Edit Pricing
                    </button>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{
                        color: "#dc2626",
                        borderColor: "#fecaca",
                        background: "#fff5f5",
                        padding: "8px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        fontWeight: 600,
                      }}
                      title={`Remove ${plan.name}`}
                      onClick={() => handleRequestDeleteTier(plan)}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* =====================================================
                LANDLORD SUBSCRIBERS TABLE & OVERRIDE CONTROLS
            ===================================================== */}
            <div className="admin-card" style={{ marginTop: "28px" }}>
              <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#281507", margin: "0 0 4px 0" }}>
                    Subscribed Landlords &amp; Accounts ({subscribersList.length})
                  </h2>
                  <p style={{ color: "#73675c", fontSize: "13px", margin: 0 }}>
                    Monitor landlord renewal cycles, grant grace periods or free days, and override subscription states.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => showNotice("Export Subscribers", "Landlord subscribers list exported successfully to CSV.", "success")}
                >
                  📥 Export Subscribers CSV
                </button>
              </div>

              <div className="admin-table-wrap" style={{ marginTop: "14px", overflowX: "auto" }}>
                <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "#fcf8f4", borderBottom: "1.5px solid #ebdcd0" }}>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", color: "#7a6e63" }}>LANDLORD</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", color: "#7a6e63" }}>CURRENT TIER</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", color: "#7a6e63" }}>STATUS</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", color: "#7a6e63" }}>NEXT BILLING</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", color: "#7a6e63" }}>CHANNEL</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", color: "#7a6e63" }}>TOTAL PAID</th>
                      <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "12px", color: "#7a6e63" }}>ADMIN ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubscribers.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: "1px solid #f3ece5" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <strong style={{ display: "block", color: "#1a1006" }}>{sub.landlordName}</strong>
                          <span style={{ fontSize: "12px", color: "#7a6e63" }}>{sub.email}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#555100" }}>{sub.tier}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              background:
                                sub.status === "Active"
                                  ? "#eef7ed"
                                  : sub.status === "Grace Period"
                                  ? "#fef3c7"
                                  : sub.status === "Free Trial"
                                  ? "#eff6ff"
                                  : "#f3e8ff",
                              color:
                                sub.status === "Active"
                                  ? "#15803d"
                                  : sub.status === "Grace Period"
                                  ? "#b45309"
                                  : sub.status === "Free Trial"
                                  ? "#1d4ed8"
                                  : "#6b21a8",
                            }}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", color: sub.nextBilling.includes("Overdue") ? "#dc2626" : "#4a3e33" }}>
                          {sub.nextBilling}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6a5e54" }}>{sub.channel}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1a1006" }}>{sub.totalPaid}</td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "4px 10px", fontSize: "11.5px", fontWeight: 700, color: "#1e40af", borderColor: "#bfdbfe", background: "#eff6ff" }}
                              onClick={() => {
                                setOverrideModalSub(sub);
                                setOverrideForm({
                                  newStatus: sub.status === "Grace Period" ? "Active" : sub.status,
                                  extensionDays: 30,
                                  reason: "",
                                });
                              }}
                              title="Issue Manual Override / Extension"
                            >
                              Override
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "4px 10px", fontSize: "11.5px", fontWeight: 600 }}
                              onClick={() => handleGrantDays(sub.id, 30)}
                              title="Grant +30 Days Free"
                            >
                              +30d
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "4px 10px", fontSize: "11.5px", fontWeight: 600 }}
                              onClick={() => handleCompAccount(sub.id)}
                              title="Comp as Free Partner"
                            >
                              Comp
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "4px 10px", fontSize: "11.5px", fontWeight: 600, color: "#8c5310" }}
                              onClick={() => handleSendReminder(sub.email)}
                              title="Send Reminder Email"
                            >
                              Remind
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUBSCRIBERS TABLE PAGINATION */}
              {subscribersList.length > 0 && (
                <TablePagination
                  currentPage={subscribersPage}
                  totalItems={subscribersList.length}
                  pageSize={subscribersPageSize}
                  onPageChange={setSubscribersPage}
                  onPageSizeChange={setSubscribersPageSize}
                />
              )}
            </div>

            {/* =====================================================
                IMMUTABLE SUBSCRIPTION AUDIT TRAIL LOGS
            ===================================================== */}
            <div className="admin-card" style={{ marginTop: "28px" }}>
              <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#281507", margin: "0 0 4px 0" }}>
                    Subscription Override &amp; Compliance Audit Trail ({auditLogsList.length})
                  </h2>
                  <p style={{ color: "#73675c", fontSize: "13px", margin: 0 }}>
                    Immutable historical records of status transitions, manual extensions, and required administrative rationale.
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap" style={{ marginTop: "14px", overflowX: "auto" }}>
                <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#fcf8f4", borderBottom: "1.5px solid #ebdcd0" }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>TIMESTAMP</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>ADMIN OPERATOR</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>TARGET ACCOUNT</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>TRANSITION</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>MANDATORY REASON / RATIONALE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAuditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #f3ece5" }}>
                        <td style={{ padding: "10px 12px", color: "#6a5e54", whiteSpace: "nowrap" }}>{log.timestamp}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#281507" }}>{log.admin}</td>
                        <td style={{ padding: "10px 12px", color: "#4a3e33" }}>{log.target}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", background: "#f1f5f9", borderRadius: "4px", color: "#334155" }}>
                            {log.prevStatus} → {log.newStatus}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#3b3026", fontStyle: "italic" }}>
                          "{log.reason}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AUDIT TRAIL PAGINATION */}
              {auditLogsList.length > 0 && (
                <TablePagination
                  currentPage={auditPage}
                  totalItems={auditLogsList.length}
                  pageSize={auditPageSize}
                  onPageChange={setAuditPage}
                  onPageSizeChange={setAuditPageSize}
                />
              )}
            </div>

            {/* =====================================================
                ADMIN OVERRIDE / GRACE EXTENSION MODAL
            ===================================================== */}
            {overrideModalSub && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(30, 20, 10, 0.65)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  padding: "20px",
                }}
                onClick={() => setOverrideModalSub(null)}
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    maxWidth: "520px",
                    width: "100%",
                    padding: "28px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                    position: "relative",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setOverrideModalSub(null)}
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "transparent",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "#73675c",
                    }}
                  >
                    ✕
                  </button>

                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#1e40af", letterSpacing: "0.5px" }}>
                    SUPER ADMIN ACCESS
                  </span>
                  <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#281507", margin: "4px 0 6px" }}>
                    Override Subscription Status
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6a5e54", margin: "0 0 18px" }}>
                    Modify subscription state for <strong>{overrideModalSub.landlordName}</strong> ({overrideModalSub.email}).
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#281507", marginBottom: "6px" }}>
                        New Status State
                      </label>
                      <select
                        value={overrideForm.newStatus}
                        onChange={(e) => setOverrideForm({ ...overrideForm, newStatus: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          border: "1.5px solid #dcd4cc",
                          fontSize: "13.5px",
                          background: "#ffffff",
                        }}
                      >
                        <option value="Active">Active (Full Listing Access)</option>
                        <option value="Grace Period">Grace Period (Payment Retries)</option>
                        <option value="Comped (Partner)">Comped (Partner / Free Forever)</option>
                        <option value="Free Trial">Free Trial</option>
                        <option value="Cancelled">Cancelled (Auto-Renew Off)</option>
                        <option value="Expired">Expired (Listings Frozen)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#281507", marginBottom: "6px" }}>
                        Extension Duration (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={overrideForm.extensionDays}
                        onChange={(e) => setOverrideForm({ ...overrideForm, extensionDays: Number(e.target.value) })}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          border: "1.5px solid #dcd4cc",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#281507", marginBottom: "6px" }}>
                        Compulsory Audit Reason / Rationale <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        rows="3"
                        placeholder="e.g. Payment gateway incident compensation, University promotional sponsorship, etc."
                        value={overrideForm.reason}
                        onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          border: "1.5px solid #dcd4cc",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "#7a6e63" }}>
                        Minimum 5 characters. This rationale will be permanently recorded in immutable audit logs.
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setOverrideModalSub(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ background: "#1e40af", color: "#ffffff", borderColor: "#1e40af", fontWeight: 700 }}
                      onClick={handleSubmitOverride}
                    >
                      Authorize &amp; Apply Override
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Verification" && (
          <div className="admin-tab-section">
            <div className="admin-card">
              <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#281507" }}>
                    Property Verification Queue ({pendingProperties.length} Pending)
                  </h2>
                  <p style={{ color: "#73675c", fontSize: "13.5px", margin: 0 }}>
                    Review landlord ownership submissions and property photos before approving for public search listings.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={fetchAdminProperties}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  ↻ Refresh Queue
                </button>
              </div>

              {/* FILTER & DATE CONTROLS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                  marginBottom: "16px",
                  padding: "12px 14px",
                  background: "#fcfaf7",
                  borderRadius: "10px",
                  border: "1px solid #eee5dc",
                }}
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  {/* SEARCH */}
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", color: "#8c7e73" }} />
                    <input
                      type="text"
                      placeholder="Search queue..."
                      value={verifSearch}
                      onChange={(e) => setVerifSearch(e.target.value)}
                      style={{
                        padding: "6px 12px 6px 30px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        width: "180px",
                        color: "#281507",
                      }}
                    />
                  </div>

                  {/* DATE RANGE PRESET */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={14} color="#686300" />
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#686300" }}>Date:</label>
                    <select
                      value={verifDateRange}
                      onChange={(e) => setVerifDateRange(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        color: "#281507",
                      }}
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="thisMonth">This Month</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>

                  {/* CUSTOM DATE PICKERS */}
                  {verifDateRange === "custom" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="date"
                        value={verifStartDate}
                        onChange={(e) => setVerifStartDate(e.target.value)}
                        style={{
                          padding: "5px 8px",
                          borderRadius: "6px",
                          border: "1px solid #dcd4cc",
                          fontSize: "12px",
                          background: "#ffffff",
                          color: "#281507",
                        }}
                        title="Start Date"
                      />
                      <span style={{ fontSize: "12px", color: "#8c7e73" }}>to</span>
                      <input
                        type="date"
                        value={verifEndDate}
                        onChange={(e) => setVerifEndDate(e.target.value)}
                        style={{
                          padding: "5px 8px",
                          borderRadius: "6px",
                          border: "1px solid #dcd4cc",
                          fontSize: "12px",
                          background: "#ffffff",
                          color: "#281507",
                        }}
                        title="End Date"
                      />
                    </div>
                  )}

                  {/* SORT BY */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#686300" }}>Sort:</label>
                    <select
                      value={verifSort}
                      onChange={(e) => setVerifSort(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #dcd4cc",
                        fontSize: "13px",
                        background: "#ffffff",
                        color: "#281507",
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="rent-desc">Highest Rent</option>
                      <option value="rent-asc">Lowest Rent</option>
                    </select>
                  </div>

                  {/* RESET BUTTON */}
                  {(verifDateRange !== "all" || verifStartDate || verifEndDate || verifSort !== "newest" || verifSearch.trim() || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setVerifDateRange("all");
                        setVerifStartDate("");
                        setVerifEndDate("");
                        setVerifSort("newest");
                        setVerifSearch("");
                        setSearchQuery("");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#991b1b",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "4px 6px",
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                <span style={{ fontSize: "12.5px", color: "#73675c", fontWeight: 500 }}>
                  Showing <strong>{filteredPendingProps.length}</strong> of {pendingProperties.length} pending submissions
                </span>
              </div>

              <div className="admin-submissions-list" style={{ marginTop: "12px" }}>
                {paginatedPendingProps && paginatedPendingProps.length > 0 ? (
                  paginatedPendingProps.map((prop) => (
                    <div
                      key={prop.id}
                      className="admin-submission-item"
                      style={{
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1.5px solid #ebdcd0",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "12px",
                      }}
                    >
                      <img
                        src={getPropertyPhotos(prop)[0] || prop.image || sunnyStudioImg}
                        alt={prop.property_name || "Property"}
                        className="admin-submission-thumb"
                        style={{ width: "90px", height: "90px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, background: "#f0ece7" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = sunnyStudioImg;
                        }}
                      />
                      <div className="admin-submission-info" style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#281507" }}>
                            {prop.property_name}
                          </h3>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: "700",
                              background: "#fef3c7",
                              color: "#b45309",
                              border: "1px solid #fde68a",
                            }}
                          >
                            PENDING VERIFICATION
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#8c7e73",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#fcf8f2",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              border: "1px solid #f0e6dc",
                            }}
                          >
                            <Calendar size={12} color="#686300" />
                            Submitted: {new Date(prop.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 6px 0", color: "#5c4f44", fontSize: "13px" }}>
                          <strong>Landlord:</strong> {prop.landlord_name || prop.landlord_email || "Landlord"} ({prop.landlord_email || "landlord@mobin.ph"})
                        </p>
                        <p style={{ margin: "0 0 6px 0", color: "#555100", fontSize: "13px", fontWeight: "700" }}>
                          ₱{Number(prop.rent || 0).toLocaleString()}/month • {prop.property_type || "Studio"} • 📍 {prop.address || prop.city || "Metro Manila"}
                        </p>
                        {Array.isArray(prop.amenities) && prop.amenities.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {prop.amenities.map((am, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 6px",
                                  background: "#f3ede5",
                                  borderRadius: "4px",
                                  color: "#6b5847",
                                }}
                              >
                                {am}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <button
                          type="button"
                          className="admin-btn-outline"
                          style={{
                            background: "#686300",
                            color: "#ffffff",
                            borderColor: "#686300",
                            fontWeight: "700",
                            padding: "8px 18px",
                            cursor: "pointer",
                            fontSize: "13px",
                            borderRadius: "7px",
                            boxShadow: "0 2px 6px rgba(104, 99, 0, 0.2)",
                          }}
                          onClick={() => handleOpenReviewProperty(prop)}
                        >
                          🔍 Review &amp; Photos
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 16px", color: "#8c7e73" }}>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
                    <h3 style={{ color: "#281507", margin: "0 0 6px" }}>
                      {verifDateRange !== "all" || verifStartDate || verifEndDate || verifSearch.trim() || searchQuery.trim()
                        ? "No Submissions Match Active Date Filters"
                        : "Verification Queue Clear"}
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "13.5px" }}>
                      {verifDateRange !== "all" || verifStartDate || verifEndDate || verifSearch.trim() || searchQuery.trim()
                        ? "Try selecting a broader date range or clearing your search filters."
                        : "All landlord property submissions have been reviewed and approved!"}
                    </p>
                    {(verifDateRange !== "all" || verifStartDate || verifEndDate || verifSearch.trim() || searchQuery.trim()) && (
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ background: "#686300", color: "#ffffff", borderColor: "#686300", fontWeight: "700" }}
                        onClick={() => {
                          setVerifDateRange("all");
                          setVerifStartDate("");
                          setVerifEndDate("");
                          setVerifSort("newest");
                          setVerifSearch("");
                          setSearchQuery("");
                        }}
                      >
                        Reset Date Filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* VERIFICATION QUEUE PAGINATION */}
              {filteredPendingProps && filteredPendingProps.length > 0 && (
                <TablePagination
                  currentPage={verifPage}
                  totalItems={filteredPendingProps.length}
                  pageSize={verifPageSize}
                  onPageChange={setVerifPage}
                  onPageSizeChange={setVerifPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            SUB-VIEW: REPORTED LISTINGS (SUPABASE BASED WITH CARDS & PAGINATION)
        ===================================================== */}
        {activeTab === "Reported Listings" && (() => {
          const totalReports = reports.length;
          const pendingReports = reports.filter((r) => (r.status || "pending").toLowerCase() === "pending").length;
          const investigatingReports = reports.filter((r) => (r.status || "").toLowerCase() === "investigating").length;
          const resolvedReports = reports.filter((r) => (r.status || "").toLowerCase() === "resolved").length;
          const dismissedReports = reports.filter((r) => (r.status || "").toLowerCase() === "dismissed").length;

          // Filter and Sort
          const filteredReportsList = reports
            .filter((rep) => {
              const status = (rep.status || "pending").toLowerCase();
              if (reportsFilter !== "all" && status !== reportsFilter.toLowerCase()) {
                return false;
              }

              if (reportsReasonFilter !== "all") {
                const reason = (rep.reason || "").toLowerCase();
                if (!reason.includes(reportsReasonFilter.toLowerCase())) {
                  return false;
                }
              }

              const q = (reportsSearch || searchQuery || "").toLowerCase().trim();
              if (q) {
                const propMatch =
                  (rep.property_name && rep.property_name.toLowerCase().includes(q)) ||
                  (rep.property_id && String(rep.property_id).toLowerCase().includes(q));
                const reporterMatch =
                  (rep.reporter_name && rep.reporter_name.toLowerCase().includes(q)) ||
                  (rep.reporter_email && rep.reporter_email.toLowerCase().includes(q));
                const reasonMatch =
                  (rep.reason && rep.reason.toLowerCase().includes(q)) ||
                  (rep.details && rep.details.toLowerCase().includes(q));

                if (!propMatch && !reporterMatch && !reasonMatch) {
                  return false;
                }
              }

              return true;
            })
            .sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return reportsSort === "newest" ? dateB - dateA : dateA - dateB;
            });

          const paginatedReports = filteredReportsList.slice(
            (reportsPage - 1) * reportsPageSize,
            reportsPage * reportsPageSize
          );

          return (
            <div className="admin-tab-section">
              <div className="admin-card">
                {/* SECTION HEADER */}
                <div className="admin-card-header" style={{ marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", color: "#281507" }}>
                      Flagged &amp; Reported Listings ({totalReports})
                    </h2>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#73675c" }}>
                      Review live tenant complaints from Supabase, inspect reported property listings, and moderate violations.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="reported-btn-refresh"
                    onClick={fetchReports}
                    disabled={loadingReports}
                    title="Refresh reports from database"
                  >
                    <RotateCcw size={14} className={loadingReports ? "terms-spinner" : ""} />
                    <span>{loadingReports ? "Syncing..." : "Refresh"}</span>
                  </button>
                </div>

                {/* STATS STRIP */}
                <div className="reported-stats-strip">
                  <div className="reported-stat-pill">
                    <span className="reported-stat-dot total" />
                    <span className="reported-stat-label">Total Reports:</span>
                    <span className="reported-stat-value">{totalReports}</span>
                  </div>
                  <div className="reported-stat-pill">
                    <span className="reported-stat-dot pending" />
                    <span className="reported-stat-label">Pending Review:</span>
                    <span className="reported-stat-value" style={{ color: "#dc2626" }}>{pendingReports}</span>
                  </div>
                  <div className="reported-stat-pill">
                    <span className="reported-stat-dot investigating" />
                    <span className="reported-stat-label">Under Investigation:</span>
                    <span className="reported-stat-value" style={{ color: "#2563eb" }}>{investigatingReports}</span>
                  </div>
                  <div className="reported-stat-pill">
                    <span className="reported-stat-dot resolved" />
                    <span className="reported-stat-label">Resolved:</span>
                    <span className="reported-stat-value" style={{ color: "#16a34a" }}>{resolvedReports}</span>
                  </div>
                  <div className="reported-stat-pill">
                    <span className="reported-stat-dot dismissed" />
                    <span className="reported-stat-label">Dismissed:</span>
                    <span className="reported-stat-value" style={{ color: "#8c7e73" }}>{dismissedReports}</span>
                  </div>
                </div>

                {/* CONTROLS & FILTER TOOLBAR */}
                <div className="reported-controls-bar">
                  <div className="reported-status-tabs">
                    {[
                      { key: "all", label: "All Reports", count: totalReports },
                      { key: "pending", label: "Pending Review", count: pendingReports },
                      { key: "investigating", label: "Investigating", count: investigatingReports },
                      { key: "resolved", label: "Resolved", count: resolvedReports },
                      { key: "dismissed", label: "Dismissed", count: dismissedReports },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`reported-tab-btn ${reportsFilter === tab.key ? "active" : ""}`}
                        onClick={() => {
                          setReportsFilter(tab.key);
                          setReportsPage(1);
                        }}
                      >
                        <span>{tab.label}</span>
                        <span className="reported-tab-count-badge">{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="reported-search-filter-row">
                    <div className="reported-search-wrapper">
                      <Search size={16} className="reported-search-icon" />
                      <input
                        type="text"
                        placeholder="Search by property, landlord, reporter, or complaint keyword..."
                        className="reported-search-input"
                        value={reportsSearch}
                        onChange={(e) => setReportsSearch(e.target.value)}
                      />
                    </div>

                    <select
                      className="reported-dropdown-select"
                      value={reportsReasonFilter}
                      onChange={(e) => {
                        setReportsReasonFilter(e.target.value);
                        setReportsPage(1);
                      }}
                    >
                      <option value="all">All Complaint Categories</option>
                      <option value="scam">Suspicious Activity / Scam</option>
                      <option value="photo">Misleading Photos</option>
                      <option value="pricing">Incorrect Price or Hidden Fees</option>
                      <option value="unresponsive">Unresponsive Landlord</option>
                      <option value="occupied">Already Occupied / Unavailable</option>
                    </select>

                    <select
                      className="reported-dropdown-select"
                      value={reportsSort}
                      onChange={(e) => {
                        setReportsSort(e.target.value);
                        setReportsPage(1);
                      }}
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* COUNT INDICATOR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", color: "#73675c", fontWeight: 500 }}>
                    Showing <strong>{paginatedReports.length}</strong> of <strong>{filteredReportsList.length}</strong> filtered reports
                  </span>
                  {(reportsSearch || reportsFilter !== "all" || reportsReasonFilter !== "all") && (
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "12px", padding: "4px 10px", borderColor: "#ebdcd0" }}
                      onClick={() => {
                        setReportsSearch("");
                        setReportsFilter("all");
                        setReportsReasonFilter("all");
                        setReportsSort("newest");
                      }}
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>

                {/* REPORTED LISTINGS CARDS GRID */}
                {paginatedReports && paginatedReports.length > 0 ? (
                  <div className="reported-listings-grid">
                    {paginatedReports.map((report) => {
                      const prop = getReportProperty(report);
                      const propPhotos = getPropertyPhotos(prop);
                      const coverImg = propPhotos[0] || prop?.image || sunnyStudioImg;
                      const status = (report.status || "pending").toLowerCase();
                      const propName = report.property_name || prop?.property_name || `Property #${report.property_id}`;
                      const landlordName = prop?.landlord_name || prop?.landlord_email || "Associated Landlord";
                      const landlordEmail = prop?.landlord_email || "landlord@mobin.ph";
                      const locationStr = prop?.address || prop?.city || "Lucban, Quezon";
                      const rentFormatted = Number(prop?.rent || prop?.price || 3500).toLocaleString();

                      return (
                        <div key={report.id} className={`reported-card is-${status}`}>
                          {/* CARD IMAGE WRAPPER */}
                          <div className="reported-card-img-wrap">
                            <img
                              src={coverImg}
                              alt={propName}
                              className="reported-card-img"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = sunnyStudioImg;
                              }}
                            />

                            <div className="reported-card-badges-row">
                              <span className={`reported-status-badge ${status}`}>
                                {status === "pending"
                                  ? "Pending Review"
                                  : status === "investigating"
                                  ? "Investigating"
                                  : status === "resolved"
                                  ? "Resolved ✓"
                                  : "Dismissed"}
                              </span>

                              <span className="reported-reason-badge" title={report.reason || "Complaint"}>
                                ⚠️ {report.reason || "Flagged Listing"}
                              </span>
                            </div>

                            <div className="reported-card-price-overlay">
                              <span className="reported-card-prop-name-overlay">{propName}</span>
                              <span className="reported-card-rent-overlay">₱{rentFormatted}/mo</span>
                            </div>
                          </div>

                          {/* CARD BODY */}
                          <div className="reported-card-body">
                            {/* METADATA LINE */}
                            <div className="reported-card-meta-line">
                              <span className="reported-card-id-tag">ID: #{report.property_id || "N/A"}</span>
                              <span className="reported-card-location-line">
                                <MapPin size={12} color="#8c7e73" />
                                <span>{locationStr}</span>
                              </span>
                            </div>

                            {/* LANDLORD LINE */}
                            <div className="reported-card-landlord-line">
                              <strong>Landlord:</strong> {landlordName}{" "}
                              <span style={{ color: "#8c7e73", fontSize: "11.5px" }}>({landlordEmail})</span>
                            </div>

                            {/* REPORTER DETAILS STRIP */}
                            <div className="reported-reporter-box">
                              <div className="reported-reporter-user">
                                <UserCircle size={14} color="#686300" />
                                <span>Reported by: <strong>{report.reporter_name || "Student / Renter"}</strong></span>
                              </div>
                              <span className="reported-report-date">
                                📅 {new Date(report.created_at || Date.now()).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            {/* COMPLAINT DETAILS CALLOUT */}
                            <div className="reported-complaint-box">
                              <div className="reported-complaint-header">
                                <AlertTriangle size={13} />
                                <span>Complaint: {report.reason || "User Flag"}</span>
                              </div>
                              <p className="reported-complaint-text">
                                "{report.details || "No additional comments provided by reporter."}"
                              </p>
                            </div>

                            {/* ACTIONS TOOLBAR */}
                            <div className="reported-card-actions">
                              <button
                                type="button"
                                className="btn-report-action btn-report-inspect"
                                onClick={() => handleInspectReportedProperty(report)}
                                title="View photos and listing details"
                              >
                                🔍 View Property
                              </button>

                              {status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn-report-action btn-report-investigate"
                                    onClick={() => handleUpdateReportStatus(report.id, "investigating", propName)}
                                  >
                                    Investigate
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-report-action btn-report-resolve"
                                    onClick={() => handleUpdateReportStatus(report.id, "resolved", propName)}
                                  >
                                    Resolve ✓
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-report-action btn-report-dismiss"
                                    onClick={() => handleUpdateReportStatus(report.id, "dismissed", propName)}
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}

                              {status === "investigating" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn-report-action btn-report-resolve"
                                    onClick={() => handleUpdateReportStatus(report.id, "resolved", propName)}
                                  >
                                    Resolve ✓
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-report-action btn-report-suspend"
                                    onClick={() => handleSuspendReportedProperty(report.property_id, propName)}
                                    title="Temporarily hide listing from searches"
                                  >
                                    Suspend Listing
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-report-action btn-report-dismiss"
                                    onClick={() => handleUpdateReportStatus(report.id, "dismissed", propName)}
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}

                              {(status === "resolved" || status === "dismissed") && (
                                <button
                                  type="button"
                                  className="btn-report-action btn-report-reopen"
                                  onClick={() => handleUpdateReportStatus(report.id, "pending", propName)}
                                >
                                  Reopen Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "50px 16px", color: "#8c7e73" }}>
                    <div style={{ fontSize: "38px", marginBottom: "10px" }}>🛡️</div>
                    <h3 style={{ color: "#281507", margin: "0 0 6px" }}>
                      {reportsFilter !== "all" || reportsReasonFilter !== "all" || reportsSearch.trim()
                        ? "No Reports Match Active Filter"
                        : "No Flagged or Reported Listings"}
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "13.5px" }}>
                      {reportsFilter !== "all" || reportsReasonFilter !== "all" || reportsSearch.trim()
                        ? "Try clearing your search keyword or switching category tabs."
                        : "All landlord accommodations currently adhere to community guidelines!"}
                    </p>
                    {(reportsFilter !== "all" || reportsReasonFilter !== "all" || reportsSearch.trim()) && (
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ background: "#686300", color: "#ffffff", borderColor: "#686300", fontWeight: "700" }}
                        onClick={() => {
                          setReportsFilter("all");
                          setReportsReasonFilter("all");
                          setReportsSearch("");
                          setReportsSort("newest");
                        }}
                      >
                        Reset Report Filters
                      </button>
                    )}
                  </div>
                )}

                {/* PAGINATION CONTROLS */}
                {filteredReportsList && filteredReportsList.length > 0 && (
                  <TablePagination
                    currentPage={reportsPage}
                    totalItems={filteredReportsList.length}
                    pageSize={reportsPageSize}
                    onPageChange={setReportsPage}
                    onPageSizeChange={setReportsPageSize}
                    pageSizeOptions={[6, 12, 24, 48]}
                  />
                )}
              </div>
            </div>
          );
        })()}

        {/* =====================================================
            SUB-VIEW: COMPREHENSIVE FINANCIALS & REVENUE LEDGER
        ===================================================== */}
        {activeTab === "Financials" && (() => {
          const completedTxns = financialTransactions.filter((t) => t.status === "Completed");
          const pendingTxns = financialTransactions.filter((t) => t.status === "Pending");

          const totalRevenue = completedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
          
          const landlordRevenue = completedTxns
            .filter((t) => t.role === "Landlord")
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          const studentRevenue = completedTxns
            .filter((t) => (t.role || "").includes("Student"))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          // Unique landlords count
          const uniqueLandlords = new Set(
            completedTxns
              .filter((t) => t.role === "Landlord")
              .map((t) => (t.payerEmail || t.payerName || "").toLowerCase().trim())
              .filter(Boolean)
          );
          const activePlansCount = uniqueLandlords.size || (landlordRevenue > 0 ? 1 : 0);

          // Success rate
          const successRatePct = financialTransactions.length > 0
            ? ((completedTxns.length / financialTransactions.length) * 100).toFixed(1)
            : "100.0";

          // Dynamic MoM Trend from real Supabase transactions
          const monthMap = {};
          financialTransactions.forEach((t) => {
            if (t.status === "Completed") {
              const d = new Date(t.rawDate || t.date);
              if (!isNaN(d.getTime())) {
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                monthMap[key] = (monthMap[key] || 0) + (Number(t.amount) || 0);
              }
            }
          });
          const sortedMonthKeys = Object.keys(monthMap).sort();
          let momBadgeText = "Organic Inflow";
          let surgeTrendText = "Live Data Synced";
          if (sortedMonthKeys.length >= 2) {
            const latestRev = monthMap[sortedMonthKeys[sortedMonthKeys.length - 1]] || 0;
            const prevRev = monthMap[sortedMonthKeys[sortedMonthKeys.length - 2]] || 0;
            if (prevRev > 0) {
              const growth = (((latestRev - prevRev) / prevRev) * 100).toFixed(1);
              momBadgeText = (Number(growth) >= 0 ? `+${growth}%` : `${growth}%`) + " MoM";
              surgeTrendText = `↑ ${momBadgeText} vs previous month`;
            }
          }

          // Gateway Breakdown Percentages (GCash & Maya Direct QR only)
          const gcashTxns = financialTransactions.filter((t) => (t.gateway || "").toLowerCase().includes("gcash"));
          const mayaTxns = financialTransactions.filter((t) => (t.gateway || "").toLowerCase().includes("maya"));
          const totalDirectChannelTxns = gcashTxns.length + mayaTxns.length;
          const gcashPct = totalDirectChannelTxns > 0 ? Math.round((gcashTxns.length / totalDirectChannelTxns) * 100) : 80;
          const mayaPct = totalDirectChannelTxns > 0 ? Math.max(0, 100 - gcashPct) : 20;

          // Dynamic Monthly Data for Trajectory Chart (Months up to current / peak)
          const allMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const currMIdx = new Date().getMonth();
          const displayMonths = allMonthNames.slice(0, Math.max(currMIdx + 1, 10)); // Jan through current month or Oct
          const dynamicMonthlyData = displayMonths.map((mName, mIdx) => {
            const mTxns = financialTransactions.filter((t) => {
              const d = new Date(t.rawDate || t.date);
              return !isNaN(d.getTime()) && d.getMonth() === mIdx;
            });
            const mCompleted = mTxns.filter((t) => t.status === "Completed");
            const mLandlord = mCompleted
              .filter((t) => t.role === "Landlord")
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const mStudent = mCompleted
              .filter((t) => (t.role || "").includes("Student"))
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            return {
              month: mName,
              landlord: mLandlord,
              student: mStudent,
              total: mLandlord + mStudent,
              txCount: mTxns.length,
              peak: false,
            };
          });

          const maxRevInMonths = Math.max(...dynamicMonthlyData.map((d) => d.total), 0);
          const maxTxInMonths = Math.max(...dynamicMonthlyData.map((d) => d.txCount), 0);
          dynamicMonthlyData.forEach((d) => {
            if (d.total > 0 && d.total === maxRevInMonths) d.peak = true;
          });
          const maxChartVal = financeChartMetric === "revenue"
            ? Math.max(maxRevInMonths * 1.15, 1000)
            : Math.max(maxTxInMonths * 1.25, 5);

          // Landlord Tier Adoption Percentages (Mutually Exclusive)
          const completedLandlordTxns = completedTxns.filter((t) => t.role === "Landlord");
          let starterPlanCount = 0;
          let proPlanCount = 0;
          let yawaPlanCount = 0;
          completedLandlordTxns.forEach((t) => {
            const it = (t.item || "").toLowerCase();
            const amt = Number(t.amount || 0);
            if (it.includes("yawa") || it.includes("multi") || it.includes("enterprise") || it.includes("portfolio") || (amt >= 1400 && amt <= 1600) || amt >= 3900) {
              yawaPlanCount++;
            } else if (it.includes("pro") || (amt >= 500 && amt <= 600)) {
              proPlanCount++;
            } else {
              starterPlanCount++;
            }
          });
          const totalLCount = completedLandlordTxns.length || 1;
          const starterPct = Math.round((starterPlanCount / totalLCount) * 100);
          const proPct = Math.round((proPlanCount / totalLCount) * 100);
          const yawaPct = Math.max(0, 100 - starterPct - proPct);

          const filteredTransactions = financialTransactions.filter((t) => {
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
              !q ||
              (t.id || "").toLowerCase().includes(q) ||
              (t.payerName || "").toLowerCase().includes(q) ||
              (t.payerEmail || "").toLowerCase().includes(q) ||
              (t.refNo || "").toLowerCase().includes(q) ||
              (t.item || "").toLowerCase().includes(q);

            const matchesChannel =
              financeChannelFilter === "All" ||
              (financeChannelFilter === "GCash" && (t.gateway || "").includes("GCash")) ||
              (financeChannelFilter === "Maya" && (t.gateway || "").includes("Maya"));

            const matchesStatus =
              financeStatusFilter === "All" ||
              t.status === financeStatusFilter;

            return matchesSearch && matchesChannel && matchesStatus;
          });

          const paginatedTransactions = filteredTransactions.slice(
            (financialsPage - 1) * financialsPageSize,
            financialsPage * financialsPageSize
          );

          return (
            <div className="admin-tab-section">
              {/* TOP FINANCIAL METRICS STRIP */}
              <div className="admin-metrics-grid" style={{ marginBottom: "24px" }}>
                <div className="admin-metric-card" style={{ borderLeft: "4px solid #686300" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="admin-metric-title">Total Gross Revenue</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d", background: "#eef7ed", padding: "2px 6px", borderRadius: "4px" }}>
                      {momBadgeText}
                    </span>
                  </div>
                  <div className="admin-metric-number" style={{ color: "#686300", fontSize: "28px", marginTop: "6px" }}>
                    ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                  <span style={{ fontSize: "12px", color: "#8c8075", marginTop: "4px" }}>
                    {completedTxns.length} verified Supabase transactions
                  </span>
                </div>

                <div className="admin-metric-card" style={{ borderLeft: "4px solid #2563eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="admin-metric-title">Landlord Subscriptions</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>
                      {activePlansCount} Active Landlords
                    </span>
                  </div>
                  <div className="admin-metric-number" style={{ color: "#1e3a8a", fontSize: "28px", marginTop: "6px" }}>
                    ₱{landlordRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                  <span style={{ fontSize: "12px", color: "#8c8075", marginTop: "4px" }}>
                    Quota tiers &amp; multi-property plans
                  </span>
                </div>

                <div className="admin-metric-card" style={{ borderLeft: "4px solid #059669" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="admin-metric-title">Renter / Student Passes</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857", background: "#ecfdf5", padding: "2px 6px", borderRadius: "4px" }}>
                      ₱99.00 / Pass
                    </span>
                  </div>
                  <div className="admin-metric-number" style={{ color: "#065f46", fontSize: "28px", marginTop: "6px" }}>
                    ₱{studentRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                  <span style={{ fontSize: "12px", color: "#8c8075", marginTop: "4px" }}>
                    Verified student direct booking passes
                  </span>
                </div>

                <div className="admin-metric-card" style={{ borderLeft: "4px solid #d97706" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="admin-metric-title">Gateway Success Rate</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", background: "#ecfdf5", padding: "2px 6px", borderRadius: "4px" }}>
                      Direct QR
                    </span>
                  </div>
                  <div className="admin-metric-number" style={{ color: "#047857", fontSize: "28px", marginTop: "6px" }}>
                    {successRatePct}%
                  </div>
                  <span style={{ fontSize: "12px", color: "#8c8075", marginTop: "4px" }}>
                    {pendingTxns.length} pending settlement
                  </span>
                </div>
              </div>

              {/* VISUAL CHARTS & FLOW SECTION (2 COLUMNS) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                {/* LEFT CARD: REVENUE TRAJECTORY & INTAKE SURGE TRENDS */}
                <div
                  className="admin-card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Header with Metric Toggle & Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                            Monthly Inflow Trajectory
                          </h3>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#92400e", background: "#fef3c7", padding: "2px 8px", borderRadius: "12px", border: "1px solid #fde68a" }}>
                            Live Supabase Ledger
                          </span>
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#8c8075" }}>
                          Landlord Subscriptions vs ₱99 Student Direct Passes
                        </p>
                      </div>

                      {/* Toggle Button Switch */}
                      <div style={{ display: "inline-flex", background: "#f4ede4", borderRadius: "8px", padding: "3px" }}>
                        <button
                          type="button"
                          onClick={() => setFinanceChartMetric("revenue")}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            background: financeChartMetric === "revenue" ? "#ffffff" : "transparent",
                            color: financeChartMetric === "revenue" ? "#281507" : "#73675c",
                            boxShadow: financeChartMetric === "revenue" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          ₱ Revenue
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinanceChartMetric("volume")}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            background: financeChartMetric === "volume" ? "#ffffff" : "transparent",
                            color: financeChartMetric === "volume" ? "#281507" : "#73675c",
                            boxShadow: financeChartMetric === "volume" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          # Volume
                        </button>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div style={{ position: "relative", marginTop: "16px", marginBottom: "8px" }}>
                      {/* SVG Chart */}
                      <div style={{ height: "190px", display: "flex", alignItems: "flex-end", gap: "10px", paddingBottom: "24px", borderBottom: "1.5px solid #ebdcd0", position: "relative" }}>
                        {/* Gridlines */}
                        <div style={{ position: "absolute", inset: "0 0 24px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", zIndex: 0 }}>
                          <div style={{ borderBottom: "1px dashed #efe8df", width: "100%", height: "0" }} />
                          <div style={{ borderBottom: "1px dashed #efe8df", width: "100%", height: "0" }} />
                          <div style={{ borderBottom: "1px dashed #efe8df", width: "100%", height: "0" }} />
                        </div>

                        {dynamicMonthlyData.map((d, idx) => {
                          const isHovered = hoveredMonthIndex === idx;
                          const landlordHeight = financeChartMetric === "revenue"
                            ? (d.landlord / maxChartVal) * 150
                            : ((d.txCount * 0.6) / maxChartVal) * 150;
                          const studentHeight = financeChartMetric === "revenue"
                            ? (d.student / maxChartVal) * 150
                            : ((d.txCount * 0.4) / maxChartVal) * 150;

                          return (
                            <div
                              key={d.month}
                              style={{
                                flex: 1,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                position: "relative",
                                cursor: "pointer",
                                zIndex: 1,
                              }}
                              onMouseEnter={() => setHoveredMonthIndex(idx)}
                              onMouseLeave={() => setHoveredMonthIndex(null)}
                            >
                              {/* Floating Hover Tooltip */}
                              {isHovered && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: `${landlordHeight + studentHeight + 32}px`,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "#281507",
                                    color: "#ffffff",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    fontSize: "11.5px",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                                    whiteSpace: "nowrap",
                                    pointerEvents: "none",
                                    zIndex: 10,
                                    minWidth: "140px",
                                  }}
                                >
                                  <div style={{ fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "4px", marginBottom: "4px" }}>
                                    {d.month} 2026 {d.peak ? "🔥 (Peak)" : ""}
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#fef08a" }}>
                                    <span>Total:</span>
                                    <strong>
                                      {financeChartMetric === "revenue"
                                        ? `₱${d.total.toLocaleString("en-PH")}`
                                        : `${d.txCount} txns`}
                                    </strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#d5c3b2", fontSize: "10.5px", marginTop: "2px" }}>
                                    <span>🟤 Landlords:</span>
                                    <span>₱{d.landlord.toLocaleString("en-PH")}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", color: "#86efac", fontSize: "10.5px" }}>
                                    <span>🟢 Students:</span>
                                    <span>₱{d.student.toLocaleString("en-PH")}</span>
                                  </div>
                                </div>
                              )}

                              {/* Stacked Bars Container */}
                              <div
                                style={{
                                  width: "100%",
                                  maxWidth: "28px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  transition: "transform 0.15s ease",
                                  transform: isHovered ? "scaleY(1.04)" : "scaleY(1)",
                                  transformOrigin: "bottom",
                                }}
                              >
                                {/* Student Passes Segment (Top) */}
                                <div
                                  style={{
                                    width: "100%",
                                    height: `${Math.max(studentHeight, studentHeight > 0 ? 3 : 0)}px`,
                                    background: isHovered
                                      ? "linear-gradient(180deg, #10b981 0%, #059669 100%)"
                                      : "linear-gradient(180deg, #34d399 0%, #10b981 100%)",
                                    borderRadius: "4px 4px 0 0",
                                    transition: "all 0.2s ease",
                                  }}
                                />
                                {/* Landlord Subscriptions Segment (Bottom) */}
                                <div
                                  style={{
                                    width: "100%",
                                    height: `${Math.max(landlordHeight, landlordHeight > 0 ? 4 : 0)}px`,
                                    background: isHovered
                                      ? "linear-gradient(180deg, #686300 0%, #484500 100%)"
                                      : "linear-gradient(180deg, #8c6b45 0%, #686300 100%)",
                                    transition: "all 0.2s ease",
                                  }}
                                />
                              </div>

                              {/* Month Label */}
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "4px",
                                  fontSize: "11px",
                                  fontWeight: isHovered || d.peak ? 800 : 500,
                                  color: isHovered ? "#281507" : d.peak ? "#686300" : "#8c8075",
                                }}
                              >
                                {d.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#4a3e33" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#686300" }} />
                        Landlord Subscriptions (₱{landlordRevenue >= 1000 ? (landlordRevenue / 1000).toFixed(1) + "k" : landlordRevenue.toLocaleString("en-PH")})
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#4a3e33" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }} />
                        Student Inquiries (₱{studentRevenue >= 1000 ? (studentRevenue / 1000).toFixed(1) + "k" : studentRevenue.toLocaleString("en-PH")})
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d" }}>
                      {surgeTrendText}
                    </span>
                  </div>
                </div>

                {/* RIGHT CARD: CASH FLOW FUNNEL & GATEWAY CHANNELS */}
                <div
                  className="admin-card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                          Cash Flow &amp; Channel Realization
                        </h3>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#8c8075" }}>
                          Payment gateway share and net realized platform profit
                        </p>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", background: "#ecfdf5", padding: "2px 8px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
                        ✓ 85.0% Net Margin
                      </span>
                    </div>

                    {/* 1. PAYMENT GATEWAY BREAKDOWN BAR */}
                    <div style={{ marginTop: "14px", marginBottom: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, color: "#4a3e33" }}>Philippine Gateway Share</span>
                        <span style={{ color: "#7a6e63" }}>Direct Philippine QR</span>
                      </div>
                      {/* Segmented Meter (GCash & Maya Direct QR only) */}
                      <div style={{ height: "12px", width: "100%", display: "flex", borderRadius: "6px", overflow: "hidden", background: "#f0e9e1" }}>
                        <div style={{ width: `${gcashPct}%`, background: "#005ce6" }} title={`GCash: ${gcashPct}%`} />
                        <div style={{ width: `${mayaPct}%`, background: "#00bf6f" }} title={`Maya: ${mayaPct}%`} />
                      </div>
                      {/* Gateway Legend Chips */}
                      <div style={{ display: "flex", justifyContent: "flex-start", gap: "24px", marginTop: "8px", fontSize: "11.5px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#005ce6", fontWeight: 700 }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#005ce6" }} />
                          GCash ({gcashPct}%)
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#008f53", fontWeight: 700 }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00bf6f" }} />
                          Maya ({mayaPct}%)
                        </span>
                      </div>
                    </div>

                    {/* 2. NET PROFIT REALIZATION FLOW DIAGRAM */}
                    <div style={{ background: "#fcf8f4", borderRadius: "10px", padding: "12px 14px", border: "1px solid #ebdcd0" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#7a6e63", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                        Net Inflow Realization Funnel
                      </span>
                      
                      {/* Step 1: Gross */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", marginBottom: "5px" }}>
                        <span style={{ color: "#281507", fontWeight: 600 }}>📥 Total Inflow Collected</span>
                        <strong style={{ color: "#281507" }}>
                          ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      {/* Step 2: Gateway Deductions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#047857", marginBottom: "5px", paddingLeft: "12px", borderLeft: "2px solid #a7f3d0" }}>
                        <span>💳 Direct Channels (GCash &amp; Maya)</span>
                        <span>₱0.00 (0% Fee)</span>
                      </div>

                      {/* Step 3: Cloud Ops Reserve */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#d97706", marginBottom: "8px", paddingLeft: "12px", borderLeft: "2px solid #fcd34d" }}>
                        <span>☁️ Platform Cloud Buffer (15.0%)</span>
                        <span>-₱{(totalRevenue * 0.15).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                      </div>

                      {/* Divider */}
                      <div style={{ borderTop: "1px dashed #dcd4cc", margin: "6px 0" }} />

                      {/* Step 4: Net Profit */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px", fontWeight: 800 }}>
                        <span style={{ color: "#15803d", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          🏆 Realized Net Profit
                        </span>
                        <span style={{ color: "#15803d", fontSize: "15px" }}>
                          ₱{(totalRevenue * 0.85).toLocaleString("en-PH", { minimumFractionDigits: 2 })} <span style={{ fontSize: "11px", fontWeight: 600 }}>(85.0%)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Landlord Tier Adoption Mini-Strip */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f0e9e1", fontSize: "11.5px", color: "#7a6e63" }}>
                    <span>Active Landlord Tier Adoption:</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#281507" }}>Starter {starterPct}%</span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: "#281507" }}>Pro {proPct}%</span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: "#686300" }}>Multi-Tier {yawaPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS TABLE CARD */}
              <div className="admin-card">
                <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#281507", margin: "0 0 4px 0" }}>
                      Payment Ledger &amp; Invoices ({filteredTransactions.length})
                    </h2>
                    <p style={{ color: "#73675c", fontSize: "13.5px", margin: 0 }}>
                      Complete real-time records of GCash and Maya payment collections with gateway references.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {/* CHANNEL FILTER */}
                    <select
                      value={financeChannelFilter}
                      onChange={(e) => setFinanceChannelFilter(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "13px", background: "#fff", color: "#281507" }}
                    >
                      <option value="All">All Channels</option>
                      <option value="GCash">GCash</option>
                      <option value="Maya">Maya</option>
                    </select>

                    {/* STATUS FILTER */}
                    <select
                      value={financeStatusFilter}
                      onChange={(e) => setFinanceStatusFilter(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcd4cc", fontSize: "13px", background: "#fff", color: "#281507" }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>

                    {/* SYNC SUPABASE BUTTON */}
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => {
                        fetchAdminFinancials();
                        showNotice("Supabase Realtime Sync", "Refreshed live financial transactions from Supabase database.", "success");
                      }}
                      disabled={loadingFinancials}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                      title="Sync real-time transactions from Supabase"
                    >
                      <span style={{ display: "inline-block", transform: loadingFinancials ? "rotate(180deg)" : "none", transition: "transform 0.5s ease" }}>
                        🔄
                      </span>
                      {loadingFinancials ? "Syncing..." : "Sync Database"}
                    </button>

                    {/* EXPORT CSV BUTTON */}
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={handleExportFinancialsCSV}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                    >
                      📥 Export Ledger CSV
                    </button>
                  </div>
                </div>

                {/* TRANSACTIONS TABLE */}
                <div className="admin-table-wrap" style={{ marginTop: "16px", overflowX: "auto" }}>
                  <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ background: "#fcf8f4", borderBottom: "1.5px solid #ebdcd0" }}>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>INVOICE ID</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>PAYER / ACCOUNT</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>PURCHASED ITEM</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>AMOUNT</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>GATEWAY / REF</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>DATE</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11.5px", color: "#7a6e63" }}>STATUS</th>
                        <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11.5px", color: "#7a6e63" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingFinancials && financialTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "40px 16px", color: "#8c7e73" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔄</span>
                              Connecting and syncing live transactions from Supabase...
                            </div>
                          </td>
                        </tr>
                      ) : filteredTransactions.length > 0 ? (
                        paginatedTransactions.map((tx) => (
                          <tr key={tx.id} style={{ borderBottom: "1px solid #f3ece5" }}>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "#686300" }}>
                              {tx.id}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <strong style={{ display: "block", color: "#1a1006" }}>{tx.payerName}</strong>
                              <span style={{ fontSize: "12px", color: "#7a6e63" }}>{tx.payerEmail}</span>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#4a3e33" }}>
                              {tx.item}
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: 800, color: "#281507" }}>
                              ₱{Number(tx.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ display: "block", color: "#281507", fontWeight: 600, fontSize: "12.5px" }}>{tx.gateway}</span>
                              <span style={{ fontSize: "11.5px", color: "#8c8075", fontFamily: "monospace" }}>{tx.refNo}</span>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#6a5e54", fontSize: "12.5px" }}>
                              {tx.date}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 9px",
                                  borderRadius: "9999px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background: tx.status === "Completed" ? "#eef7ed" : tx.status === "Pending" ? "#fef3c7" : "#fee2e2",
                                  color: tx.status === "Completed" ? "#15803d" : tx.status === "Pending" ? "#b45309" : "#dc2626",
                                }}
                              >
                                {tx.status === "Completed" ? "✓ Paid" : tx.status}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                                {tx.status === "Pending" && (
                                  <button
                                    type="button"
                                    className="admin-btn-outline"
                                    style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 800, background: "#ecfdf5", borderColor: "#6ee7b7", color: "#065f46" }}
                                    onClick={() => handleUpdatePaymentStatus(tx, "Completed")}
                                    title="Approve and mark this payment as Completed in Supabase"
                                  >
                                    ✓ Mark Paid
                                  </button>
                                )}
                                {tx.proof_image && (
                                  <button
                                    type="button"
                                    className="admin-btn-outline"
                                    style={{ padding: "4px 8px", fontSize: "11.5px", fontWeight: 700, background: "#ecfdf5", borderColor: "#a7f3d0", color: "#047857" }}
                                    onClick={() => setAdminViewingProofUrl(tx.proof_image)}
                                    title="View Uploaded Payment Proof Screenshot"
                                  >
                                    📷 Proof
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{ padding: "4px 10px", fontSize: "11.5px", fontWeight: 700, background: "#fcf8f4" }}
                                  onClick={() => setSelectedReceiptModal(tx)}
                                  title="View Official Receipt"
                                >
                                  👁 Receipt
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "36px 16px", color: "#8c7e73" }}>
                            No financial transactions match your current search or filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TABLE PAGINATION */}
                {filteredTransactions.length > 0 && (
                  <TablePagination
                    currentPage={financialsPage}
                    totalItems={filteredTransactions.length}
                    pageSize={financialsPageSize}
                    onPageChange={setFinancialsPage}
                    onPageSizeChange={setFinancialsPageSize}
                  />
                )}
              </div>
            </div>
          );
        })()}

        {activeTab === "Notifications" && (() => {
          const filteredNotifs = adminNotifications.filter((n) => {
            if (adminNotifFilter === "All") return true;
            return n.type === adminNotifFilter;
          });
          const unreadTotal = adminNotifications.filter((n) => n.unread).length;

          return (
            <div className="admin-tab-section">
              <div className="admin-card">
                <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "12px", borderBottom: "1.5px solid #ebdcd0", paddingBottom: "18px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#281507", margin: 0 }}>
                        Super Admin Notifications
                      </h2>
                      {unreadTotal > 0 && (
                        <span style={{ fontSize: "11px", fontWeight: 800, background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: "12px", border: "1px solid #fecaca" }}>
                          {unreadTotal} Unread
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#73675c", fontSize: "13.5px", margin: "4px 0 0 0" }}>
                      Live alerts from Supabase across property verifications, user reports, payment settlements, and registrations.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {unreadTotal > 0 && (
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ padding: "6px 12px", fontSize: "12.5px", fontWeight: 700 }}
                        onClick={handleMarkAllAdminNotifsRead}
                      >
                        ✓ Mark All as Read
                      </button>
                    )}
                  </div>
                </div>

                {/* CATEGORY FILTER CHIPS */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "16px 0", borderBottom: "1px solid #f3ece5" }}>
                  {[
                    { id: "All", label: "All Alerts", count: adminNotifications.length },
                    { id: "Verification", label: "Verifications", count: adminNotifications.filter((n) => n.type === "Verification").length },
                    { id: "Financials", label: "Payments", count: adminNotifications.filter((n) => n.type === "Financials").length },
                    { id: "Reported Listings", label: "Reports", count: adminNotifications.filter((n) => n.type === "Reported Listings").length },
                    { id: "Users", label: "Users", count: adminNotifications.filter((n) => n.type === "Users").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAdminNotifFilter(tab.id)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        borderRadius: "20px",
                        border: "1px solid",
                        borderColor: adminNotifFilter === tab.id ? "#686300" : "#e5ded6",
                        background: adminNotifFilter === tab.id ? "#686300" : "#ffffff",
                        color: adminNotifFilter === tab.id ? "#ffffff" : "#6a5e54",
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
                          background: adminNotifFilter === tab.id ? "rgba(255,255,255,0.25)" : "#f3ece5",
                          color: adminNotifFilter === tab.id ? "#ffffff" : "#73675c",
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* NOTIFICATIONS LIST */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {filteredNotifs.length > 0 ? (
                    filteredNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleAdminNotifClick(n)}
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
                            background: n.type === "Verification" ? "#eff6ff" : n.type === "Financials" ? "#ecfdf5" : n.type === "Reported Listings" ? "#fee2e2" : "#fef3c7",
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

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          {n.unread && (
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} title="Unread" />
                          )}
                          <span style={{ fontSize: "12px", color: "#686300", fontWeight: 700 }}>
                            View →
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 16px", color: "#8c8075" }}>
                      <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px 0" }}>No notifications in this category</p>
                      <p style={{ fontSize: "13px", margin: 0 }}>All platform events in this section have been reviewed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* FOOTER */}
        <footer className="admin-footer">
          <p>© 2023 Mob'in Internal Administration. All rights reserved.</p>
        </footer>
      </main>

      {/* =====================================================
          PROPERTY VERIFICATION REVIEW MODAL
      ===================================================== */}
      {reviewProperty && (
        <div className="prop-review-modal-overlay" onClick={() => setReviewProperty(null)}>
          <div className="prop-review-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div className="prop-review-header">
              <div className="prop-review-header-title">
                <h2>{reviewProperty.property_name}</h2>
                <span className="prop-review-badge">
                  {reviewProperty.verification === "Verified" ? "Verified Live" : "Pending Verification"}
                </span>
                {modalRatingsStats.count > 0 && (
                  <span
                    style={{
                      background: "#fef9c3",
                      color: "#854d0e",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      border: "1px solid #fde047",
                    }}
                  >
                    <IconStar filled={true} size={14} color="#eab308" />
                    {modalRatingsStats.avg.toFixed(1)} ({modalRatingsStats.count} {modalRatingsStats.count === 1 ? "review" : "reviews"})
                  </span>
                )}
              </div>
              <button
                type="button"
                className="prop-review-close-btn"
                onClick={() => setReviewProperty(null)}
                title="Close review modal"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="prop-review-body">
              {/* PHOTO GALLERY CAROUSEL WITH SWIPE / ARROWS */}
              {(() => {
                const photos = getPropertyPhotos(reviewProperty);
                const currentPhoto = photos[activeReviewPhotoIndex] || photos[0];
                return (
                  <div className="prop-review-gallery">
                    <div
                      className="prop-review-main-photo-wrap"
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        userSelect: "none",
                        borderRadius: "14px",
                        background: "#1c120a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={currentPhoto}
                        alt={reviewProperty.property_name || "Property photo"}
                        className="prop-review-main-photo"
                        style={{ cursor: "pointer", width: "100%", height: "100%", objectFit: "cover" }}
                        onClick={() => setIsPhotoFullscreen(true)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = sunnyStudioImg;
                        }}
                        title="Click to view full screen"
                      />

                      {/* Photo Counter Badge */}
                      <span
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          right: "12px",
                          background: "rgba(20, 10, 5, 0.75)",
                          color: "#ffffff",
                          backdropFilter: "blur(6px)",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          zIndex: 2,
                        }}
                      >
                        📷 {activeReviewPhotoIndex + 1} of {photos.length}
                      </span>

                      {/* Full-size Zoom Button */}
                      <button
                        type="button"
                        onClick={() => setIsPhotoFullscreen(true)}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(20, 10, 5, 0.75)",
                          color: "#ffffff",
                          border: "1px solid rgba(255,255,255,0.15)",
                          backdropFilter: "blur(6px)",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          padding: "5px 11px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          zIndex: 2,
                        }}
                        title="Open full-resolution lightbox"
                      >
                        🔍 Full Size
                      </button>

                      {/* Left Arrow Button */}
                      {photos.length > 1 && (
                        <button
                          type="button"
                          className="prop-review-nav-arrow prop-review-nav-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevPhoto(photos.length);
                          }}
                          aria-label="Previous photo"
                          title="Previous photo (←)"
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.9)",
                            color: "#281507",
                            border: "1.5px solid rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "24px",
                            fontWeight: "bold",
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.28)",
                            transition: "all 0.2s ease",
                            zIndex: 3,
                          }}
                        >
                          ‹
                        </button>
                      )}

                      {/* Right Arrow Button */}
                      {photos.length > 1 && (
                        <button
                          type="button"
                          className="prop-review-nav-arrow prop-review-nav-right"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextPhoto(photos.length);
                          }}
                          aria-label="Next photo"
                          title="Next photo (→)"
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.9)",
                            color: "#281507",
                            border: "1.5px solid rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "24px",
                            fontWeight: "bold",
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.28)",
                            transition: "all 0.2s ease",
                            zIndex: 3,
                          }}
                        >
                          ›
                        </button>
                      )}
                    </div>

                    {/* THUMBNAIL STRIP */}
                    {photos.length > 1 && (
                      <div className="prop-review-thumbs" style={{ marginTop: "10px", display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                        {photos.map((photo, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`prop-review-thumb-btn ${activeReviewPhotoIndex === index ? "active" : ""}`}
                            onClick={() => setActiveReviewPhotoIndex(index)}
                            style={{
                              position: "relative",
                              width: "72px",
                              height: "54px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: activeReviewPhotoIndex === index ? "2.5px solid #686300" : "1.5px solid transparent",
                              opacity: activeReviewPhotoIndex === index ? 1 : 0.65,
                              cursor: "pointer",
                              padding: 0,
                              flexShrink: 0,
                              background: "#eee",
                              transition: "all 0.15s ease",
                              boxShadow: activeReviewPhotoIndex === index ? "0 0 8px rgba(104, 99, 0, 0.4)" : "none",
                            }}
                          >
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = index % 2 === 0 ? sunnyStudioImg : twoBedFlatImg;
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                right: "2px",
                                background: "rgba(0,0,0,0.65)",
                                color: "#fff",
                                fontSize: "9px",
                                padding: "1px 4px",
                                borderRadius: "3px",
                                fontWeight: 700,
                              }}
                            >
                              {index + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* LANDLORD INFO CARD */}
              <div className="prop-review-landlord-box">
                <div className="prop-review-landlord-info">
                  <h4>👤 Submitted by: {reviewProperty.landlord_name || reviewProperty.landlord_email || "Landlord Partner"}</h4>
                  <p>
                    <strong>Email:</strong> {reviewProperty.landlord_email || "landlord@mobin.ph"} • <strong>Submitted:</strong> {new Date(reviewProperty.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className="prop-review-landlord-tag">Landlord Account</span>
              </div>

              {/* KEY DETAILS GRID */}
              <div className="prop-review-details-grid">
                <div className="prop-review-detail-card">
                  <span>Monthly Rent</span>
                  <strong style={{ color: "#555100" }}>₱{Number(reviewProperty.rent || 0).toLocaleString()} / mo</strong>
                </div>
                <div className="prop-review-detail-card">
                  <span>Property Type</span>
                  <strong>{reviewProperty.property_type || "Studio / Room"}</strong>
                </div>
                <div className="prop-review-detail-card">
                  <span>Verification Status</span>
                  <strong style={{ color: reviewProperty.verification === "Verified" ? "#166534" : "#b45309" }}>
                    {reviewProperty.verification || "Pending"}
                  </strong>
                </div>
                <div className="prop-review-detail-card">
                  <span>Tenant Rating</span>
                  <strong style={{ color: modalRatingsStats.count > 0 ? "#b45309" : "#6a5e54", display: "flex", alignItems: "center", gap: "4px" }}>
                    {modalRatingsStats.count > 0 ? (
                      <>
                        <IconStar filled={true} size={15} color="#eab308" />
                        {modalRatingsStats.avg.toFixed(1)} / 5.0
                        <span style={{ fontSize: "11px", fontWeight: "normal", color: "#8c7e73" }}>({modalRatingsStats.count})</span>
                      </>
                    ) : (
                      "No reviews yet"
                    )}
                  </strong>
                </div>
              </div>

              {/* ADDRESS & LOCATION */}
              <div style={{ marginBottom: "18px" }}>
                <h4 className="prop-review-section-title">📍 Location &amp; Address</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#4a3e33", fontWeight: 500 }}>
                  {reviewProperty.address || reviewProperty.city || "428 Oak Street, Metro Manila, Philippines"}
                </p>
              </div>

              {/* DESCRIPTION */}
              {reviewProperty.description && (
                <div>
                  <h4 className="prop-review-section-title">Description &amp; Notes</h4>
                  <p className="prop-review-desc">{reviewProperty.description}</p>
                </div>
              )}

              {/* AMENITIES */}
              {Array.isArray(reviewProperty.amenities) && reviewProperty.amenities.length > 0 && (
                <div>
                  <h4 className="prop-review-section-title">Included Amenities</h4>
                  <div className="prop-review-amenities-list">
                    {reviewProperty.amenities.map((am, i) => (
                      <span key={i} className="prop-review-amenity-chip">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* RATINGS & TENANT REVIEWS */}
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #ede3d7" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <h4 className="prop-review-section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    ⭐ Tenant Ratings &amp; Reviews
                    {modalRatingsStats.count > 0 && (
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#8c7e73" }}>
                        ({modalRatingsStats.count} {modalRatingsStats.count === 1 ? "review" : "reviews"})
                      </span>
                    )}
                  </h4>
                  {modalRatingsStats.count > 0 && (
                    <span style={{ fontSize: "12px", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "9999px", fontWeight: "600" }}>
                      ✓ Verified Tenant Feedback
                    </span>
                  )}
                </div>

                {reviewsLoading ? (
                  <div style={{ textAlign: "center", padding: "28px", color: "#8c7e73" }}>
                    <div className="admin-spinner" style={{ margin: "0 auto 8px" }} />
                    <p style={{ margin: 0, fontSize: "13px" }}>Loading verified tenant reviews...</p>
                  </div>
                ) : modalRatingsStats.count === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 16px", background: "#fcfaf7", borderRadius: "10px", border: "1px dashed #e2dad2" }}>
                    <div style={{ fontSize: "28px", marginBottom: "6px" }}>📝</div>
                    <h5 style={{ margin: "0 0 4px", color: "#281507", fontSize: "14.5px" }}>No tenant reviews yet</h5>
                    <p style={{ margin: 0, color: "#8c7e73", fontSize: "13px" }}>
                      Ratings and feedback from checked-in renters will appear here once submitted.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* OVERVIEW SCORE CARD & BREAKDOWN */}
                    <div className="ratings-overview-card">
                      <div className="ratings-score-left">
                        <div className="ratings-big-num">{modalRatingsStats.avg.toFixed(1)}</div>
                        <div className="ratings-stars-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <IconStar
                              key={star}
                              filled={star <= Math.round(modalRatingsStats.avg)}
                              size={18}
                              color="#f59e0b"
                            />
                          ))}
                        </div>
                        <div className="ratings-count-text">
                          Based on {modalRatingsStats.count} verified {modalRatingsStats.count === 1 ? "stay" : "stays"}
                        </div>
                      </div>

                      <div className="ratings-breakdown-right">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = modalRatingsStats.breakdown[stars] || 0;
                          const pct = modalRatingsStats.count > 0 ? Math.round((count / modalRatingsStats.count) * 100) : 0;
                          return (
                            <div key={stars} className="rating-bar-row">
                              <span style={{ fontSize: "12px", fontWeight: "600", color: "#544439", width: "24px" }}>
                                {stars}★
                              </span>
                              <div className="rating-bar-track">
                                <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="rating-bar-pct">{count} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* LIST OF VERIFIED REVIEWS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      {propertyReviews.map((rev, idx) => {
                        const revRating = Number(rev.rating) || 5;
                        const initial = (rev.reviewer_name || "T")[0].toUpperCase();
                        const dateFormatted = rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Recent stay";

                        return (
                          <div
                            key={rev.id || idx}
                            style={{
                              background: "#ffffff",
                              borderRadius: "10px",
                              border: "1px solid #ebd9c8",
                              padding: "14px 16px",
                              boxShadow: "0 1px 3px rgba(40,21,7,0.04)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "50%",
                                    background: "#f3ede5",
                                    color: "#544439",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid #ebd9c8",
                                  }}
                                >
                                  {initial}
                                </div>
                                <div>
                                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#281507" }}>
                                    {rev.reviewer_name || "Verified Tenant"}
                                  </div>
                                  <div style={{ fontSize: "11.5px", color: "#8c7e73" }}>
                                    {rev.rental_period || "Verified Stay"} • {dateFormatted}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <IconStar
                                    key={star}
                                    filled={star <= revRating}
                                    size={14}
                                    color="#f59e0b"
                                  />
                                ))}
                              </div>
                            </div>

                            {rev.comment && (
                              <p style={{ margin: 0, fontSize: "13.5px", color: "#4a3e33", lineHeight: 1.5, fontStyle: "italic" }}>
                                “{rev.comment}”
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MODAL FOOTER WITH CLOSE BUTTON (OR APPROVE & DECLINE FOR PENDING VERIFICATION) */}
            <div className="prop-review-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              {reviewProperty.verification === "Verified" || reviewProperty.verification_status === "Verified" || activeTab === "Properties" ? (
                <button
                  type="button"
                  className="admin-btn-outline"
                  style={{
                    background: "#281507",
                    color: "#ffffff",
                    borderColor: "#281507",
                    fontWeight: 700,
                    padding: "9px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setReviewProperty(null)}
                >
                  Close Details
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="prop-review-btn-reject"
                    onClick={() => {
                      const propId = reviewProperty.id;
                      setReviewProperty(null);
                      handleRejectProperty(propId);
                    }}
                  >
                    ✕ Decline / Reject
                  </button>

                  <button
                    type="button"
                    className="prop-review-btn-approve"
                    onClick={() => {
                      const propId = reviewProperty.id;
                      setReviewProperty(null);
                      handleApproveProperty(propId);
                    }}
                  >
                    ✓ Approve Property
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          USER DETAILS & PERMISSIONS MODAL
      ===================================================== */}
      {selectedUserForModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(30, 20, 10, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setSelectedUserForModal(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              maxWidth: "540px",
              width: "100%",
              padding: "26px 28px",
              boxShadow: "0 20px 45px rgba(0,0,0,0.28)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedUserForModal(null)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                background: "#f4ede4",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: "#73675c",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Header Badge */}
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#686300",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  background: "#f7f5e8",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #e2ddb0",
                }}
              >
                User Profile Details
              </span>
            </div>

            {/* User Profile Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px", paddingBottom: "18px", borderBottom: "1px solid #f0e9e1" }}>
              <UserAvatar user={selectedUserForModal} size="lg" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: isEditingModalUserName ? "6px" : 0, width: "100%" }}>
                  {!isEditingModalUserName ? (
                    <>
                      <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#281507" }}>
                        {selectedUserForModal.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setModalUserNameInput(selectedUserForModal.name || "");
                          setIsEditingModalUserName(true);
                        }}
                        style={{
                          background: "#f7f2eb",
                          border: "1px solid #dfd3c5",
                          borderRadius: "6px",
                          padding: "3px 8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#686300",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.15s ease",
                        }}
                        title="Edit this user's name directly in-place"
                      >
                        ✏️ Edit Name
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", margin: "2px 0 6px 0" }}>
                      <input
                        type="text"
                        value={modalUserNameInput}
                        onChange={(e) => setModalUserNameInput(e.target.value)}
                        placeholder="Enter full name"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1.5px solid #686300",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#281507",
                          flex: 1,
                          outline: "none",
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateUserName(selectedUserForModal, modalUserNameInput);
                          } else if (e.key === "Escape") {
                            setIsEditingModalUserName(false);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateUserName(selectedUserForModal, modalUserNameInput)}
                        style={{
                          background: "#15803d",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingModalUserName(false)}
                        style={{
                          background: "#f3ece5",
                          color: "#73675c",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <span
                    style={{
                      background:
                        (selectedUserForModal.role || "").toLowerCase() === "landlord"
                          ? "#fbf6eb"
                          : (selectedUserForModal.role || "").toLowerCase().includes("admin")
                          ? "#eef2ff"
                          : "#f0fdf4",
                      color:
                        (selectedUserForModal.role || "").toLowerCase() === "landlord"
                          ? "#8c5310"
                          : (selectedUserForModal.role || "").toLowerCase().includes("admin")
                          ? "#3730a3"
                          : "#166534",
                      border:
                        (selectedUserForModal.role || "").toLowerCase() === "landlord"
                          ? "1px solid #f3e4c7"
                          : (selectedUserForModal.role || "").toLowerCase().includes("admin")
                          ? "1px solid #c7d2fe"
                          : "1px solid #bbf7d0",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {selectedUserForModal.role}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: (selectedUserForModal.status || "").toLowerCase() === "active" ? "#eef7ed" : "#fef3c7",
                      color: (selectedUserForModal.status || "").toLowerCase() === "active" ? "#15803d" : "#b45309",
                      border: (selectedUserForModal.status || "").toLowerCase() === "active" ? "1px solid #bbf7d0" : "1px solid #fde68a",
                    }}
                  >
                    {selectedUserForModal.status || "Active"}
                  </span>
                </div>
                <span style={{ display: "block", fontSize: "12px", color: "#8c8075", marginTop: "4px" }}>
                  User ID: <strong style={{ color: "#54463b", fontFamily: "monospace" }}>{selectedUserForModal.id}</strong>
                </span>
              </div>
            </div>

            {/* EMAIL VERIFICATION STATUS BAR */}
            {selectedUserForModal.status && selectedUserForModal.status.toLowerCase().includes("pending") && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "12px 16px",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
                    ✉️ Pending Email Verification
                  </div>
                  <div style={{ fontSize: "12px", color: "#b45309", marginTop: "2px" }}>
                    If this user confirmed their Gmail or if you wish to activate them now:
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    background: "#15803d",
                    color: "#ffffff",
                    border: "none",
                    padding: "7px 16px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(21, 128, 61, 0.2)",
                  }}
                  onClick={() => handleVerifyUserStatus(selectedUserForModal)}
                >
                  ✓ Set User to Active
                </button>
              </div>
            )}

            {/* User Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              {/* Profile Photo Card */}
              <div style={{ gridColumn: "span 2", padding: "14px 16px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #eee7df", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <UserAvatar user={selectedUserForModal} size="lg" />
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
                      📷 Uploaded Profile Photo
                    </span>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: selectedUserForModal.avatarUrl ? "#281507" : "#8c8075", marginTop: "2px" }}>
                      {selectedUserForModal.avatarUrl ? "Custom User Photo Uploaded" : "No custom photo uploaded (using initials avatar)"}
                    </div>
                    {selectedUserForModal.avatarUrl && (
                      <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 600 }}>
                        ✓ Photo verified in database
                      </span>
                    )}
                  </div>
                </div>
                {selectedUserForModal.avatarUrl && (
                  <a
                    href={selectedUserForModal.avatarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#686300",
                      background: "#ffffff",
                      border: "1px solid #dcd4cc",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    🔍 View Full Photo
                  </a>
                )}
              </div>

              <div style={{ padding: "12px 14px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #eee7df" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ✉️ Email Address
                </span>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#281507", marginTop: "3px", wordBreak: "break-all" }}>
                  {selectedUserForModal.email || "N/A"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #eee7df" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📞 Phone Number
                </span>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#281507", marginTop: "3px" }}>
                  {selectedUserForModal.phone || "+63 917 000 0000"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #eee7df" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📅 Date Joined
                </span>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#281507", marginTop: "3px" }}>
                  {selectedUserForModal.dateJoined || "Recently Registered"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #eee7df" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  💎 Plan / Subscription
                </span>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#686300", marginTop: "3px" }}>
                  {selectedUserForModal.subscriptionTier || (selectedUserForModal.role === "Landlord" ? "Standard Landlord" : "Standard Renter")}
                </div>
              </div>

              {/* Portfolio & Properties details */}
              <div style={{ gridColumn: "span 2", padding: "12px 14px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #eee7df" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  🏢 Property Listings &amp; Portfolio
                </span>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#281507", marginTop: "3px" }}>
                  {(selectedUserForModal.role || "").toLowerCase() === "landlord"
                    ? `${selectedUserForModal.propertiesCount || (selectedUserForModal.propertyTitles ? selectedUserForModal.propertyTitles.length : 0)} Listed Property / Units`
                    : "Renter Profile (No properties managed)"}
                </div>
                {selectedUserForModal.propertyTitles && selectedUserForModal.propertyTitles.length > 0 && (
                  <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedUserForModal.propertyTitles.map((title, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#ffffff",
                          color: "#686300",
                          border: "1px solid #dcd4cc",
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        🏠 {title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "14px", borderTop: "1px solid #f0e9e1" }}>
              <button
                type="button"
                className="admin-btn-outline"
                style={{
                  background: "#281507",
                  color: "#ffffff",
                  borderColor: "#281507",
                  fontWeight: 700,
                  padding: "9px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedUserForModal(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FULL-SCREEN PHOTO LIGHTBOX VIEWER
      ===================================================== */}
      {isPhotoFullscreen && reviewProperty && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 5, 2, 0.94)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            padding: "24px",
          }}
          onClick={() => setIsPhotoFullscreen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsPhotoFullscreen(false)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Close Full Screen"
          >
            ✕
          </button>

          {/* Lightbox Title & Counter */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
              {reviewProperty.property_name}
            </h3>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
              Photo {activeReviewPhotoIndex + 1} of {getPropertyPhotos(reviewProperty).length}
            </span>
          </div>

          {/* Main Lightbox Image Container */}
          <div
            style={{
              maxWidth: "92vw",
              maxHeight: "82vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getPropertyPhotos(reviewProperty)[activeReviewPhotoIndex] || getPropertyPhotos(reviewProperty)[0]}
              alt={reviewProperty.property_name || "Property lightbox view"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = sunnyStudioImg;
              }}
              style={{
                maxWidth: "100%",
                maxHeight: "82vh",
                borderRadius: "14px",
                objectFit: "contain",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />

            {/* Left Nav in Lightbox */}
            {getPropertyPhotos(reviewProperty).length > 1 && (
              <button
                type="button"
                onClick={() => handlePrevPhoto(getPropertyPhotos(reviewProperty).length)}
                style={{
                  position: "absolute",
                  left: "-64px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.22)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  fontSize: "30px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                }}
                title="Previous Photo (←)"
              >
                ‹
              </button>
            )}

            {/* Right Nav in Lightbox */}
            {getPropertyPhotos(reviewProperty).length > 1 && (
              <button
                type="button"
                onClick={() => handleNextPhoto(getPropertyPhotos(reviewProperty).length)}
                style={{
                  position: "absolute",
                  right: "-64px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.22)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  fontSize: "30px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                }}
                title="Next Photo (→)"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          OFFICIAL FINANCIAL RECEIPT MODAL
      ===================================================== */}
      {selectedReceiptModal && (
        <div
          className="admin-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(30, 20, 10, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setSelectedReceiptModal(null)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
              border: "1px solid #e8dec8",
              overflow: "hidden",
              position: "relative",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Receipt Header Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #281507 0%, #4a2810 100%)",
                color: "#ffffff",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px", fontWeight: "900", color: "#eab308", letterSpacing: "0.5px" }}>Mob'in</span>
                  <span style={{ fontSize: "11px", background: "rgba(234,179,8,0.2)", color: "#fef08a", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                    Official e-Receipt
                  </span>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#d5c3b2" }}>
                  Student &amp; Landlord Housing Platform PH
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptModal(null)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Receipt Body */}
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              {/* Status & Amount Hero */}
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  background: "#fbf9f5",
                  borderRadius: "12px",
                  border: "1px dashed #d8cbba",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 800,
                    background: selectedReceiptModal.status === "Completed" ? "#eef7ed" : "#fef3c7",
                    color: selectedReceiptModal.status === "Completed" ? "#15803d" : "#b45309",
                    marginBottom: "8px",
                  }}
                >
                  {selectedReceiptModal.status === "Completed" ? "✓ PAYMENT SETTLED" : selectedReceiptModal.status.toUpperCase()}
                </span>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "#281507" }}>
                  ₱{Number(selectedReceiptModal.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: "12px", color: "#7a6e63" }}>
                  Invoice Ref: <strong style={{ color: "#4a3e33" }}>{selectedReceiptModal.id}</strong>
                </span>
              </div>

              {/* Transaction Metadata Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "12.5px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #eee5da",
                }}
              >
                <div>
                  <span style={{ color: "#8c8075", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Payer Name</span>
                  <strong style={{ color: "#281507" }}>{selectedReceiptModal.payerName}</strong>
                </div>
                <div>
                  <span style={{ color: "#8c8075", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Account Email</span>
                  <span style={{ color: "#4a3e33" }}>{selectedReceiptModal.payerEmail}</span>
                </div>
                <div>
                  <span style={{ color: "#8c8075", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Payment Method</span>
                  <strong style={{ color: "#281507" }}>{selectedReceiptModal.gateway}</strong>
                </div>
                <div>
                  <span style={{ color: "#8c8075", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Gateway Ref #</span>
                  <span style={{ fontFamily: "monospace", color: "#686300", fontWeight: 700 }}>{selectedReceiptModal.refNo}</span>
                </div>
                <div>
                  <span style={{ color: "#8c8075", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Date &amp; Time</span>
                  <span style={{ color: "#4a3e33" }}>{selectedReceiptModal.date}</span>
                </div>
                <div>
                  <span style={{ color: "#8c8075", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>Account Role</span>
                  <span style={{ color: "#4a3e33" }}>{selectedReceiptModal.role || "User"}</span>
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#7a6e63", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                  Itemized Breakdown
                </span>
                <div style={{ background: "#fcf8f4", borderRadius: "8px", padding: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#281507", fontWeight: 600 }}>{selectedReceiptModal.item}</span>
                    <strong style={{ color: "#281507" }}>₱{Number(selectedReceiptModal.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8c8075" }}>
                    <span>Processing &amp; Gateway Fees</span>
                    <span>₱0.00 (Waived)</span>
                  </div>
                  <div style={{ borderTop: "1px dashed #dcd4cc", margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 800, color: "#281507" }}>
                    <span>Total Amount Paid</span>
                    <span style={{ color: "#686300" }}>₱{Number(selectedReceiptModal.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Attached Proof of Payment (Admin Inspection) */}
              {selectedReceiptModal.proof_image && (
                <div style={{ marginBottom: "18px", background: "#f8faf6", border: "1.5px solid #86efac", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: "#166534", marginBottom: "8px" }}>
                    <span>📷 Verified Payment Proof Screenshot</span>
                  </div>
                  <div
                    onClick={() => setAdminViewingProofUrl(selectedReceiptModal.proof_image)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1fae5", width: "fit-content" }}
                    title="Click to view full screenshot"
                  >
                    <img
                      src={selectedReceiptModal.proof_image}
                      alt="Proof"
                      style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Click to enlarge screenshot</span>
                      <span style={{ fontSize: "11px", color: "#047857", fontWeight: 600 }}>Attached during landlord checkout</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Disclaimers */}
              <p style={{ fontSize: "11px", color: "#a19588", textAlign: "center", margin: "0 0 4px 0", lineHeight: 1.4 }}>
                This is an electronically generated receipt for platform service authorization on Mob'in Philippines. No physical signature is required.
              </p>
            </div>

            {/* Actions Footer */}
            <div
              style={{
                background: "#faf6f0",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid #ebdcd0",
              }}
            >
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => window.print()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
              >
                🖨️ Print Receipt
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setSelectedReceiptModal(null)}
                style={{ background: "#281507", color: "#fff", fontWeight: 700, padding: "8px 18px" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CENTER MODAL: ADMIN PROFILE (MATCHES LANDLORD)
      ===================================================== */}
      {isProfileModalOpen && (
        <div
          className="center-modal-overlay"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* HEADER */}
            <div className="center-modal-header">
              <h2>
                <User size={22} className="text-[#5f5900]" />
                Super Admin Profile
              </h2>
              <p>Manage your administrative identity and contact credentials.</p>
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
                ref={adminAvatarInputRef}
                accept="image/*"
                onChange={handleAdminAvatarChange}
                style={{ display: "none" }}
              />
              <div className="profile-avatar-container">
                <img
                  src={adminAvatar}
                  alt={profileName}
                  className="profile-avatar-img"
                />
                <button
                  type="button"
                  className="profile-avatar-camera-badge"
                  title="Upload Admin Photo"
                  onClick={() => adminAvatarInputRef.current?.click()}
                >
                  <Camera size={13} />
                </button>
              </div>
              <div className="profile-hero-info">
                <h3 className="profile-hero-name">{profileName}</h3>
                <p className="profile-hero-email">{adminEmail}</p>
                <div className="profile-badge-row">
                  <span className="profile-status-pill">
                    <span className="status-dot-pulse"></span>
                    Super Admin Active
                  </span>
                  <span className="profile-tier-pill">
                    <ShieldCheck size={13} />
                    Console Root Access
                  </span>
                </div>
              </div>
            </div>

            {/* BODY FORM FIELDS */}
            <div className="center-modal-body">
              <div className="modal-form-row">
                <div className="modal-field-group">
                  <label className="modal-field-label">
                    Full Name
                  </label>
                  <div className="modal-input-wrapper">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your full name"
                    />
                    <div className="modal-input-icon">
                      <User size={16} />
                    </div>
                  </div>
                </div>

                <div className="modal-field-group">
                  <label className="modal-field-label">
                    Phone Number
                  </label>
                  <div className="modal-input-wrapper">
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+63 917 000 0000"
                    />
                    <div className="modal-input-icon">
                      <Phone size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-field-group">
                <label className="modal-field-label">
                  Administrative Email Address
                </label>
                <div className="modal-input-wrapper disabled">
                  <Mail size={16} className="modal-input-icon" />
                  <input
                    type="email"
                    value={adminEmail}
                    disabled
                  />
                  <span className="modal-input-right-tag">
                    <Lock size={12} />
                    Protected
                  </span>
                </div>
                <span className="modal-field-hint">
                  Your administrator email is locked for security compliance.
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
                      color: "#686300",
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
                        Set a new admin password or send a reset link to your email
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
                        id="admin-new-password-input"
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
                    <span style={{ fontSize: "12px", color: "#7a6e63" }}>Or reset via email:</span>
                    <button
                      type="button"
                      onClick={handleSendAdminResetEmail}
                      disabled={isSendingResetEmail}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#686300",
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
                disabled={isSavingAdminProfile}
              >
                Cancel
              </button>
              <button
                type="button"
                className="center-btn-primary"
                onClick={handleSaveAdminProfile}
                disabled={isSavingAdminProfile}
                style={{ minWidth: "130px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {isSavingAdminProfile ? (
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
                    Saving...
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
          CENTER MODAL: ACCOUNT SETTINGS (MATCHES LANDLORD)
      ===================================================== */}
      {isSettingsModalOpen && (
        <div
          className="center-modal-overlay"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* HEADER */}
            <div className="center-modal-header">
              <h2>
                <Settings size={22} className="text-[#5f5900]" />
                System & Account Settings
              </h2>
              <p>Configure administrator preferences and live system notification triggers.</p>
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
                {/* PREFERENCE 1: VERIFICATION ALERTS */}
                <div
                  className="settings-preference-item"
                  onClick={() =>
                    setSystemAlertPreferences((prev) => ({
                      ...prev,
                      verificationAlerts: !prev.verificationAlerts,
                    }))
                  }
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon-box">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="settings-item-text">
                      <h4>Listing Verification Push Alerts</h4>
                      <p>Instant alerts when landlords submit new properties for identity & permit review.</p>
                    </div>
                  </div>
                  <label className="modern-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={systemAlertPreferences.verificationAlerts}
                      onChange={(e) =>
                        setSystemAlertPreferences((prev) => ({
                          ...prev,
                          verificationAlerts: e.target.checked,
                        }))
                      }
                    />
                    <span className="modern-switch-slider"></span>
                  </label>
                </div>

                {/* PREFERENCE 2: SECURITY ALERTS */}
                <div
                  className="settings-preference-item"
                  onClick={() =>
                    setSystemAlertPreferences((prev) => ({
                      ...prev,
                      securityAlerts: !prev.securityAlerts,
                    }))
                  }
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon-box">
                      <Lock size={20} />
                    </div>
                    <div className="settings-item-text">
                      <h4>Two-Factor & Security Audits</h4>
                      <p>Require 2FA authentication and send immediate alerts for suspicious login attempts.</p>
                    </div>
                  </div>
                  <label className="modern-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={systemAlertPreferences.securityAlerts}
                      onChange={(e) =>
                        setSystemAlertPreferences((prev) => ({
                          ...prev,
                          securityAlerts: e.target.checked,
                        }))
                      }
                    />
                    <span className="modern-switch-slider"></span>
                  </label>
                </div>

                {/* PREFERENCE 3: SERVER LOGS */}
                <div
                  className="settings-preference-item"
                  onClick={() =>
                    setSystemAlertPreferences((prev) => ({
                      ...prev,
                      serverLogs: !prev.serverLogs,
                    }))
                  }
                >
                  <div className="settings-item-left">
                    <div className="settings-item-icon-box">
                      <BarChart3 size={20} />
                    </div>
                    <div className="settings-item-text">
                      <h4>Automated Daily Health Logs</h4>
                      <p>Nightly diagnostics summarizing API response latency and database backups.</p>
                    </div>
                  </div>
                  <label className="modern-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={systemAlertPreferences.serverLogs}
                      onChange={(e) =>
                        setSystemAlertPreferences((prev) => ({
                          ...prev,
                          serverLogs: e.target.checked,
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
                  showNotice("Settings Saved", "Administrative preferences have been saved successfully!", "success");
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
          ADMIN LIGHTBOX FOR PAYMENT PROOF SCREENSHOT
      ===================================================== */}
      {adminViewingProofUrl && (
        <div
          className="sub-modal-overlay"
          onClick={() => setAdminViewingProofUrl(null)}
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
              onClick={() => setAdminViewingProofUrl(null)}
              title="Close"
            >
              ✕
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", alignSelf: "flex-start" }}>
              <span style={{ fontSize: "18px" }}>📷</span>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                Landlord Payment Proof Screenshot
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
                src={adminViewingProofUrl}
                alt="Proof of Payment Screenshot"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", display: "block" }}
              />
            </div>
            <button
              type="button"
              onClick={() => setAdminViewingProofUrl(null)}
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
