export const productKeys = {
  all: ["products"],
  adminLists: () => [...productKeys.all, "admin"],
  adminList: (type) => [...productKeys.adminLists(), type],
  storeLists: () => [...productKeys.all, "store"],
  storeList: (params) => [...productKeys.storeLists(), params],
};

export async function fetchAdminProducts(type) {
  const res = await fetch(`/api/admin/products?type=${type}&limit=200`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to load products");
  return data.products || [];
}

export async function fetchStoreProducts(searchParams) {
  const qs = new URLSearchParams(searchParams).toString();
  const res = await fetch(`/api/products?${qs}`);
  const data = await res.json();
  if (!data.success && data.products === undefined) {
    throw new Error(data.message || "Failed to load products");
  }
  return data.products || [];
}

export async function archiveAdminProduct(id) {
  const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Could not archive product");
  return data;
}
