import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

export default function ReportsSales() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSales = () => {
    if (!authContext.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/sales/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setSales(Array.isArray(data) ? data : []))
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation tick only
  }, [authContext.user, liveTick]);

  const filtered = sales.filter((s) => {
    const d = s.saleDate ?? s.SaleDate ?? "";
    if (!d) return true;
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });

  const total = filtered.reduce((s, x) => s + Number(x.totalSaleAmount ?? x.TotalSaleAmount ?? 0), 0);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Sales Report</h1>
        <div className="rounded-xl border border-gray-200 bg-sky-50/50 p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Filter by date (optional)</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={loadSales} className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700">Refresh</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Data loads automatically. Use dates to filter or leave empty for all.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Reports</h2>
            <PrintableDocument title="Sales-Report">
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">Sales Report</h2>
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
                    {filtered.map((s, i) => (
                      <tr key={s._id ?? s.id ?? i}>
                        <td className="border border-gray-300 p-2">{i + 1}</td>
                        <td className="border border-gray-300 p-2">{s.saleDate ?? s.SaleDate ?? "—"}</td>
                        <td className="border border-gray-300 p-2">{s.ProductID?.name ?? "—"}</td>
                        <td className="border border-gray-300 p-2 text-right">${Number(s.totalSaleAmount ?? s.TotalSaleAmount ?? 0).toFixed(2)}</td>
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
                  {sales.length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No sales data. <Link to="/sales" className="text-sky-600 hover:underline">Add sales</Link>.</td></tr>
                  ) : (
                    filtered.map((s, i) => (
                      <tr key={s._id ?? s.id ?? i}>
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2">{s.saleDate ?? s.SaleDate ?? "—"}</td>
                        <td className="px-4 py-2">{s.ProductID?.name ?? "—"}</td>
                        <td className="px-4 py-2 text-right font-medium">${Number(s.totalSaleAmount ?? s.TotalSaleAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filtered.length > 0 && (
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
