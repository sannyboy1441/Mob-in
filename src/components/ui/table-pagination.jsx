import React from "react";
import "./table-pagination.css";
import { ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";

export default function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  const handlePageClick = (p) => {
    if (typeof p === "number" && p !== safeCurrentPage && onPageChange) {
      onPageChange(p);
    }
  };

  return (
    <div className={`table-pagination-container ${className}`}>
      {/* LEFT: PAGE SIZE SELECTOR */}
      <div className="pagination-left">
        <div className="pagination-page-size-wrapper">
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              if (onPageSizeChange) onPageSizeChange(newSize);
              if (onPageChange) onPageChange(1);
            }}
            className="pagination-select"
            aria-label="Items per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} items
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pagination-select-chevron" />
        </div>
      </div>

      {/* CENTER: PAGE NUMBERS */}
      <div className="pagination-center">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }
          const isCurrent = p === safeCurrentPage;
          return (
            <button
              key={`page-${p}-${idx}`}
              type="button"
              className={`pagination-page-btn ${isCurrent ? "active" : ""}`}
              onClick={() => handlePageClick(p)}
              aria-current={isCurrent ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* RIGHT: PREVIOUS & NEXT BUTTONS */}
      <div className="pagination-right">
        <button
          type="button"
          className="pagination-nav-btn"
          disabled={safeCurrentPage <= 1}
          onClick={() => {
            if (safeCurrentPage > 1 && onPageChange) {
              onPageChange(safeCurrentPage - 1);
            }
          }}
          aria-label="Previous page"
        >
          <ArrowLeft size={14} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          className="pagination-nav-btn"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => {
            if (safeCurrentPage < totalPages && onPageChange) {
              onPageChange(safeCurrentPage + 1);
            }
          }}
          aria-label="Next page"
        >
          <span>Next</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
