import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

function CustomerModal({ customer, onClose, onSave }) {
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");

  useEffect(() => {
    if (customer) {
      setName(customer.name ?? "");
      setEmail(customer.email ?? "");
      setPhone(customer.phone ?? "");
      setAddress(customer.address ?? "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
    }
  }, [customer]);

  const handleSubmit = () => onSave({ name, email, phone, address });

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {customer ? "Edit Customer" : "Add Customer"}
          </Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
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

export default function Customers() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const fetchCustomers = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/customers/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation tick only
  }, [authContext.user, liveTick]);

  const filtered = customers.filter(
    (c) =>
      !search ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );
  const displayList = filtered.slice(0, showEntries);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/customers/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: Number(authContext.user), ...body }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowModal(false);
        fetchCustomers();
      })
      .catch(() => {});
  };

  const handleUpdate = (body) => {
    const id = editCustomer?._id ?? editCustomer?.id;
    if (!id) return;
    fetch(`${API}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditCustomer(null);
        fetchCustomers();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this customer?")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/customers/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchCustomers())
      .catch(() => {});
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => { setEditCustomer(null); setShowModal(true); }}>
            + Add Customer
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
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Address</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : displayList.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No customers yet. Add a customer or use Walk-in Customer for quick sales.</td></tr>
                ) : (
                  displayList.map((c, i) => (
                    <tr key={c.id ?? c._id ?? i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{c.name || "—"}</td>
                      <td className="px-4 py-2">{c.email || "—"}</td>
                      <td className="px-4 py-2">{c.phone || "—"}</td>
                      <td className="px-4 py-2">{c.address || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" className="text-blue-600 cursor-pointer hover:underline mr-2" onClick={() => { setEditCustomer(c); setShowModal(true); }}>Edit</button>
                        <button type="button" className="text-red-600 cursor-pointer hover:underline" onClick={() => handleDelete(c)}>Delete</button>
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
      {showModal && !editCustomer && (
        <CustomerModal onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />
      )}
      {editCustomer && (
        <CustomerModal customer={editCustomer} onClose={() => { setEditCustomer(null); setShowModal(false); }} onSave={(body) => handleUpdate(body)} />
      )}
    </div>
  );
}
