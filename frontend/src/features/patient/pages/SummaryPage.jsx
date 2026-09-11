import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  MessageCircleHeart,
  UserRound,
} from "lucide-react";
import { fetchSummary, clearSummary } from "../../summary/summarySlice";
import { formatDate, titleCase } from "../utils/health";

export default function SummaryPage() {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.summary);

  // Load summary data on mount
  useEffect(() => {
    dispatch(fetchSummary());
    return () => {
      dispatch(clearSummary());
    };
  }, [dispatch]);

  if (status === "loading" && !data) {
    return <div className="page-state"><span className="loading-dot"/>Loading your health summary…</div>;
  }

  if (status === "failed") {
    return <div className="page-state"><span className="loading-dot"/>Failed to load health summary. Please try again.</div>;
  }

  const {
    patient,
    consultations,
    intakes,
    documents,
    recentActivity,
  } = data || {};

  return (
    <section className="content-page summary-page">
      <span className="eyebrow">YOUR HEALTH SUMMARY</span>
      <h1>At a glance</h1>
      <p className="page-intro">
        This summary provides an overview of your health profile and recent activity.
      </p>

      {/* Patient Profile Card */}
      {patient && (
        <div className="summary-card">
          <div className="summary-card-header">
            <UserRound size={20} />
            <h2>Your profile</h2>
          </div>
          <div className="summary-card-body">
            <div className="summary-grid">
              <div>
                <h3>Gender</h3>
                <p>{patient.gender || "Not specified"}</p>
              </div>
              <div>
                <h3>Date of birth</h3>
                <p>
                  {patient.dateOfBirth ? (
                    <span>
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(patient.dateOfBirth))}
                    </span>
                  ) : (
                    "Not specified"
                  )}
                </p>
              </div>
              <div>
                <h3>Preferred language</h3>
                <p>{patient.preferredLanguage || "Not specified"}</p>
              </div>
              <div>
                <h3>Consent</h3>
                <p>
                  {patient.consentGiven ? (
                    <span className="status-chip status-consentgiven">Given</span>
                  ) : (
                    <span className="status-chip status-notgiven">Not given</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counts Cards */}
      <div className="summary-counts">
        <div className="summary-card">
          <div className="summary-card-header">
            <MessageCircleHeart size={20} />
            <h2>Consultations</h2>
          </div>
          <div className="summary-card-body">
            <div className="count-number">{consultations?.total ?? 0}</div>
            <p>Total consultations</p>
            {consultations?.recent && consultations.recent.length > 0 && (
              <Link
                className="text-link"
                to="/patient/timeline"
                >View all <ArrowRight size={16} /></Link
              >
            )}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <FileText size={20} />
            <h2>Intakes</h2>
          </div>
          <div className="summary-card-body">
            <div className="count-number">{intakes?.total ?? 0}</div>
            <p>Total intakes</p>
            {intakes?.recent && intakes.recent.length > 0 && (
              <Link
                className="text-link"
                to="/patient/timeline"
                >View all <ArrowRight size={16} /></Link
              >
            )}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <FileText size={20} />
            <h2>Documents</h2>
          </div>
          <div className="summary-card-body">
            <div className="count-number">{documents?.total ?? 0}</div>
            <p>Total documents</p>
            {documents?.recent && documents.recent.length > 0 && (
              <Link
                className="text-link"
                to="/patient/documents"
                >View all <ArrowRight size={16} /></Link
              >
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <>
          <h2 className="section-title">Recent activity</h2>
          <div className="timeline">
            {recentActivity.map((event) => (
              <TimelineItem key={event.id || event._id} event={event} />
            ))}
          </div>
          {recentActivity.length >= 5 && (
            <div className="text-center">
              <Link
                className="button-outline"
                to="/patient/timeline"
                >See full timeline <ArrowRight size={16} /></Link
              >
            </div>
          )}
        </>
      )}

      {!recentActivity || recentActivity.length === 0 && (
        <div className="empty-state">
          <span><CalendarDays size={30}/></span>
          <h3>No recent activity</h3>
          <p>
            Complete a consultation, intake, or upload a document to see events appear here.
          </p>
          <Link className="button-primary button-small" to="/patient/healthcare">
            Start an intake <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}

function TimelineItem({ event }) {
  // We reuse the same logic from HealthTimelineLive's TimelineItem but without the resume/link logic
  const getIconAndColor = (type) => {
    switch (type) {
      case "CONSULTATION":
        return {
          Icon: MessageCircleHeart,
          bg: "#e6f7f1",
          color: "#087568",
        };
      case "INTAKE":
        return {
          Icon: FileText,
          bg: "#fff0f5",
          color: "#8b008b",
        };
      case "DOCUMENT":
        return {
          Icon: FileText,
          bg: "#f0fff4",
          color: "#087568",
        };
      default:
        return {
          Icon: FileText,
          bg: "#f0f0f0",
          color: "#666666",
        };
    }
  };

  const { Icon, bg, color } = getIconAndColor(event.type);

  return (
    <article className="timeline-item">
      <div className="timeline-marker" style={{ background: bg, color }}>
        <Icon size={17} />
      </div>
      <div className="timeline-date">
        <span>{formatDate(event.occurredAt, { day: "numeric", month: "short" })}</span>
        <small>
          {new Intl.DateTimeFormat("en-IN", { year: "numeric" }).format(
            new Date(event.occurredAt)
          )}
        </small>
      </div>
      <div className="timeline-content">
        <span className={`status-chip status-${event.status.toLowerCase()}`}>
          {titleCase(event.status)}
        </span>
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        {/* We don't show the resume intake or review saved responses links in the summary */}
      </div>
    </article>
  );
}