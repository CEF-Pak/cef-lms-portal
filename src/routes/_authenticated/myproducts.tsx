import { createFileRoute } from "@tanstack/react-router";
import { FaStar } from "react-icons/fa";
import { FileDown, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/api/useAuth";
import { baseUrl } from "@/config/authConfig";

// ✅ Define the type for product data
type ProductRow = {
  order_id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  product_price: string;
  product_quantity: number;
  // Specific literal types for status for better type safety
  payment_status: "Paid" | "Due" | "Refunded" | "Cancelled" | string;
  delivery_status: "Delivered" | "Pending" | "Shipped" | "Cancelled" | string;
  reviews?: { rating: number; text: string };
  invoice_detail_api_route: string;
};

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
};

export const Route = createFileRoute("/_authenticated/myproducts")({
  component: RouteComponent,
});

// Helper for payment status styling
const getPaymentStatusClasses = (
  status: ProductRow["payment_status"]
): string => {
  switch (status) {
    case "Paid":
      return "text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Due":
      return "text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Refunded":
      return "text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Cancelled":
      return "text-red-800 bg-red-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    default:
      return "text-gray-800 bg-gray-200 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
  }
};

// Helper for delivery status styling
const getDeliveryStatusClasses = (
  status: ProductRow["delivery_status"]
): string => {
  switch (status) {
    case "Delivered":
      return "text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Pending":
      return "text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Shipped":
      return "text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Cancelled":
      return "text-red-800 bg-red-100 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    default:
      return "text-gray-800 bg-gray-200 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
  }
};

