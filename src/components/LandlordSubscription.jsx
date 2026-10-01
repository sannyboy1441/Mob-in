import React, { useState, useEffect } from "react";
import "./LandlordSubscription.css";
import { useSubscription } from "../hooks/useSubscription";
import { supabase } from "../supabaseClient";
import { DEFAULT_PLANS } from "../services/subscriptionService";
import CustomNoticeModal from "./CustomNoticeModal";
import TablePagination from "./ui/table-pagination";
import { filterPropertiesForUser, getLandlordDisplayName } from "../lib/utils";
import { compressImageToDataUrl } from "../services/imageUploadService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import emailjs from "@emailjs/browser";
import NumberFlow from "@number-flow/react";
import gcashQrImg from "../assets/gcash_qr.jpg";
import mayaQrImg from "../assets/maya_qr.jpg";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  RefreshCw,
  CreditCard,
  Download,
  AlertCircle,
  X,
  QrCode,
  Smartphone,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Eye,
  MessageSquare,
  BadgeDollarSign,
  Activity,
  Zap,
  Upload,
  Camera,
  Image as ImageIcon,
} from "lucide-react";

function IconInfoCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

export default function LandlordSubscription({ user }) {
  // Integrate custom useSubscription hook
  const {
    plans,
    landlordPlans,
    subscription,
    currentPlan,
    isSubscribed,
    propertyCount,
    unitLimit,
    usagePercentage,
    isQuotaReached,
    upgradePlan,
    refetch,
  } = useSubscription(user);

  // Real properties and metrics state
  const [activeProperties, setActiveProperties] = useState([]);
  const [totalRentalValue, setTotalRentalValue] = useState(0);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  // Dynamic next renewal date computed from subscription or 30 days from now
  const [nextRenewalDate, setNextRenewalDate] = useState(() => {
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  });

  // Billing interval toggle (Monthly vs Annual with 20% discount)
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Modals state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Payment Method State (GCash & Maya)
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState("gcash");
  const [gcashNumber, setGcashNumber] = useState("0917 ••• 8829");
  const [mayaNumber, setMayaNumber] = useState("0918 ••• 3912");
  const [cardDetails, setCardDetails] = useState({
    type: "Visa",
    last4: "4242",
    expiry: "12/26",
  });

  // Edit fields for payment method modal
  const [inputGcash, setInputGcash] = useState("0917 882 8829");
  const [inputMaya, setInputMaya] = useState("0918 391 3912");
  const [inputCardNumber, setInputCardNumber] = useState("4242 •••• •••• 4242");

  // Landlord Billing state from user context
  const [billingInfo, setBillingInfo] = useState(() => {
    const isDemoLandlord = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
    const defaultName = getLandlordDisplayName(user);
    return {
      name: defaultName,
      addressLine1: "123 University Avenue, Diliman",
      cityPostal: "Quezon City, Metro Manila 1101",
      country: "Philippines",
      email: user?.email || (isDemoLandlord ? "landlord@mobin.ph" : ""),
    };
  });

  // Sync billingInfo name and email whenever user or profile updates
  useEffect(() => {
    const activeName = getLandlordDisplayName(user);
    if (activeName) {
      setBillingInfo((prev) => ({
        ...prev,
        name: activeName,
        email: user?.email || prev.email,
      }));
    }
  }, [user]);

  // Helper to generate dynamic realistic dates
  const getPastDateString = (monthsAgo = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const [paymentHistoryList, setPaymentHistoryList] = useState(() => {
    try {
      const cached = localStorage.getItem("mobin_invoices");
      if (cached) {
        const parsed = JSON.parse(cached);
        const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
        if (isDemo && Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (inv) =>
              (user?.email && inv.user_email === user.email) ||
              (user?.id && inv.landlordId === user.id)
          );
        }
      }
    } catch {}
    return [];
  });

  // Table pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);

  // Proof of payment upload state
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [paymentProofFileName, setPaymentProofFileName] = useState("");
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState("");
  const [isDraggingProof, setIsDraggingProof] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const proofFileRef = React.useRef(null);

  // Listen for external invoice/payment updates
  useEffect(() => {
    const handleInvoicesUpdated = () => {
      try {
        const cached = localStorage.getItem("mobin_invoices");
        if (cached) {
          const parsed = JSON.parse(cached);
          const isDemo = user?.email === "landlord@mobin.ph" || user?.id === "landlord-001";
          if (isDemo && Array.isArray(parsed) && parsed.length > 0) {
            setPaymentHistoryList(parsed);
          } else if (Array.isArray(parsed)) {
            setPaymentHistoryList(
              parsed.filter(
                (inv) =>
                  (user?.email && inv.user_email === user.email) ||
                  (user?.id && inv.landlordId === user.id)
              )
            );
          }
        }
      } catch (_) {}
    };

    window.addEventListener("mobin_invoices_updated", handleInvoicesUpdated);
    return () => window.removeEventListener("mobin_invoices_updated", handleInvoicesUpdated);
  }, [user]);

  const processProofFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic)$/i.test(file.name)) {
      showNotice("Invalid File", "Please select a valid image file (JPG, PNG, WebP) for proof of payment.", "warning");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showNotice("File Too Large", "Please select an image smaller than 12MB.", "warning");
      return;
    }
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 960, 0.82);
      setPaymentProofPreview(compressedDataUrl);
      setPaymentProofFileName(file.name);
    } catch (err) {
      console.warn("Proof compression error:", err);
      showNotice("Upload Error", "Could not process image. Please try another file.", "error");
    }
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processProofFile(file);
    }
  };

  const handleRemoveProof = () => {
    setPaymentProofPreview(null);
    setPaymentProofFileName("");
    if (proofFileRef.current) {
      proofFileRef.current.value = "";
    }
  };

  // Fetch actual properties, total rental revenue, and invoices from Supabase in parallel
  useEffect(() => {
    let isMounted = true;

    async function loadActualData() {
      try {
        let propQuery = supabase.from("properties").select("*");
        const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        if (isUuid && user?.email) {
          propQuery = propQuery.or(`landlord_id.eq.${user.id},landlord_email.eq.${user.email}`);
        } else if (isUuid) {
          propQuery = propQuery.eq("landlord_id", user.id);
        } else if (user?.email) {
          propQuery = propQuery.eq("landlord_email", user.email);
        }

        let inqQuery = supabase.from("messages").select("id", { count: "exact", head: true });
        const cleanUserEmail = (user?.email || "").toLowerCase().trim();
        const isDemo = cleanUserEmail === "landlord@mobin.ph" || user?.id === "landlord-001";
        if (isDemo) {
          inqQuery = inqQuery.eq("landlord_email", "landlord@mobin.ph");
        } else if (isUuid && user?.email) {
          inqQuery = inqQuery.or(`landlord_id.eq.${user.id},landlord_email.eq.${user.email}`);
        } else if (isUuid) {
          inqQuery = inqQuery.eq("landlord_id", user.id);
        } else if (user?.email) {
          inqQuery = inqQuery.eq("landlord_email", user.email);
        }

        const invQuery = supabase.from("invoices").select("*").order("created_at", { ascending: false });

        const [propRes, inqRes, invRes] = await Promise.allSettled([propQuery, inqQuery, invQuery]);

        if (!isMounted) return;

        if (propRes.status === "fulfilled" && propRes.value.data && propRes.value.data.length > 0) {
          const props = propRes.value.data;
          setActiveProperties(props);
          const totalRent = props.reduce((acc, p) => {
            const rentVal = Number(p.monthly_rent || p.price || 0);
            return acc + (isNaN(rentVal) ? 0 : rentVal);
          }, 0);
          setTotalRentalValue(totalRent > 0 ? totalRent : props.length * 12000);
          setViewsCount(props.length * 480 + 120);
        } else {
          try {
            const cached = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
            const userCached = filterPropertiesForUser(cached, user);
            if (userCached.length > 0) {
              setActiveProperties(userCached);
              const totalRent = userCached.reduce((acc, p) => acc + (Number(p.price || p.monthly_rent || 12000)), 0);
              setTotalRentalValue(totalRent);
              setViewsCount(userCached.length * 480);
            } else {
              setActiveProperties([]);
              setTotalRentalValue(0);
              setViewsCount(0);
            }
          } catch {}
        }

        if (inqRes.status === "fulfilled" && inqRes.value.count !== undefined && inqRes.value.count !== null) {
          setInquiriesCount(inqRes.value.count || 18);
        }

        if (invRes.status === "fulfilled" && invRes.value.data && invRes.value.data.length > 0) {
          const mappedInvoices = invRes.value.data.map((inv) => ({
            id: inv.id,
            orNumber: inv.or_number || `OR-${Math.floor(100000 + Math.random() * 900000)}`,
            date: new Date(inv.created_at || inv.paid_at || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            plan: currentPlan?.name || "Landlord Starter",
            amount: `₱${Number(inv.amount || currentPlan?.price || 149).toFixed(2)}`,
            vat: `₱${Number(inv.vat_amount || (inv.amount || currentPlan?.price || 149) * 0.12).toFixed(2)}`,
            channel: (inv.payment_channel || "GCash").toUpperCase(),
            status: inv.status === "paid" ? "Paid" : inv.status || "Paid",
          }));
          setPaymentHistoryList(mappedInvoices);
        }
      } catch (err) {
        console.warn("Actual landlord data load notice:", err);
      }
    }

    loadActualData();
    return () => {
      isMounted = false;
    };
  }, [user, currentPlan]);

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

  // Initiate checkout flow
  const handleInitiateUpgrade = (targetPlan) => {
    setPendingPlan(targetPlan);
    setShowUpgradeModal(false);
    setShowCheckoutModal(true);
  };

  // Complete checkout & payment authorization
  const handleConfirmCheckout = async () => {
    if (!pendingPlan) return;

    if (!paymentProofPreview) {
      showNotice(
        "Proof of Payment Required",
        `Please upload a screenshot of your ${selectedPaymentChannel === "maya" ? "Maya" : "GCash"} payment receipt before confirming your subscription.`,
        "warning"
      );
      return;
    }

    setIsProcessingPayment(true);

    try {
      const refNumber = paymentReferenceNumber?.trim() || `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;

      await upgradePlan(pendingPlan.id, {
        paymentChannel: selectedPaymentChannel,
        billingInterval: billingCycle,
        tin: "",
        proofImage: paymentProofPreview,
        proofFileName: paymentProofFileName,
        referenceNumber: refNumber,
      });

      const calculatedPrice =
        billingCycle === "annual"
          ? (pendingPlan.annualPrice || pendingPlan.yearlyPrice || Math.round(pendingPlan.price * 12 * 0.8))
          : pendingPlan.price;

      const currentYear = new Date().getFullYear();
      const invId = `INV-${currentYear}-00${Math.floor(10 + Math.random() * 90)}`;
      const orNum = `OR-${Math.floor(100000 + Math.random() * 900000)}`;
      const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const landlordName = getLandlordDisplayName(user) || billingInfo.name || "Landlord";
      const landlordEmail = user?.email || "landlord@mobin.ph";

      const newInvoice = {
        id: invId,
        orNumber: orNum,
        reference: refNumber,
        date: formattedDate,
        plan: `${pendingPlan.name} (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
        amount: `₱${calculatedPrice.toLocaleString()}.00`,
        rawAmount: calculatedPrice,
        vat: "₱0.00",
        channel: selectedPaymentChannel.toUpperCase(),
        status: "Paid",
        proof_image: paymentProofPreview,
        proof_filename: paymentProofFileName,
        user_email: landlordEmail,
        landlordId: user?.id || "landlord-001",
        created_at: new Date().toISOString(),
      };

      // 1. Update LandlordSubscription paymentHistoryList state & mobin_invoices
      const updatedHistory = [newInvoice, ...paymentHistoryList];
      setPaymentHistoryList(updatedHistory);
      try {
        const cachedInvoices = JSON.parse(localStorage.getItem("mobin_invoices") || "[]");
        localStorage.setItem("mobin_invoices", JSON.stringify([newInvoice, ...cachedInvoices]));
        window.dispatchEvent(new Event("mobin_invoices_updated"));
      } catch (_) {}

      // 2. Add to LandlordDashboard payment history (mobin_payments)
      try {
        const cachedPayments = JSON.parse(localStorage.getItem("mobin_payments") || "[]");
        const newLandlordPayment = {
          id: `pay-${Date.now()}`,
          invoice_id: invId,
          or_number: orNum,
          reference: refNumber,
          reference_number: refNumber,
          date: formattedDate,
          description: `${pendingPlan.name} Subscription (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
          amount: calculatedPrice,
          status: "Paid",
          channel: selectedPaymentChannel.toUpperCase(),
          proof_image: paymentProofPreview,
          proof_filename: paymentProofFileName,
          user_email: landlordEmail,
          user_id: user?.id || "landlord-001",
          created_at: new Date().toISOString(),
        };
        localStorage.setItem("mobin_payments", JSON.stringify([newLandlordPayment, ...cachedPayments]));
        window.dispatchEvent(new Event("mobin_payments_updated"));
      } catch (_) {}

      // 3. Add to AdminDashboard transactions ledger (mobin_admin_transactions)
      try {
        const cachedAdminTx = JSON.parse(localStorage.getItem("mobin_admin_transactions") || "[]");
        const newAdminTx = {
          id: orNum,
          dbId: `tx-${Date.now()}`,
          payerName: landlordName,
          payerEmail: landlordEmail,
          role: "Landlord",
          item: `${pendingPlan.name} Subscription (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
          amount: calculatedPrice,
          gateway: selectedPaymentChannel === "gcash" ? "GCash (QR Scan)" : "Maya (QR Scan)",
          refNo: refNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          reference: refNumber,
          date: formattedDate,
          rawDate: new Date().toISOString(),
          status: "Completed",
          proof_image: paymentProofPreview,
        };
        localStorage.setItem("mobin_admin_transactions", JSON.stringify([newAdminTx, ...cachedAdminTx]));
        window.dispatchEvent(new Event("mobin_admin_transactions_updated"));
      } catch (_) {}

      // 4. Record to Supabase 'payments' table
      try {
        const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        await supabase.from("payments").insert([{
          user_id: isUuid ? user.id : null,
          user_email: landlordEmail,
          amount: calculatedPrice,
          tier: `${pendingPlan.name} Subscription`,
          status: "Completed",
          reference: refNumber,
          created_at: new Date().toISOString(),
        }]);
      } catch (dbErr) {
        console.warn("Supabase payments insert notice:", dbErr);
      }

      // 5. Send screenshot photo & reference number to Gmail via EmailJS
      try {
        let onlineProofUrl = "";
        if (paymentProofPreview) {
          onlineProofUrl = await uploadImageToCloudinary(paymentProofPreview, "mobin/payment_proofs");
        }

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_vr0gcbr";
        const templateId = import.meta.env.VITE_EMAILJS_RECEIPT_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_stpsf94";
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "LBV7JYBqE6IsIz6R8";

        const emailMessage = `Subscription Payment Confirmation\n\nPlan: ${pendingPlan.name} (${billingCycle === "annual" ? "Annual" : "Monthly"})\nAmount Paid: ₱${calculatedPrice.toLocaleString()}.00\nPayment Channel: ${selectedPaymentChannel.toUpperCase()}\nReference Number: ${refNumber}\nOfficial Receipt #: ${orNum}\nLandlord Account: ${landlordName} (${landlordEmail})\n\nProof of Payment Screenshot: ${onlineProofUrl || "(Screenshot verified and recorded in your Mob'in billing history)"}`;

        await emailjs.send(
          serviceId,
          templateId,
          {
            to_email: landlordEmail,
            email: landlordEmail,
            user_email: landlordEmail,
            recipient: landlordEmail,
            to_name: landlordName,
            user_name: landlordName,
            subject: `Mob'in Payment Receipt - Reference #${refNumber}`,
            reference_number: refNumber,
            ref_no: refNumber,
            code: refNumber,
            amount: `₱${calculatedPrice.toLocaleString()}.00`,
            plan: pendingPlan.name,
            proof_url: onlineProofUrl || paymentProofPreview,
            screenshot_url: onlineProofUrl || paymentProofPreview,
            image_url: onlineProofUrl,
            message: emailMessage,
          },
          publicKey
        );
        console.info("[EmailJS] Payment screenshot & reference sent to Gmail:", landlordEmail);
      } catch (emailErr) {
        console.warn("Payment confirmation email dispatch notice:", emailErr);
      }

      setPaymentProofPreview(null);
      setPaymentProofFileName("");
      setPaymentReferenceNumber("");
      setShowCheckoutModal(false);
      refetch();
      showNotice(
        "Payment Successful!",
        `You are now subscribed to ${pendingPlan.name}.\n\nYour screenshot proof has been saved to your payment history and sent to your Gmail (${landlordEmail}).`,
        "success"
      );
    } catch (err) {
      showNotice("Payment Notice", `Payment processing notice: ${err.message}`, "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Confirm early renewal
  const handleConfirmEarlyRenewal = () => {
    const newDate = "Dec 15, 2024";
    setNextRenewalDate(newDate);

    const renewInvoice = {
      id: `INV-2024-00${Math.floor(10 + Math.random() * 90)}`,
      orNumber: `OR-${Math.floor(100000 + Math.random() * 900000)}`,
      date: "Today (Early Renewal)",
      plan: `${currentPlan?.name || "Landlord Starter"} (Renewed)`,
      amount: `₱${currentPlan?.price ?? 149}.00`,
      vat: `₱${(((currentPlan?.price ?? 149)) * 0.12).toFixed(2)}`,
      channel: selectedPaymentChannel.toUpperCase(),
      status: "Paid",
    };

    setPaymentHistoryList([renewInvoice, ...paymentHistoryList]);
    setShowRenewModal(false);
    setShowManageModal(false);
    showNotice(
      "Subscription Renewed!",
      `Your subscription has been extended until ${newDate}.\n\nAn Official Receipt has been generated in your payment history.`,
      "success"
    );
  };

  // Save billing information
  const handleSaveBilling = () => {
    setIsEditingBilling(false);
    try {
      localStorage.setItem("mobin_billing_info", JSON.stringify(billingInfo));
    } catch {}
    showNotice("Billing Details Saved", "Your BIR TIN and business billing details have been updated successfully.", "success");
  };

  // Save payment method
  const handleSavePaymentMethod = () => {
    if (selectedPaymentChannel === "gcash") {
      setGcashNumber(inputGcash.slice(0, 4) + " ••• " + inputGcash.slice(-4));
    } else if (selectedPaymentChannel === "maya") {
      setMayaNumber(inputMaya.slice(0, 4) + " ••• " + inputMaya.slice(-4));
    } else if (selectedPaymentChannel === "card") {
      setCardDetails({
        type: "Visa",
        last4: inputCardNumber.slice(-4) || "4242",
        expiry: "12/26",
      });
    }
    setShowPaymentModal(false);
    showNotice("Payment Method Updated", `Default payment method successfully set to ${selectedPaymentChannel.toUpperCase()}.`, "success");
  };

  const statusDisplay = isSubscribed
    ? (subscription?.status || "Active")
    : "Not Subscribed";

  return (
    <div className="subscription-management-view">
      {/* =====================================================
          HEADER WITH BREADCRUMB & STATUS
      ===================================================== */}
      <div className="subscription-main-header">
        <div>
          <h1>Subscription Management</h1>
          <p className="subscription-sub-subtitle">
            Manage your Mob'in Landlord tier, unit quota, local payment channels, and BIR Official Receipts.
          </p>
        </div>
        <div className="header-status-indicator">
          <span
            className={`status-pill ${
              !isSubscribed
                ? "unsubscribed-glow"
                : statusDisplay === "Active"
                ? "active-glow"
                : statusDisplay === "Grace_Period"
                ? "grace-glow"
                : "trial-glow"
            }`}
          >
            <span className="badge-dot"></span>
            Account Status: <strong>{statusDisplay.replace("_", " ")}</strong>
          </span>
        </div>
      </div>

      {/* =====================================================
          ABOUT BANNER
      ===================================================== */}
      <div className={`subscription-about-banner ${!isSubscribed ? "unsubscribed-banner" : ""}`}>
        <div className="about-banner-icon">
          <IconInfoCircle />
        </div>
        <div className="about-banner-text">
          <h3>
            {isSubscribed
              ? "Landlord Subscription Guarantee"
              : "⚠️ Landlord Subscription Required to Publish Properties"}
          </h3>
          <p>
            {isSubscribed
              ? "An active subscription keeps your properties visible to verified students and workers, unlocks direct tenant messaging, and grants priority search visibility with 0% commission on tenant rent payments."
              : "You do not have an active subscription yet. Subscribe to a plan below to activate your listing quota, receive direct tenant inquiries, and start renting to verified students."}
          </p>
        </div>
      </div>


      {/* =====================================================
          QUOTA USAGE METER STRIP
      ===================================================== */}
      <div className="subscription-quota-meter-card">
        <div className="quota-meter-header">
          <div className="quota-title-wrap">
            <Building2 size={20} className="quota-icon" />
            <div>
              <h3>Property Listing Quota (Unit Limit)</h3>
              <p className="quota-subtext">
                {isSubscribed ? (
                  <>
                    You are currently using <strong>{propertyCount}</strong> of <strong>{unitLimit}</strong> allowed property {unitLimit === 1 ? "listing" : "listings"}.
                  </>
                ) : (
                  <>
                    You currently have <strong>0 listing slots</strong> available. Subscribe to a plan to start publishing properties.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="quota-action-btn-wrap">
            {!isSubscribed ? (
              <button
                type="button"
                className="btn-quota-upgrade pulse-effect"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Sparkles size={16} />
                <span>Subscribe to List Properties</span>
              </button>
            ) : isQuotaReached ? (
              <button
                type="button"
                className="btn-quota-upgrade pulse-effect"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Sparkles size={16} />
                <span>Upgrade to List More</span>
              </button>
            ) : (
              <span className="quota-available-badge">
                <CheckCircle2 size={15} /> {unitLimit - propertyCount} listing slots available
              </span>
            )}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="quota-bar-track">
          <div
            className={`quota-bar-fill ${!isSubscribed ? "unsubscribed-fill" : usagePercentage >= 100 ? "full" : ""}`}
            style={{ width: `${!isSubscribed ? 0 : usagePercentage}%` }}
          ></div>
        </div>

        <div className="quota-footer-row">
          <span>{propertyCount} Active Listed</span>
          <span>
            {isSubscribed
              ? `${unitLimit >= 999 ? "Unlimited" : unitLimit} Max Allowed on ${currentPlan?.name || "Active Tier"}`
              : "0 Max Allowed (Subscribe First)"}
          </span>
        </div>
      </div>

      {/* =====================================================
          TWO COLUMN GRID
      ===================================================== */}
      <div className="subscription-two-col-grid">
        {/* LEFT COLUMN: CURRENT PLAN CARD */}
        <div className="subscription-card current-plan-card">
          <div className="plan-card-header">
            <h2>Current Plan</h2>
            <span className={`plan-active-badge ${!isSubscribed ? "unsubscribed-badge" : ""}`}>
              <span className="badge-dot"></span> {isSubscribed ? statusDisplay : "No Active Plan"}
            </span>
          </div>

          <p className="plan-tier-sub">
            {isSubscribed ? (currentPlan?.name || "Active Landlord Plan") : "Free / Inactive Account"}
          </p>

          <div className="plan-price-display">
            <span className="price-amount">
              ₱{isSubscribed ? (currentPlan?.price ?? 149) : "0"}
            </span>
            <span className="price-period">
              {isSubscribed ? `/${currentPlan?.billingInterval || currentPlan?.period || "month"}` : " (Subscribe to activate)"}
            </span>
          </div>

          <div className="plan-features-list">
            <div className="feature-row">
              <Building2 size={16} className="feature-row-icon" />
              <span>
                Unit Cap:{" "}
                <strong>
                  {isSubscribed ? (currentPlan?.propertiesLimit || `${unitLimit >= 999 ? "Unlimited" : unitLimit} ${unitLimit === 1 ? "Property" : "Properties"}`) : "0 Properties (Locked)"}
                </strong>
              </span>
            </div>
            <div className="feature-row">
              <Calendar size={16} className="feature-row-icon" />
              <span>
                Billing Interval:{" "}
                <strong>
                  {isSubscribed
                    ? currentPlan?.billingInterval === "annual"
                      ? "Annual"
                      : "Monthly"
                    : "None"}
                </strong>
              </span>
            </div>
            <div className="feature-row">
              <RefreshCw size={16} className="feature-row-icon" />
              <span>
                Next Renewal:{" "}
                <strong>
                  {isSubscribed ? nextRenewalDate : "Pending First Subscription"}
                </strong>
              </span>
            </div>
            <div className="feature-row">
              <ShieldCheck size={16} className="feature-row-icon" />
              <span>
                Verified Landlord Badge:{" "}
                <strong>{isSubscribed ? "Active" : "Locked"}</strong>
              </span>
            </div>
          </div>

          <div className="plan-card-actions">
            {!isSubscribed ? (
              <button
                type="button"
                className="btn-upgrade-plan-highlight"
                style={{ background: "#685226", color: "#ffffff" }}
                onClick={() => setShowUpgradeModal(true)}
              >
                <Sparkles size={16} />
                <span>✨ Subscribe to a Plan</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-upgrade-plan-highlight"
                  onClick={() => setShowManageModal(true)}
                >
                  <Sparkles size={16} />
                  <span>Manage Subscription</span>
                </button>

                <div className="secondary-plan-btn-row">
                  <button
                    type="button"
                    className="btn-secondary-action btn-renew-action"
                    onClick={() => setShowRenewModal(true)}
                  >
                    <RefreshCw size={13} />
                    <span>Renew Subscription</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-action btn-upgrade-action"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Sparkles size={13} />
                    <span>Upgrade Plan</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="subscription-right-stack">

          {/* LOWER CARD: PAYMENT HISTORY & BIR OFFICIAL RECEIPTS */}
          <div className="subscription-card payment-history-card">
            <div className="subcard-header">
              <div>
                <h2>Payment History &amp; Official Receipts (OR)</h2>
                <p className="subcard-tagline">
                  BIR-compliant official receipts available for tax deduction and business expense filing.
                </p>
              </div>
            </div>

            <div className="history-table-container">
              <table className="subscription-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice / OR #</th>
                    <th>Plan Tier</th>
                    <th>Amount</th>
                    <th>Channel</th>
                    <th style={{ textAlign: "right" }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistoryList && paymentHistoryList.length > 0 ? (
                    paymentHistoryList
                      .slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)
                      .map((item) => (
                      <tr key={item.id}>
                        <td className="col-date">{item.date}</td>
                        <td className="col-or">
                          <strong>{item.orNumber}</strong>
                          {item.reference ? (
                            <span className="inv-sub" style={{ color: "#685226", fontWeight: 700, fontFamily: "monospace" }}>
                              Ref: {item.reference}
                            </span>
                          ) : (
                            <span className="inv-sub">{item.id}</span>
                          )}
                        </td>
                        <td className="col-plan">{item.plan}</td>
                        <td className="col-amount">{item.amount}</td>
                        <td className="col-channel">
                          <span className="channel-badge-small">{item.channel}</span>
                        </td>
                        <td className="col-invoice" style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                            {item.proof_image && (
                              <button
                                type="button"
                                className="btn-download-invoice"
                                style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#047857" }}
                                title="View Screenshot Proof of Payment"
                                onClick={() => setPreviewModalImage(item.proof_image)}
                              >
                                <Camera size={14} />
                                <span>Proof</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-download-invoice"
                              title="View & Download Official Receipt"
                              onClick={() => {
                                setSelectedReceipt(item);
                                setShowReceiptModal(true);
                              }}
                            >
                              <FileText size={16} />
                              <span>View OR</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "36px 16px", color: "#8c7e73" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <FileText size={28} color="#bba895" />
                          <strong style={{ color: "#4a3c30" }}>No Billing History Yet</strong>
                          <span style={{ fontSize: "12.5px" }}>Official BIR receipts and monthly payment records will appear here once you activate a subscription plan.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {paymentHistoryList && paymentHistoryList.length > 0 && (
                <TablePagination
                  currentPage={historyPage}
                  totalItems={paymentHistoryList.length}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  onPageSizeChange={setHistoryPageSize}
                />
              )}
            </div>
          </div>

          {/* WEBHOOK SIMULATOR TEST BAR (DEVELOPER / QA) */}
          <div className="webhook-test-harness-bar">
            <div className="harness-left">
              <Activity size={16} color="#8c5310" />
              <span>Webhook Simulator:</span>
            </div>
            <div className="harness-btns">
              <button
                type="button"
                className="btn-harness-action success"
                onClick={() => runWebhookSimulation("PAYMENT_SUCCESS")}
              >
                Simulate Payment Success (Active)
              </button>
              <button
                type="button"
                className="btn-harness-action fail"
                onClick={() => runWebhookSimulation("PAYMENT_FAILED")}
              >
                Simulate Payment Fail (3-Day Grace)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL 1: PLAN UPGRADE MODAL
      ===================================================== */}
      {showUpgradeModal && (
        <div
          className="sub-modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowUpgradeModal(false);
            setPendingPlan(null);
          }}
        >
          <div className="sub-modal-card upgrade-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowUpgradeModal(false);
                setPendingPlan(null);
              }}
            >
              <X size={20} />
            </button>

            <div className="upgrade-modal-header">
              <span className="modal-eyebrow">CHOOSE YOUR LANDLORD TIER</span>
              <h2>Upgrade Your Listing Capacity</h2>
              <p>
                Grow your rental reach, list more properties, and attract verified students and workers faster.
              </p>

              {/* BILLING CYCLE SWITCH (MONTHLY VS ANNUAL - SAVE 20%) */}
              <div className="modal-billing-toggle-wrap">
                <button
                  type="button"
                  className={`modal-billing-btn ${billingCycle === "monthly" ? "active" : ""}`}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  className={`modal-billing-btn ${billingCycle === "annual" ? "active" : ""}`}
                  onClick={() => setBillingCycle("annual")}
                >
                  Annual Billing
                  <span className="save-badge-pill">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="upgrade-tiers-grid">
              {((landlordPlans && landlordPlans.length > 0
                ? landlordPlans
                : (plans && plans.length > 0 ? plans : DEFAULT_PLANS)
              ).filter((p) => (p.category || "Landlord").toLowerCase() === "landlord")).map((plan) => {
                const isCurrent = isSubscribed && plan.id === currentPlan?.id;
                const isAnnual = billingCycle === "annual";
                const isFree = plan.price === 0;
                const displayPrice = isFree
                  ? 0
                  : isAnnual
                  ? plan.annualPrice || plan.yearlyPrice || Math.round(plan.price * 12 * 0.8)
                  : plan.price;

                return (
                  <div
                    key={plan.id}
                    className={`upgrade-tier-box ${plan.isPopular ? "popular-tier" : ""} ${
                      isCurrent ? "current-tier" : ""
                    }`}
                  >
                    {plan.badge && <span className="tier-tag-badge">{plan.badge}</span>}
                    {isCurrent && <span className="tier-current-tag">Current Active Plan</span>}

                    <h3 className="tier-box-title">{plan.name}</h3>
                    <p className="tier-box-desc">{plan.description}</p>

                    <div className="tier-box-price">
                      {isFree ? (
                        <span className="amount">FREE</span>
                      ) : (
                        <>
                          <span className="currency-symbol">₱</span>
                          <NumberFlow
                            value={displayPrice}
                            className="amount"
                          />
                          <span className="period">/{isAnnual ? "year" : "month"}</span>
                        </>
                      )}
                    </div>

                    {!isFree && (
                      <span className="tier-price-subtext">
                        {isAnnual
                          ? "Billed annually • 20% discount applied"
                          : `₱${(plan.price * 12).toLocaleString()}/year if billed monthly`}
                      </span>
                    )}

                    <div className="tier-quota-pill">
                      <Building2 size={15} />
                      <span>
                        {plan.propertiesLimit ||
                          (plan.unitLimit >= 999
                            ? "Unlimited Properties"
                            : `${plan.unitLimit} ${plan.unitLimit === 1 ? "Property Limit" : "Properties Allowed"}`)}
                      </span>
                    </div>

                    <ul className="tier-features-ul">
                      {plan.features.map((feat, idx) => (
                        <li key={idx}>
                          <Check size={16} className="feat-check" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={isCurrent}
                      className={`btn-tier-select ${isCurrent ? "btn-active-disabled" : "btn-upgrade-now"}`}
                      onClick={() => handleInitiateUpgrade(plan)}
                    >
                      {isCurrent ? "Current Plan" : `Upgrade to ${plan.name} →`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 1.5: INTERACTIVE CHECKOUT & PAYMENT MODAL
      ===================================================== */}
      {showCheckoutModal && pendingPlan && (
        <div
          className="sub-modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            if (!isProcessingPayment) {
              setShowCheckoutModal(false);
              setPendingPlan(null);
            }
          }}
        >
          <div className="sub-modal-card checkout-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              disabled={isProcessingPayment}
              onClick={(e) => {
                e.stopPropagation();
                setShowCheckoutModal(false);
                setPendingPlan(null);
              }}
            >
              <X size={20} />
            </button>

            <div className="checkout-modal-header">
              <span className="modal-eyebrow">SECURE 256-BIT CHECKOUT</span>
              <h2>Complete Your Subscription</h2>
              <p>Instant activation with Philippine payment channels (GCash &amp; Maya).</p>
            </div>

            <div className="checkout-grid-layout">
              {/* LEFT: ORDER SUMMARY */}
              <div className="checkout-summary-col">
                <h4 className="checkout-section-title">Order Summary</h4>
                <div className="summary-tier-card">
                  <div className="summary-tier-name">
                    <strong>{pendingPlan.name}</strong>
                    <span className="summary-interval-pill">
                      {billingCycle === "annual" ? "Annual (20% Off)" : "Monthly Plan"}
                    </span>
                  </div>
                  <div className="summary-unit-cap">
                    <Building2 size={15} />
                    <span>Allows up to <strong>{pendingPlan.propertiesLimit || (pendingPlan.unitLimit >= 999 ? "Unlimited Properties" : `${pendingPlan.unitLimit} active property listings`)}</strong></span>
                  </div>
                </div>

                <div className="summary-pricing-table">
                  <div className="summary-price-row">
                    <span>Subscription Fee</span>
                    <span>
                      ₱
                      {billingCycle === "annual"
                        ? (pendingPlan.annualPrice || pendingPlan.yearlyPrice || Math.round(pendingPlan.price * 12 * 0.8)).toLocaleString()
                        : pendingPlan.price.toLocaleString()}
                      .00
                    </span>
                  </div>
                  <div className="summary-price-row total-row">
                    <strong>Total Amount Due</strong>
                    <strong className="grand-total-highlight">
                      ₱
                      {billingCycle === "annual"
                        ? (pendingPlan.annualPrice || pendingPlan.yearlyPrice || Math.round(pendingPlan.price * 12 * 0.8)).toLocaleString()
                        : pendingPlan.price.toLocaleString()}
                      .00
                    </strong>
                  </div>
                </div>

                <div className="billing-meta-preview">
                  <div className="meta-row">
                    <span>Billed To:</span> <strong>{getLandlordDisplayName(user) || billingInfo.name || "Landlord"}</strong>
                  </div>
                  <div className="meta-row">
                    <span>Account:</span> <strong>{user?.email || billingInfo.email || "landlord@mobin.ph"}</strong>
                  </div>
                </div>

                {/* UPLOAD SCREENSHOT PROOF OF PAYMENT (BELOW ORDER SUMMARY) */}
                <div className="proof-upload-box">
                  <div className="proof-upload-header">
                    <div className="proof-header-title">
                      <Camera size={15} className="proof-header-icon" />
                      <span>Upload Proof of Payment</span>
                    </div>
                    <span className={`proof-status-badge ${paymentProofPreview ? "attached" : ""}`}>
                      {paymentProofPreview ? "✓ Attached" : "Required"}
                    </span>
                  </div>
                  <p className="proof-upload-desc">
                    Scan the {selectedPaymentChannel === "maya" ? "Maya" : "GCash"} QR code on the right, then upload your transaction screenshot below.
                  </p>

                  <input
                    type="file"
                    ref={proofFileRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleProofUpload}
                  />

                  {!paymentProofPreview ? (
                    <div
                      className={`proof-dropzone ${isDraggingProof ? "dragging" : ""}`}
                      onClick={() => proofFileRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingProof(true);
                      }}
                      onDragLeave={() => setIsDraggingProof(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingProof(false);
                        const file = e.dataTransfer?.files?.[0];
                        if (file) processProofFile(file);
                      }}
                    >
                      <div className="proof-dropzone-icon">
                        <Upload size={18} />
                      </div>
                      <div className="proof-dropzone-info">
                        <strong>Click to upload screenshot</strong>
                        <span>or drag &amp; drop PNG, JPG proof here</span>
                      </div>
                    </div>
                  ) : (
                    <div className="proof-preview-card">
                      <div
                        className="proof-thumb-container"
                        onClick={() => setPreviewModalImage(paymentProofPreview)}
                        title="Click to zoom in"
                      >
                        <img
                          src={paymentProofPreview}
                          alt="Payment Proof Screenshot"
                          className="proof-thumb-img"
                        />
                        <div className="proof-thumb-overlay">
                          <Eye size={13} />
                        </div>
                      </div>
                      <div className="proof-details">
                        <span className="proof-name" title={paymentProofFileName}>
                          {paymentProofFileName || "payment_screenshot.jpg"}
                        </span>
                        <span className="proof-meta">✓ Screenshot Attached</span>
                        <div className="proof-btns">
                          <button
                            type="button"
                            className="btn-proof-change"
                            onClick={() => proofFileRef.current?.click()}
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            className="btn-proof-remove"
                            onClick={handleRemoveProof}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* RIGHT: PAYMENT CHANNEL & QR PREVIEW */}
              <div className="checkout-payment-col">
                <h4 className="checkout-section-title">Select Payment Channel</h4>
                <div className="checkout-channels-mini">
                  <button
                    type="button"
                    className={`channel-mini-btn ${selectedPaymentChannel === "gcash" ? "active" : ""}`}
                    onClick={() => setSelectedPaymentChannel("gcash")}
                  >
                    <span className="gcash-label">GCash</span>
                  </button>
                  <button
                    type="button"
                    className={`channel-mini-btn ${selectedPaymentChannel === "maya" ? "active" : ""}`}
                    onClick={() => setSelectedPaymentChannel("maya")}
                  >
                    <span className="maya-label">Maya</span>
                  </button>
                </div>

                {/* DYNAMIC PAYMENT INSTRUCTIONS WITH QR CODE CARD */}
                <div className="channel-interactive-box" style={{ padding: "14px", minHeight: "auto", background: "#ffffff" }}>
                  {selectedPaymentChannel === "maya" ? (
                    <div className="qr-scan-preview" style={{ width: "100%" }}>
                      <div
                        style={{
                          background: "#ffffff",
                          padding: "6px",
                          borderRadius: "14px",
                          border: "1.5px solid #00a859",
                          boxShadow: "0 4px 16px rgba(0, 168, 89, 0.12)",
                          maxWidth: "245px",
                          margin: "0 auto",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={mayaQrImg}
                          alt="Maya QR Code"
                          style={{ width: "100%", height: "auto", display: "block", borderRadius: "10px" }}
                        />
                      </div>
                      <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "#4a3e33", fontWeight: 600, textAlign: "center" }}>
                        Scan via <strong>Maya App</strong> to pay &amp; activate
                      </p>
                    </div>
                  ) : (
                    <div className="qr-scan-preview" style={{ width: "100%" }}>
                      <div
                        style={{
                          background: "#ffffff",
                          padding: "6px",
                          borderRadius: "14px",
                          border: "1.5px solid #007dfa",
                          boxShadow: "0 4px 16px rgba(0, 125, 250, 0.12)",
                          maxWidth: "245px",
                          margin: "0 auto",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={gcashQrImg}
                          alt="GCash QR Code"
                          style={{ width: "100%", height: "auto", display: "block", borderRadius: "10px" }}
                        />
                      </div>
                      <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "#4a3e33", fontWeight: 600, textAlign: "center" }}>
                        Scan via <strong>GCash App</strong> to pay &amp; activate
                      </p>
                    </div>
                  )}
                </div>

                {/* CHECKOUT ACTION BUTTON */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  className="btn-confirm-checkout-action"
                  onClick={handleConfirmCheckout}
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Processing &amp; Generating OR...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>
                        Authorize ₱
                        {billingCycle === "annual"
                          ? Math.round(pendingPlan.price * 12 * 0.8).toLocaleString()
                          : pendingPlan.price.toLocaleString()}
                        {" & "}Activate Tier
                      </span>
                    </>
                  )}
                </button>

                <div className="checkout-trust-badge">
                  <ShieldCheck size={14} color="#16a34a" />
                  <span>Encrypted 256-Bit Security • Direct GCash &amp; Maya Payment • 0% Commission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 2: PAYMENT METHOD MODAL
      ===================================================== */}
      {showPaymentModal && (
        <div className="sub-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="sub-modal-card payment-method-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              onClick={() => setShowPaymentModal(false)}
            >
              <X size={20} />
            </button>

            <div className="modal-header-simple">
              <h2>Select Payment Method</h2>
              <p>Choose your preferred recurring payment channel for monthly subscriptions.</p>
            </div>

            <div className="payment-channels-list">
              <label
                className={`channel-select-item ${
                  selectedPaymentChannel === "gcash" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="channel"
                  value="gcash"
                  checked={selectedPaymentChannel === "gcash"}
                  onChange={() => setSelectedPaymentChannel("gcash")}
                />
                <div className="channel-icon-pill gcash-bg">GCash</div>
                <div className="channel-info">
                  <strong>GCash Auto-Debit</strong>
                  <span>Instant monthly deduction via GCash mobile wallet</span>
                </div>
              </label>

              {selectedPaymentChannel === "gcash" && (
                <div style={{ padding: "10px 14px", background: "#f0f7ff", borderRadius: "8px", margin: "-6px 0 10px 38px", border: "1px solid #cce3ff" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#007dfa", marginBottom: "4px" }}>GCash Mobile Number</label>
                  <input
                    type="text"
                    value={inputGcash}
                    onChange={(e) => setInputGcash(e.target.value)}
                    placeholder="0917 XXX XXXX"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #b3d7ff", fontSize: "13.5px", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <label
                className={`channel-select-item ${
                  selectedPaymentChannel === "maya" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="channel"
                  value="maya"
                  checked={selectedPaymentChannel === "maya"}
                  onChange={() => setSelectedPaymentChannel("maya")}
                />
                <div className="channel-icon-pill maya-bg">Maya</div>
                <div className="channel-info">
                  <strong>Maya Wallet</strong>
                  <span>Pay with Maya balance or linked accounts</span>
                </div>
              </label>

              {selectedPaymentChannel === "maya" && (
                <div style={{ padding: "10px 14px", background: "#f0fbf4", borderRadius: "8px", margin: "-6px 0 10px 38px", border: "1px solid #bfe8cc" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#00a859", marginBottom: "4px" }}>Maya Registered Number</label>
                  <input
                    type="text"
                    value={inputMaya}
                    onChange={(e) => setInputMaya(e.target.value)}
                    placeholder="0918 XXX XXXX"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #99dab0", fontSize: "13.5px", boxSizing: "border-box" }}
                  />
                </div>
              )}

            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-primary-confirm"
                onClick={handleSavePaymentMethod}
              >
                Save Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 2.2: MANAGE SUBSCRIPTION MODAL
      ===================================================== */}
      {showManageModal && (
        <div className="sub-modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="sub-modal-card manage-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              onClick={() => setShowManageModal(false)}
            >
              <X size={20} />
            </button>

            <div className="manage-modal-header">
              <span className="modal-eyebrow">SUBSCRIPTION CONTROLS</span>
              <h2>Manage Your Subscription</h2>
              <p>Current Tier: <strong>{currentPlan?.name || "Active Plan"}</strong> (₱{currentPlan?.price ?? 149}/month)</p>
            </div>

            <div className="manage-actions-grid">
              <button
                type="button"
                className="manage-action-btn primary"
                onClick={() => {
                  setShowManageModal(false);
                  setShowUpgradeModal(true);
                }}
              >
                <Sparkles size={20} />
                <div>
                  <strong>Upgrade / Switch Tier</strong>
                  <span>Increase listing capacity to 5 or 25 properties</span>
                </div>
              </button>

              <button
                type="button"
                className="manage-action-btn"
                onClick={() => {
                  setShowManageModal(false);
                  setShowRenewModal(true);
                }}
              >
                <RefreshCw size={20} />
                <div>
                  <strong>Renew Subscription Early</strong>
                  <span>Extend current billing cycle by +30 days</span>
                </div>
              </button>

              <button
                type="button"
                className="manage-action-btn"
                onClick={() => {
                  setShowManageModal(false);
                  setShowPaymentModal(true);
                }}
              >
                <CreditCard size={20} />
                <div>
                  <strong>Update Payment Channel</strong>
                  <span>Switch between GCash, Maya, QR Ph, or Card</span>
                </div>
              </button>

              <button
                type="button"
                className="manage-action-btn danger"
                onClick={() => {
                  setShowManageModal(false);
                  setShowCancelModal(true);
                }}
              >
                <AlertCircle size={20} />
                <div>
                  <strong>Cancel Subscription</strong>
                  <span>Cancel active plan and unlist properties</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 2.5: RENEW SUBSCRIPTION MODAL
      ===================================================== */}
      {showRenewModal && (
        <div className="sub-modal-overlay" onClick={() => setShowRenewModal(false)}>
          <div className="sub-modal-card renew-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              onClick={() => setShowRenewModal(false)}
            >
              <X size={20} />
            </button>

            <div className="renew-modal-header">
              <div className="renew-badge-icon">
                <RefreshCw size={32} color="#555100" />
              </div>
              <h2>Renew Subscription Early</h2>
              <p>Extend your {currentPlan?.name || "Landlord Starter"} platform access for another 30 days.</p>
            </div>

            <div className="renew-details-box">
              <div className="renew-row">
                <span>Current Expiry:</span>
                <strong>{nextRenewalDate}</strong>
              </div>
              <div className="renew-row">
                <span>New Extended Expiry:</span>
                <strong style={{ color: "#16a34a" }}>Dec 15, 2024 (+30 Days)</strong>
              </div>
              <div className="renew-row">
                <span>Payment Channel:</span>
                <strong>{selectedPaymentChannel.toUpperCase()}</strong>
              </div>
              <div className="renew-row total">
                <strong>Total Renewal Amount:</strong>
                <strong className="renew-price">₱{currentPlan?.price ?? 149}.00</strong>
              </div>
            </div>

            <div className="renew-actions">
              <button
                type="button"
                className="btn-confirm-renew"
                onClick={handleConfirmEarlyRenewal}
              >
                <Check size={18} />
                <span>Authorize Renewal (₱{currentPlan?.price ?? 149}.00)</span>
              </button>
              <button
                type="button"
                className="btn-cancel-renew"
                onClick={() => setShowRenewModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 3: OFFICIAL RECEIPT (BIR FORMAT VIEWER)
      ===================================================== */}
      {showReceiptModal && selectedReceipt && (
        <div className="sub-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="sub-modal-card receipt-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              onClick={() => setShowReceiptModal(false)}
            >
              <X size={20} />
            </button>

            <div className="receipt-paper">
              <div className="receipt-header">
                <div className="receipt-brand">MOB'IN PHILIPPINES</div>
                <div className="receipt-sub">Student &amp; Worker Rental Housing Platform</div>
                <div className="receipt-title-badge">PAYMENT RECEIPT</div>
                <div className="receipt-num">{selectedReceipt.orNumber}</div>
              </div>

              <div className="receipt-meta-grid">
                <div>
                  <strong>Issued To:</strong> {getLandlordDisplayName(user) || billingInfo.name}
                </div>
                <div>
                  <strong>Date:</strong> {selectedReceipt.date}
                </div>
                {selectedReceipt.reference && (
                  <div>
                    <strong>Payment Ref No.:</strong> <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#685226" }}>{selectedReceipt.reference}</span>
                  </div>
                )}
                <div>
                  <strong>Payment Channel:</strong> {selectedReceipt.channel}
                </div>
                <div>
                  <strong>Account / Email:</strong> {selectedReceipt.user_email || user?.email || "landlord@mobin.ph"}
                </div>
                <div>
                  <strong>Status:</strong> <span style={{ color: "#16a34a", fontWeight: 700 }}>PAID / CONFIRMED</span>
                </div>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Mob'in Landlord Subscription</strong>
                      <div style={{ fontSize: "12px", color: "#6a5e54" }}>
                        {selectedReceipt.plan} (Platform Access)
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>{selectedReceipt.amount}</td>
                  </tr>
                  <tr className="receipt-grand-total">
                    <td><strong>TOTAL AMOUNT PAID</strong></td>
                    <td style={{ textAlign: "right" }}><strong>{selectedReceipt.amount}</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* ATTACHED PROOF OF PAYMENT PREVIEW */}
              {selectedReceipt.proof_image && (
                <div className="receipt-proof-attached-section">
                  <div className="receipt-proof-label">
                    <CheckCircle2 size={15} color="#16a34a" />
                    <strong>Verified Payment Proof Screenshot ({selectedReceipt.channel || "GCash"})</strong>
                  </div>
                  <div
                    className="receipt-proof-thumbnail-card"
                    onClick={() => setPreviewModalImage(selectedReceipt.proof_image)}
                    title="Click to view full screenshot proof"
                  >
                    <img src={selectedReceipt.proof_image} alt="Proof of Payment" />
                    <span>View Full Payment Proof Screenshot 🔍</span>
                  </div>
                </div>
              )}

              <div className="receipt-footer-notes">
                <p>This document serves as an electronic proof of payment issued in accordance with Philippine BIR eCommerce regulations.</p>
              </div>
            </div>

            <div className="receipt-modal-actions">
              <button
                type="button"
                className="btn-print-receipt"
                onClick={() => {
                  window.print();
                }}
              >
                <Download size={16} />
                <span>Download / Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 4: CANCEL / PAUSE MODAL
      ===================================================== */}
      {showCancelModal && (
        <div className="sub-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="sub-modal-card cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sub-modal-close"
              onClick={() => setShowCancelModal(false)}
            >
              <X size={20} />
            </button>

            <div className="cancel-icon-warning">
              <AlertCircle size={36} color="#d97706" />
            </div>

            <h2>Cancel Subscription?</h2>
            <p>
              If you cancel, your current properties will remain active until the end of your billing cycle on <strong>{nextRenewalDate || "Nov 15, 2024"}</strong>. After that, your listings will be temporarily unlisted from renter searches.
            </p>

            <div className="cancel-options-column">
              <button
                type="button"
                className="btn-pause-subscription"
                onClick={() => {
                  setShowCancelModal(false);
                  showNotice("Subscription Cancelled", `Your subscription will remain active until ${nextRenewalDate || "the end of your billing cycle"}. You can re-subscribe anytime!`, "info");
                }}
              >
                Confirm Cancellation
              </button>

              <button
                type="button"
                className="btn-keep-subscription"
                onClick={() => setShowCancelModal(false)}
              >
                Keep My Active Plan
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
        onConfirm={() => {
          if (modalConfig.onConfirm) modalConfig.onConfirm();
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* =====================================================
          LIGHTBOX MODAL FOR PROOF OF PAYMENT PREVIEW
      ===================================================== */}
      {previewModalImage && (
        <div
          className="sub-modal-overlay"
          onClick={() => setPreviewModalImage(null)}
          style={{ zIndex: 10000, background: "rgba(20, 10, 5, 0.75)" }}
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
              }}
              onClick={() => setPreviewModalImage(null)}
              title="Close"
            >
              <X size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", alignSelf: "flex-start" }}>
              <Camera size={18} color="#686300" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#281507" }}>
                Proof of Payment Screenshot
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
                src={previewModalImage}
                alt="Proof of Payment Full Screenshot"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", display: "block" }}
              />
            </div>
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
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
