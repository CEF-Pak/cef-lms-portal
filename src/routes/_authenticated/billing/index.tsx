import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CheckoutSidebar from "@/components/common/CheckoutSidebar";
import { baseUrl } from "@/config/authConfig";
import { useAuth } from "@/api/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface BillingEntry {
  payment_id: string;
  payment_course_name: string;
  payment_user_name: string;
  payment_type: string;
  payment_amount: string;
  issue_date: string;
  issue_month: string;
  status?: string;
  on_action_btn_api_route?: string;
  discount_amount?: number;
  coupon_code?: string | null;
  line_subtotal?: number;
}

export const Route = createFileRoute("/_authenticated/billing/")({
  component: BillingPage,
});

const BillingTableSkeleton = () => {
  return (
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
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
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-24" />
                  {header !== "Actions" && (
                    <ArrowDown className="size-4 text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
};

function BillingPage() {
  const [billingData, setBillingData] = useState<BillingEntry[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [existingDonation, setExistingDonation] = useState(0);
  const [removingDonationId, setRemovingDonationId] = useState<
    string | number | null
  >(null);

  const { token } = useAuth();

  const loadBilling = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent === true;
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(`${baseUrl}student/pending-payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch billing data");
        }

        const data: any[] = await res.json();

        const list = data.slice(0, -1);
        const last = data[data.length - 1];
        const total = last?.total_amount || 0;

        const donationAmount = list
          .filter((item: any) => item?.payment_type === "Donation Payment")
          .reduce((sum: number, item: any) => {
            const n = Number(
              String(item.payment_amount).replace(/Rs/g, "").trim()
            );
            return sum + (Number.isFinite(n) ? n : 0);
          }, 0);

        setBillingData(list);
        setTotalAmount(total);
        setExistingDonation(donationAmount);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
        if (!silent) {
          setError("Could not load billing information.");
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [token]
  );

  const handleRemoveDonationLine = async (paymentId: string | number) => {
    setRemovingDonationId(paymentId);
    try {
      const res = await fetch(`${baseUrl}student/delete-donation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart_id: Number(paymentId) }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        await loadBilling({ silent: true });
      }
    } catch (e) {
      console.error("Failed to remove donation line:", e);
    } finally {
      setRemovingDonationId(null);
    }
  };

  // When arriving with #checkout=1 (e.g. after signup from academy), open the checkout sidebar
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);
    if (params.get("checkout") === "1") {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 container mx-auto">
        <h1 className="text-2xl font-bold">Billing</h1>
        <BillingTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 container mx-auto">
        <h1 className="text-2xl font-bold">Billing</h1>
        <div className="p-4 text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (billingData.length === 0) {
    return (
      <div className="p-6 space-y-6 container mx-auto">
        <h1 className="text-2xl font-bold">Billing</h1>
        <div className="p-4 text-center text-gray-500 text-sm">
          No pending payments found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6 container mx-auto">
      <h1 className="text-2xl font-bold">Billing</h1>

      <div className="overflow-x-auto border-0 rounded-lg">
        <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
          <thead className="text-left text-muted-foreground">
            <tr>
              {[
                "Order ID",
                "Course Name",
                "User Name",
                "Payment Type",
                "Amount",
                "Issue Date",
                "Issue Month",
                "Actions",
              ].map((header) => {
                const isSortable = header !== "Actions";
                return (
                  <th
                    key={header}
                    className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      {isSortable && (
                        <ArrowDown className="size-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {billingData.map((row, idx) => (
              <tr
                key={idx}
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
                  {row.payment_type === "Donation Payment" ? (
                    <button
                      type="button"
                      disabled={removingDonationId != null}
                      onClick={() =>
                        handleRemoveDonationLine(row.payment_id)
                      }
                      className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                    >
                      {removingDonationId === row.payment_id
                        ? "Removing…"
                        : "Remove"}
                    </button>
                  ) : (
                    <span className="text-sm font-medium px-3 py-1 rounded-full text-gray-600 bg-gray-100">
                      Due
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4 -mt-4 sm:gap-6 xl:gap-8 items-center px-4 py-3 rounded">
        <span className="font-medium text-sm">Total: Rs {totalAmount}</span>

        <button
          onClick={() => setSidebarOpen(true)}
          className="text-xs font-medium px-4 py-2 rounded-full cursor-pointer text-blue-800 bg-blue-100"
        >
          Checkout
        </button>
      </div>

      <CheckoutSidebar
        isOpen={isSidebarOpen}
        row={totalAmount}
        existingDonation={existingDonation}
        pendingPaymentRows={billingData}
        onBillingTotalsRefresh={() => loadBilling({ silent: true })}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}

export default BillingPage;

// import { createFileRoute } from "@tanstack/react-router";
// import { ArrowDown } from "lucide-react";
// import { useEffect, useState } from "react";
// import CheckoutSidebar from "@/components/common/CheckoutSidebar";
// import { baseUrl } from "@/config/authConfig";
// import { useAuth } from "@/api/useAuth";
// import { Skeleton } from "@/components/ui/skeleton";

// // Define the interface for Billing data rows
// interface BillingEntry {
//   payment_id: string;
//   payment_course_name: string;
//   payment_user_name: string;
//   payment_amount: string;
//   issue_date: string;
//   issue_month: string;
//   status?: string; // Optional, as it's manually added as "Checkout"
//   on_action_btn_api_route?: string; // Optional, for handling the sidebar
// }

// export const Route = createFileRoute("/_authenticated/billing/")({
//   component: BillingPage,
// });

// // Helper for 'Checkout' status styling
// const getCheckoutStatusClasses = (): string => {
//   return "text-sm font-medium px-4 py-2 rounded-full cursor-pointer text-blue-800 bg-blue-100 whitespace-nowrap";
// };

// // Skeleton component for loading state
// const BillingTableSkeleton = () => {
//   return (
//     <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
//       <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
//         <thead className="text-left text-muted-foreground">
//           <tr>
//             {[
//               "Order ID",
//               "Course Name",
//               "User Name",
//               "Amount",
//               "Issue Date",
//               "Issue Month",
//               "Actions",
//             ].map((header) => (
//               <th
//                 key={header}
//                 className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
//               >
//                 <div className="flex items-center gap-1">
//                   <Skeleton className="h-4 w-24" />
//                   {header !== "Actions" && (
//                     <ArrowDown className="size-4 text-gray-400" />
//                   )}
//                 </div>
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {[...Array(5)].map((_, index) => (
//             <tr key={index} className="bg-white border-b border-gray-200">
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-4 w-20" />
//               </td>
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-4 w-40" />
//               </td>
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-4 w-32" />
//               </td>
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-4 w-16" />
//               </td>
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-4 w-24" />
//               </td>
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-4 w-24" />
//               </td>
//               <td className="px-4 py-3 whitespace-nowrap">
//                 <Skeleton className="h-6 w-20 rounded-full" />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// function BillingPage() {
//   const [billingData, setBillingData] = useState<BillingEntry[]>([]);
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState<BillingEntry | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { token } = useAuth();

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`${baseUrl}student/pending-payments`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) {
//           throw new Error("Failed to fetch billing data");
//         }

//         const data: BillingEntry[] = await res.json();
//         setBillingData(data || []);
//       } catch (err) {
//         console.error("Failed to fetch billing data:", err);
//         setError("Could not load billing information.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [token]);

//   const handleBadgeClick = (row: BillingEntry) => {
//     setSelectedRow({ ...row, status: "Checkout" });
//     if (row?.on_action_btn_api_route) {
//       setSidebarOpen(true);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-6 container mx-auto">
//         <h1 className="text-2xl font-bold">Billing</h1>
//         <BillingTableSkeleton />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 space-y-6 container mx-auto">
//         <h1 className="text-2xl font-bold">Billing</h1>
//         <div className="p-4 text-red-600 text-center">{error}</div>
//       </div>
//     );
//   }

//   if (billingData.length === 0) {
//     return (
//       <div className="p-6 space-y-6 container mx-auto">
//         <h1 className="text-2xl font-bold">Billing</h1>
//         <div className="p-4 text-center text-gray-500 text-sm">
//           No pending payments found.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-2 sm:p-4 md:p-6 space-y-6 container mx-auto">
//       <h1 className="text-2xl font-bold">Billing</h1>
//       <div className="overflow-x-auto border-0 rounded-lg">
//         <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
//           <thead className="text-left text-muted-foreground">
//             <tr>
//               {[
//                 "Order ID",
//                 "Course Name",
//                 "User Name",
//                 "Amount",
//                 "Issue Date",
//                 "Issue Month",
//                 "Actions",
//               ].map((header) => {
//                 const isSortable = header !== "Actions";
//                 return (
//                   <th
//                     key={header}
//                     className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
//                   >
//                     <div className="flex items-center gap-1">
//                       {header}
//                       {isSortable && (
//                         <ArrowDown className="size-4 text-gray-400" />
//                       )}
//                     </div>
//                   </th>
//                 );
//               })}
//             </tr>
//           </thead>
//           <tbody>
//             {billingData.map((row, idx) => (
//               <tr
//                 key={idx}
//                 className="bg-white border-b border-gray-200 last:border-b-0"
//               >
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   {row.payment_id}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   {row.payment_course_name}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   {row.payment_user_name}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   {row.payment_amount}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   {row.issue_date}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   {row.issue_month}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap">
//                   <span
//                     onClick={() => handleBadgeClick(row)}
//                     className={getCheckoutStatusClasses()}
//                   >
//                     Checkout
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <CheckoutSidebar
//         isOpen={isSidebarOpen}
//         row={selectedRow}
//         onClose={() => setSidebarOpen(false)}
//       />
//     </div>
//   );
// }
