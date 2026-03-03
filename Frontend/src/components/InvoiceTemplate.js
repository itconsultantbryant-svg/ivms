import React from "react";
import { formatMoney, formatDate } from "./PrintableDocument";

export default function InvoiceTemplate({ sale, productName = "", storeName = "" }) {
  const product = sale?.ProductID?.name ?? productName;
  const store = sale?.StoreID?.name ?? storeName;
  const qty = sale?.stockSold ?? sale?.StockSold ?? 0;
  const date = sale?.saleDate ?? sale?.SaleDate ?? "";
  const total = sale?.totalSaleAmount ?? sale?.TotalSaleAmount ?? 0;
  const id = sale?._id ?? sale?.id ?? "—";

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">INVOICE</h2>
      <p className="text-sm text-gray-600 mb-4">Invoice # {id}</p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-1 border-b border-gray-300">Item</th>
            <th className="text-left py-1 border-b border-gray-300">Store</th>
            <th className="text-right py-1 border-b border-gray-300">Qty</th>
            <th className="text-right py-1 border-b border-gray-300">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">{product}</td>
            <td className="py-2">{store}</td>
            <td className="text-right py-2">{qty}</td>
            <td className="text-right py-2">{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-4 text-sm">Date: {formatDate(date)}</p>
      <p className="mt-2 font-bold">Total: {formatMoney(total)}</p>
      <p className="mt-6 text-xs text-gray-500">Thank you for your business.</p>
    </div>
  );
}
