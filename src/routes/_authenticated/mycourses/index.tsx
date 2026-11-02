import { createFileRoute } from "@tanstack/react-router";
//import * as Tabs from "@radix-ui/react-tabs";

// import LiveCoursesTable from "@/components/common/livecoursestab";
// import SelfLearningTable from "@/components/common/SelfLearningTable";
import MergedCoursesTable from "@/components/common/MergedCoursesTable";

export const Route = createFileRoute("/_authenticated/mycourses/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6 space-y-6 container mx-auto ">
      <h1 className="text-2xl font-bold">My Courses</h1>
      <MergedCoursesTable />
      {/* <Tabs.Root defaultValue="self-learning" className="space-y-4">
       
        <Tabs.List className="flex gap-4 pb-2 flex-nowrap justify-start">
        
          <Tabs.Trigger
            value="self-learning"
            className="cursor-pointer px-4 py-2 font-medium border-b-2 data-[state=active]:border-primary flex-shrink-0 whitespace-nowrap"
          >
            Self Learning Courses
          </Tabs.Trigger>
         
          <Tabs.Trigger
            value="live-courses"
            className="cursor-pointer px-4 py-2 font-medium border-b-2 data-[state=active]:border-primary flex-shrink-0 whitespace-nowrap"
          >
            Live Courses
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="self-learning">
          <SelfLearningTable />
        </Tabs.Content>

        <Tabs.Content value="live-courses">
          <LiveCoursesTable />
        </Tabs.Content>
      </Tabs.Root> */}
    </div>
  );
}
