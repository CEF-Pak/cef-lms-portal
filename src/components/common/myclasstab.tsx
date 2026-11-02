"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UpcomingClasses from "@/components/common/UpcomingClasses";
import CurrentClasses from "@/components/common/CurrentClasses";
import PastClasses from "@/components/common/PastClasses";
import { useEffect, useState } from "react";

export default function MyClassTab(liveclasses: any) {
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [currentClasses, setCurrentClasses] = useState<any[]>([]);
  const [pastClasses, setPastClasses] = useState<any[]>([]);

  useEffect(() => {
    if (liveclasses) {
      setUpcomingClasses(liveclasses.course_liveclass_tab.upcomming);
      setCurrentClasses(liveclasses.course_liveclass_tab.current);
      setPastClasses(liveclasses.course_liveclass_tab.past);
    }
  }, [liveclasses]);

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid grid-cols-3 w-full bg-[#F2F3F5] p-0 mb-4 rounded-md overflow-hidden">
        <TabsTrigger
          value="upcoming"
          className="cursor-pointer w-full text-center px-4 py-2 text-sm font-medium text-gray-500 bg-[#F2F3F5] data-[state=active]:text-[#1D407D] data-[state=active]:bg-white transition-colors"
        >
          Upcoming Classes
        </TabsTrigger>
        <TabsTrigger
          value="current"
          className="cursor-pointer w-full text-center px-4 py-2 text-sm font-medium text-gray-500 bg-[#F2F3F5] data-[state=active]:text-[#1D407D] data-[state=active]:bg-white transition-colors"
        >
          Current Classes
        </TabsTrigger>
        <TabsTrigger
          value="past"
          className="cursor-pointer w-full text-center px-4 py-2 text-sm font-medium text-gray-500 bg-[#F2F3F5] data-[state=active]:text-[#1D407D] data-[state=active]:bg-white transition-colors"
        >
          Past Classes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <UpcomingClasses upcomingClasses={upcomingClasses} />
      </TabsContent>
      <TabsContent value="current">
        <CurrentClasses currentClasses={currentClasses} />
      </TabsContent>
      <TabsContent value="past">
        <PastClasses pastClasses={pastClasses} />
      </TabsContent>
    </Tabs>
  );
}
