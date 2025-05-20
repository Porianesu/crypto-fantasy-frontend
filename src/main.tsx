import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/App.tsx'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, generatePath, redirect, RouterProvider } from 'react-router-dom'
import { HOME_PATH, ROOT_PATH } from '@/navigation/routes.tsx'
import PageContainer from '@/components/PageContainer.tsx'

const router = createBrowserRouter([
  {
    path: ROOT_PATH,
    errorElement: null,
    // loader: () => {
    //   return redirect(generatePath(HOME_PATH))
    // },
    children: [
      {
        path: HOME_PATH,
        element: (
          <PageContainer>
            <App></App>
          </PageContainer>
        ),
      },
    ],
  },
])
createRoot(document.getElementById('root')!).render(
  <StoreProvider initialState={null}>
    <RouterProvider router={router} />
  </StoreProvider>,
)
