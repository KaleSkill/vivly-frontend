import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/ui/theme-provider.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner.jsx'
import App from './App.jsx'
import initSentry from './utils/sentry.js'

initSentry();



createRoot(document.getElementById('root')).render(
  <StrictMode>
     <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
     </ThemeProvider>
  </StrictMode>,
)
