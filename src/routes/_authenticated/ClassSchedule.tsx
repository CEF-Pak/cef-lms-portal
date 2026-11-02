import { createFileRoute } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

import IndividualClass from "@/components/common/IndividualClass";
import GroupClass from "@/components/common/GroupClass";

export const Route = createFileRoute("/_authenticated/ClassSchedule")({
  component: RouteComponent,
});

function RouteComponent() {
  const [, setActiveTab] = useState("individual-class");

  return (
    <div className="p-6 space-y-6 container mx-auto">
      <h1 className="text-2xl font-bold">Class Schedule</h1>

      <Tabs.Root
        defaultValue="individual-class"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        {/* Tabs triggers */}
        {/*
          Changed from "flex justify-between items-end" to:
          "flex justify-center sm:justify-between items-end"
          This centers the tabs on small screens and aligns them to the ends on larger screens.
        */}
        <div className="flex justify-center sm:justify-between items-end">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger
              value="individual-class"
              className="cursor-pointer px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap" // Added whitespace-nowrap
            >
              Individual Class
            </Tabs.Trigger>
            <Tabs.Trigger
              value="group-class"
              className="cursor-pointer px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary whitespace-nowrap" // Added whitespace-nowrap
            >
              Group Class
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* Tabs content */}
        <Tabs.Content value="individual-class">
          <IndividualClass />
        </Tabs.Content>

        <Tabs.Content value="group-class">
          <GroupClass />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