function ReviewModal({ isOpen, onClose, productId }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleSubmit = () => {
    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const formdata = new FormData();

    formdata.append("product_id", productId);
    formdata.append("rating_sum", rating.toString());
    formdata.append("feedback", feedback);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    fetch(`${baseUrl}student/product/review-create`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setResponse(result.msg);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error submitting review:", error);
        setIsLoading(false); // Ensure loading state is reset on error
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-6">Write a Review</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`w-5 h-5 cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <div className="mb-2">
            <label className="block text-md font-medium mb-2">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 h-28 resize-none focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="Please write your feedback here"
              required
            />
          </div>

          <p className="mb-4 text-xs">{response}</p>

          <div className="flex justify-end gap-2">
            <button
              type="button" // Important: set type="button" to prevent form submission
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80 text-sm cursor-pointer flex items-center justify-center gap-2"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                "SUBMIT REVIEW"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Function to generate invoice HTML content
const generateInvoiceHTML = (result: any) => {
  // Ensure result properties are safely accessed and exist before using them
  const upper = result?.upperSection || {};
  const inner = result?.innerTableSection || {};

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${upper.invoice_number || "N/A"}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .company-info {
          font-size: 14px;
          color: #666;
        }
        .invoice-id {
          text-align: right;
        }
        .invoice-table {
          width: 100%;
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          color: #666;
          padding: 10px;
          background: #8080802b;
        }
        td {
          padding: 15px 0;
          border-top: 1px solid #ddd;
        }
        .amount {
          text-align: right;
        }
        .thank-you {
          text-align: center;
          margin-top: 40px;
        }
        .thank-you p:last-child {
          font-size: 20px;
          margin-top: 10px;
        }
        @media print {
          body {
            padding: 0;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div>
            <h1>Purchase Invoice</h1>
            <div class="company-info">
              <p>${upper.app_name || "N/A"}</p>
              <p>${upper.app_email || "N/A"}</p>
              <p>${upper.app_contact_number || "N/A"}</p>
            </div>
          </div>
          <div class="invoice-id">
            <p style="font-size: 18px; margin-bottom: 5px; margin-top: 40px;">#${upper.invoice_number || "N/A"}</p>
            <p style="font-size: 14px; color: #666; margin: 0;">Purchase Date //</p>
            <p style="font-size: 14px; color: #666; margin: 0;">${upper.purchase_date || "N/A"}</p>
          </div>
        </div>

        <div class="invoice-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Purchase Date</th>
                <th>Payment Method</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${inner.name || "N/A"}</td>
                <td>${inner.purchase_date || "N/A"}</td>
                <td>${inner.payment_method || "N/A"}</td>
                <td class="amount">${inner.amount || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="thank-you">
          <p>We thank you for your business and continued use of CEF Online</p>
          <p>Thank you from CEF Online family</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Skeleton component for loading state
const ProductsTableSkeleton = () => {
  return (
    <div className="overflow-x-auto border-0 p-2 sm:p-4 md:p-6">
      <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
        <thead className="text-left text-muted-foreground">
          <tr>
            {[
              "Order ID",
              "Product Name",
              "Price",
              "Quantity",
              "Payment Status",
              "Delivery Status",
              "Actions",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
              >
                <div className="flex items-center gap-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="bg-white border-b border-gray-200">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mt-1" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function RouteComponent() {
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state for the main component
  const [error, setError] = useState<string | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const AllProducts = async () => {
    // Made async to use try/catch/finally
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      const response = await fetch(
        `${baseUrl}student/product/purchase-list`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Ensure the incoming data structure matches ProductRow or transform it
      // Assuming 'result' is already an array of ProductRow or directly assignable
      // If the API returns 'product' key that holds the array, then use result.product
      setProducts(result || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    AllProducts();
  }, [token]); // Depend on token

  const handleOpenReviewModal = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsReviewModalOpen(true);
  };

  const handleOpenInvoice = (invoice_detail_api_route: string) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    fetch(invoice_detail_api_route, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const invoiceHTML = generateInvoiceHTML(result);
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(invoiceHTML);
          newWindow.document.close();
        }
      })
      .catch((error) => console.error(error));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 container mx-auto">
        <h1 className="text-2xl font-bold">My Products</h1>
        <ProductsTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 container mx-auto">
        <h1 className="text-2xl font-bold">My Products</h1>
        <div className="p-4 text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 space-y-6 container mx-auto">
        <h1 className="text-2xl font-bold">My Products</h1>
        <div className="p-4 text-center text-gray-500 text-sm">
          No products purchased yet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6 container mx-auto">
      <h1 className="text-2xl font-bold">My Products</h1>

      <div className="overflow-x-auto border-0 rounded-lg">
        <table className="w-full text-sm bg-white border-collapse rounded-lg min-w-max">
          <thead className="text-left text-muted-foreground">
            <tr>
              {[
                "Order ID",
                "Product Name",
                "Price",
                "Quantity",
                "Payment Status",
                "Delivery Status",
                "Actions",
              ].map((header) => {
                return (
                  <th
                    key={header}
                    className="px-4 py-2 whitespace-nowrap border-b border-gray-200"
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      {/* Optional: Add ArrowDown for sortable columns if applicable */}
                      {/* {header !== "Actions" && <ArrowDown className="size-4 text-gray-400" />} */}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {products.map((row, idx) => (
              <tr
                key={idx}
                className="bg-white border-b border-gray-200 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap">{row.order_id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>{row.product_name}</div>
                  <div className="text-gray-400 text-xs">
                    {row.product_type}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.product_price}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.product_quantity}
                </td>

                {/* Payment Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={getPaymentStatusClasses(row.payment_status)}>
                    {row.payment_status}
                  </span>
                </td>

                {/* Delivery Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={getDeliveryStatusClasses(row.delivery_status)}
                  >
                    {row.delivery_status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleOpenReviewModal(row.product_id, row.product_name)
                      }
                      className="text-secondary hover:underline flex items-center gap-1 cursor-pointer text-sm"
                    >
                      Write Reviews
                    </button>
                    <button
                      onClick={() =>
                        handleOpenInvoice(row.invoice_detail_api_route)
                      }
                      className="text-secondary flex items-center gap-1 cursor-pointer text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedProduct(null);
            AllProducts(); // Re-fetch products to show updated review status/count if applicable
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </div>
  );
}
