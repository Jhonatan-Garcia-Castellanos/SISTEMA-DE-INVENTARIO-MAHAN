import React, { useState } from 'react'
// import reactLogo from './assets/react.svg'
import Login from './componentes/Login'
// import Inventario from './componentes/SISTEMAGES'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import './App.css'

export default function App() {
  // Estado qye cibtrika su hay usuarios logueado
  const [user, setUser] = useState(null)
  // Funcion para cerrar sesion 
  const handleLogout = () => {
    setUser(null);
  };
    // <h1>Mi aplicacion</h1>
 return (
  !user ? (
    <Login onLoginSucceses={setUser} />
  ) : (
    <h1>BIENVENIDO DE NUEVO</h1>
  )
);
}

// export default App
