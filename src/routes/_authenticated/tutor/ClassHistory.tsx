import { createFileRoute } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

import IndividualHistory from "@/components/tutor/IndividualHistory"; // Import the Individual History component
import GroupHistory from "@/components/tutor/GroupHistory"; // Import the Group History component

export const Route = createFileRoute("/_authenticated/tutor/ClassHistory")({
  component: RouteComponent,
});

function RouteComponent() {
  const [, setActiveTab] = useState("individual-history");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Class History</h1>

      <Tabs.Root
        defaultValue="individual-history"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        {/* Tabs triggers */}
        <div className="flex justify-between items-end">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger
              value="individual-history"
              className="text-sm px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Individual History
            </Tabs.Trigger>
            <Tabs.Trigger
              value="group-history"
              className="text-sm px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary"
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
