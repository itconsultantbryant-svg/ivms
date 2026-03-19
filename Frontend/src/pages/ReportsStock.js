import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

export default function ReportsStock() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authContext.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/product/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [authContext.user, liveTick]);

  const lowStock = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10);
  const outOfStock = products.filter((p) => (p.stock ?? 0) <= 0);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Stock Report</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-sm text-amber-700">Low Stock (&lt;10)</p>
            <p className="text-2xl font-bold text-amber-800">{lowStock.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm text-red-700">Out of Stock</p>
            <p className="text-2xl font-bold text-red-800">{outOfStock.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">#</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Manufacturer</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Stock</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No items. <Link to="/inventory" className="text-sky-600 hover:underline">Add items</Link>.</td></tr>
                ) : (
                  products.map((p, i) => (
                    <tr key={p._id ?? p.id ?? i}>
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{p.name ?? "—"}</td>
                      <td className="px-4 py-2">{p.manufacturer ?? "—"}</td>
                      <td className="px-4 py-2 text-right">{p.stock ?? 0}</td>
                      <td className="px-4 py-2">
                        <span className={(p.stock ?? 0) <= 0 ? "text-red-600" : (p.stock ?? 0) < 10 ? "text-amber-600" : "text-green-600"}>
                          {(p.stock ?? 0) <= 0 ? "Out of Stock" : (p.stock ?? 0) < 10 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
