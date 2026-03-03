import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";

function AddEditTaxModal({ tax, onClose, onSave }) {
  const [name, setName] = useState(tax?.name ?? "");
  const [rate, setRate] = useState(tax?.rate ?? 0);
  const [status, setStatus] = useState(tax?.status ?? "ON");

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {tax ? "Edit TAX" : "Add TAX"}
          </Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. VAT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            {tax && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="ON">ON</option>
                  <option value="OFF">OFF</option>
                </select>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => onSave({ name, rate, status })}
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function SettingsTax() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTax, setEditTax] = useState(null);
  const authContext = useContext(AuthContext);

  const fetchList = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/tax/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authContext.user) {
      setLoading(false);
      return;
    }
    fetchList();
  }, [authContext.user]);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/tax/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: Number(authContext.user), ...body }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowModal(false);
        fetchList();
      })
      .catch(() => {});
  };

  const handleUpdate = (body) => {
    const id = editTax?._id ?? editTax?.id;
    if (!id) return;
    fetch(`${API}/tax/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditTax(null);
        fetchList();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this TAX?")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/tax/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchList())
      .catch(() => {});
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">TAX List</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
            onClick={() => setShowModal(true)}
          >
            Add TAX
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No tax entries. Add one above.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.map((row, idx) => (
                  <tr key={row._id ?? row.id ?? idx}>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.rate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.status ?? "ON"}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        className="text-blue-600 hover:underline mr-3"
                        onClick={() => setEditTax(row)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(row)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showModal && (
        <AddEditTaxModal
          onClose={() => setShowModal(false)}
          onSave={(body) => handleAdd(body)}
        />
      )}
      {editTax && (
        <AddEditTaxModal
          tax={editTax}
          onClose={() => setEditTax(null)}
          onSave={(body) => handleUpdate(body)}
        />
      )}
    </div>
  );
}
