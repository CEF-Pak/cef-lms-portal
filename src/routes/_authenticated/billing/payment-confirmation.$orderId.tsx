import { createFileRoute, useParams } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CheckoutSidebar from "@/components/common/CheckoutSidebar";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

export const Route = createFileRoute(
  "/_authenticated/billing/payment-confirmation/$orderId"
)({
  component: PaymentConfirmation,
});

/** pending-payments returns line rows + a trailing { total_amount } footer — never treat footer as a cart row. */
function parsePendingPayments(data: unknown): any[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const last = data[data.length - 1];
  if (
    last &&
    typeof last === "object" &&
    "total_amount" in last &&
    !("payment_id" in last)
  ) {
    return data.slice(0, -1);
  }
  return data.filter(
    (row) => row && typeof row === "object" && "payment_id" in row
  );
}

function PaymentConfirmation() {
  const [billingData, setBillingData] = useState<any[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [paymentConfirm, setPaymentConfirm] = useState(false);
  const [apiMessage, setApiMessage] = useState<any>(null);
  const [confirmDone, setConfirmDone] = useState(false);

  const { token } = useAuth();
  const { orderId } = useParams({
    from: "/_authenticated/billing/payment-confirmation/$orderId",
  });

  const loadPendingPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}student/pending-payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBillingData(parsePendingPayments(data));
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    }
  }, [token]);

  // Confirm Meezan payment first, then refresh cart list so paid carts are gone
  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId || !token) return;

      setSidebarOpen(true);
      setPaymentConfirm(true);
      setConfirmDone(false);

      try {
        const response = await fetch(
          `${baseUrl}student/successful_meezan_api_all`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ order_id: orderId }),
          }
        );

        const result = await response.json();
        setApiMessage(result);

        if (response.ok && result.status) {
          // Paid carts are deleted server-side — show empty pending list
          setBillingData([]);
          await loadPendingPayments();
        } else {
          console.error("Failed to confirm payment:", result);
          await loadPendingPayments();
        }
      } catch (error) {
        setApiMessage({
          status: false,
          message: "Error confirming payment. Please refresh Billing.",
        });
        console.error("Error confirming payment:", error);
        await loadPendingPayments();
      } finally {
        setConfirmDone(true);
      }
    };

    confirmPayment();
  }, [orderId, token, loadPendingPayments]);

  if (!orderId) {
    return <div>Loading...</div>;
  }

  const paymentSucceeded = apiMessage?.status === true;

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6 container mx-auto">
      <h1 className="text-2xl font-bold">Billing</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
          <thead className="text-left text-muted-foreground">
            <tr>
              {[
                "Order ID",
                "Name",
                "User Name",
                "Payment Type",
                "Amount",
                "Issue Date",
                "Issue Month",
                "Actions",
              ].map((header) => {
                const isArrow = header !== "Actions";
                return (
                  <th
                    key={header}
                    className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      {isArrow && (
                        <ArrowDown className="size-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!confirmDone ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  Confirming payment…
                </td>
              </tr>
            ) : paymentSucceeded || billingData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  {paymentSucceeded
                    ? "Payment completed. No pending payments."
                    : "No pending payments found."}
                </td>
              </tr>
            ) : (
              billingData.map((row) => (
                <tr
                  key={String(row.payment_id)}
                  className="bg-white border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.payment_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.payment_course_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.payment_user_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.payment_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.payment_amount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.issue_date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.issue_month}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium px-3 py-1 rounded-full text-gray-600 bg-gray-100">
                      Due
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <CheckoutSidebar
        isOpen={isSidebarOpen}
        row={null}
        onClose={() => setSidebarOpen(false)}
        paymentConfirm={paymentConfirm}
        paymentBank="meezan"
        apiMessage={apiMessage}
      />
    </div>
  );
}
