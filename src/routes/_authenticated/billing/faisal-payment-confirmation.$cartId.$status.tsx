import payment from "@/assets/payment.svg";
import { createFileRoute, useMatchRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/billing/faisal-payment-confirmation/$cartId/$status"
)({
  component: PaymentSuccess,
});

interface PaymentSuccessProps {
  faisalData?: any;
  paymentBank?: string;
  apiMessage?: any;
}

function PaymentSuccess({
  faisalData,
  paymentBank,
  apiMessage,
}: PaymentSuccessProps) {
  const matchRoute = useMatchRoute();

  // matchRoute uses path-style ids (no _authenticated prefix)
  const isFaisalRoute = matchRoute({
    to: "/billing/faisal-payment-confirmation/$cartId/$status",
    fuzzy: false,
  });

  const isMeezanRoute = matchRoute({
    to: "/billing/payment-confirmation/$orderId",
    fuzzy: false,
  });

  // ----------------------------------------------------
  // Use correct route params for each bank
  // ----------------------------------------------------
  const faisalParams = isFaisalRoute
    ? useParams({
        from: "/_authenticated/billing/faisal-payment-confirmation/$cartId/$status",
      })
    : null;

  const meezanParams = isMeezanRoute
    ? useParams({
        from: "/_authenticated/billing/payment-confirmation/$orderId",
      })
    : null;

  // ----------------------------------------------------
  // Extract Params – Faisal: cartId + status; Meezan: orderId
  // ----------------------------------------------------
  const cartId = faisalParams?.cartId ?? "";
  const status = faisalParams?.status ?? "";
  const _orderId = meezanParams?.orderId ?? "";

  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [result, setResult] = useState<any>(null);

  // ----------------------------------------------------
  // 🔥 Payment Status Logic
  // ----------------------------------------------------
  useEffect(() => {
    if (paymentBank === "faysal" && faisalData) {
      if (faisalData.status === true) {
        setConfirmationMessage(faisalData.message);
        setPaymentStatus(true);
        setResult(faisalData.data);
      } else {
        setConfirmationMessage(faisalData.message || faisalData.errMsg);
        setPaymentStatus(false);
      }
    }

    if (paymentBank === "meezan" && apiMessage) {
      setConfirmationMessage(apiMessage?.message);
      setPaymentStatus(apiMessage?.status);
      setResult(apiMessage?.data);
    }
  }, [cartId, status, _orderId, paymentBank, faisalData, apiMessage]);

  return (
    <div className="text-sm text-gray-700 w-full">
      {/* -------------------------------------- */}
      {/* PAYMENT STATUS UI */}
      {/* -------------------------------------- */}
      {paymentStatus ? (
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src={payment} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-black">Payment Successful</h2>
          <div
            className="px-4 py-2 rounded-md mt-5 bg-green-200 text-green-600"
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
      ) : (
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <img src={payment} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-black">Payment Failed</h2>
          <p className="text-gray-600 text-sm">{confirmationMessage}</p>
        </div>
      )}

      {/* -------------------------------------- */}
      {/* PAYMENT DETAILS */}
      {/* -------------------------------------- */}
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
                    ? "Faysal Bank"
                    : "Meezan Bank"}
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Recipient Name</p>
                <p className="text-black">{localStorage.getItem("user_name")}</p>
              </div>

              <div className="w-1/2">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-black">{localStorage.getItem("user_email")}</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <div className="w-1/2">
                <p className="text-xs text-gray-400">Phone Number</p>
                <p className="text-black">{localStorage.getItem("user_phone")}</p>
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

export default PaymentSuccess;
