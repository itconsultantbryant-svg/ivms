import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";

import { API_BASE as API } from "../api";

export default function ReportsPurchase() {
  const authContext = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!authContext.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/purchase/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setPurchases(Array.isArray(data) ? data : []))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  }, [authContext.user]);

  const total = purchases.reduce((s, x) => s + Number(x.totalPurchaseAmount ?? x.TotalPurchaseAmount ?? 0), 0);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Purchase Report</h1>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Reports</h2>
            <PrintableDocument title="Purchase-Report">
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">Purchase Report</h2>
                <p className="text-sm text-gray-600 mb-4">Generated {new Date().toLocaleString()}</p>
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">#</th>
                      <th className="border border-gray-300 p-2 text-left">Date</th>
                      <th className="border border-gray-300 p-2 text-left">Product</th>
                      <th className="border border-gray-300 p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p, i) => (
                      <tr key={p._id ?? p.id ?? i}>
                        <td className="border border-gray-300 p-2">{i + 1}</td>
                        <td className="border border-gray-300 p-2">{p.purchaseDate ?? p.PurchaseDate ?? "—"}</td>
                        <td className="border border-gray-300 p-2">{p.ProductID?.name ?? "—"}</td>
                        <td className="border border-gray-300 p-2 text-right">${Number(p.totalPurchaseAmount ?? p.TotalPurchaseAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-medium">
                      <td className="border border-gray-300 p-2" colSpan="3">Total</td>
                      <td className="border border-gray-300 p-2 text-right">${Number(total).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </PrintableDocument>
          </div>
          {loading ? (
            <p className="p-4 text-gray-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">#</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No purchases. <Link to="/purchase-details" className="text-sky-600 hover:underline">Add purchase</Link>.</td></tr>
                  ) : (
                    purchases.map((p, i) => (
                      <tr key={p._id ?? p.id ?? i}>
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2">{p.purchaseDate ?? p.PurchaseDate ?? "—"}</td>
                        <td className="px-4 py-2">{p.ProductID?.name ?? "—"}</td>
                        <td className="px-4 py-2 text-right font-medium">${Number(p.totalPurchaseAmount ?? p.TotalPurchaseAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {purchases.length > 0 && (
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td className="px-4 py-2" colSpan="3">Total</td>
                      <td className="px-4 py-2 text-right">${Number(total).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
