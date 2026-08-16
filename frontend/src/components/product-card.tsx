import { formatPrice } from "@/utils/formatPrice";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";

function SpecimenTag({ no }: { no: any }) {
  return (
    <div className="absolute top-3 bg-card-alt font-mono text-ink-soft left-3 border rounded-xs py-1 px-2 text-xs tracking-wide rotate-[-1.5deg] shadow-[0,1px,2px,rgba(27,26,21,0.06)] border-[1px,solid,${TOKENS.line}">
      No. {no}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const [imgError, setImgError] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col cursor-pointer"
    >
      <div className="relative aspect-4/5 bg-paper-alt overflow-hidden border border-line">
        {!imgError ? (
          <img
            src={product.img}
            alt={product.name}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover ${hover ? "scale-[1.045] saturate-105" : "scale-100 saturate-100"} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-moss-pale text-moss font-display text-[15px] italic text-center p-5">
            {product.name}
          </div>
        )}

        <SpecimenTag no={product.no} />

        {product.tag && (
          <div className="absolute top-3 right-3 bg-moss text-moss-pale font-mono text-[10px] tracking-[0.06em] uppercase py-1 px-2 rounded-xs">
            {product.tag}
          </div>
        )}

        <button
          aria-label="Add to wishlist"
          className={`absolute bottom-10.5 right-1.5 w-8.5 h-8.5 rounded-full border-0 bg-[rgba(251,250,246,0.92)] flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out ${hover ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"}`}
        >
          <Heart size={15} className="text-ink" strokeWidth={1.6} />
        </button>

        <div
          className={`absolute inset-x-0 bottom-0 flex items-center justify-between bg-[rgba(27,26,21,0.88)] px-3 py-2.25 text-[11.5px] uppercase tracking-[0.03em] transition-transform duration-260 ease-[cubic-bezier(0.16,1,0.3,1)] text-paper font-body ${hover ? "translate-y-0" : "translate-y-full"}`}
        >
          <span>Quick add</span>
          <Plus size={13} strokeWidth={1.6} />
        </div>
      </div>

      <div className="pt-3.5">
        <div className="flex justify-between items-baseline gap-2">
          <h3 className="font-display text-base font-medium text-ink m-0 leading-[1.3]">
            {product.name}
          </h3>
          <span className="font-mono text-[13.5px] text-ink whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <p className="font-body text-[12.5px] text-ink-faint m-0">
            {product.note}
          </p>
          <div className="flex gap-1.25">
            {product.colors.map((c: any, i: any) => (
              <span
                key={i}
                className="w-2.75 h-2.75 rounded-[50%] border border-line"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
