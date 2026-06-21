import React, { useState } from 'react'
import Login from './componentes/LoginV2'
import Inventario from './componentes/SISTEMAGES'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
  }

  return (
    !user ? (
      <Login onLoginSuccess={(userData) => setUser(userData || { logged: true })} />
    ) : (
      <Inventario onLogout={handleLogout} />
    )
  )
}
