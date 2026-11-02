import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BillingDetails from "./BillingDetails";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";
import { Loader2 } from "lucide-react";
import { Trash2 } from "lucide-react";

import PaymentSuccess from "./PaymentSuccess";

export interface PendingPaymentRow {
  payment_id: string | number;
  payment_course_name?: string;
  payment_type: string;
  payment_amount?: string;
  discount_amount?: number;
  coupon_code?: string | null;
  line_subtotal?: number;
}

function parseRsAmount(s?: string): number {
  if (!s) return 0;
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

interface CheckoutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  row?: any;
  existingDonation?: number;
  pendingPaymentRows?: PendingPaymentRow[];
  onBillingTotalsRefresh?: () => Promise<void>;
  paymentConfirm?: boolean;
  paymentBank?: string;
  faisalData?: any;
  apiMessage?: { text: string; type: "success" | "error" } | null;
}
interface DonationEntry {
  label: string;
  amount: number;
}

interface FaysalFormParameters {
  [key: string]: string | number | boolean;
}

export default function CheckoutSidebar({
  isOpen,
  onClose,
  row,
  existingDonation,
  pendingPaymentRows,
  onBillingTotalsRefresh,
  paymentConfirm,
  paymentBank,
  faisalData,
  apiMessage,
}: CheckoutSidebarProps) {
  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [faysalFormData, setFaysalFormData] =
    useState<FaysalFormParameters | null>(null);
  const [faysalFormUrl, setFaysalFormUrl] = useState<string>("");
  const [showFaysalForm, setShowFaysalForm] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);

  const [donationRadio, setDonationRadio] = useState<string>("");
  const [donationInput, setDonationInput] = useState<string>("");
  const [donationRowMessage, setDonationRowMessage] = useState<string | null>(
    null
  );
  const [donationBoxMessage, setDonationBoxMessage] = useState<string | null>(
    null
  );
  const [rightSidebarEntries, setRightSidebarEntries] = useState<
    DonationEntry[]
  >([]);
  const [, setTotalAmount] = useState<number>(
    typeof row === "number" ? row : 0
  );

  const rowTotal = typeof row === "number" && !Number.isNaN(row) ? row : 0;

  const [couponCode, setCouponCode] = useState("");
  const [couponTargetId, setCouponTargetId] = useState<string | number | null>(
    null
  );
  const [couponLoading, setCouponLoading] = useState(false);
  const [removeCouponLoadingId, setRemoveCouponLoadingId] = useState<
    string | number | null
  >(null);
  const [couponNotice, setCouponNotice] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);

  const couponEligibleRows = useMemo(
    () =>
      (pendingPaymentRows ?? []).filter(
        (r) => r.payment_type !== "Donation Payment"
      ),
    [pendingPaymentRows]
  );

  const showPromoBlock =
    couponEligibleRows.length > 0 && typeof onBillingTotalsRefresh === "function";

  useEffect(() => {
    if (!couponEligibleRows.length) {
      setCouponTargetId(null);
      return;
    }
    setCouponTargetId((prev) => {
      if (
        prev != null &&
        couponEligibleRows.some((l) => String(l.payment_id) === String(prev))
      ) {
        return prev;
      }
      return couponEligibleRows[0].payment_id;
    });
  }, [couponEligibleRows]);

  const itemsPricing = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    for (const r of couponEligibleRows) {
      const d = Number(r.discount_amount) || 0;
      const lineSub =
        typeof r.line_subtotal === "number"
          ? r.line_subtotal
          : parseRsAmount(r.payment_amount) + d;
      subtotal += lineSub;
      discount += d;
    }
    return {
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      hasDiscount: discount > 0,
    };
  }, [couponEligibleRows]);

  const rowsWithCoupon = useMemo(
    () =>
      couponEligibleRows.filter((r) => (Number(r.discount_amount) || 0) > 0),
    [couponEligibleRows]
  );

  const couponCodesLabel = useMemo(() => {
    const codes = rowsWithCoupon
      .map((r) => r.coupon_code)
      .filter((c): c is string => Boolean(c && String(c).trim()));
    return [...new Set(codes)].join(", ") || "—";
  }, [rowsWithCoupon]);

  const donationRowsFromApi = useMemo(
    () =>
      (pendingPaymentRows ?? []).filter(
        (r) => r.payment_type === "Donation Payment"
      ),
    [pendingPaymentRows]
  );

  const computedDonationFromApi = useMemo(
    () =>
      donationRowsFromApi.reduce(
        (s, r) => s + parseRsAmount(r.payment_amount),
        0
      ),
    [donationRowsFromApi]
  );

  /** Sum all donation lines when billing rows are present; else fallback prop (other pages). */
  const existingDonationAmount =
    donationRowsFromApi.length > 0
      ? computedDonationFromApi
      : (existingDonation ?? 0);

  const hasPendingDonationLines = donationRowsFromApi.length > 0;

  // Any new donations added in this sidebar session
  const newDonationsTotal = rightSidebarEntries.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // Total of items without donations
  const priceAmount = rowTotal - existingDonationAmount;

  // Total donations including existing + new
  const donationAmount = existingDonationAmount + newDonationsTotal;

  // Grand total
  const totalAmount = rowTotal + newDonationsTotal;

  const handleDonationDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}student/make-donation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 0 }),
      });

      const data = await res.json();
      const ok = res.ok && data.success !== false;

      if (ok) {
        setRightSidebarEntries([]);
        await onBillingTotalsRefresh?.();
        setDonationRowMessage(
          data.message || "Donation removed from pending payments."
        );
      } else {
        setDonationRowMessage(
          data.message || "Failed to remove donation. Try again."
        );
      }
    } catch {
      setDonationRowMessage("Network error while removing donation");
    } finally {
      setLoading(false);
      setTimeout(() => setDonationRowMessage(null), 4000);
    }
  };
  const handleDonationSubmit = async () => {
    let amount: number;

    if (donationRadio === "other") {
      const parsed = parseInt(donationInput);
      if (isNaN(parsed) || parsed <= 0) {
        setDonationBoxMessage("Please enter a valid amount in Rs.");
        setTimeout(() => setDonationBoxMessage(null), 3000);
        return;
      }
      amount = parsed;
    } else {
      amount = parseInt(donationRadio);
      if (isNaN(amount) || amount <= 0) return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}student/make-donation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      const ok = res.ok && data.success !== false;

      if (ok) {
        setDonationBoxMessage(data.message || "Donation successful!");
        setRightSidebarEntries([]);
        setDonationInput("");
        setDonationRadio("");
        await onBillingTotalsRefresh?.();
      } else {
        setDonationBoxMessage(data.message || "Donation failed");
      }
    } catch {
      setDonationBoxMessage("Donation failed due to network error.");
    } finally {
      setLoading(false);
      setTimeout(() => setDonationBoxMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (paymentConfirm === true) {
      setStep("success");
    } else {
      setStep("checkout");
    }
  }, [paymentConfirm]);

  if (!isOpen) {
    return null;
  }

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponNotice({ text: "Enter coupon code.", ok: false });
      setTimeout(() => setCouponNotice(null), 4000);
      return;
    }
    if (couponTargetId == null) {
      setCouponNotice({ text: "No eligible line for this coupon.", ok: false });
      setTimeout(() => setCouponNotice(null), 4000);
      return;
    }
    setCouponLoading(true);
    setCouponNotice(null);
    try {
      const res = await fetch(`${baseUrl}student/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coupon_code: code,
          id: Number(couponTargetId),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setCouponNotice({
          text: result.message || "Coupon applied.",
          ok: true,
        });
        await onBillingTotalsRefresh?.();
      } else {
        setCouponNotice({
          text: result.message || "Could not apply coupon. Try again.",
          ok: false,
        });
      }
    } catch {
      setCouponNotice({
        text: "Network error while applying coupon.",
        ok: false,
      });
    } finally {
      setCouponLoading(false);
      setTimeout(() => setCouponNotice(null), 5000);
    }
  };

  const handleRemoveCoupon = async (cartId: string | number) => {
    if (!onBillingTotalsRefresh) return;
    setRemoveCouponLoadingId(cartId);
    setCouponNotice(null);
    try {
      const res = await fetch(`${baseUrl}student/remove-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: Number(cartId) }),
      });
      const result = await res.json();
      if (result.success) {
        await onBillingTotalsRefresh();
        setCouponNotice({
          text: result.message || "Coupon removed.",
          ok: true,
        });
      } else {
        setCouponNotice({
          text: result.message || "Could not remove coupon.",
          ok: false,
        });
      }
    } catch {
      setCouponNotice({
        text: "Network error while removing coupon.",
        ok: false,
      });
    } finally {
      setRemoveCouponLoadingId(null);
      setTimeout(() => setCouponNotice(null), 4000);
    }
  };

  const handleContinue = () => {
    try {
      setLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      const formdata = new FormData();
      // formdata.append("payment_id", row.payment_id);
      // formdata.append("payment_type", "2");
      formdata.append("payment_method", paymentMethod);

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      fetch(
        `${baseUrl}student/pending-payment/pay-checkout-all`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result && paymentMethod === "faysal_bank") {
            if (result["frontend_form-action_url"]) {
              setUserId(result["user_id"]);
              setCartId(result["cart_id"]);
              const formData = result["form_required_parameters_values"];
              setFaysalFormData(formData);
              setFaysalFormUrl(result["frontend_form-action_url"]);
              setShowFaysalForm(true);
            } else {
              setMessage(result.message || "Payment processing failed");
            }
            setLoading(false);
          } else if (result && paymentMethod === "meezan_bank") {
            window.location.href = result[0].meezan_payment_flow_redirect_url;
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("❌ API Error:", error);
          console.error("🔍 Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
          setLoading(false);
        });
    } catch (error) {
      console.error("💥 General Error:", error);
      setLoading(false);
    }
  };

  const isFreeCheckout = priceAmount <= 0;

  const handleFreeCheckout = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${baseUrl}student/checkout-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await onBillingTotalsRefresh?.();
        setStep("success");
      } else {
        setMessage(data.message || "Could not complete free checkout.");
      }
    } catch {
      setMessage("Network error during checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDonationRadio("");
    setDonationInput("");
    setDonationRowMessage(null);
    setDonationBoxMessage(null);
    setRightSidebarEntries([]);
    setTotalAmount(rowTotal);
    setCouponCode("");
    setCouponNotice(null);

    setStep("checkout");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 h-full" />
      <div className="fixed top-0 right-0 w-full sm:w-[28rem] h-full bg-white shadow-lg z-50 p-4 sm:p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold">
            {step === "checkout" ? "Checkout" : "Payment Confirmation"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {step === "checkout" && row != null && (
            <>
              <div className="flex flex-col text-sm font-medium space-y-1.5 mb-4">
                {itemsPricing.hasDiscount ? (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-700">Total</span>
                      <span>Rs {itemsPricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-green-700">
                      <span>
                        Discount ({couponCodesLabel})
                      </span>
                      <span>- Rs {itemsPricing.discount}</span>
                    </div>
                    {onBillingTotalsRefresh &&
                      rowsWithCoupon.map((r) => (
                        <div
                          key={String(r.payment_id)}
                          className="flex justify-between items-center gap-2 text-xs text-gray-600 pl-0.5"
                        >
                          <span className="truncate">
                            {r.coupon_code
                              ? `${r.coupon_code}${r.payment_course_name ? ` · ${r.payment_course_name}` : ""}`
                              : `Line #${r.payment_id}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoupon(r.payment_id)}
                            disabled={removeCouponLoadingId != null}
                            className="shrink-0 text-red-600 hover:text-red-800 underline disabled:opacity-50"
                          >
                            {removeCouponLoadingId === r.payment_id ? (
                              <Loader2 className="inline size-3 animate-spin" />
                            ) : (
                              "Remove"
                            )}
                          </button>
                        </div>
                      ))}
                    <div className="flex justify-between gap-2 pt-1 border-t border-gray-100">
                      <span className="font-medium">Payable</span>
                      <span className="font-medium">Rs {priceAmount}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-700">Price</span>
                    <span>Rs {priceAmount}</span>
                  </div>
                )}

                {(donationAmount > 0 || hasPendingDonationLines) && (
                  <div className="flex justify-between items-center gap-2">
                    <span>
                      Donation: Rs {donationAmount}
                      {hasPendingDonationLines && donationRowsFromApi.length > 1
                        ? ` (${donationRowsFromApi.length} entries)`
                        : ""}
                    </span>
                    {onBillingTotalsRefresh ? (
                      <button
                        type="button"
                        onClick={handleDonationDelete}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 ml-2 flex items-center gap-1 shrink-0 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs">Remove all</span>
                      </button>
                    ) : null}
                  </div>
                )}

                <div className="flex justify-between gap-2 pt-1 font-semibold border-t border-gray-200">
                  <span>Total</span>
                  <span>Rs {totalAmount}</span>
                </div>
              </div>

              {couponNotice && (
                <p
                  className={`text-xs mb-3 ${
                    couponNotice.ok ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {couponNotice.text}
                </p>
              )}

              {donationRowMessage && (
                <p
                  className={`text-xs ${
                    donationRowMessage.toLowerCase().includes("success")
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {donationRowMessage}
                </p>
              )}

              {showPromoBlock && (
                <div className="border border-gray-200 rounded-lg p-4 mt-4">
                  <h3 className="text-base font-semibold mb-2">Promo code</h3>
                  {couponEligibleRows.length > 1 && (
                    <label className="block text-xs text-gray-600 mb-2">
                      Apply to
                      <select
                        className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                        value={
                          couponTargetId != null
                            ? String(couponTargetId)
                            : ""
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          const n = Number(v);
                          setCouponTargetId(Number.isNaN(n) ? v : n);
                        }}
                      >
                        {couponEligibleRows.map((r) => (
                          <option
                            key={String(r.payment_id)}
                            value={String(r.payment_id)}
                          >
                            {r.payment_course_name?.trim()
                              ? r.payment_course_name
                              : `Order #${r.payment_id}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="shrink-0 bg-[#013370] text-white text-xs px-3 py-2 rounded hover:bg-[#013370]/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[4.5rem]"
                    >
                      {couponLoading ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isFreeCheckout && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-green-800">
                    Your coupon covers the full amount. No payment required!
                  </p>
                </div>
              )}

              {!isFreeCheckout && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4 mt-4">
                    <h3 className="text-base lg:text-lg font-semibold mb-2">
                      Make a Donation
                    </h3>
                    <p className="text-sm sm:text-lg sm:leading-snug text-gray-600 mb-3">
                      Support our community initiatives by contributing a donation
                      in Rs.
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm lg:text-lg">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="donation"
                          value="25"
                          checked={donationRadio === "25"}
                          onChange={() => {
                            setDonationRadio("25");
                            setDonationInput("");
                            setDonationRowMessage(null);
                            setDonationBoxMessage(null);
                            setRightSidebarEntries([]);
                            setTotalAmount(rowTotal);
                          }}
                        />
                        Rs 25
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="donation"
                          value="50"
                          checked={donationRadio === "50"}
                          onChange={() => {
                            setDonationRadio("50");
                            setDonationInput("");
                            setDonationRowMessage(null);
                            setDonationBoxMessage(null);
                            setRightSidebarEntries([]);
                            setTotalAmount(rowTotal);
                          }}
                        />
                        Rs 50
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="donation"
                          value="100"
                          checked={donationRadio === "100"}
                          onChange={() => {
                            setDonationRadio("100");
                            setDonationInput("");
                            setDonationRowMessage(null);
                            setDonationBoxMessage(null);
                            setRightSidebarEntries([]);
                            setTotalAmount(rowTotal);
                          }}
                        />
                        Rs 100
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="donation"
                          value="other"
                          checked={donationRadio === "other"}
                          onChange={() => {
                            setDonationRadio("other");
                            setDonationInput("");
                            setDonationRowMessage(null);
                            setDonationBoxMessage(null);
                            setRightSidebarEntries([]);
                            setTotalAmount(rowTotal);
                          }}
                        />
                        Other
                        <input
                          type="text"
                          className="border border-gray-300 rounded p-1 w-20 text-xs"
                          placeholder="Rs"
                          value={donationInput}
                          onChange={(e) => setDonationInput(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="flex mt-4 lg:mt-8 justify-end">
                      <button
                        onClick={handleDonationSubmit}
                        disabled={loading}
                        className="bg-[#013370] text-white text-xs sm:text-sm px-3 py-2 rounded hover:bg-[#013370]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Make a Donation"
                        )}
                      </button>
                    </div>
                    {donationBoxMessage && (
                      <p className="text-xs text-green-700 mt-2">
                        {donationBoxMessage}
                      </p>
                    )}
                  </div>

                  <BillingDetails paymentMethod={(m) => setPaymentMethod(m)} />
                </>
              )}
            </>
          )}

          {showFaysalForm && faysalFormData && faysalFormUrl && (
            <form
              action={faysalFormUrl}
              method="POST"
              className="mt-6"
              id="faysalPaymentForm"
              ref={(formEl) => {
                if (formEl) {
                  setTimeout(() => formEl.submit());
                }
              }}
            >
              {Object.entries(faysalFormData).map(([key, value]) => (
                <input
                  key={key}
                  hidden
                  name={key}
                  value={
                    key === "SUCCESS_URL"
                      ? `${window.location.origin}/billing/faisal-payment-confirmation/${userId}/${cartId}/success`
                      : key === "FAILURE_URL"
                        ? `${window.location.origin}/billing/faisal-payment-confirmation/${userId}/${cartId}/failed`
                        : key === "CANCEL_URL"
                          ? `${window.location.origin}/billing/faisal-payment-confirmation/${userId}/${cartId}/failed`
                          : (value as string)
                  }
                />
              ))}
            </form>
          )}

          {message && (
            <p className="text-xs sm:text-sm text-red-700">{message}</p>
          )}

          {step === "success" && paymentConfirm === true && (
            <div className="mb-4">
              <PaymentSuccess
                paymentBank={paymentBank}
                faisalData={faisalData}
                apiMessage={apiMessage}
              />
            </div>
          )}

          {step === "success" && !paymentConfirm && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500 text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 className="text-xl font-bold text-black">Order Completed</h2>
              <p className="text-gray-600 text-sm mt-2">
                Your coupon has been applied and you are now enrolled. No payment was required.
              </p>
              <button
                onClick={handleCancel}
                className="mt-6 bg-[#013370] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#013370]/90"
              >
                Close
              </button>
            </div>
          )}

          {step === "checkout" && isFreeCheckout && row != null && (
            <div className="flex justify-start gap-2 mt-6 sm:mt-8">
              <button
                onClick={handleFreeCheckout}
                className="bg-[#013370] text-sm sm:text-lg inline-flex items-center cursor-pointer justify-center text-white px-3 py-2 rounded-lg hover:bg-[#013370]/90 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Complete Order"}
              </button>
            </div>
          )}

          {step === "checkout" && !isFreeCheckout && paymentMethod && !showFaysalForm && (
            <div className="flex justify-start gap-2 mt-6 sm:mt-8">
              <button
                onClick={handleContinue}
                className="bg-[#013370] text-sm sm:text-lg inline-flex items-center cursor-pointer justify-center text-white px-3 py-2 rounded-lg hover:bg-[#013370]/90 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
