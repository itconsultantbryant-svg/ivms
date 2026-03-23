import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import { useEffect, useState } from "react";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import FinanceDashboard from "./pages/FinanceDashboard";
import Invoices from "./pages/Invoices";
import Receipts from "./pages/Receipts";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Payment from "./pages/Payment";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import ReportsSales from "./pages/ReportsSales";
import ReportsPurchase from "./pages/ReportsPurchase";
import ReportsStock from "./pages/ReportsStock";
import Categories from "./pages/Categories";
import WastageList from "./pages/WastageList";
import Permissions from "./pages/Permissions";
import PermissionsList from "./pages/PermissionsList";
import SettingsTax from "./pages/SettingsTax";
import SettingsUnits from "./pages/SettingsUnits";
import SettingsCompanyProfile from "./pages/SettingsCompanyProfile";
import SettingsUsers from "./pages/SettingsUsers";

import { API_BASE } from "./api";
import { useLiveRefresh } from "./hooks/useLiveRefresh";
import { normalizeStoredUserId } from "./sessionUserId";

const App = () => {
  const liveTick = useLiveRefresh();
  const [user, setUser] = useState("");
  const [permissions, setPermissions] = useState(null);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const rawId = parsed._id ?? parsed.id;
        const safe = normalizeStoredUserId(rawId);
        if (safe == null) {
          setUser("");
        } else {
          if (safe !== Number(rawId)) {
            localStorage.setItem("user", JSON.stringify({ ...parsed, _id: safe, id: safe }));
          }
          setUser(String(safe));
        }
      } catch (_) {
        setUser("");
      }
    } else {
      setUser("");
      setPermissions(null);
    }
    setLoader(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setPermissions(null);
      return;
    }
    const fetchPerms = () => {
      fetch(`${API_BASE}/users/${user}/permissions`)
        .then((r) => r.json())
        .then((data) => setPermissions(data.modules))
        .catch(() => setPermissions(null));
    };
    fetchPerms();
    const onFocus = () => fetchPerms();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, liveTick]);

  const signin = (newUser, callback) => {
    const safe = normalizeStoredUserId(newUser);
    setUser(safe != null ? String(safe) : "");
    callback();
  };

  const signout = () => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem("user");
  };

  let value = { user, signin, signout, permissions };

  if (loader)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>LOADING...</h1>
      </div>
    );

  return (
    <AuthContext.Provider value={value}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedWrapper>
                <Layout />
              </ProtectedWrapper>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchase-details" element={<PurchaseDetails />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/manage-store" element={<Store />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/sales" element={<ReportsSales />} />
            <Route path="/reports/purchase" element={<ReportsPurchase />} />
            <Route path="/reports/stock" element={<ReportsStock />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/wastage-list" element={<WastageList />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/permissions/list" element={<PermissionsList />} />
            <Route path="/settings/tax" element={<SettingsTax />} />
            <Route path="/settings/units" element={<SettingsUnits />} />
            <Route path="/settings/company-profile" element={<SettingsCompanyProfile />} />
            <Route path="/settings/users" element={<SettingsUsers />} />
          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
