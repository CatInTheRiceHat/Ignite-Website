import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { mount } from './sol/widget/loader'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Sol shares Ignite's origin, assets, and React dependencies. Its styles stay in a shadow root.
const sol = mount({ websiteBaseUrl: window.location.origin, loadFonts: false })
if (import.meta.hot) import.meta.hot.dispose(() => sol.destroy())
