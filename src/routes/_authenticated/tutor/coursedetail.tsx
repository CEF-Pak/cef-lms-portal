import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OverviewTab from "@/components/tutor/overviewtab";
import NoticeTab from "@/components/tutor/noticetab";
import MyClassTab from "@/components/tutor/myclasstab";
import ReviewsTab from "@/components/tutor/reviewstab";

export const Route = createFileRoute("/_authenticated/tutor/coursedetail")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const timeline = [
    { title: "Introduction", sub: "1 video | 5 mins", watched: true },
    { title: "Getting Started", sub: "1 video | 8 mins", watched: false },
    { title: "Rules of Letter Raa", sub: "1 video | 16 mins", watched: false },
  ];

  return (
    <div className="container mx-auto flex gap-6 pl-6 pr-4">
      {/* Left Column */}
      <div className="w-[70%] bg-white mt-4 p-4 rounded-lg">
        {/* Back + Title */}
        <div className="flex items-center pt-2 gap-2 mb-4">
          <button className="text-black rounded-full">
            <CiCircleChevLeft size={30} />
          </button>
          <h2 className="text-xl font-semibold">Course Details</h2>
        </div>

        {/* Video Placeholder */}
        <div className="w-full h-[300px] bg-gray-300 rounded-lg mb-4 p-6 flex items-center justify-center text-muted-foreground">
          Video Player Placeholder
        </div>

        {/* Course Name + Meta */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Tajweed ul Quran the easy way (English)
          </h3>
          <p className="text-sm text-gray-500">5 lessons | 3 lectures</p>
        </div>

        {/* Custom Tabs */}
        <div>
          <div className="flex gap-6 mb-4 border-b">
            {["overview", "notice", "myclass", "reviews", "discussion"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 capitalize text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-[#013370] border-b-2 border-[#013370]"
                      : "text-gray-500 hover:text-[#013370]"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="p-4">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "notice" && <NoticeTab />}
            {activeTab === "myclass" && <MyClassTab />}
            {activeTab === "reviews" && <ReviewsTab />}
          </div>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="w-[25%] bg-white mt-4 p-4 rounded-lg max-h-screen overflow-y-auto top-4">
        <h3 className="text-lg font-semibold border-b border-gray-400 mb-4">
          Course Content
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {[
            "Lecture 01",
            "Lecture 02",
            "Lecture 03",
            "Lecture 04",
            "Lecture 05",
          ].map((lecture, idx) => (
            <AccordionItem key={idx} value={`lecture-${idx}`}>
              <AccordionTrigger>{lecture}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-2">
                  {timeline.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1">
                        {item.watched ? (
                          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
