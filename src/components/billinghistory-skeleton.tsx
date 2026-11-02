function BillingHistorySkeleton() {
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
              {[1, 2, 3, 4].map((idx) => (
                <tr key={idx} className="bg-white border-b border-gray-200">
                  <td className="px-4 py-4 max-w-[15rem]">
                    <div className="h-4 bg-gray-400 rounded animate-pulse w-32"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-400 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-400 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 bg-gray-400 rounded-full animate-pulse w-16"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BillingHistorySkeleton; 