import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";
import ReceiptTemplate from "../components/ReceiptTemplate";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

export default function Receipts() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetch(API + "/purchase/get/" + authContext.user)
      .then((r) => r.json())
      .then((data) => setReceipts(Array.isArray(data) ? data : []))
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  }, [authContext.user, liveTick]);

  const isSelected = (rec) => selectedReceipt && (selectedReceipt._id === rec._id || selectedReceipt.id === rec.id);

  const refresh = () => {
    setLoading(true);
    fetch(API + "/purchase/get/" + authContext.user)
      .then((r) => r.json())
      .then((data) => setReceipts(Array.isArray(data) ? data : []))
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  };

  const deleteReceipt = (id) => {
    if (!id || !window.confirm("Delete this receipt? This will remove the purchase record.")) return;
    fetch(`${API}/purchase/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        setSelectedReceipt(null);
        refresh();
      })
      .catch(() => {});
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-xl font-bold text-gray-900">All Receipts</h1>
          <p className="text-sm text-gray-500">Purchase receipts. Print or download each receipt.</p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading receipts...</p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Receipt #</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {receipts.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No receipts yet.</td></tr>
                  ) : (
                    receipts.map((rec) => (
                      <tr key={rec._id || rec.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 font-medium">#{rec._id || rec.id}</td>
                        <td className="px-4 py-2">{rec.ProductID ? rec.ProductID.name : "—"}</td>
                        <td className="px-4 py-2">{rec.purchaseDate || rec.PurchaseDate || "—"}</td>
                        <td className="px-4 py-2 text-right">{rec.quantityPurchased ?? rec.QuantityPurchased ?? 0}</td>
                        <td className="px-4 py-2 text-right font-medium">${Number(rec.totalPurchaseAmount ?? rec.TotalPurchaseAmount ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button type="button" onClick={() => setSelectedReceipt(isSelected(rec) ? null : rec)} className="text-blue-600 hover:underline text-sm mr-2">
                            {isSelected(rec) ? "Hide" : "View / Print"}
                          </button>
                          <button type="button" onClick={() => deleteReceipt(rec._id || rec.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReceipt && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <PrintableDocument title={"Receipt-" + (selectedReceipt._id || selectedReceipt.id)} onClose={() => setSelectedReceipt(null)}>
              <ReceiptTemplate purchase={selectedReceipt} />
            </PrintableDocument>
          </div>
        )}
      </div>
    </div>
  );
}
