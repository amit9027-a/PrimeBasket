
import api from "@/api/axios";
import {
  ImagePlus,
  PackagePlus,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const initialFormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  primaryImage: true,
};

const CreateProductForm = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error(error);
        setErrors((current: any) => ({
          ...current,
          form: "Unable to load categories. Please try again.",
        }));
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => String(category.id) === form.categoryId
      ),
    [categories, form.categoryId]
  );

  const handleChange = (field: string, value: any) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current: any) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
    setSuccessMessage("");
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setErrors((current: any) => ({
      ...current,
      image: undefined,
      form: undefined,
    }));
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors: any = {};

    if (!form.name.trim()) {
      nextErrors.name = "Product name is required.";
    }

    if (!form.price.trim()) {
      nextErrors.price = "Price is required.";
    } else if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      nextErrors.price = "Enter a valid price greater than zero.";
    }

    if (!form.stockQuantity.trim()) {
      nextErrors.stockQuantity = "Stock quantity is required.";
    } else if (
      !Number.isInteger(Number(form.stockQuantity)) ||
      Number(form.stockQuantity) < 0
    ) {
      nextErrors.stockQuantity = "Enter a valid non-negative whole number.";
    }

    if (!form.categoryId) {
      nextErrors.categoryId = "Please choose a category.";
    }

    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      nextErrors.image = "Please select a valid image file.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: Number(form.categoryId),
      };

      const response = await api.post("/products", payload);
      const productId = response.data.id;

      if (selectedFile) {
        const filePayload = new FormData();
        filePayload.append("file", selectedFile);

        await api.post(
          `/products/${productId}/images?primary=${form.primaryImage}`,
          filePayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setForm(initialFormState);
      setSelectedFile(null);
      setErrors({});
      setSuccessMessage("Product created successfully.");
    } catch (error: any) {
      console.error(error);
      setErrors((current: any) => ({
        ...current,
        form:
          error?.response?.data?.message ||
          "Product creation failed. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <PackagePlus size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Product Information
          </h2>
          <p className="text-xs text-slate-400">
            Add the details for your new listing.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="product-name" className={labelClass}>
          Product Name *
        </label>
        <input
          id="product-name"
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Enter product name"
          className={inputClass}
        />
        {errors.name && (
          <p className="mt-2 text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="product-category" className={labelClass}>
          Category *
        </label>
        <select
          id="product-category"
          value={form.categoryId}
          onChange={(event) => handleChange("categoryId", event.target.value)}
          className={inputClass}
        >
          <option value="">
            {isLoadingCategories ? "Loading categories..." : "Select a category"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>

        {selectedCategory?.description && (
          <p className="mt-2 text-xs text-slate-500">
            {selectedCategory.description}
          </p>
        )}

        {errors.categoryId && (
          <p className="mt-2 text-xs text-red-400">{errors.categoryId}</p>
        )}
      </div>

      <div>
        <label htmlFor="product-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="product-description"
          value={form.description}
          onChange={(event) =>
            handleChange("description", event.target.value)
          }
          placeholder="Describe your product..."
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="product-price" className={labelClass}>
            Price (₹) *
          </label>
          <input
            id="product-price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={(event) => handleChange("price", event.target.value)}
            placeholder="1999.00"
            className={inputClass}
          />
          {errors.price && (
            <p className="mt-2 text-xs text-red-400">{errors.price}</p>
          )}
        </div>

        <div>
          <label htmlFor="product-stock" className={labelClass}>
            Stock Quantity *
          </label>
          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={form.stockQuantity}
            onChange={(event) =>
              handleChange("stockQuantity", event.target.value)
            }
            placeholder="25"
            className={inputClass}
          />
          {errors.stockQuantity && (
            <p className="mt-2 text-xs text-red-400">
              {errors.stockQuantity}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-700 bg-[#0b1220] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <ImagePlus size={21} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Product Image
            </h3>
            <p className="text-xs text-slate-400">
              Upload a JPG, PNG or WebP image.
            </p>
          </div>
        </div>

        {previewUrl && (
          <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-700">
            <img
              src={previewUrl}
              alt="Product preview"
              className="h-56 w-full object-contain bg-[#101827] p-3"
            />
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              aria-label="Remove selected image"
              className="absolute right-3 top-3 rounded-lg border border-slate-600 bg-[#0a0f19] p-2 text-white hover:bg-red-500/20 hover:text-red-400"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <label
          htmlFor="product-image-upload"
          className="flex cursor-pointer flex-col items-center rounded-xl border border-slate-700 bg-white/[0.02] px-4 py-7 text-center transition hover:border-blue-500/50 hover:bg-blue-500/[0.04]"
        >
          <Upload size={24} className="mb-3 text-blue-400" />
          <span className="text-sm font-medium text-slate-200">
            {selectedFile ? "Choose another image" : "Click to upload image"}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            {selectedFile ? selectedFile.name : "Image upload is optional"}
          </span>
        </label>

        <input
          id="product-image-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />

        {errors.image && (
          <p className="mt-2 text-xs text-red-400">{errors.image}</p>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-slate-800 pt-4">
          <input
            type="checkbox"
            checked={form.primaryImage}
            onChange={(event) =>
              handleChange("primaryImage", event.target.checked)
            }
            className="mt-1 h-4 w-4 accent-blue-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-200">
              Set as primary image
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Use this image as the main product visual.
            </span>
          </span>
        </label>
      </div>

      {errors.form && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">
          {errors.form}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      <div className="border-t border-slate-800 pt-5">
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
          <Sparkles size={15} className="text-blue-400" />
          Review your details before publishing.
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoadingCategories}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PackagePlus size={18} />
          {isSubmitting ? "Creating Product..." : "Create Product"}
        </button>
      </div>
    </form>
  );
};

export default CreateProductForm;