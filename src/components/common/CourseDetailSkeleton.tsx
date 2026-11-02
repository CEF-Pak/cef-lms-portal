import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="flex w-full justify-around">
        {/* Left Column */}
        <div className="w-[70%] bg-white mt-4 p-4 rounded-lg">
          {/* Back + Title */}
          <div className="flex items-center pt-2 gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Video Player Skeleton */}
          <Skeleton className="w-full min-h-[30rem] aspect-video mb-12 rounded-lg" />

          {/* Course Title */}
          <div className="mb-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Tabs Skeleton */}
          <div>
            <div className="flex gap-6 mb-4 border-b">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>

            {/* Tab Content Skeleton */}
            <div className="mt-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-[25%] bg-white mt-4 p-4 rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          
          {/* Accordion Items Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-2">
                <Skeleton className="h-6 w-full mb-2" />
                <div className="space-y-2 pl-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 