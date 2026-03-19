import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

const defaultCreateForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  roleIDs: [],
};

export default function SettingsUsers() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API}/users`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [liveTick]);

  useEffect(() => {
    if (!authContext?.user) return;
    fetch(`${API}/roles/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]));
  }, [authContext?.user, liveTick]);

  useEffect(() => {
    if (list.length === 0) return;
    const ids = list.map((u) => u._id ?? u.id).filter(Boolean);
    ids.forEach((uid) => {
      fetch(`${API}/users/${uid}/roles`)
        .then((r) => r.json())
        .then((data) => setUserRoles((prev) => ({ ...prev, [uid]: Array.isArray(data) ? data : [] })))
        .catch(() => setUserRoles((prev) => ({ ...prev, [uid]: [] })));
    });
  }, [list]);

  const assignRole = (userID, roleID) => {
    if (!userID || !roleID) return;
    fetch(`${API}/user-roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: Number(userID), roleID: Number(roleID) }),
    })
      .then((r) => r.json())
      .then(() => {
        fetch(`${API}/users/${userID}/roles`)
          .then((res) => res.json())
          .then((data) => setUserRoles((prev) => ({ ...prev, [userID]: Array.isArray(data) ? data : [] })))
          .catch(() => {});
      })
      .catch(() => {});
  };

  const removeRole = (userID, roleID) => {
    if (!userID || !roleID) return;
    fetch(`${API}/user-roles/${userID}/${roleID}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        setUserRoles((prev) => ({
          ...prev,
          [userID]: (prev[userID] || []).filter((r) => (r._id ?? r.id) !== roleID),
        }));
      })
      .catch(() => {});
  };

  const openCreateModal = () => {
    setCreateForm(defaultCreateForm);
    setCreateError("");
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setCreateError("");
    setCreateSubmitting(false);
  };

  const onCreateFieldChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const onRoleToggle = (roleID) => {
    setCreateForm((prev) => {
      const id = Number(roleID);
      const next = prev.roleIDs.includes(id) ? prev.roleIDs.filter((r) => r !== id) : [...prev.roleIDs, id];
      return { ...prev, roleIDs: next };
    });
  };

  const createUser = (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.email.trim() || !createForm.password.trim()) {
      setCreateError("Email and password are required.");
      return;
    }
    setCreateSubmitting(true);
    fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: createForm.firstName.trim() || "User",
        lastName: createForm.lastName.trim() || "",
        email: createForm.email.trim(),
        password: createForm.password,
        phoneNumber: createForm.phoneNumber.trim() || null,
      }),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setCreateError(data?.error || "Failed to create user.");
          setCreateSubmitting(false);
          return;
        }
        const newUserID = data._id ?? data.id;
        if (!newUserID || createForm.roleIDs.length === 0) {
          fetchUsers();
          closeCreateModal();
          return;
        }
        const assignPromises = createForm.roleIDs.map((roleID) =>
          fetch(`${API}/user-roles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID: Number(newUserID), roleID: Number(roleID) }),
          })
        );
        return Promise.all(assignPromises).then(() => {
          fetchUsers();
          closeCreateModal();
        });
      })
      .catch(() => {
        setCreateError("Network error. Please try again.");
        setCreateSubmitting(false);
      })
      .finally(() => {
        setCreateSubmitting(false);
      });
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Create users with login details and assign roles. Roles are created under Permissions → User Role.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Create user
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No users found. Create a user to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {list.map((row, idx) => {
                    const uid = row._id ?? row.id;
                    const uRoles = userRoles[uid] ?? [];
                    return (
                      <tr key={uid ?? idx}>
                        <td className="px-4 py-3 text-sm text-gray-700">{uid}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.firstName ?? ""} {row.lastName ?? ""}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{row.email ?? ""}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{row.phoneNumber ?? ""}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            {uRoles.map((r) => (
                              <span
                                key={r._id ?? r.id}
                                className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800"
                              >
                                {r.name}
                                <button
                                  type="button"
                                  onClick={() => removeRole(uid, r._id ?? r.id)}
                                  className="ml-0.5 rounded hover:bg-sky-200 p-0.5"
                                  aria-label="Remove role"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <select
                              className="rounded border border-gray-300 text-xs py-1 pl-2 pr-6"
                              value=""
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v) assignRole(uid, v);
                                e.target.value = "";
                              }}
                            >
                              <option value="">+ Add role</option>
                              {roles
                                .filter((r) => !uRoles.some((ur) => (ur._id ?? ur.id) === (r._id ?? r.id)))
                                .map((r) => (
                                  <option key={r._id ?? r.id} value={r._id ?? r.id}>
                                    {r.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create user</h2>
              <p className="text-sm text-gray-500 mt-1">Add login details. You can assign roles now or later from the table.</p>
            </div>
            <form onSubmit={createUser} className="p-6 space-y-4">
              {createError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {createError}
                </div>
              )}
              <div>
                <label htmlFor="create-firstName" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  id="create-firstName"
                  name="firstName"
                  type="text"
                  value={createForm.firstName}
                  onChange={onCreateFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="create-lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  id="create-lastName"
                  name="lastName"
                  type="text"
                  value={createForm.lastName}
                  onChange={onCreateFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label htmlFor="create-email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  id="create-email"
                  name="email"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={onCreateFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label htmlFor="create-password" className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <input
                  id="create-password"
                  name="password"
                  type="password"
                  required
                  value={createForm.password}
                  onChange={onCreateFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="create-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  id="create-phone"
                  name="phoneNumber"
                  type="text"
                  value={createForm.phoneNumber}
                  onChange={onCreateFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Assign roles (optional)</span>
                <div className="flex flex-wrap gap-2">
                  {roles.length === 0 ? (
                    <p className="text-sm text-gray-500">No roles yet. Create roles under Permissions → User Role, then set permissions under Permissions → Permissions.</p>
                  ) : (
                    roles.map((r) => {
                      const rid = r._id ?? r.id;
                      const checked = createForm.roleIDs.includes(Number(rid));
                      return (
                        <label key={rid} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onRoleToggle(rid)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span className="text-sm text-gray-700">{r.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? "Creating…" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
