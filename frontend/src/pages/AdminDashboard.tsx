
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

type ProductImage = {
  id?: number;
  imageUrl?: string;
  url?: string;
  imagePath?: string;
  primary?: boolean;
  isPrimary?: boolean;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  categoryId?: number;
  categoryName?: string;
  images?: ProductImage[];
};

type Category = {
  id: number;
  name: string;
  description?: string;
};

type Order = {
  id: number;
  userId?: number;
  customerEmail?: string;
  totalAmount: number;
  shippingAddress?: string;
  status: string;
  createdAt?: string;
};

type ReturnRequest = {
  id: number;
  orderId: number;
  userId: number;
  customerEmail?: string;
  orderTotal?: number;
  reason: string;
  description?: string;
  status: string;
  refundStatus: string;
  adminNote?: string;
  createdAt?: string;
};

type EditForm = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
};

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const RETURN_STATUSES = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "RECEIVED",
  "REFUND_PENDING",
  "REFUNDED",
  "REFUND_FAILED",
];

const currency = (amount: number | undefined | null) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const response = data as Record<string, unknown>;

    if (Array.isArray(response.content)) return response.content as T[];
    if (Array.isArray(response.data)) return response.data as T[];
    if (Array.isArray(response.items)) return response.items as T[];
  }

  return [];
};

const getProductImage = (product: Product) => {
  const images = product.images ?? [];
  const selectedImage =
    images.find((image) => image.primary || image.isPrimary) ?? images[0];

  return (
    selectedImage?.imageUrl ||
    selectedImage?.url ||
    selectedImage?.imagePath ||
    ""
  );
};

const getStatusStyle = (status?: string) => {
  const normalized = (status ?? "").toUpperCase();

  if (["DELIVERED", "APPROVED", "REFUNDED", "COMPLETED"].includes(normalized)) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (["CANCELLED", "REJECTED", "REFUND_FAILED", "FAILED"].includes(normalized)) {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }

  if (["PENDING", "REFUND_PENDING", "MANUAL_REQUIRED"].includes(normalized)) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-sky-400/20 bg-sky-400/10 text-sky-300";
};

const formatStatus = (status?: string) =>
  (status || "UNKNOWN").replaceAll("_", " ");

