import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";

export default function Payment() {
  const authContext = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    Promise.all([
      fetch(`${API}/sales/get/${authContext.user}`).then((r) => r.json()),
      fetch(`${API}/purchase/get/${authContext.user}`).then((r) => r.json()),
    ])
      .then(([sales, purchases]) => {
        const combined = [
          ...(Array.isArray(sales) ? sales : []).map((s) => ({ ...s, type: "Sale", ref: s._id || s.id, amount: s.totalSaleAmount, date: s.saleDate })),
          ...(Array.isArray(purchases) ? purchases : []).map((p) => ({ ...p, type: "Purchase", ref: p._id || p.id, amount: p.totalPurchaseAmount, date: p.purchaseDate })),
        ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setPayments(combined);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [authContext.user]);

  const filtered = payments.filter((p) => !search || String(p.ref).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">Payment</h1>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Add Payment</button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-4">
            <span className="text-sm text-gray-600">List</span>
            <input type="text" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Payment For</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No payment records. Payments are tracked with <Link to="/sales" className="text-blue-600 hover:underline">Sales</Link> and <Link to="/purchase-details" className="text-blue-600 hover:underline">Purchases</Link>.</td></tr>
                ) : (
                  filtered.slice(0, 20).map((p, i) => (
                    <tr key={`${p.type}-${p.ref}-${i}`} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2">{p.type} #{p.ref}</td>
                      <td className="px-4 py-2 text-right font-medium">${Number(p.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{p.type}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="text-blue-600 cursor-pointer hover:underline mr-2">Edit</span>
                        <span className="text-red-600 cursor-pointer hover:underline">Delete</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-4 py-2 text-sm text-gray-600">
            Showing 1 to {Math.min(20, filtered.length)} of {filtered.length} entries
          </div>
        </div>
      </div>
    </div>
  );
}
