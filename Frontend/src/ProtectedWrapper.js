import AuthContext from "./AuthContext";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

const pathToModule = {
  "/": "dashboard",
  "/finance": "finance",
  "/sales": "sales",
  "/invoices": "invoices",
  "/receipts": "receipts",
  "/customers": "customers",
  "/purchase-details": "purchase",
  "/manage-store": "stores",
  "/suppliers": "suppliers",
  "/inventory": "inventory",
  "/categories": "categories",
  "/wastage-list": "wastage",
  "/payment": "payment",
  "/expenses": "expenses",
  "/reports": "reports",
  "/reports/sales": "reports_sales",
  "/reports/purchase": "reports_purchase",
  "/reports/stock": "reports_stock",
  "/permissions": "permissions",
  "/permissions/list": "permissions",
  "/settings/tax": "settings",
  "/settings/units": "settings",
  "/settings/company-profile": "settings",
  "/settings/users": "settings",
};

function getModuleForPath(pathname) {
  if (pathToModule[pathname]) return pathToModule[pathname];
  if (pathname.startsWith("/settings/")) return "settings";
  if (pathname.startsWith("/reports/")) return "reports";
  if (pathname.startsWith("/permissions")) return "permissions";
  return "dashboard";
}

function ProtectedWrapper(props) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  const modules = auth.permissions;
  if (modules != null && Array.isArray(modules)) {
    const required = getModuleForPath(location.pathname);
    if (!modules.includes(required)) {
      return <Navigate to="/" replace />;
    }
  }

  return props.children;
}
export default ProtectedWrapper;
