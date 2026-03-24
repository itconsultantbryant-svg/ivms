import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";
import { API_BASE } from "../api";
import { normalizeStoredUserId } from "../sessionUserId";
import { closeModalSafely } from "../modalFocus";
import BarcodeScanInput from "./BarcodeScanInput";
import { CameraBarcodeButton } from "./CameraBarcodeButton";

export default function AddProduct({ addProductModalSetting, handlePageUpdate }) {
  const authContext = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    userId: authContext.user,
    name: "",
    manufacturer: "",
    description: "",
    categoryID: "",
    barcode: "",
    unitPrice: "",
    stock: "0",
  });
  const [open] = useState(true);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const uid = normalizeStoredUserId(authContext.user) ?? 1;
    fetch(`${API_BASE}/categories/get/${uid}`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [authContext.user]);

  const handleInputChange = (key, value) => {
    setProduct({ ...product, [key]: value });
  };

  const addProduct = () => {
    const userId = normalizeStoredUserId(authContext.user) ?? 1;
    const payload = {
      ...product,
      userId,
      categoryID: product.categoryID === "" ? null : product.categoryID,
      unitPrice: product.unitPrice === "" ? 0 : parseFloat(product.unitPrice) || 0,
      stock: parseInt(product.stock, 10) || 0,
    };
    fetch(`${API_BASE}/product/add`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data?.error || `Could not add product (${res.status})`);
          return;
        }
        alert("Product ADDED");
        handlePageUpdate();
        closeModalSafely(addProductModalSetting);
      })
      .catch(() => alert("Network error while adding product."));
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => closeModalSafely(addProductModalSetting)}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Add Product
                      </Dialog.Title>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Manufacturer</label>
                          <input
                            type="text"
                            name="manufacturer"
                            value={product.manufacturer}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                          <select
                            name="categoryID"
                            value={product.categoryID}
                            onChange={(e) => handleInputChange("categoryID", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="">— None —</option>
                            {categories.map((c) => {
                              const id = c._id ?? c.id;
                              return (
                                <option key={id} value={id}>
                                  {c.name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Unit price (checkout)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="unitPrice"
                            value={product.unitPrice}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-1 text-sm font-medium text-gray-700">Barcode / QR payload</label>
                          <div className="flex flex-wrap items-center gap-2">
                            <BarcodeScanInput
                              value={product.barcode}
                              onChange={(v) => handleInputChange("barcode", v)}
                              onCommit={(code) => handleInputChange("barcode", code)}
                            />
                            <CameraBarcodeButton onCode={(code) => handleInputChange("barcode", code)} />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Used at checkout to load price and add to cart.</p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Initial stock on hand</label>
                          <input
                            type="number"
                            min="0"
                            name="stock"
                            value={product.stock}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            rows={3}
                            value={product.description}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                            placeholder="Optional"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                    onClick={() => closeModalSafely(addProduct)}
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => closeModalSafely(addProductModalSetting)}
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
