import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

function CategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState(category?.name ?? "");

  useEffect(() => {
    setName(category?.name ?? "");
  }, [category]);

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {category ? "Edit Category" : "Add Category"}
          </Dialog.Title>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={() => onSave({ name })}>Save</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function Categories() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const fetchList = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/categories/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation tick only
  }, [authContext.user, liveTick]);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/categories/add`, {
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
    const id = editCategory?._id ?? editCategory?.id;
    if (!id) return;
    fetch(`${API}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditCategory(null);
        fetchList();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this category?")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/categories/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchList())
      .catch(() => {});
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" onClick={() => { setEditCategory(null); setShowModal(true); }}>
            Add Category
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No categories. Add one above.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.map((row, idx) => (
                  <tr key={row._id ?? row.id ?? idx}>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button className="text-blue-600 hover:underline mr-3" onClick={() => { setEditCategory(row); setShowModal(true); }}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showModal && !editCategory && <CategoryModal onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />}
      {editCategory && <CategoryModal category={editCategory} onClose={() => { setEditCategory(null); setShowModal(false); }} onSave={(body) => handleUpdate(body)} />}
    </div>
  );
}
