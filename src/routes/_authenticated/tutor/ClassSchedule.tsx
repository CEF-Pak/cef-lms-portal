import { createFileRoute } from "@tanstack/react-router";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

import IndividualClass from "@/components/tutor/IndividualClass";
import GroupClass from "@/components/tutor/GroupClass";

export const Route = createFileRoute("/_authenticated/tutor/ClassSchedule")({
  component: RouteComponent,
});

function RouteComponent() {
  const [, setActiveTab] = useState("individual-class");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Class Schedule</h1>

      <Tabs.Root
        defaultValue="individual-class"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        {/* Tabs triggers */}
        <div className="flex justify-between items-end">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger
              value="individual-class"
              className="px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Individual Class
            </Tabs.Trigger>
            <Tabs.Trigger
              value="group-class"
              className="px-4 py-2 font-medium border-b-2 border-transparent data-[state=active]:border-primary"
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
