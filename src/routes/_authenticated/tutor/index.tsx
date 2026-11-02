import { createFileRoute } from "@tanstack/react-router";
import Banner from "@/components/banner";
import DashboardCard from "@/components/card";
import LiveClass from "@/components/tutor/liveclass";
import LatestBlog from "@/components/tutor/latestblog";
import Schedule from "@/components/tutor/schedule";
//import BillingHistory from "@/components/tutor/billinghistory";
//import LatestResources from "@/components/tutor/latestresources";
import Overview from "@/components/tutor/overview";
import MyEnrolledCourses from "@/components/tutor/myenrolledcourses";
//import Leaderboard from "@/components/tutor/leaderboard";

export const Route = createFileRoute("/_authenticated/tutor/")({
  component: TutorDashboard,
});

function TutorDashboard() {
  return (
    <div className="p-2">
      <Banner />
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 grid-rows-auto gap-4 mt-6 auto-rows-[3.4rem]">
        <div className="row-span-5 col-span-1">
          <DashboardCard title="Today's Class">
            <LiveClass />
          </DashboardCard>
        </div>
        <div className="row-span-5 col-span-1 row-start-6 lg:row-start-1 lg:col-start-2">
          <DashboardCard title="Overview">
            <Overview />
          </DashboardCard>
        </div>
        <div className="row-span-6 row-start-11 lg:row-start-1 lg:col-start-3">
          <DashboardCard title="My Schedule" type="Week">
            <Schedule />
          </DashboardCard>
        </div>
        <div className="col-span-1 lg:col-span-2 row-span-5 row-start-17 lg:row-start-6">
          <DashboardCard title="My Courses">
            <MyEnrolledCourses />
          </DashboardCard>
        </div>
        <div className="row-span-5 col-start-1 lg:col-start-3 row-start-22 lg:row-start-7">
          <DashboardCard title="Latest Blogs">
            <LatestBlog />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
