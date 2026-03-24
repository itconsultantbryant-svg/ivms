import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "../AuthContext";
import { BRAND_NAME } from "../branding";
import {
  ChartBarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartPieIcon,
  KeyIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

const mainNav = [
  { to: "/", label: "Dashboard", icon: ChartBarIcon, permission: "dashboard" },
  { to: "/finance", label: "Finance", icon: ChartPieIcon, permission: "finance" },
  { to: "/sales", label: "Sales", icon: ShoppingCartIcon, permission: "sales" },
  { to: "/checkout", label: "Checkout (scan)", icon: QrCodeIcon, permission: "sales" },
  { to: "/invoices", label: "Invoices", icon: DocumentTextIcon, permission: "invoices" },
  { to: "/receipts", label: "Receipts", icon: ClipboardDocumentListIcon, permission: "receipts" },
  { to: "/customers", label: "Customers", icon: UserGroupIcon, permission: "customers" },
  { to: "/purchase-details", label: "Purchase", icon: ShoppingBagIcon, permission: "purchase" },
  { to: "/manage-store", label: "Stores", icon: BuildingStorefrontIcon, permission: "stores" },
  { to: "/suppliers", label: "Suppliers", icon: TruckIcon, permission: "suppliers" },
  {
    key: "items",
    label: "Items",
    icon: CubeIcon,
    permission: "inventory",
    children: [
      { to: "/inventory", label: "Items", permission: "inventory" },
      { to: "/categories", label: "Categories", permission: "categories" },
      { to: "/wastage-list", label: "Wastage List", permission: "wastage" },
    ],
  },
  { to: "/payment", label: "Payment", icon: CurrencyDollarIcon, permission: "payment" },
  { to: "/expenses", label: "Expenses", icon: DocumentTextIcon, permission: "expenses" },
  {
    key: "reports",
    label: "Reports",
    icon: ChartPieIcon,
    permission: "reports",
    children: [
      { to: "/reports", label: "Reports", permission: "reports" },
      { to: "/reports/sales", label: "Sales Report", permission: "reports_sales" },
      { to: "/reports/purchase", label: "Purchase Report", permission: "reports_purchase" },
      { to: "/reports/stock", label: "Stock Report", permission: "reports_stock" },
    ],
  },
  {
    key: "permissions",
    label: "Permissions",
    icon: KeyIcon,
    permission: "permissions",
    children: [
      { to: "/permissions", label: "User Role", permission: "permissions" },
      { to: "/permissions/list", label: "Permissions", permission: "permissions" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Cog6ToothIcon,
    permission: "settings",
    children: [
      { to: "/settings/tax", label: "TAX List", permission: "settings" },
      { to: "/settings/units", label: "Units List", permission: "settings" },
      { to: "/settings/company-profile", label: "Company Profile", permission: "settings" },
      { to: "/settings/users", label: "Users", permission: "settings" },
    ],
  },
];

function NavLink({ to, label, icon: Icon, isActive, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive ? "bg-sky-600/20 text-sky-300" : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
      }`}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span>{label}</span>
    </Link>
  );
}

function SideMenu({ mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { permissions: userPermissions } = useContext(AuthContext) || {};
  const [expanded, setExpanded] = useState({
    items: location.pathname.startsWith("/inventory") || location.pathname.startsWith("/categories") || location.pathname.startsWith("/wastage"),
    reports: location.pathname.startsWith("/reports"),
    permissions: location.pathname.startsWith("/permissions"),
    settings: location.pathname.startsWith("/settings"),
  });

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
  const allowed = (perm) => userPermissions == null || (Array.isArray(userPermissions) && userPermissions.includes(perm));
  const filteredNav = mainNav.filter((item) => {
    if (item.children) {
      const allowedChildren = item.children.filter((c) => allowed(c.permission));
      if (allowedChildren.length === 0) return false;
      return allowed(item.permission);
    }
    return allowed(item.permission);
  }).map((item) => {
    if (item.children) {
      return { ...item, children: item.children.filter((c) => allowed(c.permission)) };
    }
    return item;
  });

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <div
        className={`flex h-full flex-col bg-gray-900 text-white w-56 border-r border-gray-700 lg:flex
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out lg:relative lg:translate-x-0
          ${mobileOpen ? "translate-x-0 flex" : "-translate-x-full hidden"}`}
      >
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="mt-2 flex flex-col gap-0.5 px-2">
          {filteredNav.map((item) => {
            if (item.children) {
              const isOpen = expanded[item.key];
              const hasActiveChild = item.children.some((c) => location.pathname === c.to || (c.to !== "/reports" && location.pathname.startsWith(c.to)));
              const Icon = item.icon;
              return (
                <div key={item.key}>
                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      hasActiveChild ? "bg-sky-600/20 text-sky-300" : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-gray-700 pl-3">
                      {item.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          onClick={onCloseMobile}
                          className={`rounded px-3 py-2 text-sm ${
                            location.pathname === c.to ? "bg-sky-600/20 text-sky-300 font-medium" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const isActive = (item.to === "/" && location.pathname === "/") || (item.to !== "/" && (location.pathname === item.to || location.pathname.startsWith(item.to + "/")));
            return (
              <NavLink key={item.to} to={item.to} label={item.label} icon={item.icon} isActive={isActive} onNavigate={onCloseMobile} />
            );
          })}
        </nav>
        <div className="mt-4 border-t border-gray-700 pt-4 px-2">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-gray-300">
              {user.firstName ? user.firstName[0] : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-gray-400">Online</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 px-4 py-3 text-xs text-gray-500">
        {BRAND_NAME} · Version 1.0
      </div>
    </div>
    </>
  );
}

export default SideMenu;
