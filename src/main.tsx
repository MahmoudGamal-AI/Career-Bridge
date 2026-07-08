import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          duration: 4000,
          style: { fontFamily: "'Inter', sans-serif" }
        }}
      />
    </AuthProvider>
  </StrictMode>,
);