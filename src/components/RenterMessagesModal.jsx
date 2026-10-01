import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { formatMsgTime, formatRelativeTime } from "./LandlordMessages";
import {
  X,
  Send,
  MessageSquare,
  Building2,
  Clock,
  CheckCheck,
  User,
  ExternalLink,
} from "lucide-react";
import "./RenterMessagesModal.css";

export default function RenterMessagesModal({
  isOpen,
  onClose,
  currentUser,
  initialProperty,
}) {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [renterEmail, setRenterEmail] = useState(currentUser?.email || "");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync email if currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      setRenterEmail(currentUser.email);
    } else {
      const savedEmail = localStorage.getItem("mobin_renter_email");
      if (savedEmail) setRenterEmail(savedEmail);
    }
  }, [currentUser]);

  // Load all messages involving this renter
  const fetchRenterMessages = async (emailToFetch) => {
    const targetEmail = (emailToFetch || renterEmail || "").toLowerCase().trim();
    if (!targetEmail) return;

    try {
      // 1. Fetch messages where this renter was the sender OR where property was inquired by this renter
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error || !data) return;

      // Group messages by property_id for this renter
      // First identify properties this renter participated in
      const renterPropIds = new Set();
      data.forEach((m) => {
        if (m.sender_email && m.sender_email.toLowerCase().trim() === targetEmail) {
          renterPropIds.add(String(m.property_id || "general"));
        }
      });

      if (initialProperty && initialProperty.id) {
        renterPropIds.add(String(initialProperty.id));
      }

      // Group messages belonging to those properties between renter and landlord
      const map = new Map();
      renterPropIds.forEach((propId) => {
        const propMsgs = data.filter(
          (m) => String(m.property_id || "general") === propId
        );

        const firstMsg = propMsgs[0] || {};
        const lastMsg = propMsgs[propMsgs.length - 1] || {};
        const propName = firstMsg.property_name || lastMsg.property_name || initialProperty?.property_name || `Property #${propId}`;
        const landlordEmail = firstMsg.landlord_email || lastMsg.landlord_email || initialProperty?.landlord_email || (propId === "prop-1" || propId === "prop-2" ? "landlord@mobin.ph" : "");
        const landlordId = firstMsg.landlord_id || lastMsg.landlord_id || initialProperty?.landlord_id || (propId === "prop-1" || propId === "prop-2" ? "landlord-001" : null);

        const parsedMsgs = propMsgs.map((m) => {
          const isOutgoing = m.sender_email && m.sender_email.toLowerCase().trim() === targetEmail;
          let image = m.image || m.image_url || null;
          let text = m.message || "";
          if (typeof text === "string") {
            const toMatch = text.match(/<!--to:([^>]+)-->/);
            if (toMatch) {
              text = text.replace(toMatch[0], "").trim();
            }
          }
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

          return {
            id: m.id,
            sender: isOutgoing ? "You" : (m.sender_name || "Landlord"),
            isOutgoing,
            text,
            image,
            time: formatMsgTime(m.created_at),
            created_at: m.created_at,
          };
        });

        map.set(propId, {
          id: propId,
          property_id: propId,
          property_name: propName,
          landlord_email: landlordEmail,
          landlord_id: landlordId,
          lastSnippet: lastMsg.message || "Inquiry thread started",
          lastTime: formatRelativeTime(lastMsg.created_at),
          messages: parsedMsgs,
        });
      });

      const convList = Array.from(map.values());
      setConversations(convList);

      if (convList.length > 0) {
        setActiveConvId((prev) => {
          if (initialProperty && map.has(String(initialProperty.id))) {
            return String(initialProperty.id);
          }
          return prev && map.has(prev) ? prev : convList[0].id;
        });
      }
    } catch (err) {
      console.warn("Renter messages fetch notice:", err);
    }
  };

  useEffect(() => {
    if (isOpen && renterEmail) {
      fetchRenterMessages(renterEmail);
    }
  }, [isOpen, renterEmail, initialProperty]);

  // Realtime subscription for live landlord replies!
  useEffect(() => {
    if (!isOpen) return;

    let channel = null;
    try {
      channel = supabase
        .channel("renter-live-messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => {
            fetchRenterMessages(renterEmail);
          }
        )
        .subscribe();
    } catch (_) {}

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isOpen, renterEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    const textToSend = replyText.trim();
    setReplyText("");
    setIsSending(true);

    const renterName =
      currentUser?.user_metadata?.full_name ||
      currentUser?.name ||
      renterEmail.split("@")[0] ||
      "Renter";

    let targetLandlordEmail = activeConv.landlord_email;
    let targetLandlordId = activeConv.landlord_id;

    if (!targetLandlordEmail && activeConv.property_id) {
      try {
        const { data: dbP } = await supabase
          .from("properties")
          .select("landlord_email, landlord_id")
          .eq("id", activeConv.property_id)
          .maybeSingle();
        if (dbP) {
          targetLandlordEmail = (dbP.landlord_email || "").toLowerCase().trim();
          targetLandlordId = dbP.landlord_id || targetLandlordId;
        }
      } catch (_) {}
    }

    const payload = {
      landlord_id: targetLandlordId || null,
      landlord_email: targetLandlordEmail || (activeConv.property_id === "prop-1" || activeConv.property_id === "prop-2" ? "landlord@mobin.ph" : ""),
      sender_name: renterName,
      sender_email: renterEmail,
      property_id: activeConv.property_id,
      property_name: activeConv.property_name,
      message: textToSend,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from("messages").insert([payload]).select().single();
      if (!error && data) {
        // Optimistically add to messages
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id
              ? {
                  ...c,
                  lastSnippet: textToSend,
                  lastTime: "Just now",
                  messages: [
                    ...c.messages,
                    {
                      id: data.id,
                      sender: "You",
                      isOutgoing: true,
                      text: textToSend,
                      time: formatMsgTime(data.created_at),
                      created_at: data.created_at,
                    },
                  ],
                }
              : c
          )
        );
      }
    } catch (err) {
      console.warn("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="renter-chat-modal-overlay" onClick={onClose}>
      <div
        className="renter-chat-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="renter-chat-modal-header">
          <div className="header-left-group">
            <div className="chat-badge-icon">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3>Direct Landlord Messages</h3>
              <p className="chat-modal-sub">
                Real-time synchronized chat with verified landlords
              </p>
            </div>
          </div>
          <button
            type="button"
            className="chat-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* EMAIL IDENTIFIER PROMPT IF NOT LOGGED IN */}
        {!currentUser && !renterEmail && (
          <div className="email-identifier-banner">
            <p>Enter your email to view your ongoing conversations with landlords:</p>
            <div className="email-prompt-row">
              <input
                type="email"
                placeholder="e.g. paulinedecinal@gmail.com"
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (renterEmail.trim()) {
                    localStorage.setItem("mobin_renter_email", renterEmail.trim());
                    fetchRenterMessages(renterEmail.trim());
                  }
                }}
              >
                Load My Messages
              </button>
            </div>
          </div>
        )}

        {/* MAIN CHAT BODY (TWO-COLUMN) */}
        <div className="renter-chat-content-split">
          {/* LEFT: THREADS LIST */}
          <div className="renter-threads-sidebar">
            <div className="threads-sidebar-header">
              <span>Your Accommodations ({conversations.length})</span>
            </div>
            <div className="threads-list">
              {conversations.length > 0 ? (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`thread-item-card ${c.id === activeConvId ? "active" : ""}`}
                    onClick={() => setActiveConvId(c.id)}
                  >
                    <div className="thread-icon-box">
                      <Building2 size={16} />
                    </div>
                    <div className="thread-info-meta">
                      <span className="thread-prop-title">{c.property_name}</span>
                      <p className="thread-last-msg">{c.lastSnippet}</p>
                    </div>
                    <span className="thread-time-badge">{c.lastTime}</span>
                  </div>
                ))
              ) : (
                <div className="threads-empty-state">
                  <Building2 size={32} />
                  <p>No active message threads yet.</p>
                  <span>Inquire about a listing below to start chatting with its landlord.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIVE CHAT STREAM */}
          <div className="renter-chat-active-panel">
            {activeConv ? (
              <>
                <div className="active-chat-subhead">
                  <div className="active-prop-details">
                    <h4>{activeConv.property_name}</h4>
                    <span className="landlord-email-tag">
                      Landlord: {activeConv.landlord_email}
                    </span>
                  </div>
                </div>

                <div className="renter-chat-bubbles-scroll">
                  {activeConv.messages.length > 0 ? (
                    activeConv.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`renter-bubble-row ${m.isOutgoing ? "outgoing" : "incoming"}`}
                      >
                        <div className={`renter-bubble ${m.isOutgoing ? "outgoing" : "incoming"}`}>
                          {m.image && (
                            <div className="renter-bubble-image-wrap" style={{ marginBottom: m.text ? "8px" : "0" }}>
                              <img
                                src={m.image}
                                alt="Attachment"
                                style={{ maxWidth: "100%", maxHeight: "240px", borderRadius: "8px", objectFit: "cover", display: "block" }}
                              />
                            </div>
                          )}
                          {m.text && <p>{m.text}</p>}
                          <div className="bubble-meta-time">
                            <span>{m.time}</span>
                            {m.isOutgoing && <CheckCheck size={12} className="check-icon" />}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="chat-stream-empty">
                      <p>Start your conversation with the landlord regarding {activeConv.property_name}!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* REPLY INPUT FORM */}
                <form className="renter-chat-input-bar" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder={`Message landlord about ${activeConv.property_name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn-send-renter-msg"
                    disabled={isSending || !replyText.trim()}
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="no-active-thread-placeholder">
                <MessageSquare size={44} />
                <h3>No Conversation Selected</h3>
                <p>Select a property from the left or inquire about a listing on the homepage.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
