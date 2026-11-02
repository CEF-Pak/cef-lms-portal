export default function OverviewTab({ overview }: { overview?: string | undefined }) {
  return (
    <div className="text-gray-500 text-sm">
      {overview ? <div dangerouslySetInnerHTML={{ __html: overview || "" }} /> : <div>No content available</div>}
    </div>
  );
}