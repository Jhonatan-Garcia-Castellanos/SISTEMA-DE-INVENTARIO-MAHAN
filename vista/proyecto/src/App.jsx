import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Login from './componentes/AppSistema'
import Inventario from './componentes/SistemaGestion'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Login />
    <Inventario />

    </>
  )
}

export default App
