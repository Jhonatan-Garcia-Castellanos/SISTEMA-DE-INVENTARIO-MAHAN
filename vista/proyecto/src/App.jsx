import React, { useState } from 'react'
import Login from './componentes/LoginV2'
import Sistema from './componentes/SISTEMAGES'
import Pagos from './componentes/ModuloPagos'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
  }

  return (
    !user ? (
      <Login onLoginSuccess={(userData) => setUser(userData || { nombre: 'Usuario', email: '', rol: 'Usuario', photo: '' })} />
    ) : (
      <Sistema user={user} onLogout={handleLogout} />
    )
  )
}
