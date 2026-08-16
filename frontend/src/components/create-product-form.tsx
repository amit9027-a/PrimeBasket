import api from "@/api/axios";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";
import { FileImage, ImagePlus, Sparkles, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

type Category = {
  id: number;
  name: string;
  description?: string;
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  primaryImage: boolean;
};

type ProductFieldErrors = Partial<Record<keyof ProductFormState | "image" | "form", string>>;

const FONTS = {
  display: "'Fraunces', ui-serif, Georgia, serif",
  body: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
};

const initialFormState: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  primaryImage: true,
};

const CreateProductForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProductFieldErrors>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.get<Category[]>("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error(error);
        setErrors((current) => ({
          ...current,
          form: "Unable to load categories right now. Please try again.",
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

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === form.categoryId),
    [categories, form.categoryId],
  );

  const handleFieldChange = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSuccessMessage("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setErrors((current) => ({ ...current, image: undefined, form: undefined }));
    setSuccessMessage("");
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setErrors((current) => ({ ...current, image: undefined }));
  };

  const validate = () => {
    const nextErrors: ProductFieldErrors = {};

    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (!form.price.trim()) nextErrors.price = "Price is required.";
    if (!form.stockQuantity.trim()) nextErrors.stockQuantity = "Stock quantity is required.";
    if (!form.categoryId) nextErrors.categoryId = "Please choose a category.";

    if (form.price && Number(form.price) <= 0) {
      nextErrors.price = "Price must be greater than zero.";
    }

    if (form.stockQuantity && Number(form.stockQuantity) < 0) {
      nextErrors.stockQuantity = "Stock quantity cannot be negative.";
    }

    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      nextErrors.image = "Please select a valid image file.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const productPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: Number(form.categoryId),
      };

      const productResponse = await api.post("/products", productPayload);
      const createdProductId: number = productResponse.data.id;

      if (selectedFile) {
        const filePayload = new FormData();
        filePayload.append("file", selectedFile);

        await api.post(`/products/${createdProductId}/images?primary=${form.primaryImage}`, filePayload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setForm(initialFormState);
      setSelectedFile(null);
      setErrors({});
      setSuccessMessage("Product created successfully.");
    } catch (error: any) {
      console.error(error);
      setErrors((current) => ({
        ...current,
        form:
          error?.response?.data?.message ||
          "Product creation failed. Please check your backend and try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper pb-20">
      <section className="border-b border-line bg-paper-alt/50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.08em] text-moss uppercase">
                Admin atelier
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <h1
              className="m-0 max-w-3xl text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.03em] text-ink"
              style={{ fontFamily: FONTS.display, fontWeight: 500 }}
            >
              Publish a new
              <br />
              <span className="italic font-normal text-moss">catalogue entry</span>
            </h1>

            <p
              className="mt-6 max-w-2xl text-base leading-7 text-ink-soft"
              style={{ fontFamily: FONTS.body }}
            >
              This page now follows the same editorial storefront language as the
              rest of the site, while still giving you the full admin product
              creation flow with image upload and category mapping.
            </p>
          </div>

          <div className="grid gap-4 rounded-[2px] border border-line bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                  Publishing note
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Create the product record first, then the image is uploaded to
                  the backend and attached as the product visual.
                </p>
              </div>
              <Sparkles className="mt-1 shrink-0 text-moss" size={18} strokeWidth={1.6} />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <Stat label="Categories loaded" value={isLoadingCategories ? "..." : String(categories.length)} />
              <Stat label="Image status" value={selectedFile ? "Ready" : "Optional"} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pt-10 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="grid gap-8">
          <section className="border border-line bg-card p-6 md:p-8">
            <SectionHeading
              eyebrow="Product details"
              title="Core product information"
              description="Fill the essentials first so the item is searchable, priced correctly, and ready for the storefront."
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <FieldBlock label="Product name" error={errors.name}>
                <input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Wireless Headphones"
                  className="fs-input w-full rounded-none border border-line bg-paper px-4 py-4 text-sm text-ink placeholder:text-ink-faint"
                  style={{ fontFamily: FONTS.body }}
                />
              </FieldBlock>

              <FieldBlock
                label="Category"
                error={errors.categoryId}
                helper={selectedCategory?.description || "Assign this product to an existing category."}
              >
                <select
                  id="product-category"
                  value={form.categoryId}
                  onChange={(event) => handleFieldChange("categoryId", event.target.value)}
                  className="w-full rounded-none border border-line bg-paper px-4 py-4 text-sm text-ink"
                  style={{ fontFamily: FONTS.body }}
                >
                  <option value="">
                    {isLoadingCategories ? "Loading categories..." : "Choose a category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FieldBlock>

              <FieldBlock
                label="Description"
                className="md:col-span-2"
                helper="Keep it concise and useful for customers browsing the catalogue."
              >
                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) => handleFieldChange("description", event.target.value)}
                  placeholder="Write a crisp, helpful product description."
                  className="min-h-32 w-full resize-none rounded-none border border-line bg-paper px-4 py-4 text-sm leading-6 text-ink placeholder:text-ink-faint"
                  style={{ fontFamily: FONTS.body }}
                />
              </FieldBlock>

              <FieldBlock label="Price" error={errors.price}>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => handleFieldChange("price", event.target.value)}
                  placeholder="1999"
                  className="w-full rounded-none border border-line bg-paper px-4 py-4 text-sm text-ink placeholder:text-ink-faint"
                  style={{ fontFamily: FONTS.body }}
                />
              </FieldBlock>

              <FieldBlock label="Stock quantity" error={errors.stockQuantity}>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQuantity}
                  onChange={(event) => handleFieldChange("stockQuantity", event.target.value)}
                  placeholder="25"
                  className="w-full rounded-none border border-line bg-paper px-4 py-4 text-sm text-ink placeholder:text-ink-faint"
                  style={{ fontFamily: FONTS.body }}
                />
              </FieldBlock>
            </div>
          </section>

          <section className="border border-line bg-card p-6 md:p-8">
            <SectionHeading
              eyebrow="Product image"
              title="Upload the primary visual"
              description="Use a clean hero image. It will be sent right after the product is created and can be marked as the main storefront image."
            />

            <div className="mt-8 grid gap-5">
              <AttachmentGroup className="pb-2">
                <Attachment
                  className={cn(
                    "min-h-40 w-full rounded-none border-line bg-paper md:min-h-44",
                    previewUrl ? "border-solid" : "border-dashed",
                  )}
                  orientation="horizontal"
                  state={selectedFile ? "done" : "idle"}
                >
                  <AttachmentMedia
                    variant={previewUrl ? "image" : "icon"}
                    className="h-24 w-24 rounded-none border border-line bg-paper-alt md:h-28 md:w-28"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt={selectedFile?.name || "Selected product"} />
                    ) : (
                      <ImagePlus className="size-8 text-ink-faint" />
                    )}
                  </AttachmentMedia>

                  <AttachmentContent className="py-4">
                    <AttachmentTitle className="font-medium text-ink" style={{ fontFamily: FONTS.display }}>
                      {selectedFile ? selectedFile.name : "Drop in the hero image"}
                    </AttachmentTitle>
                    <AttachmentDescription className="text-ink-soft">
                      {selectedFile
                        ? `${Math.max(selectedFile.size / 1024 / 1024, 0.01).toFixed(2)} MB image ready to upload`
                        : "Choose a polished product photo for stronger catalogue cards and detail previews."}
                    </AttachmentDescription>
                  </AttachmentContent>

                  <AttachmentActions className="right-4 top-4">
                    {selectedFile ? (
                      <AttachmentAction
                        type="button"
                        variant="secondary"
                        className="rounded-none border border-line bg-card text-ink hover:bg-paper-alt"
                        onClick={clearSelectedFile}
                      >
                        <X className="size-4" />
                      </AttachmentAction>
                    ) : null}
                  </AttachmentActions>

                  <AttachmentTrigger asChild>
                    <label htmlFor="product-image-upload" className="cursor-pointer" />
                  </AttachmentTrigger>
                </Attachment>
              </AttachmentGroup>

              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
                    Accepted formats
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    JPG, PNG, or WebP. Image upload is optional but recommended.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => document.getElementById("product-image-upload")?.click()}
                  className="border border-line px-4 py-3 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:bg-paper-alt"
                >
                  <FileImage className="mr-2 inline size-4" />
                  {selectedFile ? "Replace image" : "Choose image"}
                </button>
              </div>

              <label className="flex items-start gap-4 border-t border-line pt-5">
                <input
                  type="checkbox"
                  checked={form.primaryImage}
                  onChange={(event) => handleFieldChange("primaryImage", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-line accent-[#42502F]"
                />
                <div>
                  <p className="font-mono text-[11px] tracking-[0.08em] text-ink uppercase">
                    Mark as primary image
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Use this image as the main catalog thumbnail right after upload.
                  </p>
                </div>
              </label>

              {errors.image ? <p className="text-sm text-[#9A3F32]">{errors.image}</p> : null}
            </div>
          </section>

          {errors.form ? (
            <div className="border border-[rgba(154,63,50,0.2)] bg-[rgba(154,63,50,0.06)] px-4 py-4 text-sm text-[#9A3F32]">
              {errors.form}
            </div>
          ) : null}

          {successMessage ? (
            <div className="border border-[rgba(66,80,47,0.2)] bg-[rgba(66,80,47,0.08)] px-4 py-4 text-sm text-moss">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-card px-6 py-5">
            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                Submission check
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Make sure you are signed in as an <span className="font-semibold text-ink">ADMIN</span> before publishing.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingCategories}
              className="border border-ink bg-ink px-6 py-3 font-mono text-[11px] tracking-[0.08em] text-paper uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="mr-2 inline size-4" />
              {isSubmitting ? "Publishing..." : "Create product"}
            </button>
          </div>
        </form>

        <aside className="grid h-fit gap-4 border border-line bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                Publishing checklist
              </p>
              <h2
                className="mt-3 text-[1.9rem] leading-[1.05] text-ink"
                style={{ fontFamily: FONTS.display, fontWeight: 500 }}
              >
                Keep every entry clear,
                <br />
                searchable, and stock-aware.
              </h2>
            </div>
            <Sparkles className="mt-1 shrink-0 text-moss" size={18} strokeWidth={1.6} />
          </div>

          <div className="grid gap-4 border-t border-line pt-4">
            <ChecklistItem
              title="Strong naming"
              description="Use short, searchable names that work in both the catalogue grid and the order history."
            />
            <ChecklistItem
              title="Category alignment"
              description="Choose the category customers actually browse so search and filtering behave naturally."
            />
            <ChecklistItem
              title="Image readiness"
              description="A clean front-facing visual will make this product feel much stronger in the storefront."
            />
            <ChecklistItem
              title="Stock confidence"
              description="Orders validate stock again at checkout, so start with the most accurate quantity you have."
            />
          </div>
        </aside>
      </section>
    </main>
  );
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div>
    <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">{eyebrow}</p>
    <h2
      className="mt-3 text-[1.9rem] leading-[1.08] text-ink"
      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
    >
      {title}
    </h2>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft" style={{ fontFamily: FONTS.body }}>
      {description}
    </p>
  </div>
);

const FieldBlock = ({
  label,
  children,
  error,
  helper,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  helper?: string;
  className?: string;
}) => (
  <div className={className}>
    <label className="block font-mono text-[11px] tracking-[0.08em] text-ink uppercase">
      {label}
    </label>
    <div className="mt-3">{children}</div>
    {helper ? <p className="mt-2 text-xs leading-6 text-ink-faint">{helper}</p> : null}
    {error ? <p className="mt-2 text-sm text-[#9A3F32]">{error}</p> : null}
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">{label}</p>
    <p
      className="mt-2 text-3xl leading-none text-ink"
      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
    >
      {value}
    </p>
  </div>
);

const ChecklistItem = ({ title, description }: { title: string; description: string }) => (
  <div className="border border-line bg-paper px-4 py-4">
    <h3
      className="text-[1.05rem] leading-[1.2] text-ink"
      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
    >
      {title}
    </h3>
    <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
  </div>
);

export default CreateProductForm;
