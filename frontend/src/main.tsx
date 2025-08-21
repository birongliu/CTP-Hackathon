import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './routes/App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SignPage from './routes/SignPage.tsx'

const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/signin', element: <SignPage />},
  {path: '/signup', element: <SignPage />}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
