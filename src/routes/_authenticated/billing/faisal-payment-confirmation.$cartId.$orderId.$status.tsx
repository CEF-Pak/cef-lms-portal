import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CheckoutSidebar from "@/components/common/CheckoutSidebar";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";

export const Route = createFileRoute(
  "/_authenticated/billing/faisal-payment-confirmation/$cartId/$orderId/$status"
)({
  component: PaymentConfirmation,
});

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
  const [faisalData, setFaisalData] = useState<any>(null);
  const [confirmDone, setConfirmDone] = useState(false);
  const { token } = useAuth();

  const { cartId, orderId, status } = useParams({
    from: "/_authenticated/billing/faisal-payment-confirmation/$cartId/$orderId/$status",
  });

  const query = useSearch({
    from: "/_authenticated/billing/faisal-payment-confirmation/$cartId/$orderId/$status",
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

  useEffect(() => {
    if (!cartId || !orderId) return;

    const run = async () => {
      setSidebarOpen(true);
      setPaymentConfirm(true);
      setConfirmDone(false);

      const params = new URLSearchParams({
        ...query,
      } as Record<string, string>).toString();

      try {
        if (status === "success") {
          const fullUrl = `${baseUrl}student/successful_faysal_api_all/${orderId}?${params}`;
          const res = await fetch(fullUrl, {
            method: "GET",
            redirect: "follow",
          });
          const result = await res.json();
          setFaisalData(result);
          if (result?.status) {
            setBillingData([]);
          }
          await loadPendingPayments();
        } else if (status === "failed") {
          const fullUrl = `${baseUrl}student/failure_faysal_api_all?${params}`;
          const res = await fetch(fullUrl, {
            method: "GET",
            redirect: "follow",
          });
          const result = await res.json();
          setFaisalData(result);
          await loadPendingPayments();
        }
      } catch (err) {
        console.error("❌ Error verifying Faisal payment:", err);
        await loadPendingPayments();
      } finally {
        setConfirmDone(true);
      }
    };

    run();
  }, [cartId, orderId, status, query, loadPendingPayments]);

  if (!cartId || !orderId) {
    return <div>Loading...</div>;
  }

  const paymentSucceeded = faisalData?.status === true;

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
        faisalData={faisalData}
        paymentBank="faysal"
      />
    </div>
  );
}
