import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminDashboard } from './components/AdminDashboard.tsx'

const root = document.getElementById('root')!

createRoot(root).render(
  <StrictMode>
    {window.location.pathname === '/tabs' ? <AdminDashboard /> : <App />}
  </StrictMode>,
)
