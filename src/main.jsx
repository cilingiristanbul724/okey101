import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ek.css'
import App from './App.jsx'

// Eski/onbellekli service worker'lari guncellemeye zorla; boylece tum
// tarayicilarda her zaman en guncel surum yuklenir (takili kalan eski
// surum sorununu onler).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(kayitlar => kayitlar.forEach(k => k.update()))
    .catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
