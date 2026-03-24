import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext";
import { API_BASE } from "../api";
import { normalizeStoredUserId } from "../sessionUserId";
import { emitLiveRefresh, useLiveRefresh } from "../hooks/useLiveRefresh";
import BarcodeScanInput from "../components/BarcodeScanInput";
import { CameraBarcodeButton } from "../components/CameraBarcodeButton";
import PrintableDocument from "../components/PrintableDocument";
import InvoiceTemplate from "../components/InvoiceTemplate";

function formatMoney(n) {
  return "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Checkout() {
  const authContext = useContext(AuthContext);
  const liveTick = useLiveRefresh();
  const uid = normalizeStoredUserId(authContext.user) ?? 1;
  const [stores, setStores] = useState([]);
  const [storeID, setStoreID] = useState("");
  const [scan, setScan] = useState("");
  const [cart, setCart] = useState([]);
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lastInvoice, setLastInvoice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/store/get/${uid}`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setStores(list);
        if (list.length && !storeID) {
          setStoreID(String(list[0]._id ?? list[0].id));
        }
      })
      .catch(() => setStores([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store default once
  }, [authContext.user, liveTick]);

  const lookupBarcode = (code) => {
    const c = String(code || "").trim();
    if (!c) return;
    fetch(`${API_BASE}/product/barcode?userId=${uid}&code=${encodeURIComponent(c)}`)
      .then((r) => r.json())
      .then((p) => {
        if (p.error) {
          alert(p.error);
          return;
        }
        addLine(p);
        setScan("");
      })
      .catch(() => alert("Product not found for this barcode."));
  };

  const addLine = (p) => {
    const id = p._id ?? p.id;
    setCart((prev) => {
      const i = prev.findIndex((x) => (x.product._id ?? x.product.id) === id);
      const unit = parseFloat(p.unitPrice) || 0;
      if (i >= 0) {
        const next = [...prev];
        const maxStock = next[i].product.stock ?? 0;
        const qty = next[i].qty + 1;
        if (qty > maxStock) {
          alert("Not enough stock for this item.");
          return prev;
        }
        next[i] = { ...next[i], qty, lineTotal: qty * next[i].unitPrice };
        return next;
      }
      const stock = p.stock ?? 0;
      if (stock < 1) {
        alert("This product is out of stock.");
        return prev;
      }
      return [...prev, { product: p, qty: 1, unitPrice: unit, lineTotal: unit }];
    });
  };

  const setQty = (index, qty) => {
    const q = Math.max(1, parseInt(qty, 10) || 1);
    setCart((prev) => {
      const row = prev[index];
      if (!row) return prev;
      const max = row.product.stock ?? 0;
      if (q > max) {
        alert(`Max available: ${max}`);
        return prev;
      }
      const next = [...prev];
      next[index] = { ...row, qty: q, lineTotal: q * row.unitPrice };
      return next;
    });
  };

  const removeLine = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const submitCheckout = async () => {
    const sid = parseInt(storeID, 10);
    if (!sid || cart.length === 0) {
      alert("Select a store and add at least one item.");
      return;
    }
    setBusy(true);
    try {
      for (const line of cart) {
        const p = line.product;
        const pid = p._id ?? p.id;
        const body = {
          userID: uid,
          productID: pid,
          storeID: sid,
          stockSold: line.qty,
          saleDate,
          unitPrice: line.unitPrice,
          totalSaleAmount: line.lineTotal,
        };
        const res = await fetch(`${API_BASE}/sales/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.error || "Sale failed");
          setBusy(false);
          return;
        }
      }
      emitLiveRefresh();
      const storeName = stores.find((s) => String(s._id ?? s.id) === String(storeID))?.name ?? "";
      setLastInvoice({ lines: [...cart], saleDate, storeName });
      setCart([]);
    } finally {
      setBusy(false);
    }
  };

  const grandTotal = cart.reduce((s, l) => s + l.lineTotal, 0);

  return (
    <div className="col-span-12 p-4 lg:col-span-10 lg:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900">Checkout (scan)</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan barcode or QR payload, or type the code and press Enter. Totals use quantity × unit price from each product.
        </p>

        <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
            <select
              value={storeID}
              onChange={(e) => setStoreID(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select store</option>
              {stores.map((s) => {
                const id = s._id ?? s.id;
                return (
                  <option key={id} value={id}>
                    {s.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sale date</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Scan barcode / QR</label>
            <div className="flex flex-wrap items-center gap-2">
              <BarcodeScanInput value={scan} onChange={setScan} onCommit={lookupBarcode} />
              <CameraBarcodeButton onCode={lookupBarcode} />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3 font-semibold text-gray-900">Cart</div>
          {cart.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No items yet — scan to add.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cart.map((line, index) => {
                const p = line.product;
                const name = p.name ?? "Item";
                return (
                  <li key={(p._id ?? p.id) + "-" + index} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{name}</div>
                      <div className="text-xs text-gray-500">
                        {formatMoney(line.unitPrice)} each · stock {p.stock ?? 0}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={p.stock ?? 999999}
                      value={line.qty}
                      onChange={(e) => setQty(index, e.target.value)}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                    <div className="w-24 text-right text-sm font-medium">{formatMoney(line.lineTotal)}</div>
                    <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeLine(index)}>
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {cart.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatMoney(grandTotal)}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || cart.length === 0}
            onClick={submitCheckout}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Processing…" : "Complete & record sales"}
          </button>
        </div>

        {lastInvoice && (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="mb-3 text-sm font-medium text-green-800">Sale recorded. Print invoice / receipt.</p>
            <PrintableDocument title={"Invoice-" + Date.now()} onClose={() => setLastInvoice(null)}>
              <InvoiceTemplate lines={lastInvoice.lines} saleDate={lastInvoice.saleDate} storeName={lastInvoice.storeName} />
            </PrintableDocument>
            <button type="button" className="mt-3 text-sm text-gray-700 underline" onClick={() => setLastInvoice(null)}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
