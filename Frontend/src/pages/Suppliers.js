import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

function SupplierModal({ supplier, onClose, onSave }) {
  const [code, setCode] = useState(supplier?.code ?? "");
  const [name, setName] = useState(supplier?.name ?? "");
  const [mobile, setMobile] = useState(supplier?.mobile ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");

  useEffect(() => {
    if (supplier) {
      setCode(supplier.code ?? "");
      setName(supplier.name ?? "");
      setMobile(supplier.mobile ?? "");
      setEmail(supplier.email ?? "");
      setAddress(supplier.address ?? "");
    } else {
      setCode("");
      setName("");
      setMobile("");
      setEmail("");
      setAddress("");
    }
  }, [supplier]);

  const handleSubmit = () => onSave({ code, name, mobile, email, address });

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={handleSubmit}>Save</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function Suppliers() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);

  const fetchSuppliers = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/suppliers/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation tick only
  }, [authContext.user, liveTick]);

  const filtered = suppliers.filter(
    (s) => !search || (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );
  const displayList = filtered.slice(0, showEntries);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/suppliers/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: Number(authContext.user), ...body }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowModal(false);
        fetchSuppliers();
      })
      .catch(() => {});
  };

  const handleUpdate = (body) => {
    const id = editSupplier?._id ?? editSupplier?.id;
    if (!id) return;
    fetch(`${API}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditSupplier(null);
        setShowModal(false);
        fetchSuppliers();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this supplier?")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/suppliers/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchSuppliers())
      .catch(() => {});
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => { setEditSupplier(null); setShowModal(true); }}>
            + Add Supplier
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Show</span>
              <select value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} className="rounded border border-gray-300 text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <input type="text" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Mobile</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Address</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : displayList.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No suppliers yet. Add a supplier to manage purchase sources.</td></tr>
                ) : (
                  displayList.map((s, i) => (
                    <tr key={s.id ?? s._id ?? i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{s.code || "—"}</td>
                      <td className="px-4 py-2">{s.name || "—"}</td>
                      <td className="px-4 py-2">{s.mobile || "—"}</td>
                      <td className="px-4 py-2">{s.email || "—"}</td>
                      <td className="px-4 py-2">{s.address || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" className="text-blue-600 cursor-pointer hover:underline mr-2" onClick={() => { setEditSupplier(s); setShowModal(true); }}>Edit</button>
                        <button type="button" className="text-red-600 cursor-pointer hover:underline" onClick={() => handleDelete(s)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-sm text-gray-600">
            <span>Showing 1 to {displayList.length} of {filtered.length} entries</span>
          </div>
        </div>
      </div>
      {showModal && !editSupplier && (
        <SupplierModal onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />
      )}
      {editSupplier && (
        <SupplierModal supplier={editSupplier} onClose={() => { setEditSupplier(null); setShowModal(false); }} onSave={(body) => handleUpdate(body)} />
      )}
    </div>
  );
}
