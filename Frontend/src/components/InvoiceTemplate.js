import React from "react";
import BrandHeader from "./BrandHeader";
import { formatMoney, formatDate } from "./PrintableDocument";

export default function InvoiceTemplate({ sale, lines, saleDate: saleDateProp, storeName: storeNameProp, productName = "", storeName = "" }) {
  if (lines && lines.length > 0) {
    const date = saleDateProp || new Date().toISOString().slice(0, 10);
    const store = storeNameProp || storeName;
    const total = lines.reduce((s, l) => s + (Number(l.lineTotal) || 0), 0);
    return (
      <div>
        <BrandHeader subtitle="INVOICE" />
        {store ? <p className="text-sm text-gray-600">Store: {store}</p> : null}
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr>
              <th className="border-b border-gray-300 py-1 text-left">Item</th>
              <th className="border-b border-gray-300 py-1 text-right">Qty</th>
              <th className="border-b border-gray-300 py-1 text-right">Unit</th>
              <th className="border-b border-gray-300 py-1 text-right">Line</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => {
              const p = line.product || {};
              const name = p.name || productName || "Item";
              const qty = line.qty ?? 0;
              const unit = line.unitPrice ?? 0;
              const lineTot = line.lineTotal ?? qty * unit;
              return (
                <tr key={i}>
                  <td className="py-2">{name}</td>
                  <td className="py-2 text-right">{qty}</td>
                  <td className="py-2 text-right">{formatMoney(unit)}</td>
                  <td className="py-2 text-right">{formatMoney(lineTot)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-4 text-sm">Date: {formatDate(date)}</p>
        <p className="mt-2 font-bold">Total: {formatMoney(total)}</p>
        <p className="mt-6 text-xs text-gray-500">Thank you for your business.</p>
      </div>
    );
  }

  const product = sale?.ProductID?.name ?? productName;
  const store = sale?.StoreID?.name ?? storeName;
  const qty = sale?.stockSold ?? sale?.StockSold ?? 0;
  const date = sale?.saleDate ?? sale?.SaleDate ?? "";
  const total = sale?.totalSaleAmount ?? sale?.TotalSaleAmount ?? 0;
  const id = sale?._id ?? sale?.id ?? "—";

  return (
    <div>
      <BrandHeader subtitle="INVOICE" />
      <p className="text-sm text-gray-600">Invoice # {id}</p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr>
            <th className="border-b border-gray-300 py-1 text-left">Item</th>
            <th className="border-b border-gray-300 py-1 text-left">Store</th>
            <th className="border-b border-gray-300 py-1 text-right">Qty</th>
            <th className="border-b border-gray-300 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">{product}</td>
            <td className="py-2">{store}</td>
            <td className="py-2 text-right">{qty}</td>
            <td className="py-2 text-right">{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-4 text-sm">Date: {formatDate(date)}</p>
      <p className="mt-2 font-bold">Total: {formatMoney(total)}</p>
      <p className="mt-6 text-xs text-gray-500">Thank you for your business.</p>
    </div>
  );
}
