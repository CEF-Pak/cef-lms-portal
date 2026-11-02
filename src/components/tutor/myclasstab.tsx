"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UpcomingClasses from "@/components/common/UpcomingClasses";
import CurrentClasses from "@/components/common/CurrentClasses";
import PastClasses from "@/components/common/PastClasses";

export default function MyClassTab() {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid grid-cols-3 w-full bg-[#F2F3F5] p-0 mb-4 rounded-md overflow-hidden">
        <TabsTrigger
          value="upcoming"
          className="w-full text-center px-4 py-2 text-sm font-medium text-gray-500 bg-[#F2F3F5] data-[state=active]:text-[#1D407D] data-[state=active]:bg-white transition-colors"
        >
          Upcoming Classes
        </TabsTrigger>
        <TabsTrigger
          value="current"
          className="w-full text-center px-4 py-2 text-sm font-medium text-gray-500 bg-[#F2F3F5] data-[state=active]:text-[#1D407D] data-[state=active]:bg-white transition-colors"
        >
          Current Classes
        </TabsTrigger>
        <TabsTrigger
          value="past"
          className="w-full text-center px-4 py-2 text-sm font-medium text-gray-500 bg-[#F2F3F5] data-[state=active]:text-[#1D407D] data-[state=active]:bg-white transition-colors"
        >
          Past Classes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <UpcomingClasses />
      </TabsContent>
      <TabsContent value="current">
        <CurrentClasses />
      </TabsContent>
      <TabsContent value="past">
        <PastClasses />
      </TabsContent>
    </Tabs>
  );
}
