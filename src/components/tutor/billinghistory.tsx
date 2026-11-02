import { useState, useEffect } from "react";
import CheckoutSidebar from "@/components/common/CheckoutSidebar"; // Ensure you import this component
import { baseUrl } from "@/config/authConfig"; // Ensure auth key is properly imported
import { useAuth } from "@/api/useAuth";
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
  // const [selectedRow, setSelectedRow] = useState<any>(null);
  const [billingHistoryData, setBillingHistoryData] = useState<any[]>([]);
  const { token } = useAuth();
  // Fetch billing history data from the API
  useEffect(() => {
    const fetchBillingHistory = async () => {
      try {
        const response = await fetch(`${baseUrl}student/billing-history`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add your authorization token
          },
        });
        const data = await response.json();
        // Map data to match the UI requirements
        const formattedData = data.billing_history.map((item: any) => ({
          courseName: item.course_name,
          amount: `Rs ${item.grand_total}`,
          issueDate: item.issue_date,
          status: getStatusText(item.payment_status), // Map payment_status to UI status
        }));
        setBillingHistoryData(formattedData); // Set the formatted data to state
      } catch (error) {
        console.error("Error fetching billing history:", error);
      }
    };

    fetchBillingHistory();
  }, []);

  // Handle badge click for checkout
  const handleBadgeClick = (row: any) => {
    if (row.status === "Checkout") {
      // setSelectedRow(row);//
      setSidebarOpen(true); // Open the sidebar if the status is 'Checkout'
    }
  };

  return (
    <div className="flex flex-col gap-3 h-[12rem] overflow-y-auto">
      <div className="overflow-x-auto max-h-[12rem]">
        <div className="overflow-x-scroll">
          <table className="w-full text-xs bg-white border-collapse rounded-lg">
            <thead className="text-left text-muted-foreground">
              <tr>
                {["Course Name", "Amount", "Issue Date", "Action"].map(
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
                  <td className="px-4 py-4 max-w-[15rem] truncate flex items-center">
                    <span className="line-clamp-1">{row.courseName}</span>
                  </td>
                  <td className="px-4 py-4">{row.amount}</td>
                  <td className="px-4 py-4">{row.issueDate}</td>
                  <td className="px-4 py-4">
                    <span
                      onClick={() => handleBadgeClick(row)}
                      className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer ${
                        row.status === "Paid"
                          ? "text-green-600 bg-green-100"
                          : row.status === "Overdue"
                            ? "text-red-600 bg-red-100"
                            : row.status === "Checkout"
                              ? "text-blue-800 bg-blue-100"
                              : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <CheckoutSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}

export default BillingHistory;
