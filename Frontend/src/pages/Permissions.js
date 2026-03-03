import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";

function RoleModal({ role, onClose, onSave }) {
  const [name, setName] = useState(role?.name ?? "");

  useEffect(() => {
    setName(role?.name ?? "");
  }, [role]);

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {role ? "Edit Role" : "Add Role"}
          </Dialog.Title>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Admin, Manager, Staff"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={() => onSave({ name })}>
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function Permissions() {
  const authContext = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState(null);

  const fetchList = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/roles/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [authContext.user]);

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/roles/add`, {
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
    const id = editRole?._id ?? editRole?.id;
    if (!id) return;
    fetch(`${API}/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditRole(null);
        setShowModal(false);
        fetchList();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this role? Its permissions will be removed.")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/roles/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchList())
      .catch(() => {});
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">User Role</h1>
          <div className="flex gap-2">
            <Link
              to="/permissions/list"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Permissions
            </Link>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
              onClick={() => {
                setEditRole(null);
                setShowModal(true);
              }}
            >
              Add Role
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">Create and manage roles (Admin, Manager, Staff, etc.). Assign module permissions in Permissions.</p>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No roles yet. Add a role above, then set permissions in Permissions.</div>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Link to={`/permissions/list?roleId=${row._id ?? row.id}`} className="text-sky-600 hover:underline mr-3">
                        Permissions
                      </Link>
                      <button className="text-blue-600 hover:underline mr-3" onClick={() => { setEditRole(row); setShowModal(true); }}>
                        Edit
                      </button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>
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
      {showModal && !editRole && <RoleModal onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />}
      {editRole && (
        <RoleModal role={editRole} onClose={() => { setEditRole(null); setShowModal(false); }} onSave={(body) => handleUpdate(body)} />
      )}
    </div>
  );
}
