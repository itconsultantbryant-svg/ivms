import React, { useState, useEffect, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import AddStore from "../components/AddStore";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { emitLiveRefresh, useLiveRefresh } from "../hooks/useLiveRefresh";

function EditStoreModal({ store, onClose, onSave }) {
  const [form, setForm] = React.useState({
    name: store?.name ?? "",
    category: store?.category ?? "",
    address: store?.address ?? "",
    city: store?.city ?? "",
    image: store?.image ?? "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Edit Store</Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Retail, Warehouse" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={() => onSave(form)}>Save</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function Store() {
  const liveTick = useLiveRefresh();
  const [showModal, setShowModal] = useState(false);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [viewStore, setViewStore] = useState(null);
  const [editStore, setEditStore] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext.user) return;
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation / modal update
  }, [updatePage, authContext.user, liveTick]);

  const fetchData = () => {
    if (!authContext.user) return;
    fetch(`${API}/store/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setAllStores(Array.isArray(data) ? data : []))
      .catch(() => setAllStores([]));
  };

  const modalSetting = () => setShowModal(!showModal);
  const handlePageUpdate = () => {
    emitLiveRefresh();
    setUpdatePage((p) => !p);
  };

  const deleteStore = (id) => {
    if (!id || !window.confirm("Delete this store?")) return;
    fetch(`${API}/store/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        handlePageUpdate();
      })
      .catch(() => {});
  };

  const updateStore = (id, body) => {
    fetch(`${API}/store/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditStore(null);
        handlePageUpdate();
      })
      .catch(() => {});
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Stores</h1>
            <p className="text-sm text-gray-500">Add and view store locations.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" onClick={modalSetting}>
            Add Store
          </button>
        </div>

        {showModal && <AddStore modalSetting={modalSetting} handlePageUpdate={handlePageUpdate} />}

        {/* View Store Modal */}
        {viewStore && (
          <Transition show={!!viewStore} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={() => setViewStore(null)}>
              <div className="fixed inset-0 bg-black/30" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Store Details</Dialog.Title>
                  <div className="space-y-3 text-sm">
                    {viewStore.image && (
                      <img src={viewStore.image} alt={viewStore.name} className="h-32 w-full object-cover rounded-lg bg-gray-100" />
                    )}
                    <p><span className="text-gray-500">Name:</span> {viewStore.name ?? "—"}</p>
                    <p><span className="text-gray-500">Category:</span> {viewStore.category ?? "—"}</p>
                    <p><span className="text-gray-500">Address:</span> {viewStore.address ?? "—"}</p>
                    <p><span className="text-gray-500">City:</span> {viewStore.city ?? "—"}</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button type="button" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={() => setViewStore(null)}>Close</button>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>
          </Transition>
        )}

        {/* Edit Store Modal */}
        {editStore && (
          <EditStoreModal
            store={editStore}
            onClose={() => setEditStore(null)}
            onSave={(body) => updateStore(editStore._id ?? editStore.id, body)}
          />
        )}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Store</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Address</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">City</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No stores yet. Add a store to get started.</td></tr>
                ) : (
                  stores.map((el) => (
                    <tr key={el._id ?? el.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          {el.image ? (
                            <img src={el.image} alt="" className="h-10 w-10 rounded object-cover bg-gray-100" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">Store</div>
                          )}
                          <span className="font-medium text-gray-900">{el.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{el.category ?? "—"}</td>
                      <td className="px-4 py-2 text-gray-700">{el.address ?? "—"}</td>
                      <td className="px-4 py-2 text-gray-700">{el.city ?? "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="text-blue-600 cursor-pointer hover:underline text-sm" onClick={() => setViewStore(el)}>View</span>
                        <span className="text-gray-400 px-1">|</span>
                        <span className="text-green-700 cursor-pointer hover:underline text-sm" onClick={() => setEditStore(el)}>Edit</span>
                        <span className="text-gray-400 px-1">|</span>
                        <span className="text-red-600 cursor-pointer hover:underline text-sm" onClick={() => deleteStore(el._id ?? el.id)}>Delete</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((el) => (
            <div key={el._id ?? el.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {el.image ? (
                  <img src={el.image} alt={el.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{el.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{el.category}</p>
                <p className="text-sm text-gray-600 mt-2">{el.address}, {el.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Store;
