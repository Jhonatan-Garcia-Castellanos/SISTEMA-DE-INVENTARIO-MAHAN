import React, { useState } from 'react'
// import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './componentes/LoginV2'
import Sistema from './componentes/SISTEMAGES'
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

// function Dashboard() {
//   const [view, setView] = useState("list");
//   // const { toast } = useProducts();
 
//   return (
//     <div className="flex h-screen bg-slate-950 overflow-hidden">
//       <Navbar view={view} setView={setView} />
//       <main className="flex-1 overflow-y-auto">
//         <div className="p-8 max-w-5xl mx-auto">
//           {/* {view === "list" && <ProductList />}
//           {view === "create" && (
//             <ProductForm onSuccess={() => setView("list")} />
//           )} */}
//         </div>
//       </main>
//       {/* <Toast toast={toast} /> */}
//     </div>
//   );
// }

// function AppContent() {
//   const { user } = useAuth();
//   return user ? <Dashboard /> : <Login />;
// }

// export default function App() {
//   return (
//     <AuthProvider>
//         <App />
//     </AuthProvider>
//   );
// }
 
 

