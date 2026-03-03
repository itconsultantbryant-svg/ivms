import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import { API_BASE } from "../api";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
];
const CHART_BORDERS = ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"];

function Dashboard() {
  const [saleAmount, setSaleAmount] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    },
    series: [
      {
        name: "series",
        data: [10, 20, 40, 50, 60, 20, 10, 35, 45, 70, 25, 70],
      },
    ],
  });

  // Update Chart Data
  const updateChartData = (salesData) => {
    setChart({
      ...chart,
      series: [
        {
          name: "Monthly Sales Amount",
          data: [...salesData],
        },
      ],
    });
  };

  const authContext = useContext(AuthContext);
  const permissions = authContext?.permissions;

  const can = (module) => permissions == null || (Array.isArray(permissions) && permissions.includes(module));

  const quickLinks = [
    { to: "/finance", label: "Finance", module: "finance" },
    { to: "/sales", label: "Sales", module: "sales" },
    { to: "/purchase-details", label: "Purchase", module: "purchase" },
    { to: "/invoices", label: "Invoices", module: "invoices" },
    { to: "/receipts", label: "Receipts", module: "receipts" },
  ].filter((link) => can(link.module));

  useEffect(() => {
    if (!authContext.user) return;
    const fetchAll = () => {
      fetchTotalSaleAmount();
      fetchTotalPurchaseAmount();
      fetchStoresData();
      fetchProductsData();
      fetchMonthlySalesData();
    };
    fetchAll();
    const onFocus = () => fetchAll();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [authContext.user]);

  // Fetching total sales amount
  const fetchTotalSaleAmount = () => {
    fetch(
      `${API_BASE}/sales/get/${authContext.user}/totalsaleamount`
    )
      .then((response) => response.json())
      .then((datas) => setSaleAmount(datas.totalSaleAmount));
  };

  // Fetching total purchase amount
  const fetchTotalPurchaseAmount = () => {
    fetch(
      `${API_BASE}/purchase/get/${authContext.user}/totalpurchaseamount`
    )
      .then((response) => response.json())
      .then((datas) => setPurchaseAmount(datas.totalPurchaseAmount));
  };

  // Fetching all stores data
  const fetchStoresData = () => {
    fetch(`${API_BASE}/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((datas) => setStores(Array.isArray(datas) ? datas : []));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`${API_BASE}/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((datas) => setProducts(Array.isArray(datas) ? datas : []))
      .catch(() => setProducts([]));
  };

  const fetchMonthlySalesData = () => {
    fetch(`${API_BASE}/sales/get/${authContext.user}/monthly`)
      .then((r) => r.json())
      .then((datas) => updateChartData(datas.salesAmount || []))
      .catch(() => updateChartData([]));
  };

  // Doughnut: top 6 products by stock (real data)
  const doughnutLabels = products
    .slice()
    .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
    .slice(0, 6)
    .map((p) => p.name || "Unnamed");
  const doughnutValues = products
    .slice()
    .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
    .slice(0, 6)
    .map((p) => p.stock ?? 0);
  const doughnutData = {
    labels: doughnutLabels.length ? doughnutLabels : ["No products"],
    datasets: [
      {
        label: "Stock",
        data: doughnutValues.length ? doughnutValues : [1],
        backgroundColor: doughnutLabels.length ? CHART_COLORS.slice(0, doughnutLabels.length) : ["rgba(200,200,200,0.5)"],
        borderColor: doughnutLabels.length ? CHART_BORDERS.slice(0, doughnutLabels.length) : ["#ccc"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-4  p-4 ">
        <article className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
          <div className="inline-flex gap-2 self-end rounded bg-green-100 p-1 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-xs font-medium">Revenue</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Revenue</strong>
            <p className="text-2xl font-medium text-gray-900">${Number(saleAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <span className="text-xs text-gray-500">From sales</span>
          </div>
        </article>
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600">
            <span className="text-xs font-medium">Expenses</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Purchases</strong>
            <p className="text-2xl font-medium text-gray-900">${Number(purchaseAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <span className="text-xs text-gray-500">From purchases</span>
          </div>
        </article>
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Products</strong>
            <p className="text-2xl font-medium text-gray-900">{products.length}</p>
            <span className="text-xs text-gray-500">Items in inventory</span>
          </div>
        </article>
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Stores</strong>
            <p className="text-2xl font-medium text-gray-900">{stores.length}</p>
            <span className="text-xs text-gray-500">Locations</span>
          </div>
        </article>
        {/* Net Profit & Low Stock */}
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="inline-flex gap-2 self-end rounded bg-sky-100 p-1 text-sky-600">
            <span className="text-xs font-medium">Profit</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Net Profit</strong>
            <p className={`text-2xl font-medium ${Number(saleAmount || 0) - Number(purchaseAmount || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${(Number(saleAmount || 0) - Number(purchaseAmount || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-gray-500">Revenue − Purchases</span>
          </div>
        </article>
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <strong className="block text-sm font-medium text-gray-500">Low Stock Items</strong>
            <p className="text-2xl font-medium text-amber-600">
              {Array.isArray(products) ? products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10).length : 0}
            </p>
            <span className="text-xs text-gray-500">Items below alert level</span>
          </div>
        </article>
        <div className="flex justify-around bg-white rounded-lg py-8 col-span-full justify-center">
          <div>
            <Chart
              options={chart.options}
              series={chart.series}
              type="bar"
              width="500"
            />
          </div>
          <div>
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: "bottom" }, title: { display: true, text: "Stock by product (top 6)" } } } } />
          </div>
        </div>
        {/* Quick links */}
        <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-sky-300 hover:shadow-md transition-all">
              <span className="text-2xl">{link.to === "/finance" ? "📊" : link.to === "/sales" ? "🛒" : link.to === "/purchase-details" ? "📦" : link.to === "/invoices" ? "📄" : "🧾"}</span>
              <span className="font-medium text-gray-900">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
