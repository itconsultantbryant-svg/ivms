import React, { useState, useEffect, useContext } from "react";
import AddSale from "../components/AddSale";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";
import InvoiceTemplate from "../components/InvoiceTemplate";

import { API_BASE as API } from "../api";

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [sales, setAllSalesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [editSale, setEditSale] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext.user) return;
    fetchSalesData();
    fetchProductsData();
    fetchStoresData();
  }, [updatePage, authContext.user]);

  const fetchSalesData = () => {
    if (!authContext.user) return;
    fetch(`${API}/sales/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setAllSalesData(Array.isArray(data) ? data : []))
      .catch(() => setAllSalesData([]));
  };

  const fetchProductsData = () => {
    if (!authContext.user) return;
    fetch(`${API}/product/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]));
  };

  const fetchStoresData = () => {
    if (!authContext.user) return;
    fetch(`${API}/store/get/${authContext.user}`)
      .then((r) => r.json())
      .then((data) => setAllStores(Array.isArray(data) ? data : []))
      .catch(() => setAllStores([]));
  };

  const addSaleModalSetting = () => setShowSaleModal(!showSaleModal);
  const handlePageUpdate = () => setUpdatePage((p) => !p);

  const deleteSale = (id) => {
    if (!window.confirm("Delete this sale? Stock will be restored.")) return;
    fetch(`${API}/sales/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => handlePageUpdate())
      .catch(() => alert("Failed to delete."));
  };

  const saveEditSale = (payload) => {
    fetch(`${API}/sales/${editSale._id ?? editSale.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else { setEditSale(null); handlePageUpdate(); }
      })
      .catch(() => alert("Failed to update."));
  };

  const formatMoney = (n) => "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6">
      <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sales</h1>
            <p className="text-sm text-gray-500">Record sales and issue invoices. Print invoices from Invoices or here.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" onClick={addSaleModalSetting}>
            Add Sale
          </button>
        </div>

        {showSaleModal && (
          <AddSale addSaleModalSetting={addSaleModalSetting} products={products} stores={stores} handlePageUpdate={handlePageUpdate} authContext={authContext} />
        )}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Store</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Qty Sold</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Invoice</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.length === 0 ? (
                  <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No sales yet. Add a sale to get started.</td></tr>
                ) : (
                  sales.map((el) => (
                    <tr key={el._id ?? el.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 font-medium text-gray-900">{el.ProductID?.name ?? "—"}</td>
                      <td className="px-4 py-2">{el.StoreID?.name ?? "—"}</td>
                      <td className="px-4 py-2">{el.stockSold ?? el.StockSold ?? 0}</td>
                      <td className="px-4 py-2">{el.saleDate ?? el.SaleDate ?? "—"}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatMoney(el.totalSaleAmount ?? el.TotalSaleAmount)}</td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" onClick={() => setSelectedInvoice(selectedInvoice && (selectedInvoice._id === el._id || selectedInvoice.id === el.id) ? null : el)} className="text-blue-600 hover:underline text-sm">
                          {selectedInvoice && (selectedInvoice._id === el._id || selectedInvoice.id === el.id) ? "Hide" : "Print / Download"}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" onClick={() => setEditSale(el)} className="text-blue-600 hover:underline text-sm mr-2">Edit</button>
                        <button type="button" onClick={() => deleteSale(el._id ?? el.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedInvoice && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <PrintableDocument title={"Invoice-" + (selectedInvoice._id ?? selectedInvoice.id)} onClose={() => setSelectedInvoice(null)}>
              <InvoiceTemplate sale={selectedInvoice} />
            </PrintableDocument>
          </div>
        )}

        {viewSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewSale(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sale Details</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Product</dt><dd className="font-medium text-gray-900">{viewSale.ProductID?.name ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Store</dt><dd className="text-gray-900">{viewSale.StoreID?.name ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Qty Sold</dt><dd className="text-gray-900">{viewSale.stockSold ?? viewSale.StockSold ?? 0}</dd></div>
                <div><dt className="text-gray-500">Date</dt><dd className="text-gray-900">{viewSale.saleDate ?? viewSale.SaleDate ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Amount</dt><dd className="text-gray-900">{formatMoney(viewSale.totalSaleAmount ?? viewSale.TotalSaleAmount)}</dd></div>
              </dl>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium" onClick={() => { setSelectedInvoice(viewSale); setViewSale(null); }}>Print Invoice</button>
                <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium" onClick={() => setViewSale(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {editSale && (
          <EditSaleModal
            sale={editSale}
            products={products}
            stores={stores}
            onClose={() => setEditSale(null)}
            onSave={saveEditSale}
            userId={authContext.user}
          />
        )}
      </div>
    </div>
  );
}

function EditSaleModal({ sale, products, stores, onClose, onSave, userId }) {
  const [productID, setProductID] = useState(sale.productID ?? sale.ProductID?.id ?? sale.ProductID?._id ?? "");
  const [storeID, setStoreID] = useState(sale.storeID ?? sale.StoreID?.id ?? sale.StoreID?._id ?? "");
  const [stockSold, setStockSold] = useState(sale.stockSold ?? sale.StockSold ?? 0);
  const [saleDate, setSaleDate] = useState(sale.saleDate ?? sale.SaleDate ?? "");
  const [totalSaleAmount, setTotalSaleAmount] = useState(sale.totalSaleAmount ?? sale.TotalSaleAmount ?? 0);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ userID: userId, productID: Number(productID), storeID: Number(storeID), stockSold: Number(stockSold), saleDate, totalSaleAmount: parseFloat(totalSaleAmount) || 0 });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Sale</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select value={productID} onChange={(e) => setProductID(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <option value="">Select product</option>
              {products.map((p) => <option key={p._id ?? p.id} value={p._id ?? p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select value={storeID} onChange={(e) => setStoreID(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <option value="">Select store</option>
              {stores.map((s) => <option key={s._id ?? s.id} value={s._id ?? s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qty Sold</label>
            <input type="number" min="1" value={stockSold} onChange={(e) => setStockSold(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
            <input type="number" step="0.01" min="0" value={totalSaleAmount} onChange={(e) => setTotalSaleAmount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
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

export default Sales;
