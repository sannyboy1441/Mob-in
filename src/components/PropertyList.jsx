import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./PropertyList.css";
import CustomNoticeModal from "./CustomNoticeModal";
import sunnyStudioImg from "../assets/sunnystudio.jpg";
import twoBedFlatImg from "../assets/twobedflat.jpg";
import { filterPropertiesForUser } from "../lib/utils";

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#786c62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPending() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconStar({ filled = true }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconBed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f5900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f5900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f5900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconLock({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function getAvatarColor(name = "") {
  const colors = ["#5f5900", "#2563eb", "#16a34a", "#7c3aed", "#d97706", "#0284c7", "#ea580c"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatReviewDate(isoStr) {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (_) {
    return "Recently";
  }
}

function getReviewsMapForProperties(dbRows, propsList, user) {
  const result = {};
  if (!Array.isArray(propsList)) return result;

  propsList.forEach((p) => {
    result[p.id] = [];
  });

  const unassigned = [];

  // 1. Direct property_id matches (number or string, e.g. 13 === "13", prop-1 === 1)
  (dbRows || []).forEach((item) => {
    if (item.property_id != null) {
      const pIdStr = String(item.property_id);
      const matchedProp = propsList.find(
        (p) =>
          String(p.id) === pIdStr ||
          (String(p.id).startsWith("prop-") && String(p.id).replace("prop-", "") === pIdStr)
      );
      if (matchedProp) {
        result[matchedProp.id].push(item);
        return;
      }
    }
    // Match by exact property_name if review explicitly targets that property
    if (item.property_name) {
      const rName = item.property_name.trim().toLowerCase();
      const matchedProp = propsList.find(
        (p) => p.property_name && p.property_name.trim().toLowerCase() === rName
      );
      if (matchedProp) {
        result[matchedProp.id].push(item);
        return;
      }
    }
    unassigned.push(item);
  });

  // 2. Connect live rating data from Supabase for reviews where property_id is unassigned
  // Distribute strictly 1 distinct review per property of that landlord so ratings NEVER mix up!
  const byLandlord = {};
  unassigned.forEach((rev) => {
    const lName = (rev.landlord_name || "").trim().toLowerCase();
    if (!byLandlord[lName]) byLandlord[lName] = [];
    byLandlord[lName].push(rev);
  });

  Object.entries(byLandlord).forEach(([lName, revList]) => {
    const matchedProps = propsList.filter((p) => {
      const propLName = (
        p.landlord_name ||
        user?.user_metadata?.full_name ||
        user?.name ||
        ""
      ).trim().toLowerCase();
      const isDemo =
        user?.email === "landlord@mobin.ph" ||
        user?.id === "landlord-001" ||
        propLName.includes("beetle") ||
        propLName.includes("sarah");

      if (lName && propLName && (propLName === lName || propLName.includes(lName) || lName.includes(propLName))) {
        return true;
      }
      if (isDemo && (lName.includes("beetle") || lName.includes("sarah"))) {
        return true;
      }
      return false;
    });

    matchedProps.forEach((p, idx) => {
      if (result[p.id].length === 0 && revList[idx]) {
        result[p.id].push(revList[idx]);
      }
    });
  });

  // 3. Include local custom reviews saved specifically for that property
  propsList.forEach((p) => {
    try {
      const stored = JSON.parse(localStorage.getItem(`mobin_prop_reviews_${p.id}`) || "[]");
      if (Array.isArray(stored)) {
        stored.forEach((localRev) => {
          if (!result[p.id].some((r) => r.id === localRev.id)) {
            result[p.id].push(localRev);
          }
        });
      }
    } catch (_) {}
  });

  return result;
}

const DEFAULT_PROPERTIES = [
  {
    id: "prop-1",
    property_name: "Sunny Central Studio",
    property_type: "Studio",
    location: "Quezon City",
    rent: 15000,
    status: "Occupied",
    verification: "Verified",
    image: sunnyStudioImg,
  },
  {
    id: "prop-2",
    property_name: "Quiet 2BR Retreat",
    property_type: "2BR Shared Flat",
    location: "Makati",
    rent: 25000,
    status: "Available",
    verification: "Pending",
    image: twoBedFlatImg,
  },
];

export default function PropertyList({
  user,
  refresh,
  onAddPropertyClick,
  onEditPropertyClick,
  onPropertiesCountChange,
  initialStatusFilter = "All",
}) {
  const [properties, setProperties] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      const filtered = filterPropertiesForUser(cached, user);
      const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
      return filtered.length === 0 && isDemo ? DEFAULT_PROPERTIES : filtered;
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    initialStatusFilter === "Pending" ? "All" : initialStatusFilter || "All"
  );
  const [verificationFilter, setVerificationFilter] = useState(
    initialStatusFilter === "Pending" ? "Pending" : "All"
  );

  useEffect(() => {
    if (initialStatusFilter) {
      if (initialStatusFilter === "Pending") {
        setStatusFilter("All");
        setVerificationFilter("Pending");
      } else {
        setStatusFilter(initialStatusFilter);
        setVerificationFilter("All");
      }
    }
  }, [initialStatusFilter]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRent, setEditRent] = useState("");
  const [editStatus, setEditStatus] = useState("Available");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    primaryButtonText: "OK",
    secondaryButtonText: null,
    onConfirm: null,
  });

  // Property Details & Reviews Modal States (Connected to App & Database)
  const [selectedDetailsProperty, setSelectedDetailsProperty] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewDuration, setReviewDuration] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [availSuccessMsg, setAvailSuccessMsg] = useState("");

  // Live Ratings Summary per Property (Calculated from App / Supabase landlord_reviews)
  const [allRatingsMap, setAllRatingsMap] = useState({});

  // CALCULATE RATINGS FOR ALL PROPERTIES FROM LIVE APP REVIEWS
  const fetchAllRatingsSummary = async (propsList = properties) => {
    if (!propsList || propsList.length === 0) return;
    try {
      const { data, error } = await supabase
        .from("landlord_reviews")
        .select("*")
        .order("created_at", { ascending: true });

      const dbRows = !error && Array.isArray(data) ? data : [];
      const map = getReviewsMapForProperties(dbRows, propsList, user);
      const summaryMap = {};

      propsList.forEach((prop) => {
        const totalMatched = map[prop.id] || [];

        if (totalMatched.length > 0) {
          const avg = (
            totalMatched.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0) / totalMatched.length
          ).toFixed(1);
          summaryMap[prop.id] = {
            avgRating: avg,
            count: totalMatched.length,
            hasLiveApp: totalMatched.some((r) => r.source === "app" || (r.id && typeof r.id === "string" && r.id.length > 20)),
          };
        } else {
          // Strictly unrated: 0 rating and 0 reviews
          summaryMap[prop.id] = {
            avgRating: "0",
            count: 0,
            hasLiveApp: false,
          };
        }
      });

      setAllRatingsMap(summaryMap);
    } catch (err) {
      console.warn("Error fetching ratings summary:", err);
    }
  };

  // FETCH LIVE DETAILED REVIEWS FOR SELECTED PROPERTY
  const fetchLiveReviews = async (prop) => {
    if (!prop) return;
    setReviewsLoading(true);

    try {
      const { data, error } = await supabase
        .from("landlord_reviews")
        .select("*")
        .order("created_at", { ascending: true });

      const dbRows = !error && Array.isArray(data) ? data : [];
      const map = getReviewsMapForProperties(dbRows, properties, user);
      const matched = map[prop.id] || [];

      const formatted = matched.map((item) => {
        if (item.author) return item; // Already formatted
        return {
          id: item.id,
          author: item.reviewer_name || "Verified Tenant",
          avatarColor: getAvatarColor(item.reviewer_name || "Tenant"),
          duration: item.rental_period || "Rented · Verified Tenant",
          rating: Number(item.rating) || 5,
          date: item.created_at ? formatReviewDate(item.created_at) : "Recently",
          comment: item.comment || "",
          source: "app",
        };
      });

      setPropertyReviews(formatted);
    } catch (err) {
      console.warn("Supabase landlord_reviews fetch notice:", err);
      setPropertyReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDetailsProperty) return;
    fetchLiveReviews(selectedDetailsProperty);

    // Listen to real-time reviews inserted from the mobile app
    const channel = supabase
      .channel(`live_reviews_${selectedDetailsProperty.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "landlord_reviews",
        },
        () => {
          fetchLiveReviews(selectedDetailsProperty);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDetailsProperty]);

  // Global Realtime Subscription for landlord_reviews (Syncs Mobile App reviews to all Property Cards)
  useEffect(() => {
    fetchAllRatingsSummary();

    const globalReviewsSub = supabase
      .channel("global_landlord_reviews_cards")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "landlord_reviews",
        },
        () => {
          fetchAllRatingsSummary();
          if (selectedDetailsProperty) {
            fetchLiveReviews(selectedDetailsProperty);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalReviewsSub);
    };
  }, [properties.length, user?.id, user?.email]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedDetailsProperty) {
        setSelectedDetailsProperty(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDetailsProperty]);

  const promptToggleAvailability = (prop) => {
    if (!prop) return;

    const isPropPending =
      prop.status?.toLowerCase() === "pending" ||
      prop.verification?.toLowerCase() === "pending" ||
      prop.verification_status?.toLowerCase() === "pending" ||
      (prop.verification?.toLowerCase() !== "verified" && prop.verification_status?.toLowerCase() !== "verified");

    if (isPropPending) {
      showNotice(
        "Awaiting Admin Approval",
        `"${prop.property_name}" is currently pending verification from administrators.\n\nYou will be able to update its availability once the listing has been reviewed and accepted by an admin.`,
        "warning"
      );
      return;
    }

    const isCurrentlyOccupied = prop.status?.toLowerCase() === "occupied";
    const nextStatus = isCurrentlyOccupied ? "Available" : "Occupied";
    const isMakingOccupied = nextStatus === "Occupied";

    showNotice(
      isMakingOccupied ? "Update Availability to Occupied?" : "Update Availability to Available?",
      isMakingOccupied
        ? `Are you sure you want to mark "${prop.property_name}" as OCCUPIED?\n\nThe listing card will be blurred and marked as leased so prospective renters know it is currently unavailable for bookings.`
        : `Are you sure you want to mark "${prop.property_name}" as AVAILABLE for rent?\n\nThis will remove the occupied blur and make this accommodation active and open for tenant inquiries and bookings.`,
      isMakingOccupied ? "warning" : "info",
      async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        await toggleAvailability(prop.id);
        if (selectedDetailsProperty && String(selectedDetailsProperty.id) === String(prop.id)) {
          setSelectedDetailsProperty((prev) => (prev ? { ...prev, status: nextStatus } : prev));
          setAvailSuccessMsg(`Availability updated to "${nextStatus}"!`);
          setTimeout(() => setAvailSuccessMsg(""), 2600);
        }
      },
      isMakingOccupied ? "Yes, Mark Occupied" : "Yes, Mark Available",
      "Cancel"
    );
  };

  const handleToggleDetailsAvailability = (id) => {
    const target = properties.find((p) => String(p.id) === String(id)) || selectedDetailsProperty;
    if (target) {
      promptToggleAvailability(target);
    }
  };

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim() || !selectedDetailsProperty) return;
    const authorName = reviewName.trim();
    const authorComment = reviewComment.trim();
    const starRating = Number(reviewRating) || 5;
    const stayPeriod = reviewDuration.trim() ? `Rented · ${reviewDuration.trim()}` : "Rented · September 2026";
    const propIdNum = !isNaN(Number(selectedDetailsProperty.id))
      ? Number(selectedDetailsProperty.id)
      : selectedDetailsProperty.id === "prop-1"
      ? 1
      : selectedDetailsProperty.id === "prop-2"
      ? 2
      : null;
    const customDemoLandlordName = typeof window !== "undefined" ? localStorage.getItem("mobin_landlord_custom_name") : null;
    const landlordName = selectedDetailsProperty.landlord_name || user?.user_metadata?.full_name || customDemoLandlordName || "Sarah Jenkins";
    const landlordId = selectedDetailsProperty.landlord_id || (user?.id && user.id.length === 36 ? user.id : null);

    // 1. Insert directly into Supabase landlord_reviews table so mobile app & web database receive it
    let insertedDbReview = null;
    try {
      const { data, error } = await supabase
        .from("landlord_reviews")
        .insert([
          {
            landlord_name: landlordName,
            landlord_id: landlordId,
            property_id: propIdNum,
            reviewer_name: authorName,
            rental_period: stayPeriod,
            rating: starRating,
            comment: authorComment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();
      if (!error && Array.isArray(data) && data[0]) {
        insertedDbReview = data[0];
      }
    } catch (err) {
      console.warn("Failed to insert review to Supabase:", err);
    }

    // 2. Update state and local storage immediately
    const newRev = {
      id: insertedDbReview?.id || `rev-${Date.now()}`,
      author: authorName,
      avatarColor: getAvatarColor(authorName),
      duration: stayPeriod,
      rating: starRating,
      date: "Just now",
      comment: authorComment,
      source: "app",
    };

    const updated = [newRev, ...propertyReviews];
    setPropertyReviews(updated);
    try {
      localStorage.setItem(`mobin_prop_reviews_${selectedDetailsProperty.id}`, JSON.stringify(updated));
    } catch (_) {}
    fetchAllRatingsSummary();

    setReviewName("");
    setReviewDuration("");
    setReviewComment("");
    setReviewRating(5);
    setShowAddReview(false);
  };

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

  const fetchProperties = async () => {
    let loadedFromDb = [];
    try {
      let query = supabase.from("properties").select("*");
      const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      if (isUuid && user?.email) {
        query = query.or(`landlord_id.eq.${user.id},landlord_email.eq.${user.email}`);
      } else if (isUuid) {
        query = query.eq("landlord_id", user.id);
      } else if (user?.email) {
        query = query.eq("landlord_email", user.email);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        loadedFromDb = data.map((item) => {
          let coverImg = item.image;
          if (!coverImg && Array.isArray(item.photos) && item.photos.length > 0) {
            coverImg = item.photos[0];
          } else if (!coverImg && typeof item.photos === "string" && item.photos.length > 0) {
            try {
              const parsed = JSON.parse(item.photos);
              if (Array.isArray(parsed) && parsed.length > 0) coverImg = parsed[0];
            } catch (_) {
              if (item.photos.startsWith("http") || item.photos.startsWith("data:")) coverImg = item.photos;
            }
          }
          if (!coverImg) coverImg = sunnyStudioImg;

          return {
            id: item.id,
            property_name: item.property_name || "Accommodation",
            property_type: item.property_type || "Studio",
            location: item.address || item.city || "Metro Manila",
            rent: item.rent || 0,
            status: item.status || "Available",
            verification: item.verification || "Pending",
            image: coverImg,
            photos: Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : [coverImg],
            address: item.address || "",
            description: item.description || "",
            bedrooms: item.bedrooms || 1,
            capacity: item.capacity || 1,
            available_date: item.available_date || "",
            amenities: item.amenities || [],
            landlord_name: item.landlord_name || "",
            landlord_email: item.landlord_email || "",
            landlord_phone: item.landlord_phone || "",
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch notice:", err);
    }

    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      const userCached = filterPropertiesForUser(cached, user);
      const combined = [...loadedFromDb];
      userCached.forEach((c) => {
        if (!combined.some((item) => item.id === c.id || item.property_name === c.property_name)) {
          combined.push(c);
        }
      });

      const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
      const finalProperties = combined.length === 0 && isDemo ? DEFAULT_PROPERTIES : combined;

      setProperties(finalProperties);
      fetchAllRatingsSummary(finalProperties);
      if (onPropertiesCountChange) {
        onPropertiesCountChange(finalProperties);
      }
    } catch (_) {
      const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
      const finalProperties = loadedFromDb.length === 0 && isDemo ? DEFAULT_PROPERTIES : loadedFromDb;
      setProperties(finalProperties);
      fetchAllRatingsSummary(finalProperties);
      if (onPropertiesCountChange) {
        onPropertiesCountChange(finalProperties);
      }
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [refresh, user?.id, user?.email]);

  const toggleAvailability = async (id) => {
    const target = properties.find((p) => String(p.id) === String(id));
    if (!target) return;
    const isCurrentlyOccupied = target.status?.toLowerCase() === "occupied";
    const newStatus = isCurrentlyOccupied ? "Available" : "Occupied";

    // 1. Update in Supabase (check for valid integer or uuid id)
    const idStr = String(id);
    if (/^\d+$/.test(idStr) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr)) {
      try {
        await supabase
          .from("properties")
          .update({ status: newStatus })
          .eq("id", /^\d+$/.test(idStr) ? Number(idStr) : idStr);
      } catch (_) {}
    }

    // 2. Update in cache and state
    const updated = properties.map((item) => (String(item.id) === idStr ? { ...item, status: newStatus } : item));
    setProperties(updated);
    try {
      localStorage.setItem("mobin_properties", JSON.stringify(updated));
    } catch (_) {}
    if (onPropertiesCountChange) onPropertiesCountChange(updated);
  };

  const deleteProperty = (id) => {
    const target = properties.find((p) => p.id === id);
    if (!target) return;

    showNotice(
      "Delete Property Listing?",
      `Are you sure you want to permanently delete "${target.property_name}" from your listings?\n\nThis will remove the unit from public renter searches and cannot be undone.`,
      "warning",
      async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));

        // 1. Delete from Supabase
        try {
          await supabase.from("properties").delete().eq("id", id);
        } catch (e) {
          console.log("Delete error notice:", e);
        }

        // 2. Delete from cache and state
        const updated = properties.filter((p) => p.id !== id);
        setProperties(updated);
        try {
          localStorage.setItem("mobin_properties", JSON.stringify(updated));
        } catch (_) {}
        if (onPropertiesCountChange) onPropertiesCountChange(updated);

        showNotice(
          "Property Deleted",
          `"${target.property_name}" has been removed from your active listings.`,
          "success"
        );
      },
      "Yes, Delete",
      "Cancel"
    );
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.property_name);
    setEditRent(p.rent);
    setEditStatus(p.status);
  };

  const saveEdit = async () => {
    // 1. Update in Supabase
    try {
      await supabase
        .from("properties")
        .update({ property_name: editName, rent: Number(editRent), status: editStatus })
        .eq("id", editingId);
    } catch (_) {}

    // 2. Update in cache and state
    const updated = properties.map((p) =>
      p.id === editingId
        ? { ...p, property_name: editName, rent: Number(editRent), status: editStatus }
        : p
    );
    setProperties(updated);
    try {
      localStorage.setItem("mobin_properties", JSON.stringify(updated));
    } catch (_) {}
    if (onPropertiesCountChange) onPropertiesCountChange(updated);
    setEditingId(null);
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesVerif =
      verificationFilter === "All" || p.verification.toLowerCase() === verificationFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesVerif;
  });

  return (
    <div className="my-properties-view">
      {/* =====================================================
          HEADER SECTION
      ===================================================== */}
      <div className="my-properties-header">
        <div className="header-text">
          <h1>My Properties</h1>
          <p>Manage your property listings, availability, and verification status.</p>
        </div>

        <button
          type="button"
          className="btn-add-property-primary"
          onClick={() => onAddPropertyClick && onAddPropertyClick()}
        >
          + Add Property
        </button>
      </div>

      {/* =====================================================
          MAIN WHITE CONTAINER BOX (SEARCH + PROPERTY LIST)
      ===================================================== */}
      <div className="properties-white-container">
        {/* SEARCH & FILTER BAR */}
        <div className="properties-filter-bar">
          {/* SEARCH INPUT */}
          <div className="filter-search-box">
            <IconSearch />
            <input
              type="text"
              placeholder="Search property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* STATUS FILTER */}
          <div className="filter-dropdown-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Status: All</option>
              <option value="Available">Status: Available</option>
              <option value="Occupied">Status: Occupied</option>
            </select>
          </div>

          {/* VERIFICATION FILTER */}
          <div className="filter-dropdown-wrap">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Verification: All</option>
              <option value="Verified">Verification: Verified</option>
              <option value="Pending">Verification: Pending</option>
            </select>
          </div>
        </div>

        {/* PROPERTIES GRID */}
        <div className="properties-cards-grid">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => {
              const isVerified = property.verification?.toLowerCase() === "verified" || property.verification_status?.toLowerCase() === "verified" || property.status?.toLowerCase() === "approved";
              const isOccupied = property.status?.toLowerCase() === "occupied";
              const isPending = property.status?.toLowerCase() === "pending" || property.verification?.toLowerCase() === "pending" || property.verification_status?.toLowerCase() === "pending" || !isVerified;
              const isEditing = editingId === property.id;

              return (
                <div key={property.id} className={`landlord-property-card ${isOccupied ? "card-is-occupied" : ""}`}>
                  {/* IMAGE CONTAINER WITH OVERLAY BADGES */}
                  <div className="card-image-wrap">
                    <img
                      src={property.image || (Array.isArray(property.photos) ? property.photos[0] : property.photos) || sunnyStudioImg}
                      alt={property.property_name || "Property photo"}
                      className="card-photo"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = sunnyStudioImg;
                      }}
                    />

                    {/* OCCUPIED WATERMARK OVERLAY OVER IMAGE */}
                    {isOccupied && (
                      <div className="card-occupied-banner-overlay">
                        <span className="card-occupied-badge-stamp">
                          <IconLock size={12} />
                          OCCUPIED
                        </span>
                      </div>
                    )}

                    {/* TOP LEFT: VERIFICATION BADGE */}
                    <div className={`badge-verif ${isVerified ? "verified" : "pending"}`}>
                      {isVerified ? (
                        <>
                          <IconCheck />
                          <span>VERIFIED</span>
                        </>
                      ) : (
                        <>
                          <IconPending />
                          <span>PENDING</span>
                        </>
                      )}
                    </div>

                    {/* TOP RIGHT: STATUS BADGE */}
                    <button
                      type="button"
                      className={`badge-status ${isOccupied ? "occupied" : isPending ? "pending" : "available"} ${isPending ? "badge-status-locked" : "badge-status-clickable"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPending) {
                          showNotice(
                            "Awaiting Admin Approval",
                            `"${property.property_name}" is currently under review by administrators.\n\nAvailability can only be updated after the listing is accepted and approved.`,
                            "warning"
                          );
                          return;
                        }
                        promptToggleAvailability(property);
                      }}
                      title={isPending ? "Pending admin approval" : `Click to update availability to ${isOccupied ? "Available" : "Occupied"}`}
                    >
                      <span className="status-dot"></span>
                      <span>{isPending ? "PENDING" : (property.status?.toUpperCase() || "AVAILABLE")}</span>
                    </button>
                  </div>

                  {/* CARD BODY CONTENT */}
                  <div className="card-body-content">
                    {isEditing ? (
                      <div className="card-edit-mode">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="edit-input"
                          placeholder="Property Name"
                        />
                        <input
                          type="number"
                          value={editRent}
                          onChange={(e) => setEditRent(e.target.value)}
                          className="edit-input"
                          placeholder="Monthly Rent"
                        />
                        <div className="edit-btn-row">
                          <button type="button" className="btn-save-inline" onClick={saveEdit}>Save</button>
                          <button type="button" className="btn-cancel-inline" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="card-property-title">{property.property_name}</h2>
                        <p className="card-property-subtitle">
                          {property.property_type} • {property.location}
                        </p>

                        {/* CONNECTED APP RATINGS ROW */}
                        {(() => {
                          const ratingInfo = allRatingsMap[property.id];
                          const hasRatings = ratingInfo && Number(ratingInfo.count) > 0;

                          if (hasRatings) {
                            return (
                              <div className="card-property-rating-row">
                                <span className="card-rating-star">★</span>
                                <span className="card-rating-val">{ratingInfo.avgRating}</span>
                                <span className="card-rating-reviews">
                                  ({ratingInfo.count} {ratingInfo.count === 1 ? "review" : "reviews"})
                                </span>
                                {ratingInfo.hasLiveApp && (
                                  <span className="card-rating-app-pill" title="Live rating from Mob'in mobile app">
                                    📱 Mob'in App
                                  </span>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div className="card-property-rating-row unrated">
                              <span className="card-rating-star unrated">★</span>
                              <span className="card-rating-val unrated">0</span>
                              <span className="card-rating-reviews unrated">
                                (No ratings yet)
                              </span>
                            </div>
                          );
                        })()}

                        <div className="card-property-price">
                          ₱{Number(property.rent).toLocaleString()}/mo
                        </div>
                      </>
                    )}

                    {/* ACTION BUTTONS (ALWAYS CRISP & CLICKABLE EVEN WHEN OCCUPIED) */}
                    <div className="card-actions-container">
                      <button
                        type="button"
                        className="btn-view-property"
                        onClick={() => {
                          setSelectedDetailsProperty(property);
                          setActivePhotoIdx(0);
                          setShowAddReview(false);
                          setAvailSuccessMsg("");
                        }}
                      >
                        <IconEye />
                        <span>View Property</span>
                      </button>

                      {/* UPDATE AVAILABILITY BUTTON */}
                      {isPending ? (
                        <button
                          type="button"
                          className="btn-update-availability btn-status-pending-locked"
                          onClick={(e) => {
                            e.stopPropagation();
                            showNotice(
                              "Awaiting Admin Approval",
                              `"${property.property_name}" is currently pending verification from administrators.\n\nYou will be able to mark this unit as Available or Occupied after it is accepted by an admin.`,
                              "warning"
                            );
                          }}
                          title="Availability is locked until approved by an administrator"
                        >
                          <IconPending />
                          <span>Pending Admin Approval</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`btn-update-availability ${isOccupied ? "btn-status-occupied" : "btn-status-available"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            promptToggleAvailability(property);
                          }}
                          title={`Click to update availability to ${isOccupied ? "Available" : "Occupied"}`}
                        >
                          <IconRefresh />
                          <span>{isOccupied ? "Mark as Available" : "Mark as Occupied"}</span>
                        </button>
                      )}

                      <div className="card-bottom-actions">
                        <button
                          type="button"
                          className="btn-card-edit"
                          onClick={() => {
                            if (onEditPropertyClick) {
                              onEditPropertyClick(property);
                            } else {
                              startEdit(property);
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-card-delete"
                          onClick={() => deleteProperty(property.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : properties.length === 0 ? (
            <div className="empty-properties-state">
              <div className="empty-properties-icon">🏠</div>
              <h3>No properties yet</h3>
              <p>
                You haven't added any property listings yet. Click the button below to add your first accommodation!
              </p>
              <button
                type="button"
                className="btn-add-property-primary"
                onClick={() => onAddPropertyClick && onAddPropertyClick()}
              >
                + Add Your First Property
              </button>
            </div>
          ) : (
            <div className="no-properties-found">
              <h3>No matching properties found</h3>
              <p>Try adjusting your search query or filter options.</p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PROPERTY DETAILS MODAL (WITH RATINGS & COMMENTS)
      ===================================================== */}
      {selectedDetailsProperty && (
        <div
          className="property-details-overlay"
          onClick={() => setSelectedDetailsProperty(null)}
        >
          <div
            className="property-details-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* MODAL HEADER */}
            <div className="prop-details-header">
              <div className="prop-details-header-info">
                <div className="prop-details-badges">
                  <span className={`badge-verif-pill ${selectedDetailsProperty.verification?.toLowerCase() === "verified" ? "verified" : "pending"}`}>
                    {selectedDetailsProperty.verification?.toLowerCase() === "verified" ? (
                      <>
                        <IconCheck />
                        <span>VERIFIED LISTING</span>
                      </>
                    ) : (
                      <>
                        <IconPending />
                        <span>PENDING VERIFICATION</span>
                      </>
                    )}
                  </span>
                  <span className={`badge-status-pill ${selectedDetailsProperty.status?.toLowerCase() === "occupied" ? "occupied" : "available"}`}>
                    <span className="status-pulse-dot"></span>
                    {selectedDetailsProperty.status?.toUpperCase() || "AVAILABLE"}
                  </span>
                </div>
                <h2 className="prop-details-title">{selectedDetailsProperty.property_name}</h2>
                <p className="prop-details-location">
                  <IconMapPin />
                  <span>{selectedDetailsProperty.location || selectedDetailsProperty.address || "Metro Manila, Philippines"}</span>
                </p>
              </div>

              <button
                type="button"
                className="prop-details-close-btn"
                onClick={() => setSelectedDetailsProperty(null)}
                aria-label="Close details"
              >
                <IconX />
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="prop-details-body">
              {/* AVAILABILITY SUCCESS BANNER */}
              {availSuccessMsg && (
                <div className="details-avail-success-toast">
                  <IconCheck />
                  <span>{availSuccessMsg}</span>
                </div>
              )}

              {/* PHOTO GALLERY */}
              <div className="prop-details-gallery">
                <div className="prop-main-photo-wrap">
                  <img
                    src={
                      (Array.isArray(selectedDetailsProperty.photos) && selectedDetailsProperty.photos[activePhotoIdx]) ||
                      selectedDetailsProperty.image ||
                      sunnyStudioImg
                    }
                    alt={selectedDetailsProperty.property_name}
                    className="prop-main-photo"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = sunnyStudioImg;
                    }}
                  />
                  <div className="prop-main-photo-overlay-price">
                    ₱{Number(selectedDetailsProperty.rent).toLocaleString()}<span className="price-term">/mo</span>
                  </div>
                </div>

                {Array.isArray(selectedDetailsProperty.photos) && selectedDetailsProperty.photos.length > 1 && (
                  <div className="prop-thumbs-strip">
                    {selectedDetailsProperty.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`prop-thumb-btn ${activePhotoIdx === idx ? "active" : ""}`}
                        onClick={() => setActivePhotoIdx(idx)}
                      >
                        <img src={photo} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AVAILABILITY CONTROL SECTION (INSIDE PROPERTY DETAILS) */}
              {(() => {
                const isDetPending =
                  selectedDetailsProperty.status?.toLowerCase() === "pending" ||
                  selectedDetailsProperty.verification?.toLowerCase() === "pending" ||
                  selectedDetailsProperty.verification_status?.toLowerCase() === "pending" ||
                  (selectedDetailsProperty.verification?.toLowerCase() !== "verified" && selectedDetailsProperty.verification_status?.toLowerCase() !== "verified");

                if (isDetPending) {
                  return (
                    <div className="prop-availability-control-card" style={{ background: "#fffdfa", borderColor: "#fde68a" }}>
                      <div className="avail-control-info">
                        <div className="avail-status-tag-row">
                          <span className="avail-control-label">Availability Status:</span>
                          <span className="avail-status-indicator pending" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                            Pending Admin Review
                          </span>
                        </div>
                        <p className="avail-control-desc" style={{ color: "#78350f" }}>
                          This property is awaiting admin review and verification. Availability controls will unlock once an administrator approves the listing.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn-details-update-availability"
                        style={{ background: "#fbf7f2", border: "1.5px dashed #d1c4b7", color: "#8c7e73", cursor: "not-allowed" }}
                        disabled
                        title="Availability locked until accepted by admin"
                      >
                        <IconPending />
                        <span>Availability Locked (Pending Approval)</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="prop-availability-control-card">
                    <div className="avail-control-info">
                      <div className="avail-status-tag-row">
                        <span className="avail-control-label">Availability Status:</span>
                        <span className={`avail-status-indicator ${selectedDetailsProperty.status?.toLowerCase() === "occupied" ? "occupied" : "available"}`}>
                          {selectedDetailsProperty.status === "Occupied" ? "Occupied (Leased)" : "Available for Rent"}
                        </span>
                      </div>
                      <p className="avail-control-desc">
                        {selectedDetailsProperty.status === "Occupied"
                          ? "This property is marked as occupied and will not accept new bookings until updated."
                          : "This property is live and ready for tenant inquiries and bookings."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`btn-details-update-availability ${selectedDetailsProperty.status === "Occupied" ? "btn-make-available" : "btn-make-occupied"}`}
                      onClick={() => handleToggleDetailsAvailability(selectedDetailsProperty.id)}
                    >
                      <IconRefresh />
                      <span>
                        Update Availability ({selectedDetailsProperty.status === "Occupied" ? "Set to Available" : "Set to Occupied"})
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* PROPERTY SPECIFICATIONS GRID */}
              <div className="prop-specs-grid">
                <div className="prop-spec-item">
                  <div className="spec-icon-box">
                    <IconBed />
                  </div>
                  <div className="spec-texts">
                    <span className="spec-label">Bedrooms</span>
                    <span className="spec-value">{selectedDetailsProperty.bedrooms || 1} Room(s)</span>
                  </div>
                </div>

                <div className="prop-spec-item">
                  <div className="spec-icon-box">
                    <IconUsers />
                  </div>
                  <div className="spec-texts">
                    <span className="spec-label">Capacity</span>
                    <span className="spec-value">{selectedDetailsProperty.capacity || 2} Max Guests</span>
                  </div>
                </div>

                <div className="prop-spec-item">
                  <div className="spec-icon-box">
                    <IconCalendar />
                  </div>
                  <div className="spec-texts">
                    <span className="spec-label">Move-in Date</span>
                    <span className="spec-value">{selectedDetailsProperty.available_date || "Immediate"}</span>
                  </div>
                </div>

                <div className="prop-spec-item">
                  <div className="spec-icon-box">
                    <IconShield />
                  </div>
                  <div className="spec-texts">
                    <span className="spec-label">Type</span>
                    <span className="spec-value">{selectedDetailsProperty.property_type || "Studio"}</span>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="prop-details-section">
                <h3 className="section-subheading">About the Accommodation</h3>
                <p className="prop-description-text">
                  {selectedDetailsProperty.description ||
                    "Spacious and fully furnished rental unit in a secure, central location. Features high ceilings, modern kitchen area, reliable utilities, and easy access to public transport, universities, and commercial centers."}
                </p>
              </div>

              {/* AMENITIES */}
              <div className="prop-details-section">
                <h3 className="section-subheading">Amenities & Features</h3>
                <div className="prop-amenities-tags">
                  {(Array.isArray(selectedDetailsProperty.amenities) && selectedDetailsProperty.amenities.length > 0
                    ? selectedDetailsProperty.amenities
                    : ["Air Conditioning", "High-speed WiFi", "Private Bathroom", "24/7 Security & CCTV", "Water Heater", "Kitchen & Cooking Allowed", "Balcony", "Laundry Area"]
                  ).map((amenity, idx) => (
                    <span key={idx} className="amenity-chip">
                      <span className="amenity-dot"></span>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* LANDLORD CONTACT BOX */}
              <div className="prop-landlord-contact-box">
                <div className="landlord-contact-avatar">
                  {(selectedDetailsProperty.landlord_name || user?.user_metadata?.full_name || "L").charAt(0).toUpperCase()}
                </div>
                <div className="landlord-contact-details">
                  <h4>{selectedDetailsProperty.landlord_name || user?.user_metadata?.full_name || "Verified Landlord"}</h4>
                  <p>
                    <span>📞 {selectedDetailsProperty.landlord_phone || "+63 917 890 1234"}</span>
                    <span> • </span>
                    <span>✉️ {selectedDetailsProperty.landlord_email || user?.email || "landlord@mobin.ph"}</span>
                  </p>
                </div>
                <span className="landlord-verified-badge">
                  <IconShield />
                  Verified Host
                </span>
              </div>

              {/* RATINGS & REVIEW COMMENTS SECTION */}
              <div className="prop-details-reviews-section">
                <div className="reviews-section-header">
                  <div>
                    <h3 className="section-subheading" style={{ margin: "0 0 4px" }}>
                      Ratings & Tenant Reviews
                    </h3>
                    <p className="reviews-subtitle">
                      Genuine feedback from verified tenants who stayed at this property.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-add-review-toggle"
                    onClick={() => setShowAddReview(!showAddReview)}
                  >
                    {showAddReview ? "Cancel" : "+ Add Tenant Review"}
                  </button>
                </div>

                {/* RATINGS SCORE SUMMARY CARD */}
                {(() => {
                  const totalReviewsCount = propertyReviews.length;
                  const hasRatings = totalReviewsCount > 0;
                  const avgRating =
                    hasRatings
                      ? (propertyReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
                      : "0";

                  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                  propertyReviews.forEach((r) => {
                    const s = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
                    starCounts[s] = (starCounts[s] || 0) + 1;
                  });
                  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
                    const count = starCounts[star] || 0;
                    const pctNum = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                    return { star, count, pct: `${pctNum}%` };
                  });

                  return (
                    <div className="ratings-overview-card">
                      <div className="ratings-score-left">
                        <div className={`ratings-big-num ${!hasRatings ? "unrated" : ""}`}>{avgRating}</div>
                        <div className="ratings-stars-row">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <IconStar
                              key={s}
                              filled={hasRatings && s <= Math.round(Number(avgRating))}
                            />
                          ))}
                        </div>
                        <div className={`ratings-count-text ${!hasRatings ? "unrated" : ""}`}>
                          {hasRatings
                            ? `Based on ${totalReviewsCount} verified ${totalReviewsCount === 1 ? "review" : "reviews"} from Mob'in app`
                            : "No ratings yet (0 reviews)"}
                        </div>
                      </div>

                      <div className="ratings-breakdown-right">
                        {ratingBreakdown.map((row) => (
                          <div key={row.star} className="rating-bar-row">
                            <span className="rating-bar-star-label">{row.star} ★</span>
                            <div className="rating-bar-track">
                              <div className="rating-bar-fill" style={{ width: row.pct }}></div>
                            </div>
                            <span className="rating-bar-pct">
                              {row.count} ({row.pct})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* ADD REVIEW COLLAPSIBLE FORM */}
                {showAddReview && (
                  <form className="add-review-form" onSubmit={handleAddReviewSubmit}>
                    <h4 className="add-review-title">Post a Tenant Rating & Comment</h4>
                    <div className="add-review-row">
                      <div className="add-review-field">
                        <label>Tenant Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Maria Santos"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="add-review-field">
                        <label>Stay Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 6 months stay"
                          value={reviewDuration}
                          onChange={(e) => setReviewDuration(e.target.value)}
                        />
                      </div>
                      <div className="add-review-field rating-field">
                        <label>Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                        >
                          <option value={5}>5 ★★★★★ (Exceptional)</option>
                          <option value={4}>4 ★★★★☆ (Very Good)</option>
                          <option value={3}>3 ★★★☆☆ (Average)</option>
                          <option value={2}>2 ★★☆☆☆ (Below Average)</option>
                          <option value={1}>1 ★☆☆☆☆ (Poor)</option>
                        </select>
                      </div>
                    </div>
                    <div className="add-review-field full-width">
                      <label>Tenant Review / Comment</label>
                      <textarea
                        rows={3}
                        placeholder="Write authentic feedback regarding property condition, cleanliness, security, landlord responsiveness, etc..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                    </div>
                    <div className="add-review-actions">
                      <button type="button" className="btn-cancel-review" onClick={() => setShowAddReview(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-submit-review">
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}

                {/* REVIEW COMMENTS LIST */}
                <div className="reviews-comments-list">
                  {reviewsLoading ? (
                    <div className="no-reviews-box">
                      <p>Loading ratings and reviews from Mob'in app...</p>
                    </div>
                  ) : propertyReviews.length > 0 ? (
                    propertyReviews.map((rev) => (
                      <div key={rev.id} className="review-comment-card">
                        <div className="review-card-top">
                          <div className="review-tenant-profile">
                            <div className="review-tenant-avatar" style={{ background: rev.avatarColor || "#5f5900" }}>
                              {rev.author?.charAt(0).toUpperCase() || "T"}
                            </div>
                            <div className="review-tenant-meta">
                              <div className="review-author-name-row">
                                <h4 className="review-author-name">{rev.author}</h4>
                                <span className="review-verified-pill">
                                  <IconCheck />
                                  <span>{rev.duration || "Verified Tenant"}</span>
                                </span>
                                {rev.source === "app" && (
                                  <span className="review-app-badge" title="Submitted via Mob'in App">
                                    📱 Mob'in App
                                  </span>
                                )}
                              </div>
                              <div className="review-date-text">{rev.date}</div>
                            </div>
                          </div>

                          <div className="review-stars-badge">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <IconStar key={s} filled={s <= Math.round(Number(rev.rating))} />
                            ))}
                            <span className="review-star-number">{Number(rev.rating).toFixed(1)}</span>
                          </div>
                        </div>

                        <p className="review-comment-text">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="no-reviews-box empty-unrated">
                      <div className="no-reviews-icon">⭐</div>
                      <h4>No ratings yet</h4>
                      <p>This property currently has 0 reviews. Genuine ratings and feedback submitted by tenants in the Mob'in app or via the form above will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="prop-details-footer">
              <button
                type="button"
                className="btn-prop-footer-close"
                onClick={() => setSelectedDetailsProperty(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CUSTOM NOTICE / ALERT / CONFIRMATION MODAL
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
          else setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}