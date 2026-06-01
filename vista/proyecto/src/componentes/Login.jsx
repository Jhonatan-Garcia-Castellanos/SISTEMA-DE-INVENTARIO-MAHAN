import React, { useState } from "react";

export default function Login({onLoginSucceses}) {
  const [email, setEmail] = useState ("");
  const [password, setPassword] = useState ("");
  const [error, setError] = useState ("");
  const handleSubmit = (e) => {
    e.preventDefault ();
    setError ('');
    const emailCorrecto = 'admin@demo.com'
    const passwordCorrecto = 'Admin123'
    if (email === emailCorrecto && password === passwordCorrecto){
      onLoginSucceses ({
        email:email,
        role:'admin'
      })
    }
    else {
      setError ('Credenciales incorrectas, Intente con otro usuario.')
    }
  }
  return (
    <div >
      <div >Iniciar sesión</div>
      <div >Acceso según rol del usuario</div>
      {/* <Banner type={banner?.type} msg={banner?.msg} /> */}
      {error && (
        <div className="bg-red-50">
          {error}
          </div>
      )}
      <form onSubmit = {handleSubmit}>
      
        <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail (e.target.value)} />
      
      
        <input type="password" placeholder="Tu contraseña" value={password} onChange={(e) => setPassword (e.target.value)} />
      {/* <div style={{ textAlign: "right", marginBottom: 20 }}>
        <button style={css.link} onClick={() => onSwitch("recovery")}>¿Olvidaste tu contraseña?</button> {/* RF 2.7}
      </div>*/}
      <button  type = 'submit'>Entrar</button>
      </form>
      <div style={{ textAlign: "center", marginTop: 18, fontSize: 13 }}>
        ¿No tienes cuenta?{" "}
        <button  onClick={() => onSwitch("register")}>Regístrate</button>
      </div>
    </div>
  );
}