import { useEffect, useState } from "react";
import visaImage from "@/assets/svg/visa.svg";
import mastercardImage from "@/assets/svg/mastercard.svg";
import easypaisaImage from "@/assets/svg/easypaisa.svg";
import jazzImage from "@/assets/svg/jazzcash.svg";
import bankImage from "@/assets/svg/bank.svg";

export default function BillingDetails({
  paymentMethod,
}: {
  paymentMethod: (m: string) => void;
}) {
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [selectMethod, setSelectMethod] = useState<string>("");

  const paymentMethods = [
    {
      value: "visa",
      payment_method: "meezan_bank",
      image: visaImage,
      className: "!w-18 !h-8",
      alt: "Visa",
    },
    {
      value: "mastercard",
      payment_method: "meezan_bank",
      image: mastercardImage,
      alt: "Mastercard",
      className: "!w-22 !h-10",
    },
    {
      value: "easypaisa",
      payment_method: "meezan_bank",
      image: easypaisaImage,
      alt: "EasyPaisa",
      className: "!w-20 !h-10",
    },
    {
      value: "jazzcash",
      payment_method: "meezan_bank",
      image: jazzImage,
      alt: "JazzCash",
      className: "!w-22 !h-10",
    },
    {
      value: "bank",
      payment_method: "meezan_bank",
      image: bankImage,
      alt: "Bank",
      className: "!w-22 !h-10",
    },
  ];

  useEffect(() => {
    paymentMethod(selectedPayment);
  }, [selectedPayment]);

  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold mt-4 sm:mt-6 mb-2">
        Select Payment Method
      </h3>{" "}
      {/* Adjusted text size */}
      <div className="space-y-1 flex flex-col gap-2 mt-4">
        <label
          className={`flex items-center justify-start w-full h-[2.5rem] sm:h-[3rem] border rounded-md px-4 sm:px-6 cursor-pointer gap-4 transition-colors ${
            selectMethod === "meezan_bank_1"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
          onClick={() => {
            setSelectedPayment("meezan_bank");
            setSelectMethod("meezan_bank_1");
          }}
        >
          <input
            type="checkbox"
            className="sr-only"
            name="payment-method"
            value="meezan_bank_1"
            checked={selectMethod === "meezan_bank_1"}
            onChange={() => setSelectMethod("meezan_bank_1")}
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="text-sm sm:text-base">
            Pay by Debit/Credit Card (1)
          </span>{" "}
          {/* Adjusted text size */}
        </label>
        {/* <label
          className={`flex items-center justify-start w-full h-[2.5rem] sm:h-[3rem] border rounded-md px-4 sm:px-6 cursor-pointer gap-4 transition-colors ${
            selectMethod === "faisal_bank_1"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
          onClick={() => {
            setSelectedPayment("faysal_bank");
            setSelectMethod("faisal_bank_1");
          }}
        >
          <input
            type="checkbox"
            className="sr-only"
            name="payment-method"
            value="faisal_bank_1"
            checked={selectMethod === "faisal_bank_1"}
            onChange={() => setSelectMethod("faisal_bank_1")}
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="text-sm sm:text-base">
            Pay by Debit/Credit Card (2)
          </span>{" "}
          
        </label> */}
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {" "}
        {/* Centered and adjusted gap */}
        {paymentMethods.map((method) => (
          <label
            key={method.value}
            className={`flex items-center justify-center w-[30%] sm:w-[18.2%] h-[3.5rem] sm:h-[4rem] border rounded-md transition-colors ${
              selectMethod === method.value
                ? "border-blue-600 bg-blue-50"
                : "border-gray-100 bg-white"
            }`}
          >
            <img
              src={method.image}
              alt={method.alt}
              className={`h-6 sm:h-7 w-auto ${method.className}`} // Adjusted image size
            />
          </label>
        ))}
      </div>
    </div>
  );
}
