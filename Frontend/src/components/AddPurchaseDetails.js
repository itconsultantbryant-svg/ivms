import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import PrintableDocument from "./PrintableDocument";
import ReceiptTemplate from "./ReceiptTemplate";
import { API_BASE } from "../api";
import { normalizeStoredUserId } from "../sessionUserId";
import { closeModalSafely } from "../modalFocus";

export default function AddPurchaseDetails({ addSaleModalSetting, products, handlePageUpdate, authContext }) {
  const [purchase, setPurchase] = useState({
    userID: authContext.user,
    productID: "",
    quantityPurchased: "",
    purchaseDate: "",
    unitPrice: "",
    totalPurchaseAmount: "",
  });
  const [open] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const p = products.find((x) => String(x._id ?? x.id) === String(purchase.productID));
    if (p) {
      setPurchase((s) => ({
        ...s,
        unitPrice: p.unitPrice != null ? String(p.unitPrice) : "",
      }));
    } else {
      setPurchase((s) => ({ ...s, unitPrice: "" }));
    }
  }, [purchase.productID, products]);

  const handleInputChange = (key, value) => {
    setPurchase({ ...purchase, [key]: value });
  };

  const addSale = () => {
    if (!purchase.productID || !purchase.quantityPurchased || !purchase.purchaseDate) {
      alert("Please fill in Product, Quantity, and Date.");
      return;
    }
    const userID = normalizeStoredUserId(authContext.user) ?? 1;
    const productID = Number(purchase.productID) || parseInt(purchase.productID, 10);
    if (!userID || !productID || isNaN(productID)) {
      alert("Invalid user or product. Please sign in again and select a product.");
      return;
    }
    const qty = parseInt(purchase.quantityPurchased, 10) || 0;
    const unit = parseFloat(purchase.unitPrice) || 0;
    const override = parseFloat(purchase.totalPurchaseAmount);
    const total = Number.isFinite(override) && override > 0 ? override : unit * qty;
    const body = {
      userID,
      productID,
      quantityPurchased: qty,
      purchaseDate: purchase.purchaseDate,
      unitPrice: unit,
      totalPurchaseAmount: total,
    };
    fetch(`${API_BASE}/purchase/add`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((result) => result.json().then((data) => ({ ok: result.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          const productName =
            (products.find((p) => p._id === data.productID || p.id === data.productID) || {}).name || "";
          setLastPurchase({ ...data, ProductID: { name: productName } });
          setShowReceipt(true);
        } else {
          alert(data?.error || "Failed to add purchase.");
        }
      })
      .catch(() => alert("Failed to add purchase."));
  };

  const closeReceiptAndModal = () => {
    setShowReceipt(false);
    setLastPurchase(null);
    handlePageUpdate();
    closeModalSafely(addSaleModalSetting);
  };

  const qty = parseInt(purchase.quantityPurchased, 10) || 0;
  const unit = parseFloat(purchase.unitPrice) || 0;
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
                {showReceipt && lastPurchase ? (
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                    <p className="mb-2 text-sm font-medium text-green-600">Purchase added. Print or download your receipt.</p>
                    <PrintableDocument title={"Receipt-" + (lastPurchase.id || lastPurchase._id)} onClose={closeReceiptAndModal}>
                      <ReceiptTemplate purchase={lastPurchase} />
                    </PrintableDocument>
                    <button
                      type="button"
                      onClick={closeReceiptAndModal}
                      className="mt-4 w-full rounded-md bg-gray-800 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                          <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <Dialog.Title as="h3" className="text-lg py-4 font-semibold leading-6 text-gray-900">
                            Purchase Details
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
                                value={purchase.productID}
                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                              >
                                <option value="">Select product</option>
                                {products.map((element, index) => {
                                  const id = element._id ?? element.id;
                                  return (
                                    <option key={id ?? index} value={id}>
                                      {element.name}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                            <div>
                              <label htmlFor="quantityPurchased" className="block mb-2 text-sm font-medium text-gray-900">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                name="quantityPurchased"
                                id="quantityPurchased"
                                value={purchase.quantityPurchased}
                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                placeholder="Qty"
                              />
                            </div>
                            <div>
                              <label htmlFor="unitPrice" className="block mb-2 text-sm font-medium text-gray-900">
                                Unit cost
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="unitPrice"
                                id="unitPrice"
                                value={purchase.unitPrice}
                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                              />
                            </div>
                            <div className="sm:col-span-2 rounded-lg bg-gray-50 p-3 text-sm">
                              <span className="text-gray-600">Line total (qty × unit cost): </span>
                              <span className="font-semibold">${linePreview.toFixed(2)}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <label htmlFor="totalPurchaseAmount" className="block mb-2 text-sm font-medium text-gray-900">
                                Total amount (optional override)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                name="totalPurchaseAmount"
                                id="totalPurchaseAmount"
                                value={purchase.totalPurchaseAmount}
                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                placeholder="Leave blank to use qty × unit"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="purchaseDate">
                                Purchase date
                              </label>
                              <input
                                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                type="date"
                                id="purchaseDate"
                                name="purchaseDate"
                                value={purchase.purchaseDate}
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
                        Add
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
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
