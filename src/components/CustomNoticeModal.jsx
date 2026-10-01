import React from "react";
import "./CustomNoticeModal.css";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export default function CustomNoticeModal({
  isOpen,
  type = "info", // "success" | "warning" | "error" | "info"
  title,
  message,
  primaryButtonText = "OK",
  secondaryButtonText,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={32} />;
      case "warning":
        return <AlertCircle size={32} />;
      case "error":
        return <XCircle size={32} />;
      case "info":
      default:
        return <Info size={32} />;
    }
  };

  const handlePrimaryClick = () => {
    if (onConfirm) onConfirm();
    else if (onClose) onClose();
  };

  return (
    <div
      className="notice-modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
        if (onClose) onClose();
      }}
    >
      <div
        className="notice-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="notice-modal-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          title="Close modal"
        >
          <X size={18} />
        </button>

        <div className={`notice-icon-wrapper ${type}`}>
          {getIcon()}
        </div>

        {title && <h3 className="notice-modal-title">{title}</h3>}
        {message && <div className="notice-modal-message">{message}</div>}

        <div className="notice-modal-actions">
          {secondaryButtonText && (
            <button
              type="button"
              className="notice-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                if (onClose) onClose();
              }}
            >
              {secondaryButtonText}
            </button>
          )}

          <button
            type="button"
            className={`notice-btn-primary ${secondaryButtonText && (type === "warning" || type === "error") ? "danger" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePrimaryClick();
            }}
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
