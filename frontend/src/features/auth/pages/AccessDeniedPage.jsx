import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import BrandMark from "../../../components/brand/BrandMark";

export default function AccessDeniedPage() { return <main className="status-page"><Link to="/" className="focus-ring rounded-xl"><BrandMark /></Link><div className="status-card"><ShieldAlert size={38}/><h1>This area is not available to your account.</h1><p>Vaidyam keeps patient and clinician information separated. Return to the area assigned to your account.</p><Link className="button-primary" to="/">Return home</Link></div></main>; }
