import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import AuthContext from "../AuthContext";

import { API_BASE as API } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";

function ExpenseModal({ expense, onClose, onSave }) {
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(expense?.category ?? "");
  const [amount, setAmount] = useState(expense?.amount ?? "");
  const [note, setNote] = useState(expense?.note ?? "");

  useEffect(() => {
    if (expense) {
      setDate(expense.date ?? new Date().toISOString().slice(0, 10));
      setCategory(expense.category ?? "");
      setAmount(expense.amount ?? "");
      setNote(expense.note ?? "");
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setCategory("");
      setAmount("");
      setNote("");
    }
  }, [expense]);

  const handleSubmit = () => onSave({ date, category, amount: parseFloat(amount) || 0, note });

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded-xl bg-white shadow-xl max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {expense ? "Edit Expense" : "Add Expense"}
          </Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Rent, Utilities" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
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

export default function Expenses() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const fetchExpenses = () => {
    if (!authContext.user) return;
    setLoading(true);
    fetch(`${API}/expenses/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation tick only
  }, [authContext.user, liveTick]);

  const filtered = expenses.filter((e) => !search || (e.note && e.note.toLowerCase().includes(search.toLowerCase())));

  const handleAdd = (body) => {
    if (!authContext.user) return;
    fetch(`${API}/expenses/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: Number(authContext.user), ...body }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowModal(false);
        fetchExpenses();
      })
      .catch(() => {});
  };

  const handleUpdate = (body) => {
    const id = editExpense?._id ?? editExpense?.id;
    if (!id) return;
    fetch(`${API}/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then(() => {
        setEditExpense(null);
        setShowModal(false);
        fetchExpenses();
      })
      .catch(() => {});
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this expense?")) return;
    const id = row._id ?? row.id;
    fetch(`${API}/expenses/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => fetchExpenses())
      .catch(() => {});
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => { setEditExpense(null); setShowModal(true); }}>
            + Add Expense
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-4">
            <span className="text-sm text-gray-600">List</span>
            <input type="text" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Note</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No expenses yet. Add an expense to track costs.</td></tr>
                ) : (
                  filtered.map((e, i) => (
                    <tr key={e.id ?? e._id ?? i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{e.date ? new Date(e.date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2">{e.category || "—"}</td>
                      <td className="px-4 py-2 text-right font-medium">${Number(e.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{e.note || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" className="text-blue-600 cursor-pointer hover:underline mr-2" onClick={() => { setEditExpense(e); setShowModal(true); }}>Edit</button>
                        <button type="button" className="text-red-600 cursor-pointer hover:underline" onClick={() => handleDelete(e)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && !editExpense && (
        <ExpenseModal onClose={() => setShowModal(false)} onSave={(body) => handleAdd(body)} />
      )}
      {editExpense && (
        <ExpenseModal expense={editExpense} onClose={() => { setEditExpense(null); setShowModal(false); }} onSave={(body) => handleUpdate(body)} />
      )}
    </div>
  );
}
