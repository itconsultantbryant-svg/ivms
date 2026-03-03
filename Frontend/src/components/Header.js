import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import AuthContext from "../AuthContext";

const routeTitles = {
  "/": "Dashboard",
  "/finance": "Finance",
  "/inventory": "Items",
  "/purchase-details": "Purchase",
  "/sales": "Sales",
  "/invoices": "Invoices",
  "/receipts": "Receipts",
  "/manage-store": "Stores",
  "/customers": "Customers",
  "/suppliers": "Suppliers",
  "/payment": "Payment",
  "/expenses": "Expenses",
  "/reports": "Reports",
  "/reports/sales": "Reports / Sales Report",
  "/reports/purchase": "Reports / Purchase Report",
  "/reports/stock": "Reports / Stock Report",
  "/permissions": "Permissions",
  "/permissions/list": "Permissions",
  "/settings/tax": "Settings / TAX List",
  "/settings/units": "Settings / Units List",
  "/settings/company-profile": "Settings / Company Profile",
  "/settings/users": "Settings / Users",
  "/categories": "Items / Categories",
  "/wastage-list": "Items / Wastage List",
};

function getBreadcrumb(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/reports/")) return "Reports / " + pathname.split("/").pop().replace(/-/g, " ");
  if (pathname.startsWith("/settings/")) return "Settings / " + pathname.split("/").pop().replace(/-/g, " ");
  return pathname.slice(1) || "Dashboard";
}

export default function Header({ onMenuClick }) {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-sky-600 px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onMenuClick?.()}
          className="rounded p-1.5 text-white hover:bg-sky-700 lg:hidden"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center gap-2 rounded bg-sky-700/50 px-3 py-1.5">
          <span className="font-bold text-white">Inventory</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-white/90 sm:block">{breadcrumb}</span>
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 rounded-lg py-1.5 pl-2 pr-3 text-left text-sm text-white hover:bg-sky-700 focus:outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium">
              {user.firstName ? user.firstName[0] : "?"}
            </div>
            <span className="hidden sm:inline">Hi, {user.firstName || user.email || "User"}</span>
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={`block w-full px-4 py-2 text-left text-sm ${active ? "bg-gray-100" : ""} text-gray-700`}
                  onClick={() => {
                    authContext.signout();
                    navigate("/login");
                  }}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
}
