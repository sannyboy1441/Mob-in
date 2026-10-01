import React, { useState, useRef, useEffect } from "react";
import "./FloatingAiAssistant.css";
import { sendChatMessageToCloudflareAI } from "../services/cloudflareAiService";
import mobinLogo from "../assets/mobin_logo.png";

const INITIAL_GREETING = {
  role: "assistant",
  text: "Hello! 👋 I'm Mob'in AI, your 24/7 rental assistant.\n\nLooking for a room, bedspace, or apartment? Or need help listing and verifying a property as a landlord? Ask me anything!",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const SUGGESTIONS = [
  "🔍 How do I search for boarding houses or dorms?",
  "🛡️ How does property verification protect renters?",
  "🏠 How do landlords post a listing?",
  "💎 What are the landlord subscription tiers?",
];

export default function FloatingAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendChatMessageToCloudflareAI(newMessages);
      const aiReply = {
        role: "assistant",
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I am having a moment. Please check back shortly or reach out to Mob'in support!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* =====================================================
          CHAT WINDOW (MODAL ON LOWER RIGHT)
      ===================================================== */}
      {isOpen && (
        <div className="mobin-ai-chat-window" role="dialog" aria-label="Mob'in AI Chat Window">
          {/* Header */}
          <div className="mobin-ai-header">
            <div className="mobin-ai-header-left">
              <div className="mobin-ai-avatar-badge">
                <img
                  src={mobinLogo}
                  alt="Mob'in"
                  style={{ width: "24px", height: "24px", objectFit: "contain" }}
                />
              </div>
              <div>
                <h3 className="mobin-ai-header-title">Mob'in AI Assistant</h3>
                <div className="mobin-ai-header-status">
                  <span className="mobin-ai-status-indicator"></span>
                  Cloudflare Llama 3.1 • Online
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mobin-ai-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Message Thread */}
          <div className="mobin-ai-body">
            {messages.map((m, idx) => (
              <div key={idx} className={`mobin-ai-message ${m.role}`}>
                <div className="mobin-ai-bubble">{m.text}</div>
                <span className="mobin-ai-timestamp">{m.time}</span>
              </div>
            ))}

            {/* Quick Suggestion Chips (Show only initially or when idle) */}
            {messages.length === 1 && !isLoading && (
              <div className="mobin-ai-suggestions">
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c8075", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Quick Questions:
                </span>
                {SUGGESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="mobin-ai-suggestion-chip"
                    onClick={() => handleSendMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="mobin-ai-typing">
                <span className="mobin-ai-typing-dot"></span>
                <span className="mobin-ai-typing-dot"></span>
                <span className="mobin-ai-typing-dot"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="mobin-ai-footer">
            <form
              className="mobin-ai-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="mobin-ai-input"
                placeholder="Ask Mob'in AI anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="mobin-ai-send-btn"
                disabled={!inputText.trim() || isLoading}
                title="Send Message"
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div className="mobin-ai-caption">
              ⚡ Powered by Cloudflare Workers AI
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FLOATING TRIGGER BUTTON (LOWER RIGHT CORNER - CIRCLE)
      ===================================================== */}
      <button
        type="button"
        className={`mobin-ai-floating-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? "Close Mob'in AI" : "Chat with Mob'in AI"}
        aria-label="Open AI Assistant"
      >
        <span className="mobin-ai-pulse-dot"></span>
        {isOpen ? (
          <div className="mobin-ai-btn-close-icon">✕</div>
        ) : (
          <img src={mobinLogo} alt="Mob'in AI" className="mobin-ai-btn-logo" />
        )}
      </button>
    </>
  );
}
