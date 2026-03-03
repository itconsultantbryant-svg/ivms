import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";

function WastageModal({ wastage, products, onClose, onSave }) {
  const [productID, setProductID] = useState(wastage?.productID ?? wastage?.ProductID?.id ?? "");
  const [quantity, setQuantity] = useState(wastage?.quantity ?? 1);
  const [date, setDate] = useState(wastage?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(wastage?.note ?? "");

  useEffect(() => {
    if (wastage) {
      setProductID(wastage.productID ?? wastage.ProductID?.id ?? "");
      setQuantity(wastage.quantity ?? 1);
      setDate(wastage.date ?? new Date().toISOString().slice(0, 10));
      setNote(wastage.note ?? "");
    } else {
      setProductID("");
      setQuantity(1);
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [wastage]);

  const handleSubmit = () => onSave({ productID: productID ? Number(productID) : null, quantity: Number(quantity) || 0, date, note });

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {wastage ? "Edit Wastage" : "Add Wastage"}
          </Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product (optional)</label>
              <select value={productID} onChange={(e) => setProductID(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
                <option value="">— None —</option>
                {Array.isArray(products) && products.map((p) => (
                  <option key={p._id ?? p.id} value={p._id ?? p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
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

export default function WastageList() {
  const authContext = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWastage, setEditWastage] = useState(null);

  const fetchList = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/wastage/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [authContext.user]);

  useEffect(() => {
    if (!authContext.user) return;
    fetch(`${API}/product/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [authContext.user]);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/wastage/add`, {
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
    const id = editWastage?._id ?? editWastage?.id;
    if (!id) return;
    fetch(`${API}/wastage/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditWastage(null);
        setShowModal(false);
        fetchList();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this wastage record? Stock will be restored if linked to a product.")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/wastage/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchList())
      .catch(() => {});
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Wastage List</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" onClick={() => { setEditWastage(null); setShowModal(true); }}>
            Add Wastage
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No wastage records. Add one above.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {list.map((row, idx) => (
                  <tr key={row._id ?? row.id ?? idx}>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.ProductID?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.quantity ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.date ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.note ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button className="text-blue-600 hover:underline mr-3" onClick={() => { setEditWastage(row); setShowModal(true); }}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showModal && !editWastage && <WastageModal products={products} onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />}
      {editWastage && <WastageModal wastage={editWastage} products={products} onClose={() => { setEditWastage(null); setShowModal(false); }} onSave={(body) => handleUpdate(body)} />}
    </div>
  );
}
