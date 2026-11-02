type Notice = {
  notice_id: number;
  notice_details: string;
  notice_topic: string;
  created_at: string;
};

type NoticeTabProps = {
  data?: Notice[] | undefined;
};

export default function NoticeTab({ data }: NoticeTabProps) {
  return (
      <div className="flex flex-col items-center gap-4 h-[24rem] overflow-y-auto">
        {data && data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.notice_id}
              className="relative bg-[#F5F6F8] border border-gray-400 shadow-lg p-6 rounded-lg w-full lg:max-w-xl mx-auto mt-6"
            >
              {/* Pin (top center) */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-6 h-6 bg-[#8CBF3F] rounded-full border-2 border-white shadow-md" />
              </div>

              {/* Floating date tag */}
              <div className="absolute -top-3 left-4 bg-[#1D407D] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                {item.created_at}
              </div>

              {/* Paper content */}
              <h2 className="text-lg font-bold mb-2 text-center">
                {item.notice_topic}
              </h2>
              <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                {item.notice_details}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 mt-6">No notices available.</p>
        )}
      </div>
  )
}
