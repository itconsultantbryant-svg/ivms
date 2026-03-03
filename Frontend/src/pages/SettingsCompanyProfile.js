import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";

const defaultProfile = {
  companyName: "",
  tagLine: "",
  businessType: "",
  ownerName: "",
  mobileNo: "",
  phoneNo: "",
  faxNo: "",
  email: "",
  taxNumber: "",
  address: "",
  timeZone: "",
  currencyCode: "USD",
  currencySymbol: "$",
  prefixCategory: "CA",
  prefixItem: "IT",
  prefixSupplier: "SU",
  prefixPurchase: "PC",
  prefixCustomer: "CU",
  prefixSales: "SA",
  prefixExpenses: "EX",
};

export default function SettingsCompanyProfile() {
  const [form, setForm] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/company-profile/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setForm({
            companyName: data.companyName ?? "",
            tagLine: data.tagLine ?? "",
            businessType: data.businessType ?? "",
            ownerName: data.ownerName ?? "",
            mobileNo: data.mobileNo ?? "",
            phoneNo: data.phoneNo ?? "",
            faxNo: data.faxNo ?? "",
            email: data.email ?? "",
            taxNumber: data.taxNumber ?? "",
            address: data.address ?? "",
            timeZone: data.timeZone ?? "",
            currencyCode: data.currencyCode ?? "USD",
            currencySymbol: data.currencySymbol ?? "$",
            prefixCategory: data.prefixCategory ?? "CA",
            prefixItem: data.prefixItem ?? "IT",
            prefixSupplier: data.prefixSupplier ?? "SU",
            prefixPurchase: data.prefixPurchase ?? "PC",
            prefixCustomer: data.prefixCustomer ?? "CU",
            prefixSales: data.prefixSales ?? "SA",
            prefixExpenses: data.prefixExpenses ?? "EX",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authContext.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!authContext.user) return;
    setMessage(null);
    setSaving(true);
    fetch(`${API}/company-profile/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: Number(authContext.user), ...form }),
    })
      .then((r) => r.json())
      .then(() => {
        setMessage("Saved successfully.");
      })
      .catch(() => setMessage("Failed to save."))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-3xl text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h1>
        {message && (
          <p className={`mb-4 text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" name="tagLine" value={form.tagLine} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input type="text" name="businessType" value={form.businessType} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input type="text" name="ownerName" value={form.ownerName} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input type="text" name="mobileNo" value={form.mobileNo} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" name="phoneNo" value={form.phoneNo} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                <input type="text" name="faxNo" value={form.faxNo} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                <input type="text" name="taxNumber" value={form.taxNumber} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <input type="text" name="timeZone" value={form.timeZone} onChange={handleChange} placeholder="e.g. UTC" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <input type="text" name="currencyCode" value={form.currencyCode} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input type="text" name="currencySymbol" value={form.currencySymbol} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Prefixes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" name="prefixCategory" value={form.prefixCategory} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <input type="text" name="prefixItem" value={form.prefixItem} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input type="text" name="prefixSupplier" value={form.prefixSupplier} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase</label>
                <input type="text" name="prefixPurchase" value={form.prefixPurchase} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input type="text" name="prefixCustomer" value={form.prefixCustomer} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales</label>
                <input type="text" name="prefixSales" value={form.prefixSales} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expenses</label>
                <input type="text" name="prefixExpenses" value={form.prefixExpenses} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
