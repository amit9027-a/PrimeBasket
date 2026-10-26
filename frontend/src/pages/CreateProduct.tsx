
import CreateProductForm from "@/components/create-product-form";

const CreateProduct = () => {
  return (
    <main className="min-h-screen bg-[#0a0f19] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm text-blue-400">
          AESTRO MART / INVENTORY
        </p>

        <h1 className="text-3xl font-bold">
          Create Product
        </h1>

        <p className="mb-8 mt-2 text-sm text-slate-400">
          Add a new product to your store.
        </p>

        <div className="rounded-2xl border border-slate-700/60 bg-[#101827] p-5 sm:p-8">
          <CreateProductForm />
        </div>
      </div>
    </main>
  );
};

export default CreateProduct;