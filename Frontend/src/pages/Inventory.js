import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";
import { API_BASE } from "../api";
import { emitLiveRefresh, useLiveRefresh } from "../hooks/useLiveRefresh";

function Inventory() {
  const liveTick = useLiveRefresh();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [topSellingUnits, setTopSellingUnits] = useState(0);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext.user) return;
    fetchProductsData();
    fetchStoresData();
    fetchInventorySummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on poll / navigation / modal update
  }, [authContext.user, updatePage, liveTick]);

  // Fetching Data of All Products
  const fetchProductsData = () => {
    if (!authContext.user) return;
    fetch(`${API_BASE}/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]));
  };

  // Fetching Data of Search Products
  const fetchSearchData = (term) => {
    const q = term !== undefined && term !== null ? String(term) : (searchTerm ?? "");
    fetch(`${API_BASE}/product/search?searchTerm=${encodeURIComponent(q)}`)
      .then((response) => response.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]));
  };

  // Fetching all stores data
  const fetchStoresData = () => {
    if (!authContext.user) return;
    fetch(`${API_BASE}/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => setAllStores(Array.isArray(data) ? data : []))
      .catch(() => setAllStores([]));
  };

  const fetchInventorySummary = () => {
    if (!authContext.user) return;

    Promise.all([
      fetch(`${API_BASE}/sales/get/${authContext.user}/totalsaleamount`).then((r) => r.json()),
      fetch(`${API_BASE}/purchase/get/${authContext.user}/totalpurchaseamount`).then((r) => r.json()),
      fetch(`${API_BASE}/sales/get/${authContext.user}`).then((r) => r.json()),
    ])
      .then(([revenueRes, costRes, salesList]) => {
        setTotalRevenue(Number(revenueRes?.totalSaleAmount ?? 0));
        setTotalCost(Number(costRes?.totalPurchaseAmount ?? 0));

        const rows = Array.isArray(salesList) ? salesList : [];
        // "Top selling" = product with highest total units sold.
        const unitsByProduct = rows.reduce((acc, s) => {
          const productKey = s?.productID ?? s?.ProductID?.id ?? s?.ProductID?._id;
          const units = Number(s?.stockSold ?? 0);
          if (!productKey) return acc;
          acc[productKey] = (acc[productKey] || 0) + units;
          return acc;
        }, {});

        const topUnits = Math.max(0, ...Object.values(unitsByProduct));
        setTopSellingUnits(topUnits);
      })
      .catch(() => {
        setTotalRevenue(0);
        setTotalCost(0);
        setTopSellingUnits(0);
      });
  };

  // Modal for Product ADD
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  // Modal for Product UPDATE
  const updateProductModalSetting = (selectedProductData) => {
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };

  const viewProductModal = (p) => {
    setViewProduct(p);
    setShowViewModal(true);
  };
  const closeViewModal = () => { setViewProduct(null); setShowViewModal(false); };


  // Delete item
  const deleteItem = (id) => {
    if (!id) return;
    fetch(`${API_BASE}/product/delete/${id}`)
      .then((response) => response.json())
      .then(() => handlePageUpdate())
      .catch(() => {});
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    emitLiveRefresh();
    setUpdatePage((p) => !p);
  };

  // Handle Search Term
  const handleSearchTerm = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      fetchProductsData();
    } else {
      fetchSearchData(value);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">Overall Inventory</span>
          <div className=" flex flex-col md:flex-row justify-center items-center  ">
            <div className="flex flex-col p-10  w-full  md:w-3/12  ">
              <span className="font-semibold text-blue-600 text-base">
                Total Products
              </span>
              <span className="font-semibold text-gray-600 text-base">
                {products.length}
              </span>
              <span className="font-thin text-gray-400 text-xs">
                Total inventory (live)
              </span>
            </div>
            <div className="flex flex-col gap-3 p-10   w-full  md:w-3/12 sm:border-y-2  md:border-x-2 md:border-y-0">
              <span className="font-semibold text-yellow-600 text-base">
                Stores
              </span>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">
                    {stores.length}
                  </span>
                  <span className="font-thin text-gray-400 text-xs">
                    Active store locations (live)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">
                    ${Number(totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="font-thin text-gray-400 text-xs">
                    Total Revenue (all time)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-10  w-full  md:w-3/12  sm:border-y-2 md:border-x-2 md:border-y-0">
              <span className="font-semibold text-purple-600 text-base">
                Top Selling
              </span>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">
                  {topSellingUnits}
                  </span>
                  <span className="font-thin text-gray-400 text-xs">
                  Units sold (top product)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">
                  ${Number(totalCost || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="font-thin text-gray-400 text-xs">Cost</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-10  w-full  md:w-3/12  border-y-2  md:border-x-2 md:border-y-0">
              <span className="font-semibold text-red-600 text-base">Low Stock</span>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">{products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10).length}</span>
                  <span className="font-thin text-gray-400 text-xs">Low (&lt;10)</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600 text-base">{products.filter((p) => (p.stock ?? 0) <= 0).length}</span>
                  <span className="font-thin text-gray-400 text-xs">Out of Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showProductModal && (
          <AddProduct
            addProductModalSetting={addProductModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateProduct
            updateProductData={updateProduct}
            updateModalSetting={updateProductModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {showViewModal && viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeViewModal}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{viewProduct.name}</dd></div>
                <div><dt className="text-gray-500">Manufacturer</dt><dd className="text-gray-900">{viewProduct.manufacturer ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Stock</dt><dd className="text-gray-900">{viewProduct.stock ?? 0}</dd></div>
                <div><dt className="text-gray-500">Description</dt><dd className="text-gray-900">{viewProduct.description ?? "—"}</dd></div>
                <div><dt className="text-gray-500">Availability</dt><dd className="text-gray-900">{(viewProduct.stock ?? 0) > 0 ? "In Stock" : "Not in Stock"}</dd></div>
              </dl>
              <div className="mt-4 flex justify-end">
                <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium" onClick={closeViewModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Items</span>
              <div className="flex justify-center items-center px-2 border-2 rounded-md ">
                <img
                  alt="search-icon"
                  className="w-5 h-5"
                  src={require("../assets/search-icon.png")}
                />
                <input
                  className="border-none outline-none focus:border-none text-xs"
                  type="text"
                  placeholder="Search here"
                  value={searchTerm ?? ""}
                  onChange={handleSearchTerm}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm" onClick={addProductModalSetting}>Add Item</button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Products
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Manufacturer
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Stock
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Description
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Availibility
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  More
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {products.map((element, index) => {
                return (
                  <tr key={element._id ?? element.id ?? index}>
                    <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                      {element.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.manufacturer}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.stock}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.stock > 0 ? "In Stock" : "Not in Stock"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      <span
                        className="text-blue-600 cursor-pointer hover:underline mr-2"
                        onClick={() => viewProductModal(element)}
                      >
                        View
                      </span>
                      <span
                        className="text-green-700 cursor-pointer hover:underline mr-2"
                        onClick={() => updateProductModalSetting(element)}
                      >
                        Edit
                      </span>
                      <span
                        className="text-red-600 cursor-pointer hover:underline"
                        onClick={() => deleteItem(element._id ?? element.id)}
                      >
                        Delete
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
