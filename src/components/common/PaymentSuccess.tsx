import payment from "@/assets/payment.svg";
import { useMatchRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/api/useAuth";

interface PaymentSuccessProps {
  faisalData?: any;
  paymentBank?: string;
  apiMessage?: any;
}

export default function PaymentSuccess({
  faisalData,
  paymentBank,
  apiMessage,
}: PaymentSuccessProps) {
  const matchRoute = useMatchRoute();

  // Check which route we're currently on
  const isFaisalRoute = matchRoute({
    to: "/billing/faisal-payment-confirmation/$cartId/$orderId/$status",
    fuzzy: false,
  });

  const isMeezanRoute = matchRoute({
    to: "/billing/payment-confirmation/$orderId",
    fuzzy: false,
  });

  // Only call useParams() for the matching route to avoid errors
  const faisalParams = isFaisalRoute
    ? useParams({
        from: "/_authenticated/billing/faisal-payment-confirmation/$cartId/$orderId/$status",
      })
    : null;

  const meezanParams = isMeezanRoute
    ? useParams({
        from: "/_authenticated/billing/payment-confirmation/$orderId",
      })
    : null;

  // Pick values depending on the matched route
  const cartId = faisalParams?.cartId ?? "";
  const orderId = faisalParams?.orderId ?? meezanParams?.orderId ?? "";
  const status = faisalParams?.status ?? null;
  const hasRouteContext =
    (paymentBank === "faysal" && Boolean(cartId && orderId)) ||
    (paymentBank === "meezan" && Boolean(orderId || meezanParams?.orderId));

  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [result, setResult] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!hasRouteContext) return;

    if (paymentBank === "faysal" && faisalData) {
      if (faisalData.status === true) {
        setConfirmationMessage(faisalData.message);
        setPaymentStatus(true);
        setResult(faisalData.data);
      } else if (faisalData.status === false) {
        const message = faisalData.message
          ? faisalData.message
          : faisalData.errMsg;
        setConfirmationMessage(message);
        setPaymentStatus(false);
      }
    } else if (paymentBank === "meezan" && apiMessage) {
      if (apiMessage.status === true) {
        setConfirmationMessage(apiMessage?.message ?? "");
        setResult(apiMessage?.data);
        setPaymentStatus(true);
      } else {
        setConfirmationMessage(
          apiMessage?.message ?? "Payment could not be confirmed."
        );
        setPaymentStatus(false);
      }
    }
  }, [
    hasRouteContext,
    cartId,
    orderId,
    status,
    token,
    paymentBank,
    apiMessage,
    faisalData,
  ]);

  return (
    <div className="text-sm text-gray-700 w-full">
      {/* Show dynamic message if provided via apiMessage */}
      {paymentStatus ? (
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src={payment} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-black">
            {paymentStatus === true ? "Payment Successful" : "Payment Failed"}
          </h2>
          <div
            className={`px-4 py-2 rounded-md mt-5 ${
              paymentStatus === true
                ? "bg-green-200 text-green-600"
                : "bg-red-200 text-red-600"
            }`}
            dangerouslySetInnerHTML={{ __html: confirmationMessage }}
          />
        </div>
      ) : paymentStatus === null ? (
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src={payment} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-black">Processing Payment</h2>
          <p className="text-gray-600 text-sm">
            Please wait while we confirm your payment...
          </p>
        </div>
      ) : paymentStatus === false ? (
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src={payment} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-black">Payment Failed</h2>
          <p className="text-gray-600 text-sm">{confirmationMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src={payment} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-black">Payment Successful</h2>
          <p className="text-gray-600 text-sm">{confirmationMessage}</p>
        </div>
      )}

      {result && (
        <>
          <h3 className="text-base font-semibold text-black mb-4">
            Payment Details
          </h3>

          <div className="space-y-4">
            {/* Row 1 */}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Transaction ID</p>
                <p className="text-black">
                  {paymentBank === "faysal"
                    ? result.faysal_transaction_id
                    : result.meezan_transaction_id}
                </p>
              </div>
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Payment Method</p>
                <p className="text-black">
                  {paymentBank === "faysal"
                    ? result.payment_method === "faysal_bank"
                      ? "Faysal Bank"
                      : "N/A"
                    : result.payment_method === "meezan_bank"
                      ? "Meezan Bank"
                      : "N/A"}
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Recipient Name</p>
                <p className="text-black">
                  {localStorage.getItem("user_name")}
                </p>
              </div>
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-black">
                  {localStorage.getItem("user_email")}
                </p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Phone Number</p>
                <p className="text-black">
                  {localStorage.getItem("user_phone")}
                </p>
              </div>
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Amount Paid</p>
                <p className="text-black">
                  {result.grand_total}&nbsp;{result.payment_currency}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
