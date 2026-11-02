import { createFileRoute } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import IndividualHistory from "@/components/common/IndividualHistory"; // Import the Individual History component
import GroupHistory from "@/components/common/GroupHistory"; // Import the Group History component
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/ClassHistory")({
  component: RouteComponent,
});

function RouteComponent() {
  const [, setActiveTab] = useState("individual-history");

  return (
    <div className="p-6 space-y-6 container mx-auto ">
      <h1 className="text-2xl font-bold">Class History</h1>

      <Tabs.Root
        defaultValue="individual-history"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        {/* Tabs triggers */}
        {/*
          Applied the same responsive classes as before:
          "flex justify-center sm:justify-between items-end"
          This centers the tabs on small screens and aligns them to the ends on larger screens.
        */}
        <div className="flex justify-center sm:justify-between items-end">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger
              value="individual-history"
              className="cursor-pointer px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap" // Added whitespace-nowrap
            >
              Individual History
            </Tabs.Trigger>
            <Tabs.Trigger
              value="group-history"
              className="cursor-pointer px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap" // Added whitespace-nowrap
            >
              Group History
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* Tabs content */}
        <Tabs.Content value="individual-history">
          <IndividualHistory />
        </Tabs.Content>

        <Tabs.Content value="group-history">
          <GroupHistory />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
