import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import PrintableDocument from "../components/PrintableDocument";

import { API_BASE } from "../api";
import { useLiveRefresh } from "../hooks/useLiveRefresh";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function FinanceDashboard() {
  const liveTick = useLiveRefresh();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalOtherExpenses, setTotalOtherExpenses] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
  const [monthlyExpenses, setMonthlyExpenses] = useState(Array(12).fill(0));
  const [recentSales, setRecentSales] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFinanceData = useCallback(() => {
    const uid = authContext.user;
    if (!uid) return;

    Promise.all([
      fetch(`${API_BASE}/sales/get/${uid}/totalsaleamount`).then((r) => r.json()),
      fetch(`${API_BASE}/purchase/get/${uid}/totalpurchaseamount`).then((r) => r.json()),
      fetch(`${API_BASE}/expenses/get/${uid}`).then((r) => r.json()),
      fetch(`${API_BASE}/sales/get/${uid}/monthly`).then((r) => r.json()),
      fetch(`${API_BASE}/purchase/get/${uid}/monthly`).then((r) => r.json()),
      fetch(`${API_BASE}/sales/get/${uid}`).then((r) => r.json()),
      fetch(`${API_BASE}/purchase/get/${uid}`).then((r) => r.json()),
    ])
      .then(([salesTotal, purchaseTotal, expensesList, salesMonthly, purchaseMonthly, salesList, purchaseList]) => {
        const revenue = Number(salesTotal?.totalSaleAmount ?? 0);
        const fromPurchases = Number(purchaseTotal?.totalPurchaseAmount ?? 0);
        const expensesArray = Array.isArray(expensesList) ? expensesList : [];
        const fromExpenses = expensesArray.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
        setTotalRevenue(revenue);
        setTotalExpenses(fromPurchases + fromExpenses);
        setTotalPurchases(fromPurchases);
        setTotalOtherExpenses(fromExpenses);
        setMonthlyRevenue(salesMonthly?.salesAmount ?? Array(12).fill(0));
        setMonthlyExpenses(purchaseMonthly?.purchaseAmount ?? Array(12).fill(0));
        setRecentSales(Array.isArray(salesList) ? salesList.slice(0, 8) : []);
        setRecentPurchases(Array.isArray(purchaseList) ? purchaseList.slice(0, 8) : []);
        setRecentExpenses(expensesArray.slice(0, 8));
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authContext.user]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData, liveTick]);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  const revenueVsExpensesChart = {
    options: {
      chart: { type: "bar", toolbar: { show: false } },
      title: { text: "Revenue vs Expenses by Month", style: { fontSize: "14" } },
      xaxis: { categories: MONTHS },
      yaxis: { title: { text: "Amount ($)" } },
      plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
      colors: ["#10b981", "#ef4444"],
      legend: { position: "top" },
      dataLabels: { enabled: false },
    },
    series: [
      { name: "Revenue", data: monthlyRevenue },
      { name: "Expenses", data: monthlyExpenses },
    ],
  };

  const profitByMonth = monthlyRevenue.map((r, i) => (r || 0) - (monthlyExpenses[i] || 0));
  const profitChart = {
    options: {
      chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
      title: { text: "Net Profit by Month", style: { fontSize: "14" } },
      xaxis: { categories: MONTHS },
      yaxis: { title: { text: "Profit ($)" }, labels: { formatter: (v) => "$" + v } },
      colors: [netProfit >= 0 ? "#10b981" : "#ef4444"],
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.2 } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
    },
    series: [{ name: "Net Profit", data: profitByMonth }],
  };

  const formatMoney = (n) => "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  if (loading) {
    return (
      <div className="col-span-12 lg:col-span-10 flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Loading finance data...</p>
      </div>
    );
  }

  return (
    <div className="col-span-12 lg:col-span-10 p-4 lg:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live data
          {lastUpdated && (
            <span> · Last updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Quick links to related areas */}
      <div className="flex flex-wrap gap-2">
        <Link to="/sales" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Sales</Link>
        <Link to="/purchase-details" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Purchase</Link>
        <Link to="/expenses" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Expenses</Link>
        <Link to="/invoices" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Invoices</Link>
        <Link to="/receipts" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Receipts</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(totalRevenue)}</p>
          <p className="mt-1 text-xs text-gray-400">From sales</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Purchases</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(totalPurchases)}</p>
          <p className="mt-1 text-xs text-gray-400">Inventory purchases</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Other Expenses</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(totalOtherExpenses)}</p>
          <p className="mt-1 text-xs text-gray-400">From Expenses module</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatMoney(totalExpenses)}</p>
          <p className="mt-1 text-xs text-gray-400">Purchases + Other</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Net Profit</p>
          <p className={`mt-1 text-2xl font-semibold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatMoney(netProfit)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Revenue − Expenses</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Profit Margin</p>
          <p className={`mt-1 text-2xl font-semibold ${Number(profitMargin) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {profitMargin}%
          </p>
          <p className="mt-1 text-xs text-gray-400">Of revenue</p>
        </article>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <Chart
            options={revenueVsExpensesChart.options}
            series={revenueVsExpensesChart.series}
            type="bar"
            height={320}
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <Chart
            options={profitChart.options}
            series={profitChart.series}
            type="area"
            height={320}
          />
        </div>
      </div>

      {/* Summary by month table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Monthly Summary</h2>
          <p className="text-xs text-gray-500">Revenue, expenses, and profit per month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2 text-right">Revenue</th>
                <th className="px-4 py-2 text-right">Expenses</th>
                <th className="px-4 py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MONTHS.map((month, i) => {
                const rev = monthlyRevenue[i] || 0;
                const exp = monthlyExpenses[i] || 0;
                const profit = rev - exp;
                return (
                  <tr key={month} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2 font-medium text-gray-900">{month}</td>
                    <td className="px-4 py-2 text-right text-green-600">{formatMoney(rev)}</td>
                    <td className="px-4 py-2 text-right text-red-600">{formatMoney(exp)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatMoney(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-green-50/50">
            <h2 className="font-semibold text-gray-900">Recent Sales</h2>
            <p className="text-xs text-gray-500">Latest revenue transactions</p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            {recentSales.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No sales yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSales.map((s) => (
                    <tr key={s._id ?? s.id}>
                      <td className="px-4 py-2 text-gray-700">{formatDate(s.saleDate)}</td>
                      <td className="px-4 py-2 text-right font-medium text-green-600">
                        {formatMoney(s.totalSaleAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-red-50/50">
            <h2 className="font-semibold text-gray-900">Recent Purchases</h2>
            <p className="text-xs text-gray-500">Latest purchase transactions</p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            {recentPurchases.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No purchases yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentPurchases.map((p) => (
                    <tr key={p._id ?? p.id}>
                      <td className="px-4 py-2 text-gray-700">{formatDate(p.purchaseDate)}</td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">
                        {formatMoney(p.totalPurchaseAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-amber-50/50">
            <h2 className="font-semibold text-gray-900">Recent Expenses</h2>
            <p className="text-xs text-gray-500">Other expenses (Expenses module)</p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            {recentExpenses.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No expenses yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentExpenses.map((e) => (
                    <tr key={e._id ?? e.id}>
                      <td className="px-4 py-2 text-gray-700">{formatDate(e.date)}</td>
                      <td className="px-4 py-2 text-gray-700">{e.category ?? "—"}</td>
                      <td className="px-4 py-2 text-right font-medium text-amber-600">
                        {formatMoney(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">Finance Report</h2>
        <p className="text-sm text-gray-500 mb-3">Print or download this report.</p>
        <PrintableDocument title="Finance-Report">
          <div>
            <h2 className="text-lg font-bold mb-4">Finance Report</h2>
            <p className="text-sm text-gray-600 mb-4">Generated {lastUpdated ? lastUpdated.toLocaleString() : ""}</p>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead><tr><th className="border border-gray-300 p-2 text-left">Metric</th><th className="border border-gray-300 p-2 text-right">Value</th></tr></thead>
              <tbody>
                <tr><td className="border border-gray-300 p-2">Total Revenue</td><td className="border border-gray-300 p-2 text-right">{formatMoney(totalRevenue)}</td></tr>
                <tr><td className="border border-gray-300 p-2">Purchases</td><td className="border border-gray-300 p-2 text-right">{formatMoney(totalPurchases)}</td></tr>
                <tr><td className="border border-gray-300 p-2">Other Expenses</td><td className="border border-gray-300 p-2 text-right">{formatMoney(totalOtherExpenses)}</td></tr>
                <tr><td className="border border-gray-300 p-2">Total Expenses</td><td className="border border-gray-300 p-2 text-right">{formatMoney(totalExpenses)}</td></tr>
                <tr><td className="border border-gray-300 p-2">Net Profit</td><td className="border border-gray-300 p-2 text-right">{formatMoney(netProfit)}</td></tr>
                <tr><td className="border border-gray-300 p-2">Profit Margin</td><td className="border border-gray-300 p-2 text-right">{profitMargin}%</td></tr>
              </tbody>
            </table>
            <h3 className="font-semibold mt-4 mb-2">Monthly Summary</h3>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead><tr><th className="border border-gray-300 p-2">Month</th><th className="border border-gray-300 p-2 text-right">Revenue</th><th className="border border-gray-300 p-2 text-right">Expenses</th><th className="border border-gray-300 p-2 text-right">Profit</th></tr></thead>
              <tbody>
                {MONTHS.map((month, i) => (
                  <tr key={month}>
                    <td className="border border-gray-300 p-2">{month}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatMoney(monthlyRevenue[i])}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatMoney(monthlyExpenses[i])}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatMoney((monthlyRevenue[i] || 0) - (monthlyExpenses[i] || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrintableDocument>
      </div>
    </div>
  );
}

export default FinanceDashboard;
