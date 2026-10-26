
import { useState } from "react";
import {
  Gift,
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wallet,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  checkGiftCardBalance,
  createGiftCard,
  getGiftCards,
  updateGiftCardStatus,
  type GiftCard,
} from "@/features/gift-cards/giftCardAPI";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const GiftCards = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [cards, setCards] = useState<GiftCard[]>([]);
  const [code, setCode] = useState("");
  const [checkedCard, setCheckedCard] = useState<GiftCard | null>(null);
  const [amount, setAmount] = useState("500");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCards = async () => {
    setLoadingCards(true);
    setError("");

    try {
      const response = await getGiftCards();
      setCards(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Gift Cards load nahi ho sake. Admin login check karein."
      );
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setError("Amount kam se kam ₹1 hona chahiye.");
      return;
    }

    setLoading(true);

    try {
      const response = await createGiftCard({
        amount: parsedAmount,
        expiryDate: expiryDate || null,
      });

      setCards((previous) => [response.data, ...previous]);
      setSuccess(`Gift Card create ho gaya: ${response.data.code}`);
      setAmount("500");
      setExpiryDate("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Gift Card create nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceCheck = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setCheckedCard(null);

    if (!code.trim()) {
      setError("Gift Card code enter karo.");
      return;
    }

    setLoading(true);

    try {
      const response = await checkGiftCardBalance(code.trim());
      setCheckedCard(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Gift Card verify nahi hua. Code check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (card: GiftCard) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await updateGiftCardStatus(
        card.id,
        !card.active
      );

      setCards((previous) =>
        previous.map((item) =>
          item.id === card.id ? response.data : item
        )
      );

      setSuccess(
        `Gift Card ${response.data.active ? "activate" : "deactivate"} ho gaya.`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Gift Card status update nahi hua."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f19] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300">
              <Gift size={16} />
             Prime Basket Rewards
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Gift Cards
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Gift Card details aur available balance ek hi jagah manage
              karein.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={loadCards}
              disabled={loadingCards}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loadingCards ? "animate-spin" : ""}
              />
              Refresh Cards
            </button>
          )}
        </div>

        {(error || success) && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-400/20 bg-red-400/10 text-red-200"
                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
            }`}
          >
            {error ? (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            ) : (
              <ShieldCheck size={19} className="mt-0.5 shrink-0" />
            )}
            <span>{error || success}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
                <Wallet size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Check your balance</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Apna Gift Card code enter karein.
                </p>
              </div>
            </div>

            <form onSubmit={handleBalanceCheck} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Gift Card code
                </span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="PRIMEBASKET-XXXXXXXXXXXXXXX"
                  autoComplete="off"
                  maxLength={40}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0f19] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                <Search size={18} />
                {loading ? "Checking..." : "Check Balance"}
              </button>
            </form>

            {checkedCard && (
              <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-400/5 p-5">
                <p className="text-sm text-slate-400">Gift Card code</p>
                <p className="mt-1 break-all font-semibold">
                  {checkedCard.code}
                </p>

                <p className="mt-5 text-sm text-slate-400">
                  Available balance
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-300">
                  {formatPrice(checkedCard.balance)}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Status: {checkedCard.active ? "Active" : "Inactive"}
                </p>

                {checkedCard.expiryDate && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays size={14} />
                    Expires: {checkedCard.expiryDate}
                  </p>
                )}
              </div>
            )}
          </section>

          {isAdmin ? (
            <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
                  <Plus size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Create Gift Card</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Naya Gift Card generate karein.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">
                    Amount (INR)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="1000000000"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0f19] px-4 py-3 text-white outline-none focus:border-blue-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">
                    Expiry date (optional)
                  </span>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={expiryDate}
                    onChange={(event) => setExpiryDate(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0f19] px-4 py-3 text-white outline-none focus:border-blue-400"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
                >
                  <Plus size={18} />
                  {loading ? "Creating..." : "Create Gift Card"}
                </button>
              </form>
            </section>
          ) : (
            <section className="flex flex-col justify-center rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-6 sm:p-8">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                <Gift size={28} />
              </div>
              <h2 className="text-xl font-semibold">
                A thoughtful gift, made simple
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Apne Gift Card ka code safe rakhein. Available balance yahan
                check kar sakte hain.
              </p>
              <p className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
                Gift Card checkout redemption abhi next integration step mein
                add hoga.
              </p>
            </section>
          )}
        </div>

        {isAdmin && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Manage Gift Cards</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Cards ki balance aur status dekhein.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                {cards.length} cards
              </span>
            </div>

            {cards.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                <Gift className="mx-auto mb-3 text-slate-500" size={28} />
                <p className="text-slate-300">No Gift Cards loaded</p>
                <p className="mt-2 text-sm text-slate-500">
                  Cards dekhne ke liye Refresh Cards par click karein.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="px-3 py-3 font-medium">Code</th>
                      <th className="px-3 py-3 font-medium">Initial</th>
                      <th className="px-3 py-3 font-medium">Balance</th>
                      <th className="px-3 py-3 font-medium">Expiry</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-3 py-4 font-medium">{card.code}</td>
                        <td className="px-3 py-4">
                          {formatPrice(card.initialAmount)}
                        </td>
                        <td className="px-3 py-4 text-blue-300">
                          {formatPrice(card.balance)}
                        </td>
                        <td className="px-3 py-4 text-slate-400">
                          {card.expiryDate || "No expiry"}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={
                              card.active
                                ? "rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-300"
                                : "rounded-full bg-red-400/10 px-2.5 py-1 text-red-300"
                            }
                          >
                            {card.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleStatus(card)}
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium hover:bg-white/10 disabled:opacity-50"
                          >
                            {card.active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default GiftCards;
