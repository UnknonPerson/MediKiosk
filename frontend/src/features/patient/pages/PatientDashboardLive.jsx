import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarClock, CircleAlert, ClipboardPlus, FileUp, HeartPulse, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { fetchPatientProfile } from "../patientSlice";
import { fetchConsultations } from "../../consultation/consultationsSlice";
import { formatDate, titleCase } from "../utils/health";

export default function PatientDashboardLive() {
  const dispatch = useDispatch(); const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); const { profile, status: profileStatus, error: profileError } = useSelector((state) => state.patient); const { items, status: consultationStatus, error: consultationError } = useSelector((state) => state.consultations);
  useEffect(() => { dispatch(fetchPatientProfile()).unwrap().catch((error) => { if (error?.status === 404) navigate("/patient/setup", { replace: true }); }); dispatch(fetchConsultations()); }, [dispatch, navigate]);
  if ((profileStatus === "idle" || profileStatus === "loading") && consultationStatus !== "failed") return <div className="page-state"><span className="loading-dot"/>Loading your health overview…</div>;
  const completed = items.filter((item) => item.status === "COMPLETED").length; const inProgress = items.filter((item) => item.status === "IN_PROGRESS").length; const error = profileError?.message || consultationError;
  return <section className="dashboard-page"><div className="dashboard-welcome"><div><span className="eyebrow">YOUR PERSONAL SPACE</span><h1>Hello, {user?.fullName?.split(" ")[0] || "there"}.</h1><p>Start where you are. Vaidyam will help organize the information you choose to share.</p></div><Link className="button-primary" to="/patient/healthcare"><MessageCircleHeart size={19}/>Start health intake <ArrowRight size={17}/></Link></div>
    {error && <p className="notice-error" role="alert"><CircleAlert size={18}/>{error}</p>}
    <div className="dashboard-grid"><article className="dashboard-hero-card"><div className="dashboard-hero-icon"><HeartPulse size={28}/></div><div><span className="card-kicker">TODAY'S CHECK-IN</span><h2>What would you like help organizing?</h2><p>Share a health concern in your own words, by text or voice. You can review every saved answer.</p><Link to="/patient/healthcare" className="text-link">Begin a guided intake <ArrowRight size={16}/></Link></div></article><article className="profile-glance"><span className="profile-glance-icon"><ShieldCheck size={21}/></span><div><b>Your privacy choices</b><p>{profile?.consent?.medicalDataProcessing && profile?.consent?.aiProcessing ? "Health intake is ready." : "Health intake is paused until required consent is enabled."}</p><Link to="/patient/consent" className="text-link">Review consent</Link></div></article></div>
    <section className="metric-grid" aria-label="Health activity"><Metric value={items.length} label="Health conversations"/><Metric value={completed} label="Completed"/><Metric value={inProgress} label="In progress"/></section>
    <section className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Your health conversations</h2></div><Link to="/patient/timeline" className="text-link">View history <CalendarClock size={16}/></Link></section>
    {items.length ? <div className="consultation-list">{items.slice(0, 4).map((item) => <article key={item._id} className="consultation-card"><div><span className={`status-chip status-${item.status.toLowerCase()}`}>{titleCase(item.status)}</span><h3>{item.chiefComplaint}</h3><p>{item.healthcareSystem === "AYUSH" ? "AYUSH health intake" : "Modern health intake"} · Started {formatDate(item.createdAt)}</p></div><Link to={`/patient/summary?consultation=${item._id}`} className="button-secondary button-small">{item.status === "IN_PROGRESS" ? "Resume" : "View details"}</Link></article>)}</div> : <EmptyActivity />}
    <section className="quick-actions"><Link to="/patient/healthcare"><ClipboardPlus size={21}/><span><b>Start a health conversation</b><small>Share a new concern at your pace.</small></span><ArrowRight size={18}/></Link><Link to="/patient/documents"><FileUp size={21}/><span><b>Medical documents</b><small>See upload availability and document status.</small></span><ArrowRight size={18}/></Link></section>
  </section>;
}
function Metric({ value, label }) { return <article className="metric-card"><strong>{value}</strong><span>{label}</span></article>; }
function EmptyActivity() { return <div className="empty-card"><span><MessageCircleHeart size={26}/></span><h3>No health conversations yet</h3><p>When you are ready, tell Vaidyam what is on your mind. Your answers will be organized here.</p><Link to="/patient/healthcare" className="button-primary button-small">Start now <ArrowRight size={16}/></Link></div>; }
