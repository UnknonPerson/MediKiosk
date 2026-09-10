import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert, HeartPulse, Leaf, Mic, ShieldCheck } from "lucide-react";
import { fetchPatientProfile } from "../../patient/patientSlice";

export default function HealthcareSelectionLive() {
  const dispatch = useDispatch(); const navigate = useNavigate(); const { profile, status, error } = useSelector((state) => state.patient);
  useEffect(() => { if (!profile) dispatch(fetchPatientProfile()).unwrap().catch((requestError) => { if (requestError?.status === 404) navigate("/patient/setup", { replace: true }); }); }, [dispatch, navigate, profile]);
  const intakeReady = profile?.consent?.medicalDataProcessing && profile?.consent?.aiProcessing;
  if (!profile && status === "loading") return <div className="page-state"><span className="loading-dot"/>Checking your intake settings…</div>;
  return <section className="content-page healthcare-page"><span className="eyebrow">GUIDED HEALTH INTAKE</span><h1>How would you like to begin?</h1><p className="page-intro">Choose the approach that feels right today. You can type or speak your answers in either conversation.</p>{error?.message && error.status !== 404 && <p className="notice-error" role="alert"><CircleAlert size={18}/>{error.message}</p>}{profile && !intakeReady ? <div className="consent-callout"><ShieldCheck size={23}/><div><b>Two consent choices are needed before an intake can begin.</b><p>Enable health-information collection and adaptive intake questions to continue.</p><Link to="/patient/consent" className="text-link">Review consent choices <ArrowRight size={16}/></Link></div></div> : <div className="system-choice-grid"><IntakeChoice icon={HeartPulse} title="Modern health intake" label="SYMPTOMS & HEALTH HISTORY" text="A structured conversation about your current concern, symptoms, medications, and relevant health history." to="/patient/intake?system=MODERN"/><IntakeChoice icon={Leaf} title="AYUSH health intake" label="AYUSH-ALIGNED WELLNESS" text="A guided intake that includes wellbeing, routine, digestion, sleep, and AYUSH-specific observations." to="/patient/intake?system=AYUSH"/></div>}<div className="voice-note"><Mic size={20}/><p><b>Prefer to speak?</b> Voice input is available inside the conversation. Text is always available too.</p></div></section>;
}
function IntakeChoice({ icon: Icon, title, label, text, to }) { return <article className="system-choice"><span className="system-icon"><Icon size={28}/></span><span className="card-kicker">{label}</span><h2>{title}</h2><p>{text}</p><Link className="button-primary" to={to}>Choose this intake <ArrowRight size={17}/></Link></article>; }
