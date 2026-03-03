import React, { useRef } from "react";

export default function PrintableDocument({ title, children, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const prevTitle = document.title;
    document.title = title || "Document";
    const printWindow = window.open("", "_blank");
    const style = "body{font-family:system-ui,sans-serif;padding:24px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px 12px;} th{background:#f5f5f5;} .text-right{text-align:right;}";
    printWindow.document.write("<html><head><title>" + document.title + "</title><style>" + style + "</style></head><body>" + content.innerHTML + "</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
    document.title = prevTitle;
  };

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;
    const t = title || "document";
    const html = "<!DOCTYPE html><html><head><title>" + t + "</title></head><body>" + content.innerHTML + "</body></html>";
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t.replace(/\s+/g, "-") + ".html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 no-print">
        <button type="button" onClick={handlePrint} className="px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700">Print</button>
        <button type="button" onClick={handleDownload} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">Download</button>
        {onClose && <button type="button" onClick={onClose} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50">Close</button>}
      </div>
      <div ref={printRef} className="bg-white text-gray-900 p-6 rounded border border-gray-200 max-w-2xl">{children}</div>
    </div>
  );
}

export function formatMoney(n) {
  return "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
}
