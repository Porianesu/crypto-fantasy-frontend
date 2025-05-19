import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/App.tsx'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROOT_PATH } from '@/navigation/routes.tsx'
import Card from '@/pages/Card.tsx'

const router = createBrowserRouter([
  {
    path: ROOT_PATH,
    errorElement: null,
    children: [
      {
        path: 'home/',
        element: <App></App>,
      },
      {
        path: 'card/',
        element: <Card></Card>,
      },
    ],
  },
])
createRoot(document.getElementById('root')!).render(
  <StoreProvider initialState={null}>
    <RouterProvider router={router} />
  </StoreProvider>,
)
