type OverviewTabProps = {
  data?: string | undefined;
};

export default function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="text-gray-500 text-sm">
    {data ? <div dangerouslySetInnerHTML={{ __html: data || "" }} /> : <div>No content available</div>}
  </div>
  );
}
