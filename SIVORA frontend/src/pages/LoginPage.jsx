import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { X, Eye, EyeOff } from "lucide-react";

const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  toggle,
  show,
  onToggle,
  value,
  onChange,
  error,
}) => (
  <div>
    <label className="block text-[10px] font-sans tracking-[0.2em] uppercase text-gray-400 mb-1.5">
      {label}
    </label>

    <div className="relative">
      <input
        type={toggle ? (show ? "text" : "password") : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full bg-gray-50 border px-4 py-3 text-sm font-sans outline-none transition-all focus:bg-white focus:border-red-500 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      />

      {toggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>

    {error && (
      <p className="text-[10px] text-red-500 mt-1">
        {Array.isArray(error) ? error[0] : error}
      </p>
    )}
  </div>
);

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { login } = useAuth();
  const { fetchCart } = useCart();
  const nav = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: null }));
  };

  const clearForm = () =>
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    });

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (tab === "register" && !form.name.trim()) {
      errs.name = "Full name is required";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }

    if (!form.password) {
      errs.password = "Password is required";
    } else if (tab === "register" && form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (tab === "register" && form.password !== form.password_confirmation) {
      errs.password_confirmation = "Passwords do not match";
    }

    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();

    // Run client-side validation first
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Step 1: register or login
      let r =
        tab === "login"
          ? await authAPI.login({ email: form.email, password: form.password })
          : await authAPI.register(form);

      let d = r.data;
      let u = d.user || d.data?.user || d;
      let t = d.token || d.data?.token || d.access_token;

      // Step 2: if register returned no token, auto-login right after
      if (tab === "register" && !t) {
        const loginR = await authAPI.login({
          email: form.email,
          password: form.password,
        });
        d = loginR.data;
        u = d.user || d.data?.user || d;
        t = d.token || d.data?.token || d.access_token;
      }

      login(u, t);
      clearForm();
      await fetchCart();

      toast(
        tab === "login"
          ? `Welcome back, ${u?.name || ""}!`
          : `Welcome, ${u?.name || ""}! Your account has been created.`,
      );

      // Redirect: admin → /admin, user → where they came from or home
      if (u?.role?.toLowerCase() === "admin") {
        nav("/admin", { replace: true });
      } else {
        const from = location.state?.from || "/";
        nav(from, { replace: true });
      }
    } catch (err) {
      const errs = err.response?.data?.errors || {};
      const msg = (
        err.response?.data?.message || "Something went wrong"
      ).toLowerCase();

      if (
        msg.includes("email already") ||
        msg.includes("already taken") ||
        msg.includes("already registered") ||
        msg.includes("has already been taken")
      ) {
        setErrors({ email: "This email is already registered" });
      } else if (
        msg.includes("invalid credentials") ||
        msg.includes("wrong password") ||
        msg.includes("these credentials do not match") ||
        msg.includes("unauthorized")
      ) {
        setErrors({
          password: "Incorrect email or password",
          _general: "The email or password you entered is incorrect",
        });
      } else if (Object.keys(errs).length > 0) {
        setErrors(errs);
      } else {
        setErrors({
          _general: err.response?.data?.message || "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 to-red-400" />

        {/* Close button */}
        <button
          onClick={() => nav(-1)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-8 pb-10">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none mb-8">
            <span className="italic text-lg tracking-widest text-gray-900 uppercase font-bold">
              SIVORA
            </span>
            <span className="text-[8px] font-sans tracking-[0.4em] text-gray-400 uppercase">
              Fashion
            </span>
          </Link>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-gray-400 mb-7">
            {tab === "login"
              ? "Sign in to continue shopping."
              : "Join SIVORA Fashion today."}
          </p>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-100 mb-7">
            {[
              ["login", "Sign In"],
              ["register", "Register"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => {
                  setTab(k);
                  setErrors({});
                  clearForm();

                  // 🔥 IMPORTANT: also reset password visibility
                  setShowPass(false);
                  setShowConfirm(false);
                }}
                className={`text-[11px] font-sans tracking-widest uppercase px-4 py-2.5 border-b-2 transition-colors ${
                  tab === k
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* General error banner */}
          {errors._general && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-sans px-4 py-3 mb-5">
              {errors._general}
            </div>
          )}

          <form
            onSubmit={submit}
            autoComplete="off"
            noValidate
            className="space-y-4"
          >
            {/* Hidden dummy fields — trick browser into not autofilling */}
            <input type="text" style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            {tab === "register" && (
              <Field
                label="Full Name"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={(value) => set("name", value)}
                error={errors.name}
              />
            )}
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(value) => set("email", value)}
              error={errors.email}
            />
            <div
              className={`grid gap-4 ${
                tab === "register"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              <Field
                label="Password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(value) => set("password", value)}
                error={errors.password}
                toggle
                show={showPass}
                onToggle={() => setShowPass((p) => !p)}
              />

              {tab === "register" && (
                <Field
                  label="Confirm Password"
                  name="password_confirmation"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={(value) => set("password_confirmation", value)}
                  error={errors.password_confirmation}
                  toggle
                  show={showConfirm}
                  onToggle={() => setShowConfirm((p) => !p)}
                />
              )}
            </div>

            {tab === "login" && (
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-[11px] font-sans text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-sans text-[11px] tracking-widest uppercase py-4 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <svg className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading
                ? "Please wait…"
                : tab === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="text-xs font-sans text-gray-400 mt-6 text-center">
            {tab === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setTab(tab === "login" ? "register" : "login");
                setErrors({});
                clearForm();
              }}
              className="text-red-600 font-semibold hover:underline"
            >
              {tab === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
