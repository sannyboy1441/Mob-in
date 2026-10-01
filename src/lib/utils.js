import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function filterPropertiesForUser(propsList, user) {
  if (!Array.isArray(propsList)) return [];
  const cleanEmail = user?.email?.trim().toLowerCase();
  const userId = user?.id ? String(user.id) : "";
  const isDemo = cleanEmail === "landlord@mobin.ph" || userId === "landlord-001";

  if (isDemo) {
    return propsList.filter((p) => {
      const pEmail = p.landlord_email?.trim().toLowerCase();
      const pId = String(p.id || "");
      return (
        pEmail === "landlord@mobin.ph" ||
        String(p.landlord_id || "") === "landlord-001" ||
        pId === "prop-1" ||
        pId === "prop-2"
      );
    });
  }

  if (!cleanEmail && !userId) return [];

  return propsList.filter((p) => {
    const pEmail = p.landlord_email?.trim().toLowerCase();
    const uEmail = p.user_email?.trim().toLowerCase();
    const pLandlordId = p.landlord_id ? String(p.landlord_id) : "";
    const pUserId = p.user_id ? String(p.user_id) : "";

    if (cleanEmail && ((pEmail && pEmail === cleanEmail) || (uEmail && uEmail === cleanEmail))) return true;
    if (userId && ((pLandlordId && pLandlordId === userId) || (pUserId && pUserId === userId))) return true;
    return false;
  });
}

export function getLandlordDisplayName(user) {
  if (!user) return "Landlord";
  const customDemoName =
    typeof window !== "undefined"
      ? localStorage.getItem("mobin_landlord_custom_name")
      : null;
  const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
  if (isDemo && customDemoName && customDemoName.trim()) {
    return customDemoName.trim();
  }
  if (user?.user_metadata?.full_name?.trim()) return user.user_metadata.full_name.trim();
  if (user?.name?.trim()) return user.name.trim();
  if (user?.user_metadata?.first_name) {
    const fn = user.user_metadata.first_name.trim();
    const ln = user.user_metadata.last_name ? user.user_metadata.last_name.trim() : "";
    return `${fn} ${ln}`.trim();
  }
  if (user?.email) {
    const prefix = user.email.split("@")[0].replace(/[._]/g, " ");
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return isDemo ? (customDemoName || "Sarah Jenkins") : "Landlord";
}

export function filterMessagesForLandlord(messagesList, user, ownedProperties = []) {
  if (!Array.isArray(messagesList) || messagesList.length === 0) return [];

  const cleanUserEmail = (user?.email || "").toLowerCase().trim();
  const userId = user?.id ? String(user.id) : "";
  const isDemo = cleanUserEmail === "landlord@mobin.ph" || userId === "landlord-001";

  // Build sets for quick lookup of properties owned by this landlord
  const ownedPropIdSet = new Set();
  const ownedPropNameSet = new Set();

  if (Array.isArray(ownedProperties)) {
    ownedProperties.forEach((p) => {
      if (!p) return;
      if (p.id !== undefined && p.id !== null && p.id !== "") ownedPropIdSet.add(String(p.id));
      if (p.property_name) ownedPropNameSet.add(String(p.property_name).toLowerCase().trim());
    });
  }

  // Demo landlord owns demo properties prop-1 and prop-2 by default
  if (isDemo) {
    ownedPropIdSet.add("prop-1");
    ownedPropIdSet.add("prop-2");
  }

  return messagesList.filter((m) => {
    if (!m) return false;
    const msgSender = (m.sender_email || "").toLowerCase().trim();
    if (msgSender === "test@realtime.com" || msgSender === "test@test.com") return false;

    const msgText = m.message || "";
    if (!msgText && !msgSender && !m.image && !m.image_url) return false;

    const msgLandlordEmail = (m.landlord_email || "").toLowerCase().trim();
    const msgLandlordId = m.landlord_id ? String(m.landlord_id) : "";
    const msgPropId = m.property_id !== undefined && m.property_id !== null ? String(m.property_id).trim() : "";
    const msgPropName = (m.property_name || "").toLowerCase().trim();

    const hasPropertyRef = Boolean(msgPropId && msgPropId !== "general" && msgPropId !== "null" && msgPropId !== "undefined");
    const isThisLandlordsProperty = hasPropertyRef && (ownedPropIdSet.has(msgPropId) || (msgPropName && ownedPropNameSet.has(msgPropName)));

    const isSender = Boolean(
      (cleanUserEmail && msgSender === cleanUserEmail) ||
      (isDemo && (msgSender === "landlord@mobin.ph" || msgSender === "landlord-001"))
    );

    // 1. PROPERTY INQUIRIES & REPLIES
    // If the message is regarding a property, ONLY the owner of that property (and the sender) can see it!
    if (hasPropertyRef) {
      if (isThisLandlordsProperty) return true;
      if (isSender) return true;
      return false;
    }

    // 2. DIRECT GENERAL MESSAGES (no property attached)
    if (isSender) return true;

    if (isDemo) {
      if (msgLandlordEmail && msgLandlordEmail !== "landlord@mobin.ph") return false;
      if (msgLandlordId && msgLandlordId !== "landlord-001") return false;
      return msgLandlordEmail === "landlord@mobin.ph" || msgLandlordId === "landlord-001";
    }

    if (msgLandlordEmail === "landlord@mobin.ph" || msgLandlordId === "landlord-001") return false;
    if (cleanUserEmail && msgLandlordEmail === cleanUserEmail) return true;
    if (userId && msgLandlordId === userId) return true;

    return false;
  });
}


