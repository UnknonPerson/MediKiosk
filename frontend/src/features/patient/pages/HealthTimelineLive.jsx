import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarDays, CircleAlert, FileText, MessageCircleHeart, SlidersHorizontal } from "lucide-react";
import { fetchPatientTimeline, clearTimelineError, setTimelineFilter } from "../../patient/timelineSlice";
import { fetchIntakeForConsultation } from "../../intake/intakeSlice";
import { formatDate, titleCase } from "../utils/health";

export default function HealthTimelineLive() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { events, pagination, filter, status, error } = useSelector(
    (state) => state.timeline
  );
  const [resuming, setResuming] = useState("");

  // Load timeline data on mount and when filter changes
  useEffect(() => {
    dispatch(fetchPatientTimeline({ page: pagination.page, limit: pagination.limit, filter }));
    return () => {
      dispatch(clearTimelineError());
    };
  }, [dispatch, pagination.page, pagination.limit, filter, params.get("focus")]);

  // Handle resume intake for an incomplete consultation
  const resume = async (consultationId, healthcareSystem) => {
    setResuming(consultationId);
    try {
      const intake = await dispatch(fetchIntakeForConsultation(consultationId)).unwrap();
      navigate(`/patient/intake?system=${healthcareSystem}&intake=${intake._id}`);
    } finally {
      setResuming("");
    }
  };

  if (status === "loading" && !events.length) {
    return <div className="page-state"><span className="loading-dot"/>Loading your health timeline…</div>;
  }

  if (status === "failed") {
    return <div className="page-state"><span className="loading-dot"/>Failed to load timeline. Please try again.</div>;
  }

  return (
    <section className="content-page timeline-page">
      <span className="eyebrow">YOUR HEALTH TIMELINE</span>
      <h1>Your health journey</h1>
      <p className="page-intro">
        This timeline shows your health events including consultations, intakes, and documents in chronological order.
      </p>
      {error && (
        <p className="notice-error" role="alert">
          <CircleAlert size={18} />
          {error.message || "We could not load your timeline."}
        </p>
      )}
      <div className="timeline-toolbar">
        <span>
          <SlidersHorizontal size={17} />
          Filter events
        </span>
        <div>
          {[
            ["ALL", "All events"],
            ["CONSULTATION", "Consultations"],
            ["INTAKE", "Intakes"],
            ["DOCUMENT", "Documents"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                dispatch(setTimelineFilter(value));
                dispatch(fetchPatientTimeline({ page: 1, limit: pagination.limit, filter: value }));
              }}
              className={filter === value ? "filter-active" : ""}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {events.length ? (
        <div className="timeline">
          {events.map((event) => (
            <TimelineItem
              key={event.id}
              event={event}
              focused={params.get("focus") === event.id}
              onResume={resume}
              resuming={resuming === event.id}
            />
          ))}
          {pagination.hasMore && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                className="button-secondary outline"
                onClick={() =>
                  dispatch(fetchPatientTimeline({
                    page: pagination.page + 1,
                    limit: pagination.limit,
                    filter,
                  }))
                }
              >
                Load more events
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-card">
          <span><CalendarDays size={26}/></span>
          <h3>No health events yet</h3>
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

function TimelineItem({ event, focused, onResume, resuming }) {
  // Determine icon and styling based on event type
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
          Icon: FileText, // Could differentiate by extractionMethod if desired
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
  const completed =
    event.status === "COMPLETED" ||
    event.status === "PROCESSED" ||
    event.uploadStatus === "UPLOADED";

  return (
    <article className={`timeline-item ${focused ? "timeline-item-focused" : ""}`}>
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
        {event.type === "CONSULTATION" && event.metadata?.healthcareSystem === "AYUSH" && !event.metadata?.chiefComplaint ? (
          <p>AYUSH health assessment</p>
        ) : null}
        {event.type === "INTAKE" && (
          <p>
            {event.metadata?.intakeType === "AYUSH" ? "AYUSH" : "Modern"} health intake ·
            {completed ? "Completed" : "In progress"}
          </p>
        )}
        {event.type === "DOCUMENT" && (
          <p>
            {event.metadata?.documentType.replace("_", " ")} ·
            {event.metadata?.extractionMethod === "native" ? "Native text extraction" : event.metadata?.extractionMethod === "ocr" ? "OCR processed" : "Uploaded"}
          </p>
        )}
        {/* Resume intake for incomplete consultation */}
        {event.type === "CONSULTATION" &&
          event.status !== "COMPLETED" &&
          event.status !== "CANCELLED" && (
          <button
            disabled={resuming}
            onClick={() =>
              onResume(
                event.metadata.consultationId,
                event.metadata.healthcareSystem
              )
            }
            className="text-link"
          >
            {resuming ? "Opening…" : "Resume intake"} <ArrowRight size={16} />
          </button>
        )}
        {/* Link to completed consultation summary */}
        {event.type === "CONSULTATION" && event.status === "COMPLETED" && (
          <Link
            className="text-link"
            to={`/patient/summary?consultation=${event.metadata.consultationId}`}
          >
            Review saved responses <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}