import { createFileRoute } from "@tanstack/react-router";
import Banner from "@/components/banner";
import DashboardCard from "@/components/card";
import LiveClass from "@/components/liveclass";
import LatestBlog from "@/components/latestblog";
import Schedule from "@/components/schedule";
import BillingHistory from "@/components/billinghistory";
//import LatestResources from "@/components/latestresources";
import Overview from "@/components/overview";
import MyEnrolledCourses from "@/components/myenrolledcourses";
import Leaderboard from "@/components/leaderboard";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 sm:p-4 container mx-auto">
      <Banner />
      <div
        className="container mx-auto grid
                   grid-cols-1          /* Default: single column for mobile */
                   md:grid-cols-2       /* Medium screens: two columns */
                   lg:grid-cols-3       /* Large screens: three columns */
                   gap-4 mt-6
                   auto-rows-auto" /* Row height determined by content */
      >
        {/*
          Component order is important for mobile-first stacking.
          We define spans for MD and LG breakpoints.
          row-span and col-start are used only at LG for the specific 3-column layout.
        */}

        {/* 1. Today's Class */}
        <div className="md:col-span-1 lg:row-span-5">
          <DashboardCard title="Today's Class">
            <LiveClass />
          </DashboardCard>
        </div>

        {/* 2. Overview */}
        <div className="md:col-span-1 lg:row-span-5">
          <DashboardCard title="Overview">
            <Overview />
          </DashboardCard>
        </div>

        {/* 3. My Schedule */}
        {/* On MD, this will span both columns if the first two fill the row.
           On LG, it goes to the third column. */}
        <div className="md:col-span-2 lg:col-span-1 lg:row-span-6">
          <DashboardCard title="My Schedule" type="Week">
            <Schedule />
          </DashboardCard>
        </div>

        {/* 4. My Enrolled Courses */}
        {/* On MD, this spans both columns. On LG, it spans two columns (left side). */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-5">
          <DashboardCard
            title="My Enrolled Courses"
            links="View All"
            link="/mycourses"
          >
            <MyEnrolledCourses />
          </DashboardCard>
        </div>

        {/* 5. Latest Blogs */}
        {/* On MD, this stacks below "My Enrolled Courses". On LG, it's in the third column. */}
        <div className="md:col-span-2 lg:col-span-1 lg:row-span-5">
          <DashboardCard title="Latest Blogs">
            <LatestBlog />
          </DashboardCard>
        </div>

        {/* 6. Billing History */}
        {/* On MD, this spans both columns. On LG, it spans two columns (left side). */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-4">
          <DashboardCard
            title="Billing History"
            links="View All"
            link="/billing"
          >
            <BillingHistory />
          </DashboardCard>
        </div>

        {/* 7. Leaderboard */}
        {/* On MD, this stacks below "Billing History". On LG, it's in the third column. */}
        <div className="md:col-span-2 lg:col-span-1 lg:row-span-5">
          <DashboardCard title="Leaderboard">
            <Leaderboard />
          </DashboardCard>
        </div>

        {/* Removed the commented-out LatestResources for clarity, uncomment if needed */}
        {/*
        <div className="row-span-5 col-start-1 row-start-11">
          <DashboardCard title="Latest Resources" links="View All">
            <LatestResources />
          </DashboardCard>
        </div>
        */}
      </div>
    </div>
  );
}
