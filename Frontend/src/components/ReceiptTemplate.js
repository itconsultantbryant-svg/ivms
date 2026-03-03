import React from "react";
import { formatMoney, formatDate } from "./PrintableDocument";

export default function ReceiptTemplate({ purchase, productName }) {
  const product = (purchase && (purchase.ProductID && purchase.ProductID.name)) || productName || "—";
  const qty = purchase && (purchase.quantityPurchased ?? purchase.QuantityPurchased);
  const date = purchase && (purchase.purchaseDate ?? purchase.PurchaseDate);
  const total = purchase && (purchase.totalPurchaseAmount ?? purchase.TotalPurchaseAmount);
  const id = (purchase && (purchase._id ?? purchase.id)) || "—";

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">PURCHASE RECEIPT</h2>
      <p className="text-sm text-gray-600 mb-4">Receipt # {id}</p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-1 border-b border-gray-300">Item</th>
            <th className="text-right py-1 border-b border-gray-300">Qty</th>
            <th className="text-right py-1 border-b border-gray-300">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">{product}</td>
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
