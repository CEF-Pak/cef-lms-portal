import { Pencil } from "lucide-react";

interface CheckoutReviewProps {
  data?: any;
}

export default function CheckoutReview({ data }: CheckoutReviewProps) {
  return (
    <div className="text-sm text-gray-700 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Order ID with edit option */}
        <div className="flex justify-between items-center">
          <p>
            <strong>Order ID:</strong> {data?.orderId}
          </p>
          <button className="text-[#013370] text-xs hover:underline">
            Change
          </button>
        </div>

        {/* Price */}
        <p>
          <strong>Price:</strong> {data?.amount}
        </p>

        {/* Course Name */}
        <p>
          <strong>Course Name:</strong> {data?.productName}
        </p>

        {/* Billing Address */}
        <div>
          <p className="font-medium">Billing Address:</p>
          <p className="text-xs text-gray-500">
            123 Main Street, Apartment 4B, Lahore, Punjab, Pakistan
          </p>
        </div>

        {/* Payment Section */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Payment Details</h4>
            <button className="text-[#013370]">
              <Pencil size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-400">Payment via</p>

          <div className="border-b rounded px-3 py-2 text-sm">Visa Card</div>

          <p className="text-xs text-gray-400 mt-1">
            * Everything appears to be in order; if so, please proceed.
          </p>
        </div>
      </div>
    </div>
  );
}
