import { useState } from "react";
import {
  ClipboardList,
  FilePlus2,
  FileText,
  HeartPulse,
  Leaf,
  Link2,
  MessageCircleHeart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLoader from "../../../components/common/PageLoader";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/Cards/Card";
import DashboardSection from "../components/DashboardSection";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardTopbar from "../components/DashboardTopbar";
import HealthInsightsCard from "../components/HealthInsightsCard";
import HealthOverviewCard from "../components/HealthOverviewCard";
import HealthRecordsCard from "../components/HealthRecordsCard";
import HealthStatusCard from "../components/HealthStatusCard";
import PatientProfileCard from "../components/PatientProfileCard";
import QuickActionCard from "../components/QuickActionCard";
import RecentActivity from "../components/RecentActivity";
import usePatientDashboard from "../hooks/usePatientDashboard";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { dashboard, isLoading, error } = usePatientDashboard();

  if (isLoading) {
    return <PageLoader fullScreen text="Loading your health dashboard…" />;
  }

  if (error || !dashboard) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
        <Card padding="lg" className="w-full max-w-lg border-emerald-100 text-center">
          <HeartPulse className="mx-auto text-emerald-700" size={32} />
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Dashboard unavailable</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {error || "We could not load your health dashboard right now."}
          </p>
          <Button className="mt-7" onClick={() => navigate("/patient/healthcare")}>
            Return to healthcare options
          </Button>
        </Card>
      </section>
    );
  }

  const patientName = dashboard.patient?.name || "Patient";
  const overview = dashboard.overview;
  const activities = dashboard.recentActivity;
  const hasHealthHistory = activities.length > 0;
  const overviewCards = [
    {
      icon: Leaf,
      label: "AYUSH Assessments",
      value: overview.ayushAssessments,
      detail: overview.ayushAssessments ? "Completed" : "Not yet started",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: MessageCircleHeart,
      label: "Modern Health Conversations",
      value: overview.modernConversations,
      detail: overview.modernConversations ? "Completed" : "Not yet started",
      iconClassName: "bg-sky-100 text-sky-700",
    },
    {
      icon: FileText,
      label: "Health Documents",
      value: overview.documents,
      detail: overview.documents ? "Available" : "Not yet added",
      iconClassName: "bg-violet-100 text-violet-700",
    },
    {
      icon: ClipboardList,
      label: "Total Health Records",
      value: overview.totalRecords,
      detail: "Available in your workspace",
      iconClassName: "bg-amber-100 text-amber-700",
    },
  ];

  const quickActions = [
    {
      icon: Leaf,
      title: "Start AYUSH Assessment",
      description: "Complete a guided traditional wellness check-in.",
      actionLabel: "Start assessment",
      iconClassName: "bg-emerald-100 text-emerald-700",
      onClick: () => navigate("/patient/healthcare/ayush-assessment"),
    },
    {
      icon: MessageCircleHeart,
      title: "Modern Health Conversation",
      description: "Share your health concern in your own words.",
      actionLabel: "Start conversation",
      iconClassName: "bg-sky-100 text-sky-700",
      onClick: () => navigate("/patient/healthcare/modern-conversation"),
    },
    {
      icon: FilePlus2,
      title: "Upload Health Document",
      description: "Document upload will be available in the next feature.",
      actionLabel: "Coming soon",
      iconClassName: "bg-violet-100 text-violet-700",
      disabled: true,
    },
    {
      icon: ClipboardList,
      title: "View Health Records",
      description: "A full medical history page is coming soon.",
      actionLabel: "Coming soon",
      iconClassName: "bg-amber-100 text-amber-700",
      disabled: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <DashboardTopbar
          patientName={patientName}
          onMenuOpen={() => setIsSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="flex flex-col gap-4 border-b border-slate-200 pb-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
                Patient dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, {patientName} <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                Here&apos;s an overview of your health and recent activity.
              </p>
            </div>
            <p className="max-w-xs border-l-2 border-emerald-300 pl-4 text-sm italic leading-relaxed text-slate-500">
              “A healthier you, a brighter tomorrow.”
            </p>
          </section>

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
            <PatientProfileCard patient={dashboard.patient} abha={dashboard.abha} />

            <DashboardSection
              eyebrow="Quick actions"
              title="Manage your health"
              description="Start a healthcare flow or prepare for upcoming services."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.title} {...action} />
                ))}
              </div>
            </DashboardSection>
          </div>

          <section className="mt-7">
            <Card padding="lg" className="overflow-hidden border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex max-w-2xl gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
                    <Link2 size={23} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">
                      ABHA health information
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      Your health records can be securely connected with ABHA
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Connect ABHA in a future update to bring verified health records into one place.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-xl border border-sky-100 bg-white/90 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ABHA Status</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {dashboard.abha.connected ? "Connected" : "Not Connected"}
                    </p>
                  </div>
                  <Button variant="secondary" disabled className="whitespace-nowrap">
                    Connect ABHA · Soon
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          <div className="mt-10">
            <DashboardSection
              eyebrow="Health summary"
              title="Your health records at a glance"
              description="Counts are based on completed records available in your MediKiosk session."
            >
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {overviewCards.map((card) => (
                  <HealthOverviewCard key={card.label} {...card} />
                ))}
              </div>
            </DashboardSection>
          </div>

          <div className="mt-10 grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
            <DashboardSection
              eyebrow="Recent activity"
              title="Your health activity"
              description="Assessments and conversations are shown together, with the newest record first."
            >
              <RecentActivity activities={activities} />
            </DashboardSection>

            <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-1">
              <HealthStatusCard />
              <HealthRecordsCard activities={activities} />
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <DashboardSection
              eyebrow="Health documents"
              title="Keep your records organized"
              description="Documents will appear here once the Document Center is available."
            >
              <Card padding="lg" className="border-dashed border-slate-300 bg-white shadow-none">
                <FileText size={24} className="text-violet-700" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">No health documents uploaded yet</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                  Upload prescriptions, reports, and other medical documents to keep your health
                  information organized.
                </p>
                <Button variant="secondary" disabled className="mt-5">
                  Upload Document · Soon
                </Button>
              </Card>
            </DashboardSection>

            <DashboardSection
              eyebrow="Health insights"
              title="Build your health history"
              description="This space will show safe, informational summaries as verified data becomes available."
            >
              <HealthInsightsCard hasHealthHistory={hasHealthHistory} />
            </DashboardSection>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
