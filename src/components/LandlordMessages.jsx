import React, { useState, useRef, useEffect } from "react";
import "./LandlordMessages.css";
import "./PropertyList.css";
import CustomNoticeModal from "./CustomNoticeModal";
import { supabase } from "../supabaseClient";
import sunnyStudioImg from "../assets/sunnystudio.jpg";
import twoBedFlatImg from "../assets/twobedflat.jpg";
import { filterMessagesForLandlord, filterPropertiesForUser, getLandlordDisplayName } from "../lib/utils";


/* =====================================================
   ICONS
===================================================== */
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#786c62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#686300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="22.01" />
      <line x1="15" y1="22" x2="15" y2="22.01" />
      <line x1="9" y1="18" x2="9" y2="18.01" />
      <line x1="15" y1="18" x2="15" y2="18.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
    </svg>
  );
}

function IconHouse() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#686300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMoreDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#594d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8c5310" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

function IconPhoto() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6a5e54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconPaperclip() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6a5e54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function IconEmoji() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6a5e54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
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

function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconStar({ filled = true, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconRefresh({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
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

import { uploadImageToCloudinary } from "../services/cloudinaryService";
import { compressImageToDataUrl } from "../services/imageUploadService";

export function formatMsgTime(dateStr) {
  if (!dateStr) return "Just now";
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return "Just now";
  }
}

export function formatDatePill(dateStr) {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (_) {
    return "Today";
  }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "Recently";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (_) {
    return "Recently";
  }
}

export function groupMessagesIntoConversations(rawMessages, landlordEmail, profilesMap = {}, options = {}) {
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) return [];

  const cleanEmail = (landlordEmail || options?.user?.email || "").toLowerCase().trim();
  const user = options?.user || { email: cleanEmail, id: options?.landlordId };
  const ownedProps = options?.properties || options?.ownedProperties || options?.ownedPropIds || [];

  // 1. Strictly filter messages for this specific landlord to prevent any data leak
  const scopedMessages = filterMessagesForLandlord(rawMessages, user, ownedProps);
  if (scopedMessages.length === 0) return [];

  const map = new Map();
  const sorted = [...scopedMessages].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );

  for (const m of sorted) {
    const isOutgoing = Boolean(
      (cleanEmail && m.sender_email && m.sender_email.toLowerCase().trim() === cleanEmail) ||
      (options?.user?.email && m.sender_email && m.sender_email.toLowerCase().trim() === options.user.email.toLowerCase().trim())
    );

    let renterEmail = isOutgoing ? null : m.sender_email?.toLowerCase().trim();
    let renterName = isOutgoing ? null : (m.sender_name || renterEmail?.split("@")[0]);
    const propId = String(m.property_id || "general");
    const propName = m.property_name || "Accommodation";

    // Extract hidden recipient tag if present
    let targetRecipient = null;
    let text = m.message || "";
    if (typeof text === "string") {
      const toMatch = text.match(/<!--to:([^>]+)-->/);
      if (toMatch) {
        targetRecipient = toMatch[1].trim();
        text = text.replace(toMatch[0], "").trim();
      }
    }

    let convKey = null;
    if (renterEmail) {
      // Group by renter email scoped to this landlord
      convKey = renterEmail;
    } else if (renterName && !isOutgoing) {
      convKey = `renter__${renterName.toLowerCase().replace(/\s+/g, "")}`;
    } else {
      // Outgoing landlord reply:
      // 1. Direct match by recipient hint if present
      let matchedKey = null;
      if (targetRecipient) {
        if (map.has(targetRecipient)) {
          matchedKey = targetRecipient;
        } else {
          for (const [k, v] of map.entries()) {
            if (v.email?.toLowerCase() === targetRecipient.toLowerCase() || v.name?.toLowerCase() === targetRecipient.toLowerCase()) {
              matchedKey = k;
              break;
            }
          }
        }
      }

      // 2. Fall back to property match
      if (!matchedKey) {
        let latestTime = -1;
        for (const [k, v] of map.entries()) {
          const touchesProp = v.property_id === propId || (v.allProperties && v.allProperties.includes(propId));
          if (touchesProp) {
            const lastMsg = v.messages[v.messages.length - 1];
            const time = new Date(lastMsg?.created_at || 0).getTime();
            if (time > latestTime) {
              latestTime = time;
              matchedKey = k;
            }
          }
        }
      }

      if (!matchedKey) {
        let latestTime = -1;
        for (const [k, v] of map.entries()) {
          const lastMsg = v.messages[v.messages.length - 1];
          const time = new Date(lastMsg?.created_at || 0).getTime();
          if (time > latestTime) {
            latestTime = time;
            matchedKey = k;
          }
        }
      }

      convKey = matchedKey || `thread__${propId}`;
    }

    const resolvedAvatar =
      (renterEmail && profilesMap[renterEmail]) ||
      (renterName && (profilesMap[renterName.toLowerCase().trim()] || profilesMap[renterName.toLowerCase().replace(/\s+/g, "").trim()])) ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(renterName || "Renter")}&backgroundColor=686300,8c7e73,281507&textColor=ffffff`;

    if (!map.has(convKey)) {
      const displayName = renterName || "Prospective Renter";
      map.set(convKey, {
        id: convKey,
        name: displayName,
        email: renterEmail || "",
        property: propName,
        property_id: propId,
        property_name: propName,
        allProperties: [propId],
        propertyNames: [propName],
        landlord_email: m.landlord_email || cleanEmail,
        landlord_id: m.landlord_id || options?.landlordId || null,
        avatar: resolvedAvatar,
        date: formatDatePill(m.created_at),
        category: "inquiries",
        isInquiry: true,
        hasReplied: false,
        messages: [],
      });
    }

    const conv = map.get(convKey);
    if ((!conv.name || conv.name === "Prospective Renter") && renterName) {
      conv.name = renterName;
    }
    if (resolvedAvatar && (!conv.avatar || conv.avatar.includes("dicebear"))) {
      conv.avatar = resolvedAvatar;
    }
    if (!conv.email && renterEmail) conv.email = renterEmail;

    if (propId && !conv.allProperties.includes(propId)) {
      conv.allProperties.push(propId);
    }
    if (propName && !conv.propertyNames.includes(propName)) {
      conv.propertyNames.push(propName);
    }
    // Update to latest specific property name
    if (propName && propName !== "Accommodation") {
      conv.property = propName;
      conv.property_name = propName;
      conv.property_id = propId;
    }

    if (isOutgoing) {
      conv.hasReplied = true;
    }

    let image = m.image || m.image_url || null;
    if (!image && typeof text === "string") {
      const dataUriMatch = text.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=_\-\s]+/i);
      if (dataUriMatch) {
        image = dataUriMatch[0].trim();
      } else {
        const imgMatch = text.match(/(https?:\/\/[^\s]+(?:\.png|\.jpg|\.jpeg|\.webp|\.gif|cloudinary\.com[^\s]+))/i);
        if (imgMatch) {
          image = imgMatch[0].trim();
        }
      }
    }

    // Strip image from text body so raw base64 or photo URL never displays inside the text bubble!
    if (typeof text === "string") {
      if (image && text.includes(image)) {
        text = text.replace(image, "").trim();
      }
      text = text.replace(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=_\-\s]+/gi, "").trim();
      text = text.replace(/(https?:\/\/[^\s]+(?:\.png|\.jpg|\.jpeg|\.webp|\.gif|cloudinary\.com[^\s]+))/gi, "").trim();
      if (
        text === "📷 [Photo Attachment]" ||
        text === "[Photo Attachment]" ||
        text === "📷 Photo attached" ||
        text === "📷 Sent a photo"
      ) {
        text = "";
      }
    }

    conv.messages.push({
      id: m.id || `msg-${Date.now()}-${Math.random()}`,
      sender: isOutgoing ? "You" : (m.sender_name || conv.name || "Renter"),
      sender_email: m.sender_email,
      property_name: propName,
      property_id: propId,
      text: text,
      image: image,
      time: formatMsgTime(m.created_at),
      created_at: m.created_at,
      isOutgoing,
    });
  }

  const conversations = Array.from(map.values()).map((c) => {
    const lastMsg = c.messages[c.messages.length - 1];
    return {
      ...c,
      isNewInquiry: !c.hasReplied,
      lastSnippet: lastMsg?.text || (lastMsg?.image ? "📷 Photo attached" : "Inquiry started"),
      time: formatRelativeTime(lastMsg?.created_at),
      date: formatDatePill(lastMsg?.created_at),
      lastTimestamp: new Date(lastMsg?.created_at || 0).getTime(),
    };
  });

  return conversations.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
}

export default function LandlordMessages({ user, onViewProperty, properties: passedProps }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(() => {
    try {
      return sessionStorage.getItem("mobin_landlord_active_conv_id") || null;
    } catch (_) {}
    return null;
  });
  const [filterTab, setFilterTab] = useState(() => {
    try {
      return sessionStorage.getItem("mobin_landlord_msg_filter_tab") || "All";
    } catch (_) {}
    return "All";
  });

  // Sync activeConvId to sessionStorage
  useEffect(() => {
    try {
      if (activeConvId) {
        sessionStorage.setItem("mobin_landlord_active_conv_id", activeConvId);
      } else {
        sessionStorage.removeItem("mobin_landlord_active_conv_id");
      }
    } catch (_) {}
  }, [activeConvId]);

  // Sync filterTab to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("mobin_landlord_msg_filter_tab", filterTab);
    } catch (_) {}
  }, [filterTab]);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [attachedImage, setAttachedImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [detailsActivePhotoIdx, setDetailsActivePhotoIdx] = useState(0);
  const [isLoadingPropertyDetails, setIsLoadingPropertyDetails] = useState(false);
  const [availSuccessMsg, setAvailSuccessMsg] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const handleViewPropertyClick = async () => {
    if (!activeConv) return;
    setIsLoadingPropertyDetails(true);
    try {
      const propId = String(activeConv.property_id || "");
      const propName = String(activeConv.property_name || activeConv.property || "").toLowerCase().trim();

      // 1. Search in passedProps and locally cached properties
      let foundProp = (passedProps || []).find(
        (p) => String(p.id) === propId || (p.property_name && String(p.property_name).toLowerCase().trim() === propName)
      );

      if (!foundProp) {
        try {
          const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
          foundProp = cached.find(
            (p) => String(p.id) === propId || (p.property_name && String(p.property_name).toLowerCase().trim() === propName)
          );
        } catch (_) {}
      }

      // 2. Query from Supabase if not found
      if (!foundProp && propId && propId !== "null" && propId !== "undefined" && propId !== "general") {
        try {
          const isNum = /^\d+$/.test(propId);
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propId);
          if (isNum || isUuid) {
            const { data } = await supabase.from("properties").select("*").eq("id", isNum ? Number(propId) : propId).maybeSingle();
            if (data) foundProp = data;
          }
        } catch (_) {}
      }

      if (!foundProp && propName && propName !== "accommodation") {
        try {
          const { data } = await supabase.from("properties").select("*").ilike("property_name", activeConv.property_name || activeConv.property).limit(1);
          if (Array.isArray(data) && data[0]) foundProp = data[0];
        } catch (_) {}
      }

      // 3. Fallback demo property data if demo properties
      if (!foundProp) {
        if (propId === "prop-1" || propName.includes("sunny")) {
          foundProp = {
            id: "prop-1",
            property_name: "Sunny Central Studio",
            location: "Downtown, Manila",
            rent: 8500,
            status: "Available",
            verification: "Verified",
            property_type: "Studio Apartment",
            bedrooms: 1,
            capacity: 2,
            available_date: "Immediate",
            photos: [sunnyStudioImg],
            amenities: ["Air Conditioning", "High-speed WiFi", "Private Bathroom", "24/7 Security & CCTV", "Water Heater"],
            description: "A bright, fully furnished studio apartment located in the heart of downtown. Ideal for students and young professionals.",
            landlord_name: "Sarah Jenkins",
            landlord_email: "landlord@mobin.ph",
            landlord_phone: "+63 917 890 1234",
          };
        } else if (propId === "prop-2" || propName.includes("quiet")) {
          foundProp = {
            id: "prop-2",
            property_name: "Quiet 2BR Suite",
            location: "Uptown, Quezon City",
            rent: 14500,
            status: "Available",
            verification: "Verified",
            property_type: "Two-Bedroom Suite",
            bedrooms: 2,
            capacity: 4,
            available_date: "Immediate",
            photos: [twoBedFlatImg],
            amenities: ["Air Conditioning", "High-speed WiFi", "Private Bathroom", "Balcony", "Kitchen & Cooking Allowed"],
            description: "Spacious two-bedroom apartment in a peaceful residential neighborhood with complete amenities.",
            landlord_name: "Sarah Jenkins",
            landlord_email: "landlord@mobin.ph",
            landlord_phone: "+63 917 890 1234",
          };
        } else {
          foundProp = {
            id: propId || "prop-accommodation",
            property_name: activeConv.property_name || activeConv.property || "Accommodation",
            location: "Metro Manila, Philippines",
            rent: 8000,
            status: "Available",
            verification: "Verified",
            property_type: "Apartment",
            bedrooms: 1,
            capacity: 2,
            available_date: "Immediate",
            photos: [sunnyStudioImg],
            amenities: ["Air Conditioning", "High-speed WiFi", "Private Bathroom"],
            description: "Comfortable accommodation ready for occupancy with clean living spaces and convenient access.",
            landlord_name: user?.user_metadata?.full_name || getLandlordDisplayName(user),
            landlord_email: user?.email || "landlord@mobin.ph",
            landlord_phone: "+63 917 890 1234",
          };
        }
      }

      // Normalise photos array
      if (foundProp) {
        let photos = [];
        if (Array.isArray(foundProp.photos) && foundProp.photos.length > 0) {
          photos = foundProp.photos;
        } else if (Array.isArray(foundProp.images) && foundProp.images.length > 0) {
          photos = foundProp.images;
        } else if (foundProp.image) {
          photos = [foundProp.image];
        } else if (foundProp.cover_photo) {
          photos = [foundProp.cover_photo];
        } else {
          photos = [sunnyStudioImg];
        }
        foundProp = { ...foundProp, photos };
      }

      setSelectedPropertyDetails(foundProp);
      setDetailsActivePhotoIdx(0);
    } catch (err) {
      console.warn("View property error:", err);
    } finally {
      setIsLoadingPropertyDetails(false);
    }
  };

  // Property Ratings & Tenant Reviews state
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewDuration, setReviewDuration] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const fetchPropertyReviews = async (prop) => {
    if (!prop) {
      setPropertyReviews([]);
      return;
    }
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from("landlord_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      const dbRows = !error && Array.isArray(data) ? data : [];
      const propIdStr = String(prop.id || "");
      const propName = String(prop.property_name || "").toLowerCase().trim();
      const landlordName = String(prop.landlord_name || "").toLowerCase().trim();

      let matched = dbRows.filter((r) => {
        if (r.property_id != null && (String(r.property_id) === propIdStr || (propIdStr.startsWith("prop-") && String(r.property_id) === propIdStr.replace("prop-", "")))) return true;
        if (r.property_name && propName && r.property_name.toLowerCase().trim() === propName) return true;
        return false;
      });

      if (matched.length === 0 && landlordName) {
        matched = dbRows.filter((r) => {
          const rLName = (r.landlord_name || "").toLowerCase().trim();
          return rLName && (rLName === landlordName || rLName.includes(landlordName) || landlordName.includes(rLName));
        });
      }

      // Check local storage reviews
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

      const formatted = matched.map((item) => ({
        id: item.id,
        author: item.reviewer_name || item.author || "Verified Tenant",
        duration: item.rental_period || item.duration || "Rented · Verified Tenant",
        rating: Number(item.rating) || 5,
        date: item.created_at ? formatReviewDate(item.created_at) : (item.date || "Recently"),
        comment: item.comment || "",
      }));

      setPropertyReviews(formatted);
    } catch (err) {
      console.warn("Reviews fetch notice:", err);
      setPropertyReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPropertyDetails) {
      fetchPropertyReviews(selectedPropertyDetails);
      setShowAddReview(false);
    } else {
      setPropertyReviews([]);
      setShowAddReview(false);
    }
  }, [selectedPropertyDetails?.id]);

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropertyDetails || !reviewComment.trim()) return;

    const authorName = reviewName.trim() || "Verified Tenant";
    const authorComment = reviewComment.trim();
    const starRating = Number(reviewRating) || 5;
    const stayPeriod = reviewDuration.trim() ? `Rented · ${reviewDuration.trim()}` : "Rented · Recent";
    const propIdNum = !isNaN(Number(selectedPropertyDetails.id))
      ? Number(selectedPropertyDetails.id)
      : selectedPropertyDetails.id === "prop-1"
      ? 1
      : selectedPropertyDetails.id === "prop-2"
      ? 2
      : null;
    const landlordName = selectedPropertyDetails.landlord_name || user?.user_metadata?.full_name || "Landlord";
    const landlordId = selectedPropertyDetails.landlord_id || (user?.id && user.id.length === 36 ? user.id : null);

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

    const newRev = {
      id: insertedDbReview?.id || `rev-${Date.now()}`,
      author: authorName,
      duration: stayPeriod,
      rating: starRating,
      date: "Just now",
      comment: authorComment,
    };

    const updated = [newRev, ...propertyReviews];
    setPropertyReviews(updated);
    try {
      localStorage.setItem(`mobin_prop_reviews_${selectedPropertyDetails.id}`, JSON.stringify(updated));
    } catch (_) {}

    setReviewName("");
    setReviewDuration("");
    setReviewComment("");
    setReviewRating(5);
    setShowAddReview(false);
  };

  const totalReviewsCount = propertyReviews.length;
  const hasRatings = totalReviewsCount > 0;
  const avgRating = hasRatings
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

  const promptToggleAvailability = (prop) => {
    if (!prop) return;
    const isCurrentlyOccupied = prop.status?.toLowerCase() === "occupied";
    const nextStatus = isCurrentlyOccupied ? "Available" : "Occupied";
    const isMakingOccupied = nextStatus === "Occupied";

    setConfirmModal({
      isOpen: true,
      title: isMakingOccupied ? "Update Availability to Occupied?" : "Update Availability to Available?",
      message: isMakingOccupied
        ? `Are you sure you want to mark "${prop.property_name}" as OCCUPIED?\n\nThis will indicate that the accommodation is currently leased and unavailable for new bookings.`
        : `Are you sure you want to mark "${prop.property_name}" as AVAILABLE for rent?\n\nThis will make your accommodation active and live for tenant inquiries and bookings.`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        const propId = prop.id;
        const idStr = String(propId);
        if (/^\d+$/.test(idStr) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr)) {
          try {
            await supabase.from("properties").update({ status: nextStatus }).eq("id", /^\d+$/.test(idStr) ? Number(idStr) : idStr);
          } catch (_) {}
        }
        try {
          const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
          const updated = cached.map((p) => String(p.id) === idStr ? { ...p, status: nextStatus } : p);
          localStorage.setItem("mobin_properties", JSON.stringify(updated));
        } catch (_) {}
        setSelectedPropertyDetails((prev) => prev ? { ...prev, status: nextStatus } : prev);
        setAvailSuccessMsg(`Availability updated to "${nextStatus}"!`);
        setTimeout(() => setAvailSuccessMsg(""), 2600);
      }
    });
  };

  // Read status tracking per conversation thread: { [convId]: timestamp }
  const [readMap, setReadMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mobin_read_threads") || "{}");
    } catch {
      return {};
    }
  });

  const markThreadAsRead = (convId, timestamp = Date.now()) => {
    if (!convId) return;
    setReadMap((prev) => {
      const updated = { ...prev, [convId]: timestamp };
      try {
        localStorage.setItem("mobin_read_threads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const cleanUserEmail = (user?.email || "").toLowerCase().trim();
  const isDemoLandlord = cleanUserEmail === "landlord@mobin.ph" || user?.id === "landlord-001";
  const effectiveLandlordEmail = cleanUserEmail || (isDemoLandlord ? "landlord@mobin.ph" : "");
  const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

  const getOwnedProperties = () => {
    if (Array.isArray(passedProps) && passedProps.length > 0) return passedProps;
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      return filterPropertiesForUser(cached, user);
    } catch {
      return [];
    }
  };

  const fetchMessages = async () => {
    // 1. Resolve all properties owned by this landlord from passedProps, cache, and directly from Supabase
    let ownedProps = [];
    if (Array.isArray(passedProps) && passedProps.length > 0) {
      ownedProps = [...passedProps];
    } else {
      try {
        const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
        ownedProps = filterPropertiesForUser(cached, user);
      } catch (_) {}
    }

    try {
      let pQuery = supabase.from("properties").select("id, property_name, landlord_id, landlord_email");
      if (isDemoLandlord) {
        pQuery = pQuery.eq("landlord_email", "landlord@mobin.ph");
      } else {
        const pOr = [];
        if (cleanUserEmail) pOr.push(`landlord_email.eq.${cleanUserEmail}`);
        if (isUuid && user?.id) pOr.push(`landlord_id.eq.${user.id}`);
        if (pOr.length > 0) pQuery = pQuery.or(pOr.join(","));
      }
      const { data: dbProps } = await pQuery;
      if (Array.isArray(dbProps)) {
        dbProps.forEach((dp) => {
          if (!ownedProps.some((op) => String(op.id) === String(dp.id))) {
            ownedProps.push(dp);
          }
        });
      }
    } catch (_) {}

    const ownedPropIds = ownedProps.map((p) => String(p.id)).filter(Boolean);

    let rawMessages = [];
    try {
      let query = supabase.from("messages").select("*");

      if (isDemoLandlord) {
        // Demo landlord strictly receives inquiries for demo properties (prop-1, prop-2) or demo account
        const demoConditions = [
          "landlord_email.eq.landlord@mobin.ph",
          "sender_email.eq.landlord@mobin.ph",
          "property_id.eq.prop-1",
          "property_id.eq.prop-2",
        ];
        ownedPropIds.forEach((pid) => {
          if (pid !== "prop-1" && pid !== "prop-2") {
            demoConditions.push(`property_id.eq.${pid}`);
          }
        });
        query = query.or(demoConditions.join(","));
      } else {
        // Real registered landlord: strictly their own email, user_id, or owned properties. NEVER landlord@mobin.ph!
        const orConditions = [];
        if (cleanUserEmail) {
          orConditions.push(`landlord_email.eq.${cleanUserEmail}`);
          orConditions.push(`sender_email.eq.${cleanUserEmail}`);
        }
        if (isUuid && user?.id) {
          orConditions.push(`landlord_id.eq.${user.id}`);
        }
        if (ownedPropIds.length > 0) {
          ownedPropIds.forEach((pid) => {
            orConditions.push(`property_id.eq.${pid}`);
          });
        }

        if (orConditions.length > 0) {
          query = query.or(orConditions.join(","));
        } else {
          setConversations([]);
          return;
        }
      }

      const { data, error } = await query.order("created_at", { ascending: true });
      if (!error && data) {
        rawMessages = data;
      }
    } catch (err) {
      console.warn("Messages fetch notice:", err);
    }

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

    // Combine with local cached messages, but strictly filter for THIS landlord
    let combinedRaw = [...rawMessages];
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_messages") || "[]");
      const userCached = filterMessagesForLandlord(cached, user, ownedProps);
      userCached.forEach((c) => {
        if (!combinedRaw.some((m) => m.id === c.id)) {
          combinedRaw.push(c);
        }
      });
    } catch (_) {}

    const parsedConversations = groupMessagesIntoConversations(
      combinedRaw,
      effectiveLandlordEmail,
      profilesMap,
      {
        user,
        isDemoLandlord,
        ownedProperties: ownedProps,
        ownedPropIds,
        landlordId: user?.id,
      }
    );

    setConversations(parsedConversations);
    if (parsedConversations.length > 0) {
      setActiveConvId((prev) => (prev && parsedConversations.some((c) => c.id === prev) ? prev : parsedConversations[0].id));
    } else {
      setActiveConvId(null);
    }
  };


  useEffect(() => {
    fetchMessages();

    // Fast polling every 1.5 seconds so messages from mobile app appear immediately without refreshing
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 1500);

    // Realtime Supabase Channel for instant Live Messages
    let channel = null;
    try {
      channel = supabase
        .channel("landlord-live-messages-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => {
            fetchMessages();
          }
        )
        .subscribe();
    } catch (_) {}

    return () => {
      clearInterval(pollInterval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email]);

  // Mark active conversation as read when selected
  useEffect(() => {
    if (activeConvId) {
      markThreadAsRead(activeConvId);
    }
  }, [activeConvId]);

  // Dynamically compute unread state based on readMap & active conversation
  const enrichedConversations = conversations.map((conv) => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    const lastMsgTime = lastMsg ? new Date(lastMsg.created_at || 0).getTime() : 0;
    const lastReadTime = readMap[conv.id] ? Number(readMap[conv.id]) : 0;
    const isCurrentlyActive = conv.id === activeConvId;

    // Unread if the last message was incoming from renter AND after the landlord's last read timestamp
    const unread = !isCurrentlyActive && Boolean(
      lastMsg && !lastMsg.isOutgoing && lastMsgTime > lastReadTime
    );

    return {
      ...conv,
      unread,
    };
  });

  const activeConv =
    enrichedConversations.find((c) => c.id === activeConvId) || enrichedConversations[0] || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages?.length]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // 1. Immediate local preview so the user sees the attached photo chip right away
      const previewUrl = await compressImageToDataUrl(file, 600, 0.82);
      if (previewUrl) {
        setAttachedImage(previewUrl);
      }
      // 2. Upload to Cloudinary in background
      const cloudUrl = await uploadImageToCloudinary(file, "mobin/messages");
      if (cloudUrl) {
        setAttachedImage(cloudUrl);
      }
    } catch (_) {
      try {
        const url = URL.createObjectURL(file);
        setAttachedImage(url);
      } catch (e2) {}
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !attachedImage) return;
    if (!activeConv) return;

    const currentText = replyText.trim();
    const currentImg = attachedImage;

    setReplyText("");
    setAttachedImage(null);
    setIsSending(true);

    const nowIso = new Date().toISOString();
    const tempId = "temp-" + Date.now();
    const landlordName = getLandlordDisplayName(user);
    const resolvedLandlordEmail = cleanUserEmail || (isDemoLandlord ? "landlord@mobin.ph" : "");
    const resolvedLandlordId = isUuid ? user.id : null;

    const newMessage = {
      id: tempId,
      sender: "You",
      sender_email: resolvedLandlordEmail,
      property_name: activeConv.property_name || activeConv.property || "Accommodation",
      property_id: activeConv.property_id || null,
      text: currentText,
      image: currentImg,
      time: formatMsgTime(nowIso),
      isOutgoing: true,
      created_at: nowIso,
    };

    // Mark current thread as read since landlord is active
    markThreadAsRead(activeConvId, Date.now());

    // 1. Optimistic React State update
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConvId) {
          return {
            ...conv,
            hasReplied: true,
            isNewInquiry: false,
            lastSnippet: currentText || "📷 Sent a photo",
            time: "Just now",
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );

    // 2. Persist to Supabase messages table
    const resolvedRecipient = activeConv.email || (activeConv.id && !activeConv.id.startsWith("thread__") ? activeConv.id : "");
    const recipientTag = resolvedRecipient ? `<!--to:${resolvedRecipient}-->` : "";
    const rawMessageBody = currentText 
      ? (currentImg && !currentImg.startsWith("data:") ? `${currentText}\n${currentImg}` : currentText)
      : (currentImg && !currentImg.startsWith("data:") ? currentImg : "📷 [Photo Attachment]");
    const finalMessageText = recipientTag ? `${recipientTag}${rawMessageBody}` : rawMessageBody;

    // Try payload with explicit image / image_url columns for mobile apps
    const messagePayload = {
      landlord_id: resolvedLandlordId,
      landlord_email: resolvedLandlordEmail,
      sender_name: landlordName,
      sender_email: resolvedLandlordEmail,
      property_id: activeConv.property_id || null,
      property_name: activeConv.property_name || activeConv.property || "Accommodation",
      message: finalMessageText,
      created_at: nowIso,
    };

    if (currentImg) {
      messagePayload.image = currentImg;
      messagePayload.image_url = currentImg;
    }

    try {
      let { data, error } = await supabase.from("messages").insert([messagePayload]).select().single();

      // If image/image_url columns don't exist yet in Supabase schema, fall back without them
      if (error && (error.code === "PGRST204" || error.message?.includes("image"))) {
        const fallbackPayload = {
          landlord_id: resolvedLandlordId,
          landlord_email: resolvedLandlordEmail,
          sender_name: landlordName,
          sender_email: resolvedLandlordEmail,
          property_id: activeConv.property_id || null,
          property_name: activeConv.property_name || activeConv.property || "Accommodation",
          message: finalMessageText,
          created_at: nowIso,
        };
        const fallbackRes = await supabase.from("messages").insert([fallbackPayload]).select().single();
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && data) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConvId
              ? {
                  ...conv,
                  messages: conv.messages.map((m) => (m.id === tempId ? { ...m, id: data.id } : m)),
                }
              : conv
          )
        );
      }
    } catch (err) {
      console.warn("Supabase message send notice:", err);
    } finally {
      setIsSending(false);
    }

    // 3. Cache locally
    try {
      const cached = JSON.parse(localStorage.getItem("mobin_messages") || "[]");
      cached.push(messagePayload);
      localStorage.setItem("mobin_messages", JSON.stringify(cached.slice(-100)));
      window.dispatchEvent(new Event("mobin_messages_updated"));
    } catch (_) {}
  };

  const unreadCount = enrichedConversations.filter((c) => c.unread).length;

  const filteredConversations = enrichedConversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "Unread") {
      // In Unread tab: show unread threads, or the currently open thread if there are unread items
      return c.unread || (unreadCount > 0 && c.id === activeConvId);
    }
    if (filterTab === "Inquiries") {
      // In Inquiries tab: show all listing inquiries from renters
      return c.category === "inquiries" || c.isInquiry || c.isNewInquiry;
    }
    return true;
  });

  if (conversations.length === 0) {
    return (
      <div className="landlord-messages-container" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="messages-empty-full-state">
          <div className="empty-messages-icon">💬</div>
          <h2>No messages yet</h2>
          <p>
            You have no active message threads. When renters reach out regarding your property listings, their inquiries and chat messages will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="landlord-messages-container">
      {/* =====================================================
          LEFT PANE: CONVERSATION LIST
      ===================================================== */}
      <div className="messages-left-pane">
        {/* HEADER & SEARCH */}
        <div className="messages-left-header">
          <h1>Messages</h1>
          <div className="messages-search-wrap">
            <IconSearch />
            <input
              type="text"
              placeholder="Search messages, properties, tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="messages-filter-pills">
          <button
            type="button"
            className={`pill-btn ${filterTab === "All" ? "active" : ""}`}
            onClick={() => setFilterTab("All")}
          >
            All Messages
          </button>
          <button
            type="button"
            className={`pill-btn ${filterTab === "Unread" ? "active" : ""}`}
            onClick={() => setFilterTab("Unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            className={`pill-btn ${filterTab === "Inquiries" ? "active" : ""}`}
            onClick={() => setFilterTab("Inquiries")}
          >
            Inquiries
          </button>
        </div>

        {/* CONVERSATION LIST */}
        <div className="conversations-list-scroll">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConvId;

              return (
                <div
                  key={conv.id}
                  className={`conv-list-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    markThreadAsRead(conv.id);
                  }}
                >
                  {/* ACTIVE LEFT STRIPE */}
                  {isSelected && <div className="conv-active-stripe"></div>}

                  <div className="conv-item-content">
                    <div className="conv-top-row">
                      <span className="conv-user-name">{conv.name}</span>
                      <span className="conv-time">{conv.time}</span>
                    </div>

                    <div className="conv-property-row">
                      {conv.isNewInquiry ? (
                        <span className="badge-new-inquiry">NEW INQUIRY</span>
                      ) : (
                        <span className="badge-inquiry">INQUIRY</span>
                      )}
                      <span className="conv-property-tag">
                        {conv.propertyIcon === "house" ? <IconHouse /> : <IconBuilding />}
                        <span>{conv.property}</span>
                      </span>
                    </div>

                    <div className="conv-snippet-row">
                      <p className="conv-snippet-text">{conv.lastSnippet}</p>
                      {conv.unread && <span className="conv-unread-dot" title="Unread message"></span>}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="messages-empty-filter-state">
              <div className="empty-filter-icon">
                {filterTab === "Unread" ? "✨" : filterTab === "Inquiries" ? "📋" : "💬"}
              </div>
              <p className="empty-filter-title">
                {filterTab === "Unread" ? "All caught up!" : filterTab === "Inquiries" ? "No inquiries found" : "No messages found"}
              </p>
              <p className="empty-filter-subtitle">
                {filterTab === "Unread"
                  ? "You have no unread messages right now."
                  : filterTab === "Inquiries"
                  ? "No property inquiries match your criteria."
                  : "Try adjusting your search query."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          RIGHT PANE: CHAT THREAD & ACTION
      ===================================================== */}
      <div className="messages-right-pane">
        {activeConv ? (
          <>
            {/* CHAT HEADER */}
            <div className="chat-top-header">
              <div className="chat-header-user">
                <div className="chat-avatar-wrap">
                  <img src={activeConv.avatar} alt={activeConv.name} />
                  <span className="online-indicator-dot"></span>
                </div>
                <div className="chat-header-info">
                  <div className="chat-user-title">
                    <h3>{activeConv.name}</h3>
                    <span className="active-green-dot"></span>
                  </div>
                  <div className="chat-property-sub">
                    <IconBuilding />
                    <span>Interested in: <strong>{activeConv.property}</strong></span>
                  </div>
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  className="chat-btn-view-property"
                  onClick={handleViewPropertyClick}
                  disabled={isLoadingPropertyDetails}
                  title="View property details and photos"
                >
                  <IconEye />
                  <span>{isLoadingPropertyDetails ? "Loading..." : "View Property"}</span>
                </button>
                <button type="button" className="btn-more-options" title="More options">
                  <IconMoreDots />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES BODY */}
            <div className="chat-messages-body">
              <div className="chat-date-pill-wrap">
                <span className="chat-date-pill">{activeConv.date}</span>
              </div>

              <div className="chat-bubble-stream">
                {activeConv.messages.map((msg) => {
                  if (msg.isOutgoing) {
                    return (
                      <div key={msg.id} className="chat-bubble-row outgoing">
                        <div className="chat-bubble-outgoing">
                          {msg.image && (
                            <div className="chat-bubble-image-wrap">
                              <img src={msg.image} alt="Attachment" className="chat-img-attachment" />
                            </div>
                          )}
                          {msg.text && <p>{msg.text}</p>}
                        </div>
                        <div className="chat-time-outgoing">
                          <span>{msg.time}</span>
                          <span className="read-checks">✓✓</span>
                        </div>
                      </div>
                    );
                  }

                  const msgIndex = activeConv.messages.indexOf(msg);
                  const prevMsg = msgIndex > 0 ? activeConv.messages[msgIndex - 1] : null;
                  const showPropTag =
                    msg.property_name &&
                    msg.property_name !== "Accommodation" &&
                    (!prevMsg || prevMsg.property_name !== msg.property_name);

                  return (
                    <div key={msg.id} className="chat-bubble-row incoming">
                      <img src={msg.avatar || activeConv.avatar} alt={msg.sender} className="incoming-avatar" />
                      <div className="incoming-content-wrap">
                        {showPropTag && (
                          <div className="chat-msg-prop-tag">
                            🏢 Inquired about: {msg.property_name}
                          </div>
                        )}
                        <div className="chat-bubble-incoming">
                          {msg.image && (
                            <div className="chat-bubble-image-wrap">
                              <img src={msg.image} alt="Attachment" className="chat-img-attachment" />
                            </div>
                          )}
                          {msg.text && <p>{msg.text}</p>}
                        </div>
                        <div className="chat-time-incoming">{msg.time}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ACTION CARD: PRE-APPROVAL REQUEST */}
              {activeConv.hasPreApproval && (
                <div className="preapproval-action-card">
                  <div className="preapproval-left">
                    <div className="preapproval-icon-box">
                      <IconClipboard />
                    </div>
                    <div className="preapproval-text">
                      <h4>Pre-approval Request Received</h4>
                      <p>{activeConv.name.split(" ")[0]} has submitted a request for pre-approval.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-review-preapproval"
                    onClick={() => alert(`Reviewing pre-approval application for ${activeConv.name}`)}
                  >
                    Review
                  </button>
                </div>
              )}
            </div>

            {/* CHAT INPUT ROW & ATTACHMENT TOOLS */}
            <div className="chat-reply-container">
              {attachedImage && (
                <div className="chat-attached-preview">
                  <img src={attachedImage} alt="Preview attachment" />
                  <button
                    type="button"
                    className="btn-remove-attachment"
                    onClick={() => setAttachedImage(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="chat-reply-input-bar">
                {/* TOOLBAR ICONS */}
                <div className="chat-input-icons-left">
                  <label className="btn-chat-icon" title="Attach Photo">
                    <IconPhoto />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn-chat-icon"
                    title="Attach File"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPaperclip />
                  </button>

                  <button
                    type="button"
                    className="btn-chat-icon"
                    title="Insert Emoji"
                    onClick={() => setReplyText((prev) => prev + " 😊 ")}
                  >
                    <IconEmoji />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={`Reply to ${activeConv.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />

                <button
                  type="submit"
                  className="btn-chat-send"
                  disabled={!replyText.trim() && !attachedImage}
                >
                  <IconSend />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation from the left to start messaging.</p>
          </div>
        )}
      </div>

      {/* =====================================================
          PROPERTY DETAILS MODAL (OPENED VIA VIEW PROPERTY)
      ===================================================== */}
      {selectedPropertyDetails && (
        <div
          className="property-details-overlay"
          onClick={() => setSelectedPropertyDetails(null)}
          style={{ zIndex: 10000 }}
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
                  <span className={`badge-verif-pill ${selectedPropertyDetails.verification?.toLowerCase() === "verified" ? "verified" : "pending"}`}>
                    <IconCheck />
                    <span>{selectedPropertyDetails.verification?.toUpperCase() || "VERIFIED LISTING"}</span>
                  </span>
                  <span className={`badge-status-pill ${selectedPropertyDetails.status?.toLowerCase() === "occupied" ? "occupied" : "available"}`}>
                    <span className="status-pulse-dot"></span>
                    {selectedPropertyDetails.status?.toUpperCase() || "AVAILABLE"}
                  </span>
                  <span
                    className={`badge-rating-pill ${hasRatings ? "rated" : "unrated"}`}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      letterSpacing: "0.2px",
                      background: hasRatings ? "#fef3c7" : "#f5f0ea",
                      color: hasRatings ? "#b45309" : "#7b6e62",
                      border: hasRatings ? "1px solid #fde68a" : "1px solid #ebd9c8",
                    }}
                  >
                    <span style={{ color: hasRatings ? "#f59e0b" : "#a89f91", fontSize: "12px" }}>★</span>
                    <span>{hasRatings ? `${avgRating} (${totalReviewsCount} ${totalReviewsCount === 1 ? "review" : "reviews"})` : "NO RATINGS YET"}</span>
                  </span>
                </div>
                <h2 className="prop-details-title">{selectedPropertyDetails.property_name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginTop: "2px" }}>
                  <p className="prop-details-location" style={{ margin: 0 }}>
                    <IconMapPin />
                    <span>{selectedPropertyDetails.location || [selectedPropertyDetails.address, selectedPropertyDetails.city].filter(Boolean).join(", ") || "Metro Manila, Philippines"}</span>
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: hasRatings ? "#281507" : "#8c7d70",
                    }}
                  >
                    <span style={{ color: hasRatings ? "#f59e0b" : "#c4b5a5", fontSize: "14px" }}>★</span>
                    <span>{hasRatings ? avgRating : "0.0"}</span>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#786c62" }}>
                      ({totalReviewsCount} {totalReviewsCount === 1 ? "tenant review" : "tenant reviews"})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="prop-details-close-btn"
                onClick={() => setSelectedPropertyDetails(null)}
                aria-label="Close details"
              >
                <IconX />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="prop-details-body">
              {/* PHOTO GALLERY */}
              <div className="prop-details-gallery">
                <div className="prop-main-photo-wrap">
                  <img
                    src={
                      (Array.isArray(selectedPropertyDetails.photos) && selectedPropertyDetails.photos[detailsActivePhotoIdx]) ||
                      sunnyStudioImg
                    }
                    alt={selectedPropertyDetails.property_name}
                    className="prop-main-photo"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = sunnyStudioImg;
                    }}
                  />
                  <div className="prop-main-photo-overlay-price">
                    ₱{Number(selectedPropertyDetails.rent || 0).toLocaleString()}<span className="price-term">/mo</span>
                  </div>
                </div>

                {Array.isArray(selectedPropertyDetails.photos) && selectedPropertyDetails.photos.length > 1 && (
                  <div className="prop-thumbs-strip">
                    {selectedPropertyDetails.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`prop-thumb-btn ${detailsActivePhotoIdx === idx ? "active" : ""}`}
                        onClick={() => setDetailsActivePhotoIdx(idx)}
                      >
                        <img src={photo} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AVAILABILITY SUCCESS BANNER */}
              {availSuccessMsg && (
                <div className="details-avail-success-toast">
                  <IconCheck />
                  <span>{availSuccessMsg}</span>
                </div>
              )}

              {/* AVAILABILITY CONTROL SECTION */}
              <div className="prop-availability-control-card">
                <div className="avail-control-info">
                  <div className="avail-status-tag-row">
                    <span className="avail-control-label">Availability Status:</span>
                    <span className={`avail-status-indicator ${selectedPropertyDetails.status?.toLowerCase() === "occupied" ? "occupied" : "available"}`}>
                      {selectedPropertyDetails.status === "Occupied" ? "Occupied (Leased)" : "Available for Rent"}
                    </span>
                  </div>
                  <p className="avail-control-desc">
                    {selectedPropertyDetails.status === "Occupied"
                      ? "This property is marked as occupied and will not accept new bookings until updated."
                      : "This property is live and ready for tenant inquiries and bookings."}
                  </p>
                </div>

                <button
                  type="button"
                  className={`btn-details-update-availability ${selectedPropertyDetails.status === "Occupied" ? "btn-make-available" : "btn-make-occupied"}`}
                  onClick={() => promptToggleAvailability(selectedPropertyDetails)}
                >
                  <IconRefresh />
                  <span>
                    Update Availability ({selectedPropertyDetails.status === "Occupied" ? "Set to Available" : "Set to Occupied"})
                  </span>
                </button>
              </div>

              {/* SPECIFICATIONS GRID */}
              <div className="prop-specs-grid">
                <div className="prop-spec-item">
                  <div className="spec-icon-box"><IconBed /></div>
                  <div className="spec-texts">
                    <span className="spec-label">Bedrooms</span>
                    <span className="spec-value">{selectedPropertyDetails.bedrooms || 1} Room(s)</span>
                  </div>
                </div>

                <div className="prop-spec-item">
                  <div className="spec-icon-box"><IconUsers /></div>
                  <div className="spec-texts">
                    <span className="spec-label">Capacity</span>
                    <span className="spec-value">{selectedPropertyDetails.capacity || 2} Max Guests</span>
                  </div>
                </div>

                <div className="prop-spec-item">
                  <div className="spec-icon-box"><IconCalendar /></div>
                  <div className="spec-texts">
                    <span className="spec-label">Move-in Date</span>
                    <span className="spec-value">{selectedPropertyDetails.available_date || "Immediate"}</span>
                  </div>
                </div>

                <div className="prop-spec-item">
                  <div className="spec-icon-box"><IconShield /></div>
                  <div className="spec-texts">
                    <span className="spec-label">Type</span>
                    <span className="spec-value">{selectedPropertyDetails.property_type || "Apartment"}</span>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="prop-details-section">
                <h3 className="section-subheading">About the Accommodation</h3>
                <p className="prop-description-text">
                  {selectedPropertyDetails.description ||
                    "Spacious and fully furnished rental unit in a secure, central location with modern fixtures and convenient access."}
                </p>
              </div>

              {/* AMENITIES */}
              <div className="prop-details-section">
                <h3 className="section-subheading">Amenities & Features</h3>
                <div className="prop-amenities-tags">
                  {(Array.isArray(selectedPropertyDetails.amenities) && selectedPropertyDetails.amenities.length > 0
                    ? selectedPropertyDetails.amenities
                    : ["Air Conditioning", "High-speed WiFi", "Private Bathroom", "24/7 Security & CCTV", "Water Heater", "Kitchen Area"]
                  ).map((amenity, idx) => (
                    <span key={idx} className="amenity-chip">
                      <span className="amenity-dot"></span>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* RATINGS & REVIEW COMMENTS SECTION */}
              <div className="prop-details-reviews-section">
                <div className="reviews-section-header">
                  <div>
                    <h3 className="section-subheading" style={{ margin: "0 0 4px" }}>
                      Ratings & Tenant Reviews
                    </h3>
                    <p className="reviews-subtitle">
                      Genuine feedback and ratings from verified tenants for this accommodation.
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

                {/* RATINGS OVERVIEW CARD */}
                <div className="ratings-overview-card">
                  <div className="ratings-score-left">
                    <div className={`ratings-big-num ${!hasRatings ? "unrated" : ""}`}>{hasRatings ? avgRating : "0"}</div>
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
                        ? `Based on ${totalReviewsCount} verified ${totalReviewsCount === 1 ? "review" : "reviews"}`
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

                {/* REVIEWS COMMENTS LIST */}
                <div className="reviews-comments-list">
                  {reviewsLoading ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#8c7d70", fontSize: "13px" }}>
                      Loading tenant reviews...
                    </div>
                  ) : propertyReviews.length > 0 ? (
                    propertyReviews.map((rev) => (
                      <div key={rev.id || Math.random()} className="review-comment-card">
                        <div className="review-comment-header">
                          <div className="review-author-info">
                            <div className="review-author-avatar" style={{ background: "#5f5900" }}>
                              {(rev.author || "T").charAt(0).toUpperCase()}
                            </div>
                            <div className="review-author-meta">
                              <div className="review-name-row">
                                <span className="review-author-name">{rev.author}</span>
                                <span className="review-verified-pill">Verified Tenant</span>
                              </div>
                              <span className="review-date">{rev.duration} • {rev.date}</span>
                            </div>
                          </div>
                          <div className="review-stars-row">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <IconStar key={s} size={14} filled={s <= Number(rev.rating)} />
                            ))}
                          </div>
                        </div>
                        {rev.comment && (
                          <p className="review-comment-text">{rev.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px 16px", background: "#fdfaf6", borderRadius: "12px", border: "1px dashed #ebd9c8" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#594d43" }}>
                        No tenant reviews yet
                      </p>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#8c7d70" }}>
                        Ratings and genuine feedback from renters via the Mob'in mobile app will appear here once submitted.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* LANDLORD CONTACT BOX */}
              <div className="prop-landlord-contact-box">
                <div className="landlord-contact-avatar">
                  {(selectedPropertyDetails.landlord_name || user?.user_metadata?.full_name || "L").charAt(0).toUpperCase()}
                </div>
                <div className="landlord-contact-details">
                  <h4>{selectedPropertyDetails.landlord_name || user?.user_metadata?.full_name || "Verified Landlord"}</h4>
                  <p>
                    <span>📞 {selectedPropertyDetails.landlord_phone || "+63 917 890 1234"}</span>
                    <span> • </span>
                    <span>✉️ {selectedPropertyDetails.landlord_email || user?.email || "landlord@mobin.ph"}</span>
                  </p>
                </div>
                <span className="landlord-verified-badge">
                  <IconShield />
                  Verified Host
                </span>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="prop-details-footer" style={{ padding: "16px 24px", borderTop: "1px solid #ebd9c8", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#fdfaf6" }}>
              {onViewProperty && (
                <button
                  type="button"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    background: "#555100",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const propToEdit = selectedPropertyDetails;
                    setSelectedPropertyDetails(null);
                    onViewProperty(propToEdit);
                  }}
                >
                  Edit This Property Listing →
                </button>
              )}
              <button
                type="button"
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  background: "#ffffff",
                  color: "#594d43",
                  border: "1px solid #d4c5b5",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedPropertyDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRMATION MODAL (AVAILABILITY UPDATES)
      ===================================================== */}
      <CustomNoticeModal
        isOpen={confirmModal.isOpen}
        type="warning"
        title={confirmModal.title}
        message={confirmModal.message}
        primaryButtonText="Yes, Update"
        secondaryButtonText="Cancel"
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          else setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }}
        onClose={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
      />
    </div>
  );
}
