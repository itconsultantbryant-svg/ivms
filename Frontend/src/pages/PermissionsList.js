import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

const MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "finance", label: "Finance" },
  { id: "sales", label: "Sales" },
  { id: "invoices", label: "Invoices" },
  { id: "receipts", label: "Receipts" },
  { id: "customers", label: "Customers" },
  { id: "purchase", label: "Purchase" },
  { id: "stores", label: "Stores" },
  { id: "suppliers", label: "Suppliers" },
  { id: "inventory", label: "Items / Inventory" },
  { id: "categories", label: "Categories" },
  { id: "wastage", label: "Wastage List" },
  { id: "payment", label: "Payment" },
  { id: "expenses", label: "Expenses" },
  { id: "reports", label: "Reports" },
  { id: "reports_sales", label: "Reports / Sales" },
  { id: "reports_purchase", label: "Reports / Purchase" },
  { id: "reports_stock", label: "Reports / Stock" },
  { id: "permissions", label: "Permissions" },
  { id: "settings", label: "Settings" },
];

export default function PermissionsList() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const roleIdParam = searchParams.get("roleId");
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(roleIdParam || "");
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authContext.user) return;
    fetch(`${API}/roles/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]));
  }, [authContext.user, liveTick]);

  useEffect(() => {
    if (roleIdParam && !selectedRoleId) setSelectedRoleId(roleIdParam);
  }, [roleIdParam, selectedRoleId]);

  useEffect(() => {
    if (!selectedRoleId) {
      setChecked({});
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/roles/${selectedRoleId}/permissions`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const map = {};
        MODULES.forEach((m) => (map[m.id] = false));
        list.forEach((p) => (map[p.module] = true));
        setChecked(map);
      })
      .catch(() => {
        const map = {};
        MODULES.forEach((m) => (map[m.id] = false));
        setChecked(map);
      })
      .finally(() => setLoading(false));
  }, [selectedRoleId, liveTick]);

  const handleToggle = (moduleId) => {
    setChecked((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleSelectRole = (e) => {
    const id = e.target.value;
    setSelectedRoleId(id);
    if (id) setSearchParams({ roleId: id });
    else setSearchParams({});
  };

  const handleSave = () => {
    if (!selectedRoleId) return;
    setSaving(true);
    const modules = MODULES.filter((m) => checked[m.id]).map((m) => m.id);
    fetch(`${API}/roles/${selectedRoleId}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modules }),
    })
      .then((r) => r.json())
      .then(() => setSaving(false))
      .catch(() => setSaving(false));
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Permissions</h1>
          <Link to="/permissions" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            ← User Roles
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-4">Select a role and set which modules it can access.</p>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={selectedRoleId}
              onChange={handleSelectRole}
              className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a role...</option>
              {roles.map((r) => (
                <option key={r._id ?? r.id} value={r._id ?? r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {!selectedRoleId && (
            <p className="text-sm text-gray-500">Select a role above or create one from User Roles.</p>
          )}

          {selectedRoleId && loading && <p className="text-sm text-gray-500">Loading permissions...</p>}

          {selectedRoleId && !loading && (
            <>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Module access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MODULES.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!checked[m.id]}
                        onChange={() => handleToggle(m.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save permissions"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
