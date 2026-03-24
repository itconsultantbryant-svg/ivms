import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";
import { normalizeStoredUserId } from "../sessionUserId";
import { blurActiveElement } from "../modalFocus";

function CategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState(category?.name ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    category?.lowStockThreshold != null ? String(category.lowStockThreshold) : "5"
  );
  const [targetStock, setTargetStock] = useState(category?.targetStock != null ? String(category.targetStock) : "0");

  useEffect(() => {
    setName(category?.name ?? "");
    setLowStockThreshold(category?.lowStockThreshold != null ? String(category.lowStockThreshold) : "5");
    setTargetStock(category?.targetStock != null ? String(category.targetStock) : "0");
  }, [category]);

  const save = () => {
    blurActiveElement();
    onSave({
      name,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      targetStock: parseInt(targetStock, 10) || 0,
    });
  };

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-lg font-semibold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </Dialog.Title>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Low-stock alert (units in category)</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Flag when total on-hand units in this category are at or below this level.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Target stock (planning)</label>
              <input
                type="number"
                min="0"
                value={targetStock}
                onChange={(e) => setTargetStock(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => {
                blurActiveElement();
                onClose();
              }}
            >
              Cancel
            </button>
            <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={save}>
              Save
            </button>
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
  const [stockByCategory, setStockByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const fetchList = () => {
    if (!authContext.user) return;
    const uid = normalizeStoredUserId(authContext.user) ?? 1;
    setLoading(true);
    Promise.all([
      fetch(`${API}/categories/get/${uid}`).then((r) => r.json()),
      fetch(`${API}/product/get/${uid}`).then((r) => r.json()),
    ])
      .then(([cats, products]) => {
        setList(Array.isArray(cats) ? cats : []);
        const m = {};
        (Array.isArray(products) ? products : []).forEach((p) => {
          const c = p.categoryID;
          if (!c) return;
          m[c] = (m[c] || 0) + (Number(p.stock) || 0);
        });
        setStockByCategory(m);
      })
      .catch(() => {
        setList([]);
        setStockByCategory({});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation tick only
  }, [authContext.user, liveTick]);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    const uid = normalizeStoredUserId(authContext.user) ?? 1;
    fetch(`${API}/categories/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: uid, ...body }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          alert(data?.error || `Could not add category (${r.status})`);
          return;
        }
        setShowModal(false);
        fetchList();
      })
      .catch(() => alert("Network error while adding category."));
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => {
              setEditCategory(null);
              setShowModal(true);
            }}
          >
            Add Category
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No categories. Add one above.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">In stock (units)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Target</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Low alert</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {list.map((row, idx) => {
                  const id = row._id ?? row.id;
                  const onHand = stockByCategory[id] ?? 0;
                  const low = row.lowStockThreshold ?? 5;
                  const target = row.targetStock ?? 0;
                  const isLow = onHand <= low && onHand > 0;
                  const isOut = onHand <= 0;
                  return (
                    <tr key={id ?? idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{onHand}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{target}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{low}</td>
                      <td className="px-4 py-3 text-sm">
                        {isOut ? (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">Out / empty</span>
                        ) : isLow ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Low stock</span>
                        ) : (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button className="mr-3 text-blue-600 hover:underline" onClick={() => { setEditCategory(row); setShowModal(true); }}>
                          Edit
                        </button>
                        <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showModal && !editCategory && <CategoryModal onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />}
      {editCategory && (
        <CategoryModal
          category={editCategory}
          onClose={() => {
            setEditCategory(null);
            setShowModal(false);
          }}
          onSave={(body) => handleUpdate(body)}
        />
      )}
    </div>
  );
}
