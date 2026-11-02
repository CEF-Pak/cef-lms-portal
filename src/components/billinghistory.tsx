import { useState, useEffect } from "react";
import CheckoutSidebar from "@/components/common/CheckoutSidebar"; // Ensure you import this component
import { baseUrl } from "@/config/authConfig"; // Ensure auth key is properly imported
import { useAuth } from "@/api/useAuth";
import BillingHistorySkeleton from "./billinghistory-skeleton";

interface BillingHistoryItem {
  payment_id: string;
  courseName: string;
  paymentType: string;
  amount: string;
  issueDate: string;
  status: string;
}

interface ApiBillingHistoryItem {
  payment_id: string;
  course_name: string;
  grand_total: number;
  issue_date: string;
  payment_status: string;
  payment_type: string;
}

// Status mapping for payment_status from the API
const getStatusText = (paymentStatus: string) => {
  switch (paymentStatus) {
    case "free":
      return "Free";
    case "due":
      return "Checkout";
    case "paid":
      return "Paid";
    case "overdue":
      return "Overdue";
    default:
      return "Unknown";
  }
};

function BillingHistory() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [billingHistoryData, setBillingHistoryData] = useState<
    BillingHistoryItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const { token } = useAuth();
  // Fetch billing history data from the API
  useEffect(() => {
    const fetchBillingHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}student/billing-history`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTotalAmount(data.total_amount);

        // Map data to match the UI requirements
        const formattedData = data.billing_history.map(
          (item: ApiBillingHistoryItem) => ({
            payment_id: item.payment_id,
            courseName: item.course_name,
            paymentType: item.payment_type,

            amount: `Rs ${item.grand_total}`,
            issueDate: item.issue_date,
            status: getStatusText(item.payment_status), // Map payment_status to UI status
          })
        );

        setBillingHistoryData(formattedData); // Set the formatted data to state
      } catch (error) {
        console.error("Error fetching billing history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingHistory();
  }, [token]);

  if (isLoading) {
    return <BillingHistorySkeleton />;
  }

  // Handle empty billing history data
  if (billingHistoryData.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No billing history found.
      </div>
    );
  }
  // Helper function to get donation amount
  const getDonationAmount = (): number => {
    const donationRow = billingHistoryData.find(
      (item) => item.paymentType === "Donation Payment"
    );
    if (donationRow) {
      return parseFloat(donationRow.amount.replace("Rs ", ""));
    }
    return 0;
  };

  return (
    <div className="flex flex-col gap-3 h-[12rem] overflow-y-auto">
      {/* Primary container for horizontal scrolling */}
      <div className="overflow-x-auto max-h-[12rem]">
        {/* Remove the redundant `overflow-x-scroll` div here. `overflow-x-auto` is sufficient on the parent. */}
        <table className="w-full text-xs bg-white border-collapse rounded-lg">
          <thead className="text-left text-muted-foreground sticky top-0 bg-white z-10">
            <tr>
              {["Name", "Payment Type", "Amount", "Issue Date", "Action"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {billingHistoryData.map((row, idx) => (
              <tr key={idx} className="bg-white border-b border-gray-200">
                {/* Max-width and truncate for Course Name to avoid excessive width */}
                <td className="px-4 py-4 max-w-[15rem] truncate">
                  <span className="line-clamp-1">{row.courseName}</span>
                </td>
                <td className="px-4 py-4">{row.paymentType}</td>

                <td className="px-4 py-4">{row.amount}</td>
                <td className="px-4 py-4">{row.issueDate}</td>
                {/* Add whitespace-nowrap to the Action column's td to keep content in one line */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium px-3 py-1 rounded-full text-gray-600 bg-gray-100">
                    Due
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-4 sm:gap-6 2yxl:gap-8 items-center px-4 py-3 bg-white rounded">
        <span className="font-medium text-sm">Total: Rs {totalAmount}</span>

        <button
          onClick={() => setSidebarOpen(true)}
          className="text-xs font-medium px-4 py-2 rounded-full cursor-pointer text-blue-800 bg-blue-100"
        >
          Checkout
        </button>
      </div>

      {/* Checkout Sidebar */}
      <CheckoutSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        row={totalAmount}
        existingDonation={getDonationAmount()}
      />
    </div>
  );
}

export default BillingHistory;
