import visaImage from "@/assets/svg/visa.svg";
import mastercardImage from "@/assets/svg/mastercard.svg";
import easypaisaImage from "@/assets/svg/easypaisa.svg";
import jazzImage from "@/assets/svg/jazzcash.svg";
import bankImage from "@/assets/svg/bank.svg";

type Props = {
  methods: string[];
  value: string;
  onChange: (method: string) => void;
};

export function VaultPayMethodPicker({ methods, value, onChange }: Props) {
  const showMeezan = methods.includes("meezan_bank");
  const showFaysal = methods.includes("faysal_bank");

  const logos = [
    { image: visaImage, alt: "Visa", className: "!w-18 !h-8" },
    { image: mastercardImage, alt: "Mastercard", className: "!w-22 !h-10" },
    { image: easypaisaImage, alt: "EasyPaisa", className: "!w-20 !h-10" },
    { image: jazzImage, alt: "JazzCash", className: "!w-22 !h-10" },
    { image: bankImage, alt: "Bank", className: "!w-22 !h-10" },
  ];

  if (!showMeezan && !showFaysal) {
    return (
      <p className="text-sm text-red-700">
        Online payment methods are not configured. Please contact CEF support.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="mb-2 mt-4 text-base font-semibold sm:mt-6 sm:text-lg">
        Select Payment Method
      </h3>
      <div className="mt-4 flex flex-col gap-2 space-y-1">
        {showMeezan && (
          <label
            className={`flex h-[2.5rem] w-full cursor-pointer items-center justify-start gap-4 rounded-md border px-4 transition-colors sm:h-[3rem] sm:px-6 ${
              value === "meezan_bank"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
            onClick={() => onChange("meezan_bank")}
          >
            <span className="text-sm sm:text-base">Pay by Debit/Credit Card</span>
          </label>
        )}
        {showFaysal && (
          <label
            className={`flex h-[2.5rem] w-full cursor-pointer items-center justify-start gap-4 rounded-md border px-4 transition-colors sm:h-[3rem] sm:px-6 ${
              value === "faysal_bank"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
            onClick={() => onChange("faysal_bank")}
          >
            <span className="text-sm sm:text-base">Pay with Faysal Bank</span>
          </label>
        )}
      </div>
      {showMeezan && (
        <div className="mt-3 flex flex-wrap items-center gap-3 opacity-80">
          {logos.map((l) => (
            <img key={l.alt} src={l.image} alt={l.alt} className={l.className} />
          ))}
        </div>
      )}
    </div>
  );
}
