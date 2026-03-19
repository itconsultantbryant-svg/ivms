import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";
import { emitLiveRefresh } from "../hooks/useLiveRefresh";

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    emitLiveRefresh();
  }, [location.pathname]);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <Header onMenuClick={() => setMobileMenuOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <SideMenu mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