const emptyEditForm: EditForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);

  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [returnSearch, setReturnSearch] = useState("");
  const [returnStatusFilter, setReturnStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});
  const [processingReturnId, setProcessingReturnId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [returnError, setReturnError] = useState("");
  const [returnNotice, setReturnNotice] = useState("");

  const loadDashboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setReturnError("");

    try {
      const [
        productsResult,
        ordersResult,
        categoriesResult,
        returnsResult,
      ] = await Promise.allSettled([
        api.get("/products"),
        api.get("/orders"),
        api.get("/categories"),
        api.get("/returns/admin"),
      ]);

      if (productsResult.status === "fulfilled") {
        setProducts(normalizeList<Product>(productsResult.value.data));
      } else {
        setError("Products load nahi ho paaye. Backend aur login session check karo.");
      }

      if (ordersResult.status === "fulfilled") {
        const loadedOrders = normalizeList<Order>(ordersResult.value.data);
        setOrders(loadedOrders);

        setOrderStatusDrafts((previous) => {
          const next = { ...previous };

          loadedOrders.forEach((order) => {
            if (!(order.id in next)) next[order.id] = order.status;
          });

          return next;
        });
      } else {
        setOrders([]);
      }

      if (categoriesResult.status === "fulfilled") {
        setCategories(normalizeList<Category>(categoriesResult.value.data));
      } else {
        setCategories([]);
      }

      if (returnsResult.status === "fulfilled") {
        setReturns(normalizeList<ReturnRequest>(returnsResult.value.data));
      } else {
        setReturns([]);
        setReturnError(
          "Return requests load nahi hui. Admin login, backend endpoint aur permissions check karo.",
        );
      }
    } catch {
      setError("Dashboard load karte waqt error aaya.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(query) ||
      product.categoryName?.toLowerCase().includes(query) ||
      String(product.id).includes(query)
    );
  }, [products, search]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        const matchesSearch =
          !query ||
          String(order.id).includes(query) ||
          (order.customerEmail ?? "").toLowerCase().includes(query) ||
          (order.shippingAddress ?? "").toLowerCase().includes(query);

        const matchesStatus =
          orderStatusFilter === "ALL" ||
          order.status.toUpperCase() === orderStatusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return second - first;
      });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredReturns = useMemo(() => {
    const query = returnSearch.trim().toLowerCase();

    return [...returns]
      .filter((item) => {
        const matchesSearch =
          !query ||
          String(item.id).includes(query) ||
          String(item.orderId).includes(query) ||
          String(item.userId).includes(query) ||
          (item.customerEmail ?? "").toLowerCase().includes(query) ||
          (item.reason ?? "").toLowerCase().includes(query);

        const matchesStatus =
          returnStatusFilter === "ALL" ||
          item.status.toUpperCase() === returnStatusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return second - first;
      });
  }, [returns, returnSearch, returnStatusFilter]);

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stockQuantity) > 0 &&
      Number(product.stockQuantity) <= 5,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stockQuantity) <= 0,
  ).length;

  const inventoryValue = products.reduce(
    (total, product) =>
      total +
      Number(product.price ?? 0) * Number(product.stockQuantity ?? 0),
    0,
  );

  const totalOrderValue = orders.reduce(
    (total, order) => total + Number(order.totalAmount ?? 0),
    0,
  );

  const pendingReturns = returns.filter((item) => item.status === "PENDING").length;
  const approvedReturns = returns.filter((item) => item.status === "APPROVED").length;
  const manualRefunds = returns.filter(
    (item) => item.refundStatus === "MANUAL_REQUIRED",
  ).length;

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stockQuantity: String(product.stockQuantity ?? ""),
      categoryId: product.categoryId ? String(product.categoryId) : "",
    });
    setError("");
    setNotice("");
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingProduct(null);
    setEditForm(emptyEditForm);
  };

  const updateEditField = (field: keyof EditForm, value: string) => {
    setEditForm((previous) => ({ ...previous, [field]: value }));
  };

  const saveProductChanges = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!editingProduct) return;

    const productName = editForm.name.trim();
    const price = Number(editForm.price);
    const stockQuantity = Number(editForm.stockQuantity);
    const categoryId = Number(editForm.categoryId);

    if (!productName) {
      setError("Product name required hai.");
      return;
    }

    if (!editForm.price.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Price zero se zyada hona chahiye.");
      return;
    }

    if (
      !editForm.stockQuantity.trim() ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError("Stock quantity 0 ya usse zyada whole number honi chahiye.");
      return;
    }

    if (!editForm.categoryId || !Number.isInteger(categoryId) || categoryId <= 0) {
      setError("Please category select karo.");
      return;
    }

    setSavingEdit(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        name: productName,
        description: editForm.description.trim(),
        price,
        stockQuantity,
        categoryId,
      };

      const response = await api.put<Product>(
        `/products/${editingProduct.id}`,
        payload,
      );

      const updatedProduct = response.data;

      setProducts((previous) =>
        previous.map((product) => {
          if (product.id !== editingProduct.id) return product;

          return {
            ...product,
            ...updatedProduct,
            name: updatedProduct.name ?? payload.name,
            description: updatedProduct.description ?? payload.description,
            price: updatedProduct.price ?? payload.price,
            stockQuantity: updatedProduct.stockQuantity ?? payload.stockQuantity,
            categoryId: updatedProduct.categoryId ?? payload.categoryId,
            categoryName:
              updatedProduct.categoryName ??
              categories.find((category) => category.id === categoryId)?.name ??
              product.categoryName,
          };
        }),
      );

      setEditingProduct(null);
      setEditForm(emptyEditForm);
      setNotice("Product successfully update ho gaya.");
      await loadDashboard(true);
    } catch (requestError: unknown) {
      const message =
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
          ? (
              requestError as {
                response?: { data?: { message?: string; detail?: string } };
              }
            ).response?.data?.message ??
            (
              requestError as {
                response?: { data?: { detail?: string } };
              }
            ).response?.data?.detail
          : undefined;

      setError(
        message ||
          "Product update nahi hua. Admin login aur backend permissions check karo.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Kya tum "${product.name}" ko delete karna chahte ho?`,
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");
    setNotice("");

    try {
      await api.delete(`/products/${product.id}`);
      setProducts((previous) => previous.filter((item) => item.id !== product.id));
      setNotice(`"${product.name}" delete ho gaya.`);
    } catch {
      setError(
        "Product delete nahi hua. Admin permissions aur backend response check karo.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const updateOrderStatus = async (order: Order) => {
    const selectedStatus = orderStatusDrafts[order.id];

    if (!selectedStatus) {
      setError("Order status select karo.");
      return;
    }

    if (selectedStatus === order.status) {
      setNotice(`Order #${order.id} ka status pehle se ${order.status} hai.`);
      setError("");
      return;
    }

    const confirmed = window.confirm(
      `Order #${order.id} ka status ${order.status} se ${selectedStatus} karna hai?`,
    );
    if (!confirmed) return;

    setUpdatingOrderId(order.id);
    setError("");
    setNotice("");

    try {
      const response = await api.patch<Order>(
        `/orders/${order.id}/status`,
        { status: selectedStatus },
      );

      const updatedOrder = response.data;

      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? { ...item, ...updatedOrder, status: updatedOrder.status ?? selectedStatus }
            : item,
        ),
      );

      setOrderStatusDrafts((previous) => ({
        ...previous,
        [order.id]: updatedOrder.status ?? selectedStatus,
      }));

      setNotice(
        `Order #${order.id} status successfully ${updatedOrder.status ?? selectedStatus} ho gaya.`,
      );
    } catch (requestError: unknown) {
      const responseMessage =
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
          ? (
              requestError as {
                response?: { data?: { message?: string; detail?: string } };
              }
            ).response?.data?.message ??
            (
              requestError as {
                response?: { data?: { detail?: string } };
              }
            ).response?.data?.detail
          : undefined;

      setError(
        responseMessage ||
          `Order #${order.id} ka status update nahi hua. Admin permission aur backend response check karo.`,
      );

      setOrderStatusDrafts((previous) => ({
        ...previous,
        [order.id]: order.status,
      }));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const decideReturn = async (
    item: ReturnRequest,
    decision: "APPROVE" | "REJECT",
  ) => {
    if (item.status !== "PENDING") {
      setReturnError("Sirf pending return requests par decision liya ja sakta hai.");
      return;
    }

    const confirmed = window.confirm(
      decision === "APPROVE"
        ? `Return #${item.id} approve karna hai? Approval ke baad refund manually process karna hoga.`
        : `Return #${item.id} reject karna hai?`,
    );

    if (!confirmed) return;

    setProcessingReturnId(item.id);
    setReturnError("");
    setReturnNotice("");

    try {
      const response = await api.patch<ReturnRequest>(
        `/returns/admin/${item.id}/decision`,
        {
          decision,
          adminNote: (adminNotes[item.id] ?? "").trim() || null,
        },
      );

      const updatedReturn = response.data;

      setReturns((previous) =>
        previous.map((existing) =>
          existing.id === item.id
            ? { ...existing, ...updatedReturn }
            : existing,
        ),
      );

      setReturnNotice(
        decision === "APPROVE"
          ? `Return #${item.id} approve ho gaya. Refund status: ${updatedReturn.refundStatus || "MANUAL_REQUIRED"}. Actual refund manually process karna hoga.`
          : `Return #${item.id} reject ho gaya.`,
      );

      setAdminNotes((previous) => ({ ...previous, [item.id]: "" }));
    } catch (requestError: unknown) {
      const responseMessage =
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
          ? (
              requestError as {
                response?: { data?: { message?: string; detail?: string; error?: string } };
              }
            ).response?.data?.message ??
            (
              requestError as {
                response?: { data?: { detail?: string; error?: string } };
              }
            ).response?.data?.detail ??
            (
              requestError as {
                response?: { data?: { error?: string } };
              }
            ).response?.data?.error
          : undefined;

      setReturnError(
        responseMessage ||
          "Return decision save nahi hua. Admin login, API endpoint aur backend logs check karo.",
      );
    } finally {
      setProcessingReturnId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080b14]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-xl font-black text-violet-300">
                P
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight sm:text-xl">
                  Prime <span className="text-violet-400">Basket</span>
                </h1>
                <p className="text-xs text-slate-500">Admin Control Center</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  {user?.firstName || "Administrator"} {user?.lastName || ""}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "Admin account"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadDashboard(true)}
                disabled={refreshing}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/10 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Overview / Administration
              </p>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Dashboard<span className="text-violet-400">.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Products, inventory, orders aur customer returns ko ek hi jagah se manage karo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/products/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400"
              >
                <span className="text-lg">＋</span> Add Product
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08]"
              >
                View Store ↗
              </Link>
            </div>
          </section>

          {error && !editingProduct && (
            <div role="alert" className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {notice && !editingProduct && (
            <div role="status" className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm text-emerald-300">
              {notice}
            </div>
          )}

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Products" value={loading ? "..." : totalProducts.toLocaleString("en-IN")} detail="Products in your store" icon="▦" accent="violet" />
            <StatCard label="Inventory Value" value={loading ? "..." : currency(inventoryValue)} detail="Current stock × product price" icon="₹" accent="cyan" />
            <StatCard label="Total Orders" value={loading ? "..." : orders.length.toLocaleString("en-IN")} detail="Orders returned by the API" icon="↗" accent="blue" />
            <StatCard label="Low / Out of Stock" value={loading ? "..." : `${lowStockProducts} / ${outOfStockProducts}`} detail="Low stock / out of stock" icon="!" accent="amber" />
          </section>

          <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-[#101522]/90 p-5 sm:p-6 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Order value</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight">{loading ? "..." : currency(totalOrderValue)}</h3>
                  <p className="mt-2 text-xs text-slate-500">Sum of totalAmount values returned by the orders API.</p>
                </div>
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-2xl text-cyan-300">₹</div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-xs text-slate-500">Categories</p>
                  <p className="mt-2 text-2xl font-bold">{loading ? "..." : categories.length}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-xs text-slate-500">Healthy Stock</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    {loading ? "..." : products.filter((product) => Number(product.stockQuantity) > 5).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#101522]/90 p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-300">Quick Actions</p>
              <div className="mt-4 space-y-3">
                <QuickAction to="/admin/products/create" icon="＋" title="Create Product" description="Add a new store item" />
                <QuickAction to="/products" icon="▦" title="Browse Products" description="Preview the customer store" />
                <button
                  type="button"
                  onClick={() => void loadDashboard(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-lg text-violet-300">↻</span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-200">Refresh Dashboard</span>
                    <span className="mt-1 block text-xs text-slate-500">Reload products, orders and returns</span>
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Product Inventory */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522]/90">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="text-lg font-bold">Product Inventory</h3>
                <p className="mt-1 text-sm text-slate-500">Search, edit and manage your products.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative">
                  <span className="sr-only">Search products</span>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, category or ID..."
                    className="w-full rounded-xl border border-white/10 bg-[#080b14] py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 sm:w-72"
                  />
                </label>
                <Link to="/admin/products/create" className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400">
                  + Add Product
                </Link>
              </div>
            </div>

            {loading ? (
              <LoadingBlock text="Loading dashboard data..." />
            ) : filteredProducts.length === 0 ? (
              <EmptyBlock title="No products found" description={search ? "Search term change karke dekho." : "Add your first product to get started."}>
                {!search && <Link to="/admin/products/create" className="mt-5 inline-flex rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white hover:bg-violet-400">Create Product</Link>}
              </EmptyBlock>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                      <tr>
                        {["Product", "Category", "Price", "Stock", "Actions"].map((heading) => (
                          <th key={heading} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${heading === "Actions" ? "text-right" : ""}`}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredProducts.map((product) => {
                        const image = getProductImage(product);
                        const stock = Number(product.stockQuantity ?? 0);

                        return (
                          <tr key={product.id} className="transition hover:bg-white/[0.025]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {image ? (
                                  <img src={image} alt={product.name} className="h-12 w-12 rounded-xl border border-white/10 bg-white/[0.03] object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                                ) : (
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xl text-slate-500">▦</div>
                                )}
                                <div className="min-w-0">
                                  <p className="max-w-xs truncate text-sm font-semibold text-slate-200">{product.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">ID: {product.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4"><span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">{product.categoryName || "Uncategorized"}</span></td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-200">{currency(product.price)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${stock <= 0 ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : stock <= 5 ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}`}>
                                {stock <= 0 ? "Out of stock" : `${stock} units`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => openEditModal(product)} className="rounded-lg border border-violet-400/20 bg-violet-400/[0.08] px-3 py-2 text-xs font-bold text-violet-300 transition hover:bg-violet-400/[0.16]">Edit</button>
                                <button type="button" onClick={() => void deleteProduct(product)} disabled={deletingId === product.id} className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-400/[0.14] disabled:opacity-50">
                                  {deletingId === product.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4">
                  <p className="text-xs text-slate-500">Showing {filteredProducts.length} of {products.length} products</p>
                  <p className="text-xs text-slate-500">Inventory management</p>
                </div>
              </>
            )}
          </section>

          {/* Order Management */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101522]/90">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="text-lg font-bold">Order Management</h3>
                <p className="mt-1 text-sm text-slate-500">Track orders and update their current status.</p>
              </div>
              <span className="w-fit rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-400">{orders.length} total orders</span>
            </div>

            <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] p-5 sm:grid-cols-2 sm:p-6">
              <input type="search" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search order ID, customer or address..." aria-label="Search orders" className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50" />
              <select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)} aria-label="Filter orders by status" className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50">
                <option value="ALL">All order statuses</option>
                {ORDER_STATUSES.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
              </select>
            </div>

            {loading ? (
              <LoadingBlock text="Loading orders..." />
            ) : filteredOrders.length === 0 ? (
              <EmptyBlock title="No matching orders" description="Search ya status filter change karke dekho." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                    <tr>
                      {["Order", "Customer", "Date", "Amount", "Current Status", "Update Status"].map((heading) => (
                        <th key={heading} className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredOrders.map((order) => {
                      const selectedStatus = orderStatusDrafts[order.id] ?? order.status;
                      const isUpdating = updatingOrderId === order.id;

                      return (
                        <tr key={order.id} className="align-top transition hover:bg-white/[0.025]">
                          <td className="px-5 py-5">
                            <span className="text-sm font-bold text-slate-200">#{order.id}</span>
                            {order.userId !== undefined && <p className="mt-1 text-xs text-slate-500">User ID: {order.userId}</p>}
                          </td>
                          <td className="max-w-[220px] px-5 py-5">
                            <p className="break-words text-sm text-slate-300">{order.customerEmail || "Customer"}</p>
                            {order.shippingAddress && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{order.shippingAddress}</p>}
                          </td>
                          <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-400">{formatDate(order.createdAt)}</td>
                          <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-slate-200">{currency(order.totalAmount)}</td>
                          <td className="px-5 py-5"><span className={`inline-flex whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getStatusStyle(order.status)}`}>{formatStatus(order.status)}</span></td>
                          <td className="px-5 py-5">
                            <div className="flex min-w-[190px] flex-col gap-2">
                              <select value={selectedStatus} disabled={isUpdating} aria-label={`Select status for order ${order.id}`} onChange={(event) => setOrderStatusDrafts((previous) => ({ ...previous, [order.id]: event.target.value }))} className="w-full rounded-lg border border-white/10 bg-[#080b14] px-3 py-2.5 text-xs text-white outline-none transition focus:border-violet-400/50 disabled:opacity-50">
                                {!ORDER_STATUSES.includes(order.status as (typeof ORDER_STATUSES)[number]) && <option value={order.status}>{formatStatus(order.status)}</option>}
                                {ORDER_STATUSES.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                              </select>
                              <button type="button" disabled={isUpdating || selectedStatus === order.status} onClick={() => void updateOrderStatus(order)} className="rounded-lg bg-violet-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500">
                                {isUpdating ? "Updating..." : selectedStatus === order.status ? "No Changes" : "Update Status"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4">
              <p className="text-xs text-slate-500">Showing {filteredOrders.length} of {orders.length} orders</p>
              <p className="text-xs text-slate-500">Status changes are saved through the backend API.</p>
            </div>
          </section>

          {/* Returns & Refund Management */}
          <section id="returns" className="mb-8 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#101522]/95 shadow-xl shadow-violet-950/10">
            <div className="border-b border-white/[0.07] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Customer Service</p>
                  <h3 className="mt-2 text-xl font-black sm:text-2xl">Returns & Refund Management</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Customer return requests review karo, decision save karo aur refund handling status track karo.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={refreshing}
                  onClick={() => void loadDashboard(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-bold text-violet-200 transition hover:bg-violet-400/20 disabled:opacity-50"
                >
                  {refreshing ? "Refreshing..." : "↻ Refresh Returns"}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniStat label="Total Requests" value={returns.length} />
                <MiniStat label="Awaiting Decision" value={pendingReturns} tone="amber" />
                <MiniStat label="Manual Refund Required" value={manualRefunds} tone="violet" />
              </div>
            </div>

            {returnError && (
              <div role="alert" className="m-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm leading-6 text-rose-300 sm:m-6">
                {returnError}
              </div>
            )}

            {returnNotice && (
              <div role="status" className="m-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm leading-6 text-emerald-300 sm:m-6">
                {returnNotice}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] p-5 sm:grid-cols-2 sm:p-6">
              <input
                type="search"
                value={returnSearch}
                onChange={(event) => setReturnSearch(event.target.value)}
                placeholder="Search return ID, order, email or reason..."
                aria-label="Search return requests"
                className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50"
              />
              <select
                value={returnStatusFilter}
                onChange={(event) => setReturnStatusFilter(event.target.value)}
                aria-label="Filter returns by status"
                className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
              >
                {RETURN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "All return statuses" : formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <LoadingBlock text="Loading return requests..." />
            ) : returns.length === 0 ? (
              <EmptyBlock
                title="No return requests yet"
                description={returnError ? "API response ya permissions check karo, phir refresh karo." : "Customer ki return request aane par yahan dikhai degi."}
              />
            ) : filteredReturns.length === 0 ? (
              <EmptyBlock title="No matching return requests" description="Search ya status filter change karke dekho." />
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredReturns.map((item) => {
                  const isPending = item.status === "PENDING";
                  const isProcessing = processingReturnId === item.id;

                  return (
                    <article key={item.id} className="p-5 transition hover:bg-white/[0.015] sm:p-6">
                      <div className="flex flex-col justify-between gap-4 xl:flex-row">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-black text-white">Return #{item.id}</span>
                            <span className="text-sm text-slate-500">Order #{item.orderId}</span>
                            <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusStyle(item.status)}`}>{formatStatus(item.status)}</span>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <InfoField label="Customer" value={item.customerEmail || `User #${item.userId}`} />
                            <InfoField label="Order Amount" value={currency(item.orderTotal)} />
                            <InfoField label="Request Date" value={formatDate(item.createdAt)} />
                            <InfoField label="Return Reason" value={item.reason || "Not provided"} />
                            <InfoField label="Refund Status" value={formatStatus(item.refundStatus)} />
                            <InfoField label="Customer ID" value={String(item.userId ?? "—")} />
                          </div>

                          {item.description && (
                            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#080b14]/70 p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Description</p>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{item.description}</p>
                            </div>
                          )}

                          {item.adminNote && (
                            <div className="mt-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Admin Note</p>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{item.adminNote}</p>
                            </div>
                          )}
                        </div>

                        {isPending && (
                          <div className="w-full shrink-0 xl:max-w-sm">
                            <label htmlFor={`return-note-${item.id}`} className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                              Admin Note (optional)
                            </label>
                            <textarea
                              id={`return-note-${item.id}`}
                              rows={3}
                              maxLength={1000}
                              value={adminNotes[item.id] ?? ""}
                              disabled={isProcessing}
                              onChange={(event) => setAdminNotes((previous) => ({ ...previous, [item.id]: event.target.value }))}
                              placeholder="Decision ka reason ya internal note..."
                              className="w-full resize-y rounded-xl border border-white/10 bg-[#080b14] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50 disabled:opacity-50"
                            />
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => void decideReturn(item, "APPROVE")}
                                className="rounded-xl bg-emerald-500/15 px-3 py-3 text-sm font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/25 transition hover:bg-emerald-500/25 disabled:opacity-50"
                              >
                                {isProcessing ? "Saving..." : "✓ Approve"}
                              </button>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => void decideReturn(item, "REJECT")}
                                className="rounded-xl bg-rose-500/10 px-3 py-3 text-sm font-bold text-rose-300 ring-1 ring-inset ring-rose-400/25 transition hover:bg-rose-500/20 disabled:opacity-50"
                              >
                                {isProcessing ? "Saving..." : "✕ Reject"}
                              </button>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-500">
                              Approval sirf return request approve karega. Actual payment refund alag se manually process karna hoga.
                            </p>
                          </div>
                        )}

                        {!isPending && item.refundStatus === "MANUAL_REQUIRED" && (
                          <div className="h-fit w-full rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 xl:max-w-sm">
                            <p className="text-sm font-bold text-amber-200">Manual refund required</p>
                            <p className="mt-2 text-xs leading-5 text-slate-400">
                              Request approve ho chuki hai, lekin is dashboard se payment refund automatically execute nahi hota.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4 sm:px-6">
              <p className="text-xs text-slate-500">Showing {filteredReturns.length} of {returns.length} return requests</p>
              <p className="text-xs text-slate-500">{approvedReturns} approved · {pendingReturns} pending</p>
            </div>
          </section>

          <footer className="py-8 text-center text-xs text-slate-600">
            Prime Basket Admin Dashboard · Store Management
          </footer>
        </main>
      </div>

      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="edit-product-title" className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101522] shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Inventory Management</p>
                <h3 id="edit-product-title" className="mt-2 text-xl font-black sm:text-2xl">Edit Product</h3>
                <p className="mt-1 text-sm text-slate-500">Product ID: {editingProduct.id}</p>
              </div>
              <button type="button" onClick={closeEditModal} disabled={savingEdit} aria-label="Close edit form" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50">×</button>
            </div>

            <form onSubmit={saveProductChanges}>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
                {error && <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-300">{error}</div>}
                {categories.length === 0 && <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">Categories load nahi hui hain. Category API aur permissions check karo.</div>}

                <div>
                  <label htmlFor="edit-product-name" className="mb-2 block text-sm font-semibold text-slate-300">Product Name <span className="text-rose-400">*</span></label>
                  <input id="edit-product-name" type="text" required maxLength={150} value={editForm.name} onChange={(event) => updateEditField("name", event.target.value)} placeholder="Enter product name" className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50" />
                </div>

                <div>
                  <label htmlFor="edit-product-description" className="mb-2 block text-sm font-semibold text-slate-300">Description</label>
                  <textarea id="edit-product-description" rows={4} maxLength={5000} value={editForm.description} onChange={(event) => updateEditField("description", event.target.value)} placeholder="Describe your product..." className="w-full resize-y rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50" />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-product-price" className="mb-2 block text-sm font-semibold text-slate-300">Price (₹) <span className="text-rose-400">*</span></label>
                    <input id="edit-product-price" type="number" required min="0.01" step="0.01" value={editForm.price} onChange={(event) => updateEditField("price", event.target.value)} placeholder="499.00" className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50" />
                  </div>
                  <div>
                    <label htmlFor="edit-product-stock" className="mb-2 block text-sm font-semibold text-slate-300">Stock Quantity <span className="text-rose-400">*</span></label>
                    <input id="edit-product-stock" type="number" required min="0" step="1" value={editForm.stockQuantity} onChange={(event) => updateEditField("stockQuantity", event.target.value)} placeholder="25" className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50" />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-product-category" className="mb-2 block text-sm font-semibold text-slate-300">Category <span className="text-rose-400">*</span></label>
                  <select id="edit-product-category" required value={editForm.categoryId} onChange={(event) => updateEditField("categoryId", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50">
                    <option value="" className="bg-[#101522]">Select category</option>
                    {categories.map((category) => <option key={category.id} value={String(category.id)} className="bg-[#101522]">{category.name}</option>)}
                  </select>
                  {categories.length > 0 && <p className="mt-2 text-xs text-slate-500">{categories.length} categories available</p>}
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-xs leading-5 text-slate-400">Product image is not changed by this form. Existing images remain associated with the product unless your backend update logic changes them.</p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] bg-white/[0.015] p-5 sm:flex-row sm:justify-end sm:p-6">
                <button type="button" onClick={closeEditModal} disabled={savingEdit} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={savingEdit || categories.length === 0} className="rounded-xl bg-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">{savingEdit ? "Saving Changes..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: string;
  accent: "violet" | "cyan" | "blue" | "amber";
};

function StatCard({ label, value, detail, icon, accent }: StatCardProps) {
  const accentStyles = {
    violet: { icon: "border-violet-400/20 bg-violet-400/10 text-violet-300", glow: "from-violet-500/[0.09]" },
    cyan: { icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300", glow: "from-cyan-500/[0.08]" },
    blue: { icon: "border-blue-400/20 bg-blue-400/10 text-blue-300", glow: "from-blue-500/[0.08]" },
    amber: { icon: "border-amber-400/20 bg-amber-400/10 text-amber-300", glow: "from-amber-500/[0.08]" },
  };

  const styles = accentStyles[accent];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${styles.glow} to-[#101522] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <h3 className="mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl">{value}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl font-bold ${styles.icon}`}>{icon}</div>
      </div>
    </div>
  );
}

type QuickActionProps = {
  to: string;
  icon: string;
  title: string;
  description: string;
};

function QuickAction({ to, icon, title, description }: QuickActionProps) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition hover:border-violet-400/30 hover:bg-violet-500/[0.06]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-lg text-violet-300">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-200">{title}</span>
        <span className="mt-1 block text-xs text-slate-500">{description}</span>
      </span>
      <span className="ml-auto text-slate-600">↗</span>
    </Link>
  );
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
      <p className="mt-4 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function EmptyBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-slate-500">↗</div>
      <h4 className="mt-4 font-bold text-slate-200">{title}</h4>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: number;
  tone?: "cyan" | "amber" | "violet";
}) {
  const styles = {
    cyan: "border-cyan-400/15 bg-cyan-400/[0.05] text-cyan-300",
    amber: "border-amber-400/15 bg-amber-400/[0.05] text-amber-300",
    violet: "border-violet-400/15 bg-violet-400/[0.05] text-violet-300",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}
