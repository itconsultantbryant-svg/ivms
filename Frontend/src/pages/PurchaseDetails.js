import React, { useState, useEffect, useContext } from "react";
import AddPurchaseDetails from "../components/AddPurchaseDetails";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";
import ReceiptTemplate from "../components/ReceiptTemplate";
import { API_BASE } from "../api";

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchase, setAllPurchaseData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [viewPurchase, setViewPurchase] = useState(null);
  const [editPurchase, setEditPurchase] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchPurchaseData();
    fetchProductsData();
  }, [updatePage, authContext.user]);

  // Fetching Data of All Purchase items
  const fetchPurchaseData = () => {
    fetch(`${API_BASE}/purchase/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setAllPurchaseData(Array.isArray(data) ? data : []))
      .catch(() => setAllPurchaseData([]));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`${API_BASE}/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]));
  };

  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setPurchaseModal(!showPurchaseModal);
  };

  
  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  const deletePurchase = (id) => {
    if (!window.confirm("Delete this purchase? Stock will be restored.")) return;
    fetch(`${API_BASE}/purchase/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => handlePageUpdate())
      .catch(() => alert("Failed to delete."));
  };

  const saveEditPurchase = (payload) => {
    fetch(`${API_BASE}/purchase/${editPurchase._id ?? editPurchase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else { setEditPurchase(null); handlePageUpdate(); }
      })
      .catch(() => alert("Failed to update."));
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
            authContext = {authContext}
          />
        )}
        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div><span className="font-bold">Purchases</span><p className="text-xs text-gray-500">Print receipts via Receipts page or below.</p></div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm" onClick={addSaleModalSetting}>Add Purchase</button>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Product</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Quantity</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Date</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Amount</th>
                <th className="whitespace-nowrap px-4 py-2 text-center font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchase.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No purchases yet.</td></tr>
              ) : purchase.map((element) => (
                <tr key={element._id ?? element.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-900">{element.ProductID?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{element.quantityPurchased ?? element.QuantityPurchased ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{element.purchaseDate ?? element.PurchaseDate ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">${Number(element.totalPurchaseAmount ?? element.TotalPurchaseAmount ?? 0).toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-center">
                    <button type="button" onClick={() => setViewPurchase(element)} className="text-blue-600 hover:underline text-xs mr-2">View</button>
                    <button type="button" onClick={() => setEditPurchase(element)} className="text-blue-600 hover:underline text-xs mr-2">Edit</button>
                    <button type="button" onClick={() => setSelectedReceipt(selectedReceipt && (selectedReceipt._id === element._id || selectedReceipt.id === element.id) ? null : element)} className="text-blue-600 hover:underline text-xs mr-2">Print</button>
                    <button type="button" onClick={() => deletePurchase(element._id ?? element.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedReceipt && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <PrintableDocument title={"Receipt-" + (selectedReceipt._id ?? selectedReceipt.id)} onClose={() => setSelectedReceipt(null)}>
              <ReceiptTemplate purchase={selectedReceipt} />
            </PrintableDocument>
          </div>
        )}

        {viewPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewPurchase(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Details</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Product</dt><dd className="font-medium text-gray-900">{viewPurchase.ProductID?.name ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Quantity</dt><dd className="text-gray-900">{viewPurchase.quantityPurchased ?? viewPurchase.QuantityPurchased ?? 0}</dd></div>
                <div><dt className="text-gray-500">Date</dt><dd className="text-gray-900">{viewPurchase.purchaseDate ?? viewPurchase.PurchaseDate ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Amount</dt><dd className="text-gray-900">${Number(viewPurchase.totalPurchaseAmount ?? viewPurchase.TotalPurchaseAmount ?? 0).toFixed(2)}</dd></div>
              </dl>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium" onClick={() => { setSelectedReceipt(viewPurchase); setViewPurchase(null); }}>Print Receipt</button>
                <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium" onClick={() => setViewPurchase(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {editPurchase && (
          <EditPurchaseModal
            purchase={editPurchase}
            onClose={() => setEditPurchase(null)}
            onSave={saveEditPurchase}
            userId={authContext.user}
          />
        )}
      </div>
    </div>
  );
}

function EditPurchaseModal({ purchase, onClose, onSave, userId }) {
  const [qty, setQty] = useState(purchase.quantityPurchased ?? purchase.QuantityPurchased ?? 0);
  const [date, setDate] = useState(purchase.purchaseDate ?? purchase.PurchaseDate ?? "");
  const [amount, setAmount] = useState(purchase.totalPurchaseAmount ?? purchase.TotalPurchaseAmount ?? 0);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ userID: userId, quantityPurchased: qty, purchaseDate: date, totalPurchaseAmount: parseFloat(amount) || 0 });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Purchase</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseDetails;
