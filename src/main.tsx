import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/HomePage.tsx'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import {
  HOME_PATH,
  homePageLoader,
  LOADING_PATH,
  LOGIN_PATH,
  ROOT_PATH,
} from '@/navigation/routes.tsx'
import PageContainer from '@/components/PageContainer.tsx'
import { TransitionProvider } from '@/context/TransitionContext.tsx'
import TransitionComponent from '@/components/Transition.tsx'
import LoginPage from '@/pages/LoginPage.tsx'
import LoadingPage from '@/pages/LoadingPage.tsx'

const router = createBrowserRouter([
  {
    path: ROOT_PATH,
    errorElement: null,
    element: (
      <PageContainer>
        <Outlet></Outlet>
      </PageContainer>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={LOADING_PATH}></Navigate>,
      },
      {
        path: LOADING_PATH,
        element: (
          <TransitionComponent>
            <LoadingPage></LoadingPage>
          </TransitionComponent>
        ),
      },
      {
        path: HOME_PATH,
        loader: homePageLoader,
        element: (
          <TransitionComponent>
            <App></App>
          </TransitionComponent>
        ),
      },
      {
        path: LOGIN_PATH,
        element: (
          <TransitionComponent>
            <LoginPage></LoginPage>
          </TransitionComponent>
        ),
      },
      {
        path: '*', // 捕获所有未匹配的路由
        element: <Navigate to={LOADING_PATH} replace />,
      },
    ],
  },
])
createRoot(document.getElementById('root')!).render(
  <StoreProvider initialState={null}>
    <TransitionProvider>
      <RouterProvider router={router} />
    </TransitionProvider>
  </StoreProvider>,
)
