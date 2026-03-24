import React from "react";
import { BRAND_NAME, BRAND_LOGO_SRC } from "../branding";

/**
 * Store name + logo for invoices, receipts, and printable reports.
 * @param {string} [subtitle] - e.g. "INVOICE", "RECEIPT", "Sales Report"
 */
export default function BrandHeader({ subtitle }) {
  return (
    <div className="brand-header flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4 mb-4">
      <img src={BRAND_LOGO_SRC} alt="" className="h-14 w-14 flex-shrink-0 object-contain" />
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight text-gray-900">{BRAND_NAME}</p>
        {subtitle ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
