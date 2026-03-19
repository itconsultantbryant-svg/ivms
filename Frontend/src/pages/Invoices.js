import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";
import InvoiceTemplate from "../components/InvoiceTemplate";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

export default function Invoices() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetch(API + "/sales/get/" + authContext.user)
      .then((r) => r.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [authContext.user, liveTick]);

  const refresh = () => {
    setLoading(true);
    fetch(API + "/sales/get/" + authContext.user)
      .then((r) => r.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  };

  const deleteInvoice = (id) => {
    if (!id || !window.confirm("Delete this invoice? This will remove the sales record.")) return;
    fetch(`${API}/sales/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        setSelectedInvoice(null);
        refresh();
      })
      .catch(() => {});
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">All sales as invoices. Print or download each invoice.</p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading invoices...</p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Invoice #</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Store</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No invoices yet.</td></tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv._id ?? inv.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 font-medium">#{inv._id ?? inv.id}</td>
                        <td className="px-4 py-2">{inv.ProductID?.name ?? "—"}</td>
                        <td className="px-4 py-2">{inv.StoreID?.name ?? "—"}</td>
                        <td className="px-4 py-2">{inv.saleDate ?? inv.SaleDate ?? "—"}</td>
                        <td className="px-4 py-2 text-right font-medium">${Number(inv.totalSaleAmount ?? inv.TotalSaleAmount ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(selectedInvoice && (selectedInvoice._id === inv._id || selectedInvoice.id === inv.id) ? null : inv)}
                            className="text-blue-600 hover:underline text-sm mr-2"
                          >
                            {selectedInvoice && (selectedInvoice._id === inv._id || selectedInvoice.id === inv.id) ? "Hide" : "View / Print"}
                          </button>
                          <button type="button" onClick={() => deleteInvoice(inv._id ?? inv.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedInvoice && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <PrintableDocument title={"Invoice-" + (selectedInvoice._id ?? selectedInvoice.id)} onClose={() => setSelectedInvoice(null)}>
              <InvoiceTemplate sale={selectedInvoice} />
            </PrintableDocument>
          </div>
        )}
      </div>
    </div>
  );
}
