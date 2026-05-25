import { useState, useEffect } from "react";

// ─── Paleta & estilos globales ───────────────────────────────────────────────
const G = {
  bg: "#0D0F14",
  surface: "#161A22",
  card: "#1E2330",
  border: "#2A3044",
  accent: "#4F7CFF",
  accentHover: "#6B93FF",
  success: "#2DD4AA",
  danger: "#FF5C6A",
  warn: "#F5A623",
  text: "#F0F2FF",
  muted: "#8B93B0",
  subtle: "#3A4260",
};

const css = {
  app: {
    minHeight: "100vh",
    background: G.bg,
    color: G.text,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: G.card,
    border: `1px solid ${G.border}`,
    borderRadius: 16,
    padding: "40px 44px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  wideCard: {
    background: G.card,
    border: `1px solid ${G.border}`,
    borderRadius: 16,
    padding: "32px 36px",
    width: "100%",
    maxWidth: 960,
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: G.muted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    background: G.surface,
    border: `1px solid ${G.border}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: G.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  inputError: {
    borderColor: G.danger,
  },
  errMsg: {
    color: G.danger,
    fontSize: 12,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  btn: (variant = "primary") => ({
    width: "100%",
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.02em",
    transition: "background 0.2s, transform 0.1s",
    background: variant === "primary" ? G.accent : G.subtle,
    color: variant === "primary" ? "#fff" : G.text,
  }),
  btnSm: (variant = "primary") => ({
    padding: "7px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background:
      variant === "danger"
        ? "#3D1A1E"
        : variant === "success"
        ? "#0E2E27"
        : G.subtle,
    color:
      variant === "danger"
        ? G.danger
        : variant === "success"
        ? G.success
        : G.text,
    transition: "opacity 0.15s",
  }),
  tag: (color = G.accent) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    background: color + "22",
    color: color,
    letterSpacing: "0.04em",
  }),
  divider: {
    border: "none",
    borderTop: `1px solid ${G.border}`,
    margin: "24px 0",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: G.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: G.muted,
    marginBottom: 28,
  },
  link: {
    color: G.accent,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePassword = (p) =>
  p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={css.label}>{label}</label>
      {children}
      {error && (
        <div style={css.errMsg}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}

function Input({ error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...css.input,
        ...(error ? css.inputError : {}),
        borderColor: focused ? G.accent : error ? G.danger : G.border,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Banner({ type, msg }) {
  if (!msg) return null;
  const colors = {
    success: G.success,
    error: G.danger,
    info: G.accent,
    warn: G.warn,
  };
  const c = colors[type] || G.accent;
  return (
    <div
      style={{
        background: c + "18",
        border: `1px solid ${c}44`,
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        color: c,
        marginBottom: 18,
      }}
    >
      {msg}
    </div>
  );
}

// ─── REGISTRO (RF 1.x) ────────────────────────────────────────────────────────
function Register({ users, setUsers, onSwitch }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido.";
    if (!form.apellido.trim()) e.apellido = "El apellido es requerido.";
    if (!validateEmail(form.email))
      e.email = "Formato de correo electrónico inválido."; // RF 1.2
    if (users.find((u) => u.email === form.email))
      e.email = "Este correo ya está registrado."; // RF 1.3
    if (!validatePassword(form.password))
      e.password =
        "Mínimo 8 caracteres, una mayúscula y un número."; // RF 1.4
    if (form.password !== form.confirm)
      e.confirm = "Las contraseñas no coinciden."; // RF 1.5
    if (!form.terms) e.terms = "Debes aceptar los términos y condiciones."; // RF 1.8
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setUsers((u) => [
      ...u,
      { email: form.email, password: form.password, nombre: form.nombre, apellido: form.apellido, role: "user", verified: false },
    ]);
    setBanner({ type: "success", msg: `✓ Registro exitoso. Se envió un correo de verificación a ${form.email}.` }); // RF 1.6
    setTimeout(() => onSwitch("login"), 2800);
  };

  return (
    <div style={css.card}>
      <div style={css.title}>Crear cuenta</div>
      <div style={css.subtitle}>Todos los campos son obligatorios</div>
      <Banner type={banner?.type} msg={banner?.msg} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Nombre" error={errors.nombre}>
          <Input placeholder="Ana" value={form.nombre} onChange={set("nombre")} error={errors.nombre} />
        </Field>
        <Field label="Apellido" error={errors.apellido}>
          <Input placeholder="García" value={form.apellido} onChange={set("apellido")} error={errors.apellido} />
        </Field>
      </div>
      <Field label="Correo electrónico" error={errors.email}>
        <Input type="email" placeholder="ana@empresa.com" value={form.email} onChange={set("email")} error={errors.email} />
      </Field>
      <Field label="Contraseña" error={errors.password}>
        <Input type="password" placeholder="Min. 8 chars, 1 mayúscula, 1 número" value={form.password} onChange={set("password")} error={errors.password} />
      </Field>
      <Field label="Confirmar contraseña" error={errors.confirm}>
        <Input type="password" placeholder="Repite la contraseña" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
      </Field>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: G.muted }}>
          <input type="checkbox" checked={form.terms} onChange={set("terms")} style={{ marginTop: 2, accentColor: G.accent }} />
          Acepto los <span style={{ color: G.accent }}>términos y condiciones</span> del servicio.
        </label>
        {errors.terms && <div style={css.errMsg}>⚠ {errors.terms}</div>}
      </div>
      <button style={css.btn()} onClick={submit}>Registrarme</button>
      <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: G.muted }}>
        ¿Ya tienes cuenta?{" "}
        <button style={css.link} onClick={() => onSwitch("login")}>Iniciar sesión</button>
      </div>
    </div>
  );
}

// ─── LOGIN (RF 2.x) ───────────────────────────────────────────────────────────
function Login({ users, setCurrentUser, onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const e = {};
    if (!validateEmail(form.email)) e.email = "Formato de correo inválido."; // RF 2.2
    if (!form.password) e.password = "Ingresa tu contraseña."; // RF 2.3
    setErrors(e);
    if (Object.keys(e).length) return;
    const user = users.find((u) => u.email === form.email && u.password === form.password); // RF 2.4
    if (!user) {
      setBanner({ type: "error", msg: "Credenciales incorrectas. Verifica tu correo y contraseña." });
      return;
    }
    setCurrentUser(user);
  };

  return (
    <div style={css.card}>
      <div style={css.title}>Iniciar sesión</div>
      <div style={css.subtitle}>Acceso según rol del usuario</div>
      <Banner type={banner?.type} msg={banner?.msg} />
      <Field label="Correo electrónico" error={errors.email}>
        <Input type="email" placeholder="tu@correo.com" value={form.email} onChange={set("email")} error={errors.email} />
      </Field>
      <Field label="Contraseña" error={errors.password}>
        <Input type="password" placeholder="Tu contraseña" value={form.password} onChange={set("password")} error={errors.password} />
      </Field>
      <div style={{ textAlign: "right", marginBottom: 20 }}>
        <button style={css.link} onClick={() => onSwitch("recovery")}>¿Olvidaste tu contraseña?</button> {/* RF 2.7 */}
      </div>
      <button style={css.btn()} onClick={submit}>Entrar</button>
      <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: G.muted }}>
        ¿No tienes cuenta?{" "}
        <button style={css.link} onClick={() => onSwitch("register")}>Regístrate</button>
      </div>
    </div>
  );
}

// ─── RECUPERAR CONTRASEÑA (RF 2.7) ────────────────────────────────────────────
function Recovery({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!validateEmail(email)) { setError("Formato de correo inválido."); return; }
    setError("");
    setSent(true);
  };

  return (
    <div style={css.card}>
      <div style={css.title}>Recuperar contraseña</div>
      <div style={css.subtitle}>Te enviaremos un enlace de recuperación</div>
      {sent ? (
        <Banner type="success" msg={`✓ Si el correo ${email} existe, recibirás instrucciones en breve.`} />
      ) : (
        <>
          <Field label="Correo electrónico" error={error}>
            <Input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          </Field>
          <button style={css.btn()} onClick={submit}>Enviar enlace</button>
        </>
      )}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <button style={css.link} onClick={() => onSwitch("login")}>← Volver al login</button>
      </div>
    </div>
  );
}

// ─── INVENTARIO (RF 3.x) ──────────────────────────────────────────────────────
const INITIAL_PRODS = [
  { id: 1, nombre: "Laptop Dell XPS", categoria: "Electrónica", cantidad: 12, precio: 1299.99 },
  { id: 2, nombre: "Monitor LG 27\"", categoria: "Electrónica", cantidad: 8, precio: 349.0 },
  { id: 3, nombre: "Silla Ergonómica", categoria: "Mobiliario", cantidad: 25, precio: 459.0 },
  { id: 4, nombre: "Teclado Mecánico", categoria: "Accesorios", cantidad: 40, precio: 89.99 },
];

let nextId = 5;

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(
    product || { nombre: "", categoria: "", cantidad: "", precio: "" }
  );
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Nombre requerido.";
    if (!form.categoria.trim()) e.categoria = "Categoría requerida.";
    if (isNaN(form.cantidad) || Number(form.cantidad) < 0)
      e.cantidad = "Cantidad válida requerida.";
    if (isNaN(form.precio) || Number(form.precio) <= 0)
      e.precio = "Precio válido requerido.";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      ...form,
      id: form.id || nextId++,
      cantidad: Number(form.cantidad),
      precio: Number(form.precio),
    });
  };

  const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24,
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...css.card, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={css.title}>{form.id ? "Editar producto" : "Nuevo producto"}</div>
        <hr style={css.divider} />
        <Field label="Nombre del producto" error={errors.nombre}>
          <Input placeholder="Ej. Monitor 4K" value={form.nombre} onChange={set("nombre")} error={errors.nombre} />
        </Field>
        <Field label="Categoría" error={errors.categoria}>
          <Input placeholder="Ej. Electrónica" value={form.categoria} onChange={set("categoria")} error={errors.categoria} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Cantidad" error={errors.cantidad}>
            <Input type="number" min="0" value={form.cantidad} onChange={set("cantidad")} error={errors.cantidad} />
          </Field>
          <Field label="Precio ($)" error={errors.precio}>
            <Input type="number" min="0" step="0.01" value={form.precio} onChange={set("precio")} error={errors.precio} />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button style={{ ...css.btn("secondary"), flex: 1 }} onClick={onClose}>Cancelar</button>
          <button style={{ ...css.btn(), flex: 1 }} onClick={submit}>
            {form.id ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Inventory({ user, onLogout }) {
  const [products, setProducts] = useState(INITIAL_PRODS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | product
  const [deleteId, setDeleteId] = useState(null);
  const [banner, setBanner] = useState(null);

  // RF 2.5 – cierre de sesión automático tras 5 min de inactividad
  useEffect(() => {
    let timer = setTimeout(() => {
      setBanner({ type: "warn", msg: "Sesión cerrada por inactividad." });
      setTimeout(onLogout, 2000);
    }, 5 * 60 * 1000);
    const reset = () => { clearTimeout(timer); timer = setTimeout(onLogout, 5 * 60 * 1000); };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => { clearTimeout(timer); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); };
  }, [onLogout]);

  const filtered = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const saveProduct = (p) => {
    setProducts((prev) =>
      prev.find((x) => x.id === p.id)
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [...prev, p]
    );
    setModal(null);
    setBanner({ type: "success", msg: `✓ Producto "${p.nombre}" guardado.` });
    setTimeout(() => setBanner(null), 3000);
  };

  const confirmDelete = (id) => setDeleteId(id);
  const doDelete = () => {
    const p = products.find((x) => x.id === deleteId);
    setProducts((prev) => prev.filter((x) => x.id !== deleteId));
    setDeleteId(null);
    setBanner({ type: "info", msg: `Producto "${p?.nombre}" eliminado.` });
    setTimeout(() => setBanner(null), 3000);
  };

  const totalItems = products.reduce((a, p) => a + p.cantidad, 0);
  const totalValue = products.reduce((a, p) => a + p.cantidad * p.precio, 0);

  const rolColor = user.role === "admin" ? G.accent : G.success;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 980, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Control de Inventarios</div>
          <div style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>
            Bienvenido, <strong style={{ color: G.text }}>{user.nombre} {user.apellido}</strong>{" "}
            <span style={css.tag(rolColor)}>{user.role.toUpperCase()}</span>
          </div>
        </div>
        <button style={{ ...css.btn("secondary"), width: "auto", padding: "9px 20px", fontSize: 13 }} onClick={onLogout}>
          Cerrar sesión {/* RF 2.6 */}
        </button>
      </div>

      <Banner type={banner?.type} msg={banner?.msg} />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Productos registrados", value: products.length, color: G.accent },
          { label: "Unidades en stock", value: totalItems, color: G.success },
          { label: "Valor total del inventario", value: `$${totalValue.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: G.warn },
        ].map((s) => (
          <div key={s.label} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, color: G.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <input
          style={{ ...css.input, flex: 1 }}
          placeholder="Buscar por nombre o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={{ ...css.btn(), width: "auto", padding: "0 22px", whiteSpace: "nowrap" }} onClick={() => setModal("new")}>
          + Nuevo producto
        </button>
      </div>

      {/* Tabla de productos */}
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: G.card, borderBottom: `1px solid ${G.border}` }}>
              {["ID", "Producto", "Categoría", "Cantidad", "Precio", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: G.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: G.muted }}>
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid ${G.border}` : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = G.card)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px", color: G.muted }}># {p.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: G.text }}>{p.nombre}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={css.tag(G.muted)}>{p.categoria}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: p.cantidad < 5 ? G.danger : p.cantidad < 15 ? G.warn : G.success, fontWeight: 600 }}>
                      {p.cantidad}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: G.text }}>
                    ${p.precio.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={css.btnSm("success")} onClick={() => setModal(p)}>Editar</button>
                      <button style={css.btnSm("danger")} onClick={() => confirmDelete(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de producto */}
      {modal && (
        <ProductModal
          product={modal === "new" ? null : modal}
          onSave={saveProduct}
          onClose={() => setModal(null)}
        />
      )}

      {/* Confirmación de eliminación */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ ...css.card, maxWidth: 380 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>¿Eliminar producto?</div>
            <div style={{ fontSize: 13, color: G.muted, marginBottom: 24 }}>
              Esta acción no se puede deshacer. El producto será removido del inventario.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...css.btn("secondary"), flex: 1 }} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button style={{ ...css.btn(), flex: 1, background: G.danger }} onClick={doDelete}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("login"); // login | register | recovery | app
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { email: "admin@demo.com", password: "Admin123", nombre: "Admin", apellido: "Demo", role: "admin", verified: true },
    { email: "user@demo.com", password: "User1234", nombre: "Usuario", apellido: "Demo", role: "user", verified: true },
  ]);

  const handleSetUser = (u) => {
    setCurrentUser(u);
    setView("app");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView("login");
  };

  if (currentUser && view === "app") {
    return (
      <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Inventory user={currentUser} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div style={css.app}>
      <div style={{ width: "100%" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "10px 20px" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: G.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>S</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: G.text }}>SistemaApp</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          {view === "register" && (
            <Register users={users} setUsers={setUsers} onSwitch={setView} />
          )}
          {view === "login" && (
            <Login users={users} setCurrentUser={handleSetUser} onSwitch={setView} />
          )}
          {view === "recovery" && <Recovery onSwitch={setView} />}
        </div>

        {/* Credenciales de prueba */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: G.muted }}>
          Demo → admin@demo.com / Admin123 · user@demo.com / User1234
        </div>
      </div>
    </div>
  );
}
