import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./AddProperty.css";
import CustomNoticeModal from "./CustomNoticeModal";
import sunnyStudioImg from "../assets/sunnystudio.jpg";
import twoBedFlatImg from "../assets/twobedflat.jpg";
import { compressImageToDataUrl } from "../services/imageUploadService";
import { uploadMultipleImagesToCloudinary } from "../services/cloudinaryService";
import { enforceSubscriptionLimit } from "../services/subscriptionService";
import PropertyMapPicker from "./PropertyMapPicker";
import {
  Building2,
  Home,
  BedDouble,
  Users,
  Calendar,
  Phone,
  FileText,
  Wifi,
  Wind,
  Armchair,
  Utensils,
  Laptop,
  Shirt,
  Flame,
  Car,
  Heart,
  Shield,
  ShieldCheck,
  Cctv,
  UploadCloud,
  MapPin,
  Navigation,
  EyeOff,
  Sparkles,
  Check,
  ArrowLeft,
  Info,
  Compass,
  Trash2,
  Plus,
} from "lucide-react";

export default function AddProperty({ user, onPropertyAdded, onCancel }) {
  // Section Refs for quick scrolling
  const basicRef = useRef(null);
  const detailsRef = useRef(null);
  const securityRef = useRef(null);
  const photosRef = useRef(null);
  const locationRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form State
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [contactPhone, setContactPhone] = useState(
    user?.phone || user?.user_metadata?.phone || ""
  );
  const [city, setCity] = useState("Quezon City");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(14.6507);
  const [longitude, setLongitude] = useState(121.0494);

  const [numRooms, setNumRooms] = useState("1");
  const [capacity, setCapacity] = useState("1");

  // Format today's date in local YYYY-MM-DD
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayString = getTodayDateString();

  const [availableFrom, setAvailableFrom] = useState(todayString);

  const [amenities, setAmenities] = useState({
    wifi: true,
    furnished: false,
    ac: true,
    heating: false,
    washingMachine: false,
    parking: false,
    kitchen: true,
    studyDesk: false,
    waterHeater: false,
    petFriendly: false,
  });

  const [security, setSecurity] = useState({
    cctv: false,
    securityGate: false,
    securityPersonnel: false,
    otherFeatures: "",
  });

  // Start with empty photos array so landlord's real uploaded photos are accurately stored
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [exactAddress, setExactAddress] = useState("428 Oak Street, Cityville");

  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    primaryButtonText: "OK",
    onConfirm: null,
  });

  const showNotice = (title, message, type = "info", onConfirm = null, primaryButtonText = "OK") => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      primaryButtonText,
      onConfirm,
    });
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAmenityToggle = (key) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const processIncomingFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    if (photos.length >= 6) {
      showNotice("Photo Limit Reached", "You can upload a maximum of 6 property photos.", "warning");
      return;
    }

    const availableSlots = 6 - photos.length;
    if (filesList.length > availableSlots) {
      showNotice(
        "Photo Limit Notice",
        `Only ${availableSlots} more photo${availableSlots === 1 ? "" : "s"} can be added (Maximum 6 photos).`,
        "info"
      );
    }
    const allowedFiles = filesList.slice(0, availableSlots);
    setPhotoFiles((prev) => [...prev, ...allowedFiles].slice(0, 6));
    setIsProcessingPhotos(true);

    try {
      // 1. Generate crisp local previews immediately for instant UI feedback
      const previewUrls = await Promise.all(
        allowedFiles.map((file) => compressImageToDataUrl(file, 960, 0.78))
      );
      const validPreviews = previewUrls.filter(Boolean);
      setPhotos((prev) => [...prev, ...validPreviews].slice(0, 6));

      // 2. Upload to Cloudinary in the background
      const uploadedCloudUrls = await uploadMultipleImagesToCloudinary(allowedFiles);
      if (uploadedCloudUrls && uploadedCloudUrls.length > 0) {
        setPhotos((currentPhotos) => {
          return currentPhotos.map((photo) => {
            const idx = validPreviews.indexOf(photo);
            if (idx !== -1 && uploadedCloudUrls[idx]) {
              return uploadedCloudUrls[idx];
            }
            return photo;
          });
        });
      }
    } catch (err) {
      console.warn("Photo upload warning:", err);
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processIncomingFiles(files);
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check subscription before allowing property submission
    const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
    if (!isDemo) {
      const subCheck = await enforceSubscriptionLimit(user?.id, user?.email);
      if (!subCheck.allowed) {
        showNotice(
          "Subscription Required",
          subCheck.reason || "Please subscribe to an active landlord plan before adding and publishing properties.",
          "warning"
        );
        return;
      }
    }

    if (!propertyName || !rentPrice) {
      showNotice("Missing Details", "Please fill in the property name and rental price before submitting.", "warning");
      return;
    }

    if (photos.length < 2) {
      showNotice("Photo Requirement", "Please upload at least 2 photos (Minimum 2, Maximum 6) for tenant verification.", "warning");
      return;
    }

    if (availableFrom && availableFrom < todayString) {
      showNotice(
        "Invalid Available Date",
        "The availability date cannot be in the past. Please select today or a future date.",
        "warning"
      );
      return;
    }

    setLoading(true);

    // Final check: if any photo is still a data URL, upload to Cloudinary
    let finalPhotoUrls = [...photos];
    const needUpload = finalPhotoUrls.some((p) => typeof p === "string" && p.startsWith("data:"));
    if (needUpload) {
      try {
        const uploadedUrls = await uploadMultipleImagesToCloudinary(finalPhotoUrls);
        if (uploadedUrls && uploadedUrls.length > 0) {
          finalPhotoUrls = uploadedUrls;
        }
      } catch (err) {
        console.warn("Storage upload notice (using compressed photos):", err);
      }
    }

    const primaryCoverImage = finalPhotoUrls[0] || sunnyStudioImg;

    const selectedAmenitiesList = Object.entries(amenities)
      .filter(([_, val]) => val)
      .map(([key]) => {
        switch (key) {
          case "wifi": return "WiFi";
          case "furnished": return "Furnished";
          case "ac": return "Air Conditioning";
          case "washingMachine": return "Washing Machine";
          case "parking": return "Parking";
          case "kitchen": return "Kitchen";
          case "studyDesk": return "Study Desk";
          case "waterHeater": return "Water Heater";
          case "petFriendly": return "Pet Friendly";
          default: return key;
        }
      });

    const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    const landlordIdValue = isUuid ? user.id : null;

    const newPropertyPayload = {
      property_name: propertyName,
      property_type: propertyType || "Studio",
      monthly_rent: Number(rentPrice) || 0,
      rent: Number(rentPrice) || 0,
      city: city || "Quezon City",
      location: city || "Quezon City",
      address: exactAddress,
      latitude: Number(latitude) || 14.6507,
      longitude: Number(longitude) || 121.0494,
      description: description || "Cozy rental unit in a prime location.",
      bedrooms: Number(numRooms) || 1,
      bathrooms: 1,
      capacity: Number(capacity) || 1,
      available_date: availableFrom || new Date().toISOString().split("T")[0],
      amenities: selectedAmenitiesList,
      image: primaryCoverImage,
      photos: finalPhotoUrls.length > 0 ? finalPhotoUrls : [sunnyStudioImg],
      landlord_id: landlordIdValue,
      landlord_name: user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split("@")[0] : (user?.email === "landlord@mobin.ph" ? ((typeof window !== "undefined" ? localStorage.getItem("mobin_landlord_custom_name") : null) || "Sarah Jenkins") : "Landlord")),
      landlord_email: user?.email || (user?.id === "landlord-001" ? "landlord@mobin.ph" : ""),
      landlord_phone: contactPhone || user?.user_metadata?.phone || (user?.email === "landlord@mobin.ph" ? "+63 917 123 4567" : ""),
      status: "Pending", // Sent to admin approval queue
      created_at: new Date().toISOString(),
    };

    let savedProperty = null;

    // 1. Insert into Supabase
    try {
      const { data, error } = await supabase
        .from("properties")
        .insert([newPropertyPayload])
        .select()
        .single();

      if (error) {
        console.warn("Full payload insert notice, trying safe core schema:", error.message);
        const safePayload = {
          property_name: propertyName,
          property_type: propertyType || "Studio",
          rent: Number(rentPrice) || 0,
          city: city || "Quezon City",
          address: exactAddress,
          description: description || "",
          amenities: selectedAmenitiesList,
          image: primaryCoverImage,
          photos: finalPhotoUrls.length > 0 ? finalPhotoUrls : [sunnyStudioImg],
          landlord_id: landlordIdValue,
          landlord_email: user?.email || (user?.id === "landlord-001" ? "landlord@mobin.ph" : ""),
          landlord_name: user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split("@")[0] : (user?.email === "landlord@mobin.ph" ? ((typeof window !== "undefined" ? localStorage.getItem("mobin_landlord_custom_name") : null) || "Sarah Jenkins") : "Landlord")),
          landlord_phone: contactPhone || user?.user_metadata?.phone || (user?.email === "landlord@mobin.ph" ? "+63 917 123 4567" : ""),
          status: "Pending",
          created_at: new Date().toISOString(),
        };

        const retryRes = await supabase
          .from("properties")
          .insert([safePayload])
          .select()
          .single();

        if (!retryRes.error && retryRes.data) {
          savedProperty = retryRes.data;
        } else {
          // Absolute minimum fallback matching base schema
          const minPayload = {
            property_name: propertyName,
            address: exactAddress,
            rent: Number(rentPrice) || 0,
            amenities: selectedAmenitiesList,
            image: primaryCoverImage,
            photos: finalPhotoUrls.length > 0 ? finalPhotoUrls : [sunnyStudioImg],
          };
          const minRes = await supabase
            .from("properties")
            .insert([minPayload])
            .select()
            .single();
          if (!minRes.error && minRes.data) {
            savedProperty = minRes.data;
          }
        }
      } else {
        savedProperty = data;
      }
    } catch (err) {
      console.warn("Database insert exception:", err);
    }

    // 2. Persist in local storage cache
    const finalSavedProp = {
      ...newPropertyPayload,
      ...(savedProperty || {}),
      id: savedProperty?.id || `prop-${Date.now()}`,
      image: primaryCoverImage,
      photos: finalPhotoUrls.length > 0 ? finalPhotoUrls : [sunnyStudioImg],
    };

    try {
      const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      const updatedCache = [
        finalSavedProp,
        ...cached.filter((p) => p.id !== finalSavedProp.id && p.property_name !== finalSavedProp.property_name),
      ];
      localStorage.setItem("mobin_properties", JSON.stringify(updatedCache));
      window.dispatchEvent(new Event("mobin_properties_updated"));
    } catch (_) {}

    setLoading(false);

    showNotice(
      "Property Listing Submitted!",
      `"${propertyName}" has been forwarded to the Admin Verification Queue.\n\nOnce the admin approves your property documents, it will be published live on Mob'in.`,
      "success",
      () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        if (onPropertyAdded) {
          onPropertyAdded(finalSavedProp);
        }
      },
      "View in My Properties"
    );
  };

  return (
    <div className="add-property-view">
      {/* =====================================================
          TOP NAVIGATION & HEADER
      ===================================================== */}
      <div className="add-property-top-bar">
        <button
          type="button"
          className="btn-back-link"
          onClick={() => onCancel && onCancel()}
        >
          <ArrowLeft size={15} />
          <span>Back to My Properties</span>
        </button>
        <div className="add-property-badge">
          <Sparkles size={13} />
          <span>Listing Creation Console</span>
        </div>
      </div>

      <div className="add-property-header">
        <h1>Add New Property</h1>
        <p>Fill in the details below to create an attractive, verified listing for prospective tenants on Mob'in.</p>
      </div>

      {/* =====================================================
          STEPPER QUICK JUMP PILLS
      ===================================================== */}
      <div className="add-property-stepper">
        <button type="button" className="stepper-pill" onClick={() => scrollToSection(basicRef)}>
          <span className="stepper-num">1</span>
          <span>Basic Info</span>
        </button>
        <button type="button" className="stepper-pill" onClick={() => scrollToSection(detailsRef)}>
          <span className="stepper-num">2</span>
          <span>Details & Amenities</span>
        </button>
        <button type="button" className="stepper-pill" onClick={() => scrollToSection(securityRef)}>
          <span className="stepper-num">3</span>
          <span>Safety & Security</span>
        </button>
        <button type="button" className="stepper-pill" onClick={() => scrollToSection(photosRef)}>
          <span className="stepper-num">4</span>
          <span>Photos Gallery</span>
        </button>
        <button type="button" className="stepper-pill" onClick={() => scrollToSection(locationRef)}>
          <span className="stepper-num">5</span>
          <span>Location & Map</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="add-property-form">
        {/* =====================================================
            CARD 1: BASIC INFORMATION
        ===================================================== */}
        <div className="add-property-card" ref={basicRef}>
          <div className="card-section-header-flex">
            <div className="card-section-title-wrap">
              <div className="card-icon-badge">
                <Building2 size={20} />
              </div>
              <div className="card-section-title">
                <h2>
                  Basic Information
                  {!propertyName.trim() && (
                    <span className="input-required-tag">*required</span>
                  )}
                </h2>
                <p className="card-section-subtitle">Core property title, property classification, rental rate, and landlord contact.</p>
              </div>
            </div>
            <span className="card-pill-tag accent">Step 1 of 5</span>
          </div>

          <div className="add-form-group">
            <label>
              Property Name / Title
              {!propertyName.trim() && (
                <span className="input-required-tag">*</span>
              )}
            </label>
            <div className="add-input-icon-wrap">
              <Building2 size={16} className="input-leading-icon" />
              <input
                type="text"
                placeholder="e.g. Modern Loft Studio with Skyline View"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="add-form-group">
              <label>
                Property Type
                {!propertyType && (
                  <span className="input-required-tag">*</span>
                )}
              </label>
              <div className="select-wrapper add-input-icon-wrap">
                <Home size={16} className="input-leading-icon" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Studio">Studio Unit</option>
                  <option value="1BR Apartment">1BR Apartment</option>
                  <option value="2BR Apartment">2BR Apartment</option>
                  <option value="Shared Flat">Shared Flat</option>
                  <option value="Bedspace">Bedspace</option>
                  <option value="Dormitory">Dormitory</option>
                </select>
              </div>
            </div>

            <div className="add-form-group">
              <label>
                Monthly Rent
                {!rentPrice && (
                  <span className="input-required-tag">*</span>
                )}
              </label>
              <div className="price-input-wrap">
                <span className="price-symbol">₱</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value)}
                  required
                />
                <span className="price-suffix">PHP/mo</span>
              </div>
            </div>

            <div className="add-form-group">
              <label>Landlord Contact Phone</label>
              <div className="add-input-icon-wrap">
                <Phone size={16} className="input-leading-icon" />
                <input
                  type="text"
                  placeholder="+63 917 123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="add-form-group">
            <label>
              Description & Highlights
              {!description.trim() && (
                <span className="input-required-tag">*</span>
              )}
            </label>
            <textarea
              rows="4"
              placeholder="Describe the unit interior, furnishings, nearby transit hubs, universities, shopping malls, and house rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <span className="form-field-hint">
              <Sparkles size={12} color="#555100" />
              Detailed descriptions receive higher search ranking and 3x more tenant inquiries.
            </span>
          </div>
        </div>

        {/* =====================================================
            CARD 2: PROPERTY DETAILS & AMENITIES
        ===================================================== */}
        <div className="add-property-card" ref={detailsRef}>
          <div className="card-section-header-flex">
            <div className="card-section-title-wrap">
              <div className="card-icon-badge">
                <BedDouble size={20} />
              </div>
              <div className="card-section-title">
                <h2>Property Details &amp; Amenities</h2>
                <p className="card-section-subtitle">Specify room counts, guest capacity, move-in availability, and unit features.</p>
              </div>
            </div>
            <span className="card-pill-tag accent">Step 2 of 5</span>
          </div>

          <div className="form-row-3">
            <div className="add-form-group">
              <label>Number of Rooms</label>
              <div className="add-input-icon-wrap">
                <BedDouble size={16} className="input-leading-icon" />
                <input
                  type="number"
                  min="1"
                  value={numRooms}
                  onChange={(e) => setNumRooms(e.target.value)}
                />
              </div>
            </div>

            <div className="add-form-group">
              <label>Capacity (Max Guests)</label>
              <div className="add-input-icon-wrap">
                <Users size={16} className="input-leading-icon" />
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
            </div>

            <div className="add-form-group">
              <label>Available From</label>
              <div className="add-input-icon-wrap">
                <Calendar size={16} className="input-leading-icon" />
                <input
                  type="date"
                  min={todayString}
                  value={availableFrom}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val < todayString) {
                      setAvailableFrom(todayString);
                      showNotice("Invalid Date", "Dates before today cannot be selected. Set to today.", "warning");
                    } else {
                      setAvailableFrom(val);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="add-form-group" style={{ marginBottom: 0 }}>
            <label className="checkbox-section-label">Included Amenities</label>
            <div className="amenities-interactive-grid">
              {[
                { key: "wifi", label: "High-Speed WiFi", icon: Wifi },
                { key: "ac", label: "Air Conditioning", icon: Wind },
                { key: "furnished", label: "Fully Furnished", icon: Armchair },
                { key: "kitchen", label: "Kitchen Area", icon: Utensils },
                { key: "studyDesk", label: "Study Desk", icon: Laptop },
                { key: "washingMachine", label: "Washing Machine", icon: Shirt },
                { key: "waterHeater", label: "Water Heater", icon: Flame },
                { key: "parking", label: "Vehicle Parking", icon: Car },
                { key: "petFriendly", label: "Pet Friendly", icon: Heart },
              ].map(({ key, label, icon: IconComponent }) => {
                const isChecked = amenities[key];
                return (
                  <div
                    key={key}
                    className={`amenity-chip-item ${isChecked ? "checked" : ""}`}
                    onClick={() => handleAmenityToggle(key)}
                    role="checkbox"
                    aria-checked={isChecked}
                  >
                    <div className="amenity-chip-left">
                      <div className="amenity-icon-box">
                        <IconComponent size={16} />
                      </div>
                      <span className="amenity-label-text">{label}</span>
                    </div>
                    <div className="amenity-check-indicator">
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =====================================================
            CARD 3: SAFETY & SECURITY
        ===================================================== */}
        <div className="add-property-card" ref={securityRef}>
          <div className="card-section-header-flex">
            <div className="card-section-title-wrap">
              <div className="card-icon-badge">
                <ShieldCheck size={20} />
              </div>
              <div className="card-section-title">
                <h2>Safety &amp; Security</h2>
                <p className="card-section-subtitle">Reassure tenants with verified building safety features and premises security.</p>
              </div>
            </div>
            <span className="card-pill-tag accent">Step 3 of 5</span>
          </div>

          <div className="form-row-2 align-start">
            <div className="security-interactive-col">
              {[
                { key: "cctv", label: "24/7 CCTV Surveillance", icon: Cctv },
                { key: "securityGate", label: "Gated Perimeter / Electronic Gate", icon: Shield },
                { key: "securityPersonnel", label: "Security Guards on Duty", icon: ShieldCheck },
              ].map(({ key, label, icon: SecIcon }) => {
                const isSecChecked = security[key];
                return (
                  <div
                    key={key}
                    className={`security-chip-item ${isSecChecked ? "checked" : ""}`}
                    onClick={() => handleSecurityToggle(key)}
                    role="checkbox"
                    aria-checked={isSecChecked}
                  >
                    <div className="security-chip-left">
                      <div className="security-icon-box">
                        <SecIcon size={16} />
                      </div>
                      <span className="amenity-label-text">{label}</span>
                    </div>
                    <div className="amenity-check-indicator">
                      {isSecChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="add-form-group">
              <label>Other Security Features</label>
              <div className="add-input-icon-wrap">
                <Shield size={16} className="input-leading-icon" />
                <input
                  type="text"
                  placeholder="e.g. Smart Keycard Access, Fire Alarm & Sprinklers"
                  value={security.otherFeatures}
                  onChange={(e) =>
                    setSecurity({ ...security, otherFeatures: e.target.value })
                  }
                />
              </div>
              <span className="form-field-hint">
                <Info size={12} />
                Properties with explicit safety measures achieve faster booking conversions.
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            CARD 4: PROPERTY PHOTOS
        ===================================================== */}
        <div className="add-property-card" ref={photosRef}>
          <div className="card-section-header-flex">
            <div className="card-section-title-wrap">
              <div className="card-icon-badge">
                <UploadCloud size={20} />
              </div>
              <div className="card-section-title">
                <h2>
                  Property Photos
                  {photos.length < 2 && (
                    <span className="input-required-tag">*min 2 photos required</span>
                  )}
                </h2>
                <p className="card-section-subtitle">Upload clean, well-lit photos showing bedrooms, common areas, and amenities.</p>
              </div>
            </div>
            <span className={`card-pill-tag ${photos.length >= 2 ? "accent" : ""}`}>
              {photos.length} / 6 photos {photos.length >= 2 ? "✓" : "(Min 2)"}
            </span>
          </div>

          {/* DROPZONE */}
          <div
            className={`photos-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              const droppedFiles = Array.from(e.dataTransfer?.files || []).filter(
                (f) => f.type.startsWith("image/")
              );
              if (droppedFiles.length > 0) {
                processIncomingFiles(droppedFiles);
              }
            }}
            onClick={() => {
              if (photos.length < 6) fileInputRef.current?.click();
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <div className="photos-dropzone-icon">
              <UploadCloud size={28} />
            </div>
            <h3>Drag &amp; drop photos here, or click to browse</h3>
            <p>PNG, JPG, or WEBP formats supported (Maximum 6 photos, minimum 2)</p>

            {isProcessingPhotos && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "10px 0", color: "#686300", fontWeight: "600", fontSize: "13.5px" }}>
                <span className="spinner-border animate-spin" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #686300", borderTopColor: "transparent", borderRadius: "50%" }}></span>
                Processing &amp; uploading photos...
              </div>
            )}

            {photos.length < 6 ? (
              <button
                type="button"
                className="btn-select-files"
                disabled={isProcessingPhotos}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Plus size={15} />
                <span>{isProcessingPhotos ? "Processing..." : "Select Photos from Computer"}</span>
              </button>
            ) : (
              <span style={{ fontSize: "13px", color: "#555100", fontWeight: 700 }}>
                ✓ Maximum 6 photos reached
              </span>
            )}
          </div>

          {/* UPLOADED PHOTO PREVIEWS */}
          {photos.length > 0 && (
            <div className="photos-preview-gallery">
              {photos.map((src, idx) => (
                <div key={idx} className="photo-preview-item">
                  <img src={src} alt={`Property Upload ${idx + 1}`} />
                  {idx === 0 && (
                    <span className="photo-cover-badge">★ Cover Photo</span>
                  )}
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(idx);
                    }}
                    title="Remove Photo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <div
                  className="photo-add-more-slot"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload another photo"
                >
                  <Plus size={22} />
                  <span>Add Photo</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            CARD 5: LOCATION
        ===================================================== */}
        <div className="add-property-card" ref={locationRef}>
          <div className="card-section-header-flex">
            <div className="card-section-title-wrap">
              <div className="card-icon-badge">
                <MapPin size={20} />
              </div>
              <div className="card-section-title">
                <h2>Location &amp; Interactive Map</h2>
                <p className="card-section-subtitle">Set the city and address. Exact street address is protected and only disclosed upon verified booking.</p>
              </div>
            </div>
            <span className="card-pill-tag accent">Step 5 of 5</span>
          </div>

          <div className="location-two-col">
            {/* LEFT: EXACT ADDRESS & PRIVACY NOTICE */}
            <div className="location-left-col">
              <div className="add-form-group">
                <label>City / Municipality</label>
                <div className="select-wrapper add-input-icon-wrap">
                  <MapPin size={16} className="input-leading-icon" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="Quezon City">Quezon City</option>
                    <option value="Manila">Manila</option>
                    <option value="Makati">Makati</option>
                    <option value="Taguig (BGC)">Taguig (BGC)</option>
                    <option value="Pasig">Pasig</option>
                    <option value="Mandaluyong">Mandaluyong</option>
                    <option value="San Juan">San Juan</option>
                    <option value="Parañaque">Parañaque</option>
                    <option value="Pasay">Pasay</option>
                    <option value="Caloocan">Caloocan</option>
                    <option value="Cebu City">Cebu City</option>
                    <option value="Davao City">Davao City</option>
                    <option value="Baguio">Baguio</option>
                    <option value="Other">Other Metro Area</option>
                  </select>
                </div>
              </div>

              <div className="add-form-group">
                <label>
                  Exact Street Address
                  {!exactAddress.trim() && (
                    <span className="input-required-tag">*</span>
                  )}
                </label>
                <div className="add-input-icon-wrap">
                  <Navigation size={16} className="input-leading-icon" />
                  <input
                    type="text"
                    placeholder="e.g. 428 Oak Street, Brgy. Central"
                    value={exactAddress}
                    onChange={(e) => setExactAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="privacy-notice-box">
                <div className="privacy-notice-icon-box">
                  <EyeOff size={20} />
                </div>
                <div className="privacy-notice-text">
                  <h4>Privacy Protected</h4>
                  <p>
                    The precise street address is hidden from public browse listings. It will only be shared with verified tenants after a viewing schedule is confirmed.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: MAP CONTAINER */}
            <div className="location-map-wrap">
              <PropertyMapPicker
                city={city}
                latitude={latitude}
                longitude={longitude}
                propertyName={propertyName}
                exactAddress={exactAddress}
                onLocationChange={(newLat, newLng) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                }}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM FORM ACTIONS ROW
        ===================================================== */}
        <div className="add-property-bottom-actions">
          <div className="action-bar-left-hint">
            <Info size={16} color="#8c5310" />
            <span>Listings are verified within 24 hours by Mob'in administrators before going public.</span>
          </div>

          <div className="action-bar-right-btns">
            <button
              type="button"
              className="btn-form-cancel"
              onClick={() => onCancel && onCancel()}
              disabled={loading}
            >
              Cancel &amp; Discard
            </button>

            <button
              type="submit"
              className="btn-form-save"
              disabled={loading}
            >
              {loading ? (
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
                  <span>Submitting Listing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publish Property Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* CUSTOM NOTICE MODAL */}
      <CustomNoticeModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryButtonText={modalConfig.primaryButtonText}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}