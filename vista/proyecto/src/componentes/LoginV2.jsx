import { useState, useEffect } from "react";

/* ─── Design Tokens ─── */
const T = {
  navy:   "#050813",
  blue:   "#0a192b",
  blueSoft:"#EBF0FD",
  white:  "#ffffff",
  bg:     "#F8F9FC",
  border: "#0a192b98",
  text:   "#1B2A4A",
  muted:  "#6B7A99",
  error:  "#D94F4F",
  errorBg:"#FDF0F0",
  success:"#2ECC71",
  successBg:"#EDFBF3",
  round: "#055c8f",
  shadow: "#000000",
};

/* ─── Inline styles ─── */
const S = {
  root: {
    minHeight: "100vh",
    display: "flex",
    background: T.bg,
    fontFamily: "'Inter', system-ui, sans-serif",
    color: T.text,
  },
  panel: {
    display: "flex",
    flex: 1,
    borderRadius: 20,
    boxShadow: "0 8px 48px rgba(27,42,74,0.12)",
    background: T.blue,
    overflow: "hidden",
    margin: "auto",
    maxWidth: 900,
    minHeight: 620,
    boxShadow: "0 8px 48px rgba(27,42,74,0.12)",
  },
  brand: {
    width: 380,
    flexShrink: 0,
    background: `linear-gradient(150deg, ${T.navy} 0%, #2A4080 100%)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "48px 40px",
    color: T.white,
  },
  brandIcon: {
    width: 48,
    height: 48,
    background: T.round,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 12,
  },
  brandSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.62)",
    lineHeight: 1.6,
    marginBottom: 40,
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: T.round,
    flexShrink: 0,
  },
  form: {
    flex: 1,
    background: T.white,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "48px 44px",
    overflowY: "auto",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
    color: T.navy,
  },
  formSub: {
    fontSize: 13,
    color: T.muted,
    marginBottom: 28,
  },
  row: {
    display: "flex",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 14,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: T.navy,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  input: (hasError) => ({
    border: `1.5px solid ${hasError ? T.error : T.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: T.text,
    background: hasError ? T.errorBg : T.white,
    outline: "none",
    transition: "border-color 0.15s",
  }),
  errorMsg: {
    fontSize: 11,
    color: T.error,
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  btn: (disabled) => ({
    background: disabled ? "#A0AFCC" : T.blue,
    color: T.white,
    border: "none",
    borderRadius: 8,
    padding: "12px 0",
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 6,
    transition: "background 0.15s",
    letterSpacing: "0.01em",
  }),
  btnSecondary: {
    background: "transparent",
    color: T.blue,
    border: `1.5px solid ${T.border}`,
    borderRadius: 8,
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
    transition: "border-color 0.15s",
  },
  switch: {
    textAlign: "center",
    fontSize: 13,
    color: T.muted,
    marginTop: 18,
  },
  switchLink: {
    color: T.blue,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "none",
    fontSize: 13,
    padding: 0,
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
    marginTop: 2,
  },
  checkLabel: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 1.5,
  },
  banner: (type) => ({
    background: type === "success" ? T.successBg : T.errorBg,
    color: type === "success" ? "#1a7a47" : T.error,
    border: `1px solid ${type === "success" ? "#9DE8C0" : "#F5BEBE"}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  }),
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "16px 0",
    color: T.border,
    fontSize: 11,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: T.border,
  },
  pwStrength: {
    height: 3,
    borderRadius: 2,
    marginTop: 6,
    transition: "all 0.3s",
  },
  pwHint: {
    fontSize: 11,
    color: T.muted,
    marginTop: 4,
  },
  forgotLink: {
    fontSize: 12,
    color: T.blue,
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    fontWeight: 500,
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 8,
    display: "block",
    textAlign: "right",
  },
};

/* ─── Validation helpers ─── */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pwPolicy = (pw) => ({
  length:   pw.length >= 8,
  upper:    /[A-Z]/.test(pw),
  number:   /[0-9]/.test(pw),
});

const pwScore = (pw) => {
  const r = pwPolicy(pw);
  return Object.values(r).filter(Boolean).length;
};

const scoreColor = (s) => ["#D8DDE8", "#D94F4F", "#F0A500", "#2ECC71"][s] || T.border;
const scoreLabel = ["", "Débil", "Regular", "Segura"];

/* ─── Test emails (demo) ─── */
const emailCorrecto = 'admin@demo.com'
const passwordCorrecto = 'Admin123'


/* ═══════════════════════════════════════
   REGISTER FORM
═══════════════════════════════════════ */
function RegisterForm({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirm: "", terms: false,
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (submitted) validate({ ...form, [k]: v });
  };

  const validate = (f = form) => {
    const e = {};
    if (!f.nombre.trim())  e.nombre   = "El nombre es obligatorio.";
    if (!f.apellido.trim()) e.apellido = "El apellido es obligatorio.";
    if (!f.email.trim())   e.email    = "El correo es obligatorio.";
    else if (!emailRe.test(f.email)) e.email = "Ingresa un correo válido.";
    else if (FAKE_DB.has(f.email.toLowerCase())) e.email = "Este correo ya está registrado.";

    const pw = pwPolicy(f.password);
    if (!f.password)           e.password = "La contraseña es obligatoria.";
    else if (!pw.length)       e.password = "Mínimo 8 caracteres.";
    else if (!pw.upper)        e.password = "Incluye al menos una mayúscula.";
    else if (!pw.number)       e.password = "Incluye al menos un número.";

    if (!f.confirm)            e.confirm  = "Confirma tu contraseña.";
    else if (f.confirm !== f.password) e.confirm = "Las contraseñas no coinciden.";

    if (!f.terms) e.terms = "Debes aceptar los términos para continuar.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    FAKE_DB.add(form.email.toLowerCase());
    setLoading(false);
    setBanner({ type: "success", msg: `¡Registro exitoso! Revisa tu correo ${form.email} para verificar tu cuenta.` });
    setTimeout(() => onSuccess?.(), 3000);
  };

  const score = pwScore(form.password);

  return (
    <div style={S.form}>
      <div style={S.formTitle}>Crear cuenta</div>
      <div style={S.formSub}>Completa los campos para registrarte en Stockly.</div>

      {banner && <div style={S.banner(banner.type)}>{banner.msg}</div>}

      <div style={S.row}>
        <Field label="Nombre" error={errors.nombre}>
          <input style={S.input(!!errors.nombre)} value={form.nombre} onChange={set("nombre")} placeholder="María" />
        </Field>
        <Field label="Apellido" error={errors.apellido}>
          <input style={S.input(!!errors.apellido)} value={form.apellido} onChange={set("apellido")} placeholder="García" />
        </Field>
      </div>

      <Field label="Correo electrónico" error={errors.email}>
        <input style={S.input(!!errors.email)} value={form.email} onChange={set("email")} type="email" placeholder="correo@empresa.com" />
      </Field>

      <Field label="Contraseña" error={errors.password}>
        <input style={S.input(!!errors.password)} value={form.password} onChange={set("password")} type="password" placeholder="Mínimo 8 caracteres" />
        {form.password && (
          <>
            <div style={{ ...S.pwStrength, width: `${(score / 3) * 100}%`, background: scoreColor(score) }} />
            <div style={S.pwHint}>
              Seguridad: <strong style={{ color: scoreColor(score) }}>{scoreLabel[score]}</strong>
              {" · "}mayúscula {pwPolicy(form.password).upper ? "✓" : "✗"}
              {" · "}número {pwPolicy(form.password).number ? "✓" : "✗"}
              {" · "}8+ chars {pwPolicy(form.password).length ? "✓" : "✗"}
            </div>
          </>
        )}
      </Field>

      <Field label="Confirmar contraseña" error={errors.confirm}>
        <input style={S.input(!!errors.confirm)} value={form.confirm} onChange={set("confirm")} type="password" placeholder="Repite tu contraseña" />
      </Field>

      <div style={S.checkRow}>
        <input type="checkbox" id="terms" checked={form.terms} onChange={set("terms")} style={{ marginTop: 2, accentColor: T.blue, flexShrink: 0 }} />
        <label htmlFor="terms" style={S.checkLabel}>
          Acepto los{" "}
          <span style={{ color: T.blue, fontWeight: 600, cursor: "pointer" }}>términos y condiciones</span>
          {" "}y la{" "}
          <span style={{ color: T.blue, fontWeight: 600, cursor: "pointer" }}>política de privacidad</span>.
        </label>
      </div>
      {errors.terms && <div style={{ ...S.errorMsg, marginTop: -10, marginBottom: 10 }}>⚠ {errors.terms}</div>}

      <button style={S.btn(loading)} onClick={handleSubmit} disabled={loading}>
        {loading ? "Registrando…" : "Crear cuenta"}
      </button>

      <div style={S.switch}>
        ¿Ya tienes cuenta?{" "}
        <button style={S.switchLink} onClick={onSwitch}>Inicia sesión</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   LOGIN FORM
═══════════════════════════════════════ */
function LoginForm({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login"); // login | recover

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async () => {
    const e = {};
    if (!form.email)               e.email    = "El correo es obligatorio.";
    else if (!emailRe.test(form.email)) e.email = "Ingresa un correo válido.";
    if (!form.password)            e.password = "La contraseña es obligatoria.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    // Demo: only demo@stockly.com / Password1 or registered emails work
    if (emailRe.test(form.email) && form.password.length >= 8) {
      setBanner({ type: "success", msg: "Sesión iniciada correctamente. Redirigiendo…" });
      setTimeout(() => onSuccess?.(), 1500);
    } else {
      setBanner({ type: "error", msg: "Correo o contraseña incorrectos. Verifica tus datos." });
    }
  };

  if (view === "recover") return <RecoverForm onBack={() => setView("login")} />;

  return (
    <div style={S.form}>
      <div style={S.formTitle}>Iniciar sesión</div>
      <div style={S.formSub}>Accede a tu cuenta</div>

      {banner && <div style={S.banner(banner.type)}>{banner.msg}</div>}

      <Field label="Correo electrónico" error={errors.email}>
        <input style={S.input(!!errors.email)} value={form.email} onChange={set("email")} type="email" placeholder="Correo electronico" />
      </Field>

      <Field label="Contraseña" error={errors.password}>
        <input style={S.input(!!errors.password)} value={form.password} onChange={set("password")} type="password" placeholder="Tu contraseña" />
      </Field>

      {/* RF 2.3 - Forgot password link */}
      <button style={S.forgotLink} onClick={() => setView("recover")}>¿Olvidaste tu contraseña?</button>

      <button style={S.btn(loading)} onClick={handleLogin} disabled={loading}>
        {loading ? "Verificando…" : "Iniciar sesión"}
      </button>

      {/* RF 2.2 - Manual logout placeholder notice */}
      <div style={{ ...S.pwHint, textAlign: "center", marginTop: 12 }}>
        La sesión se cerrará automáticamente tras 30 min de inactividad.
      </div>

      <div style={S.switch}>
        ¿No tienes cuenta?{" "}
        <button style={S.switchLink} onClick={onSwitch}>Regístrate</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   RECOVER PASSWORD FORM  (RF 2.3)
═══════════════════════════════════════ */
function RecoverForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email) return setError("El correo es obligatorio.");
    if (!emailRe.test(email)) return setError("Ingresa un correo válido.");
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div style={S.form}>
      <div style={S.formTitle}>Recuperar contraseña</div>
      <div style={S.formSub}>
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </div>

      {sent ? (
        <div style={S.banner("success")}>
          ✓ Correo enviado. Revisa tu bandeja de entrada (y la carpeta de spam).
        </div>
      ) : (
        <>
          <Field label="Correo electrónico" error={error}>
            <input style={S.input(!!error)} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="correo@empresa.com" />
          </Field>
          <button style={S.btn(loading)} onClick={handle} disabled={loading}>
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </>
      )}

      <button style={{ ...S.btnSecondary, marginTop: 14 }} onClick={onBack}>
        ← Volver al inicio de sesión
      </button>
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({ label, error, children }) {
  return (
    <div style={{ ...S.field }}>
      <label style={S.label}>{label}</label>
      {children}
      {error && <div style={S.errorMsg}>⚠ {error}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════
   BRAND PANEL
═══════════════════════════════════════ */
function BrandPanel() {
  return (
    <div style={S.brand}>
      <div style={S.brandIcon}><img src="/a.png" alt="Stockly" height="50"/></div> 
      <div style={S.brandTitle}>Stockly</div>
      <div style={S.brandSub}>
        Gestión inteligente de inventarios para equipos que necesitan precisión y velocidad.
      </div>
      <ul style={S.featureList}>
        {[
          "Control de stock en tiempo real",
          "Registro y seguimiento de productos",
          "Reportes automatizados",
          "Acceso seguro por roles",
        ].map((f) => (
          <li key={f} style={S.featureItem}>
            <span style={S.featureDot} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════
   ROOT
═══════════════════════════════════════ */
export default function AuthModule({ onLoginSuccess }) {
  const [screen, setScreen] = useState("login"); // login | register | app
  const [animKey, setAnimKey] = useState(0);

  const switchTo = (s) => {
    setAnimKey((k) => k + 1);
    setScreen(s);
  };

  const handleLoginSuccess = (userData) => {
    onLoginSuccess?.(userData || { logged: true });
    setScreen("app");
  };

  if (screen === "app") {
    return (
      <div style={{ ...S.root, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>😊</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.navy }}>¡Bienvenido de nuevo!</div>
        <div style={{ color: T.muted, fontSize: 14 }}>Sesión activa</div>
        <button
          style={{ ...S.btnSecondary, padding: "10px 28px", marginTop: 24 }}
          onClick={() => switchTo("login")}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.panel}>
        <BrandPanel />
        <div key={animKey} style={{ flex: 1, animation: "fadeIn 0.25s ease" }}>
          {screen === "register" ? (
            <RegisterForm
              onSuccess={() => switchTo("login")}
              onSwitch={() => switchTo("login")}
            />
          ) : (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitch={() => switchTo("register")}
            />
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(10px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </div>
  );
}
