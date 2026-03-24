import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../api";
import { normalizeStoredUserId } from "../sessionUserId";
import { closeModalSafely } from "../modalFocus";

export default function AddSale({ addSaleModalSetting, products, stores, handlePageUpdate, authContext }) {
  const uid = normalizeStoredUserId(authContext.user) ?? 1;
  const [sale, setSale] = useState({
    userID: String(uid),
    productID: "",
    storeID: "",
    stockSold: "",
    saleDate: "",
    unitPrice: "",
    totalSaleAmount: "",
  });
  const [open] = useState(true);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const p = products.find((x) => String(x._id ?? x.id) === String(sale.productID));
    if (p) {
      setSale((s) => ({
        ...s,
        unitPrice: p.unitPrice != null ? String(p.unitPrice) : "",
      }));
    } else {
      setSale((s) => ({ ...s, unitPrice: "" }));
    }
  }, [sale.productID, products]);

  useEffect(() => {
    const p = products.find((x) => String(x._id ?? x.id) === String(sale.productID));
    const unit = parseFloat(sale.unitPrice) || parseFloat(p?.unitPrice) || 0;
    const qty = parseInt(sale.stockSold, 10) || 0;
    const line = unit * qty;
    setSale((s) => ({ ...s, totalSaleAmount: qty > 0 ? line.toFixed(2) : "" }));
  }, [sale.stockSold, sale.unitPrice, sale.productID, products]);

  const handleInputChange = (key, value) => {
    setSale({ ...sale, [key]: value });
  };

  const addSale = () => {
    const userID = normalizeStoredUserId(authContext.user) ?? 1;
    const body = {
      userID,
      productID: parseInt(sale.productID, 10),
      storeID: parseInt(sale.storeID, 10),
      stockSold: parseInt(sale.stockSold, 10),
      saleDate: sale.saleDate,
      unitPrice: parseFloat(sale.unitPrice) || 0,
      totalSaleAmount: parseFloat(sale.totalSaleAmount) || 0,
    };
    if (!body.productID || !body.storeID || !body.saleDate || !body.stockSold) {
      alert("Please select product, store, date, and quantity.");
      return;
    }
    fetch(`${API_BASE}/sales/add`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data?.error || `Could not add sale (${res.status})`);
          return;
        }
        alert("Sale ADDED");
        handlePageUpdate();
        closeModalSafely(addSaleModalSetting);
      })
      .catch(() => alert("Failed to add sale."));
  };

  const p = products.find((x) => String(x._id ?? x.id) === String(sale.productID));
  const qty = parseInt(sale.stockSold, 10) || 0;
  const unit = parseFloat(sale.unitPrice) || parseFloat(p?.unitPrice) || 0;
  const linePreview = qty * unit;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => closeModalSafely(addSaleModalSetting)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-out duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative max-h-[90vh] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:overflow-y-scroll">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg py-2 font-semibold leading-6 text-gray-900">
                        Add Sale
                      </Dialog.Title>
                      <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label htmlFor="productID" className="block mb-2 text-sm font-medium text-gray-900">
                            Product
                          </label>
                          <select
                            id="productID"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
                            name="productID"
                            value={sale.productID}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          >
                            <option value="">Select product</option>
                            {products.map((element, index) => {
                              const id = element._id ?? element.id;
                              return (
                                <option key={id ?? index} value={id}>
                                  {element.name} (stock {element.stock ?? 0})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="stockSold" className="block mb-2 text-sm font-medium text-gray-900">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            name="stockSold"
                            id="stockSold"
                            value={sale.stockSold}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                            placeholder="Qty"
                          />
                        </div>
                        <div>
                          <label htmlFor="unitPrice" className="block mb-2 text-sm font-medium text-gray-900">
                            Unit price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="unitPrice"
                            id="unitPrice"
                            value={sale.unitPrice}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2 rounded-lg bg-gray-50 p-3 text-sm">
                          <span className="text-gray-600">Line total (qty × unit): </span>
                          <span className="font-semibold text-gray-900">
                            ${linePreview.toFixed(2)}
                          </span>
                          {p && qty > (p.stock ?? 0) ? (
                            <p className="mt-1 text-xs text-red-600">Quantity exceeds available stock ({p.stock ?? 0}).</p>
                          ) : null}
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="storeID" className="block mb-2 text-sm font-medium text-gray-900">
                            Store
                          </label>
                          <select
                            id="storeID"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
                            name="storeID"
                            value={sale.storeID}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          >
                            <option value="">Select store</option>
                            {stores.map((element, index) => {
                              const id = element._id ?? element.id;
                              return (
                                <option key={id ?? index} value={id}>
                                  {element.name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="saleDate">
                            Sale date
                          </label>
                          <input
                            className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                            type="date"
                            id="saleDate"
                            name="saleDate"
                            value={sale.saleDate}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => closeModalSafely(addSale)}
                  >
                    Add Sale
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => closeModalSafely(addSaleModalSetting)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
