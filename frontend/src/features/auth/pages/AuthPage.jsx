import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import BrandMark from "../../../components/brand/BrandMark";
import { clearAuthError, login, registerAccount, requestPasswordReset, resendVerification, resetPassword, verifyEmail, verifyPasswordReset } from "../authSlice";

export default function AuthPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error: authError, actionStatus } = useSelector((state) => state.auth);
  const mode = params.get("mode") || "login";
  const next = params.get("next");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", otp: "", resetToken: "" });
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const setMode = (value) => { setFormError(""); setNotice(""); dispatch(clearAuthError()); setParams((current) => { current.set("mode", value); return current; }); };
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setFormError(""); setNotice(""); dispatch(clearAuthError());
    try {
      if (mode === "login") {
        const user = await dispatch(login({ email: form.email, password: form.password })).unwrap();
        navigate(next || (user.role === "DOCTOR" ? "/doctor" : "/patient/dashboard"), { replace: true });
      } else if (mode === "register") {
        await dispatch(registerAccount({ fullName: form.fullName, email: form.email, password: form.password })).unwrap();
        setNotice("We sent a six-digit verification code to your email."); setMode("verify");
      } else if (mode === "verify") {
        await dispatch(verifyEmail({ email: form.email, otp: form.otp })).unwrap();
        setNotice("Your email is verified. Sign in to continue."); setMode("login");
      } else if (mode === "forgot") {
        await dispatch(requestPasswordReset(form.email)).unwrap(); setNotice("If an eligible account exists, a reset code has been sent."); setMode("reset-verify");
      } else if (mode === "reset-verify") {
        const data = await dispatch(verifyPasswordReset({ email: form.email, otp: form.otp })).unwrap();
        setForm((current) => ({ ...current, resetToken: data.resetToken })); setMode("reset");
      } else if (mode === "reset") {
        if (form.password !== form.confirmPassword) throw new Error("The passwords do not match.");
        await dispatch(resetPassword({ email: form.email, resetToken: form.resetToken, password: form.password })).unwrap();
        setNotice("Your password has been reset. Sign in with your new password."); setMode("login");
      }
    } catch (submitError) { setFormError(typeof submitError === "string" ? submitError : submitError.message); }
  };

  const titles = {
    login: ["Welcome back", "Sign in to continue your health journey."], register: ["Create your account", "Start with a secure Vaidyam account."],
    verify: ["Check your email", "Enter the six-digit code we sent you."], forgot: ["Reset your password", "We will send a secure verification code."],
    "reset-verify": ["Verify your code", "Enter the six-digit code from your email."], reset: ["Choose a new password", "Use at least eight characters."],
  };
  const [title, subtitle] = titles[mode] || titles.login;
  const isOtpMode = mode === "verify" || mode === "reset-verify";

  return <div className="auth-page">
    <section className="auth-aside"><Link to="/" className="focus-ring rounded-xl"><BrandMark dark /></Link><div className="auth-aside-copy"><span className="eyebrow eyebrow-light">HEALTH, MADE CLEARER</span><h1>Tell your health story once. Be understood faster.</h1><p>Vaidyam brings your symptoms, previous conversations, and health context into a calm, usable overview.</p></div><div className="auth-trust"><ShieldCheck size={19} /><span>Your information is collected only with your consent.</span></div></section>
    <section className="auth-form-side"><Link to="/" className="auth-back-link inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 focus-ring lg:hidden"><ArrowLeft size={17} />Back to home</Link><div className="auth-form-card"><div className="mb-8"><span className="eyebrow">SECURE ACCESS</span><h2>{title}</h2><p>{subtitle}</p></div>
      {notice && <div className="notice-success" role="status"><CheckCircle2 size={19} />{notice}</div>}
      {(formError || authError) && <div className="notice-error" role="alert">{formError || authError}</div>}
      <form onSubmit={submit} className="space-y-5">
        {mode === "register" && <Field icon={UserRound} label="Full name" name="fullName" value={form.fullName} onChange={update} autoComplete="name" placeholder="Your full name" />}
        {mode !== "reset" && <Field icon={Mail} label="Email address" type="email" name="email" value={form.email} onChange={update} autoComplete="email" placeholder="you@example.com" />}
        {isOtpMode && <Field icon={KeyRound} label="Verification code" inputMode="numeric" name="otp" value={form.otp} onChange={update} placeholder="6-digit code" maxLength="6" />}
        {(mode === "login" || mode === "register" || mode === "reset") && <div><label htmlFor="password">Password</label><div className="input-with-icon"><LockKeyhole size={18} aria-hidden="true" /><input id="password" required type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={update} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters"/><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>}
        {mode === "reset" && <Field icon={LockKeyhole} label="Confirm new password" type={showPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" placeholder="Repeat your new password" />}
        <button disabled={actionStatus === "pending"} className="button-primary w-full" type="submit">{actionStatus === "pending" ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : mode === "verify" ? "Verify email" : mode === "forgot" ? "Send verification code" : mode === "reset-verify" ? "Verify code" : "Reset password"}<ArrowRight size={18} /></button>
      </form>
      <div className="auth-links">{mode === "login" && <><button onClick={() => setMode("forgot")}>Forgot password?</button><p>New to Vaidyam? <button onClick={() => setMode("register")}>Create an account</button></p></>}{mode === "register" && <p>Already have an account? <button onClick={() => setMode("login")}>Sign in</button></p>}{mode === "verify" && <><button onClick={() => dispatch(resendVerification(form.email)).unwrap().then(() => setNotice("A new verification code has been sent.")).catch((resendError) => setFormError(typeof resendError === "string" ? resendError : resendError.message))}>Resend code</button><p><button onClick={() => setMode("login")}>Back to sign in</button></p></>}{(mode === "forgot" || mode === "reset" || mode === "reset-verify") && <button onClick={() => setMode("login")}>Back to sign in</button>}</div>
    </div></section>
  </div>;
}

function Field({ icon: Icon, label, ...props }) { return <div><label htmlFor={props.name}>{label}</label><div className="input-with-icon"><Icon size={18} aria-hidden="true"/><input id={props.name} required {...props} /></div></div>; }
