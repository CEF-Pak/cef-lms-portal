import { createFileRoute } from "@tanstack/react-router";
//import * as Tabs from "@radix-ui/react-tabs";
//import { useState } from "react"; // Import useState

// import LiveClassTutor from "@/components/tutor/LiveClassTutor";
// import SelfLearningTutor from "@/components/tutor/SelfLearningTutor";
import MergedTutorCoursesTable from "@/components/tutor/MergedTutorCoursesTable";

export const Route = createFileRoute("/_authenticated/tutor/mycourses/")({
  component: RouteComponent,
});

function RouteComponent() {
  // State to keep track of the active tab.
  //const [, setActiveTab] = useState("self-learning");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Courses</h1>

      {/* <Tabs.Root
        defaultValue="self-learning"
        className="space-y-4"
        onValueChange={setActiveTab} 
      >
       
        <div className="flex justify-between items-end">
          <Tabs.List className="flex gap-4">
            
            <Tabs.Trigger
              value="self-learning"
             
              className="px-4 text-sm py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Self Learning Courses
            </Tabs.Trigger>
           
            <Tabs.Trigger
              value="live-courses"
             
              className="px-4 text-sm py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Live Courses
            </Tabs.Trigger>
          </Tabs.List> */}
      {/*
          {activeTab === "self-learning" && (
            <div className="pb-2">
              {" "}
              <button className="px-4 py-2 bg-[#013370] text-sm text-white rounded-md">
                Create Class
              </button>
            </div>
          )}
          */}
      {/* </div>

        <Tabs.Content value="self-learning">
          <SelfLearningTutor />
        </Tabs.Content>

        <Tabs.Content value="live-courses">
          <LiveClassTutor />
        </Tabs.Content>
      </Tabs.Root> */}
      <MergedTutorCoursesTable />
    </div>
  );
}
