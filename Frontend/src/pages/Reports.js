import React from "react";
import { Link } from "react-router-dom";
import { ChartBarIcon, ShoppingBagIcon, CubeIcon } from "@heroicons/react/24/outline";

const reportCards = [
  { to: "/reports/sales", title: "Sales Report", icon: ChartBarIcon },
  { to: "/reports/purchase", title: "Purchase Report", icon: ShoppingBagIcon },
  { to: "/reports/stock", title: "Stock Report", icon: CubeIcon },
];

export default function Reports() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Reports</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-sky-300 hover:shadow-md transition-all"
            >
              <r.icon className="h-12 w-12 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-900 text-center">{r.title}</span>
              <span className="text-xs text-sky-600 mt-1">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
