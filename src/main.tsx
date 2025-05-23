import React, { type PropsWithChildren, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import {
  HOME_PATH,
  homePageLoader,
  ENTRANCE_PATH,
  ROOT_PATH,
  CARD_PATH,
  cardPageLoader,
} from '@/navigation/routes.tsx'
import PageContainer from '@/components/PageContainer.tsx'
import { TransitionProvider } from '@/context/TransitionContext.tsx'
import TransitionComponent from '@/components/Transition.tsx'
import LoadingPage from '@/pages/EntrancePage.tsx'
const CardPage = React.lazy(() => import('@/pages/CardPage.tsx'))
const HomePage = React.lazy(() => import('@/pages/HomePage.tsx'))

export const preloadPages = async () => {
  try {
    await import('@/pages/CardPage.tsx')
    await import('@/pages/HomePage.tsx')
  } catch (e) {
    console.error('Error preloading CardPage:', e)
  }
}

const CommonPageSuspense: React.FC<PropsWithChildren> = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}

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
        element: <Navigate to={ENTRANCE_PATH}></Navigate>,
      },
      {
        path: ENTRANCE_PATH,
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
            <CommonPageSuspense>
              <HomePage></HomePage>
            </CommonPageSuspense>
          </TransitionComponent>
        ),
      },
      {
        path: CARD_PATH,
        loader: cardPageLoader,
        element: (
          <TransitionComponent>
            <CommonPageSuspense>
              <CardPage></CardPage>
            </CommonPageSuspense>
          </TransitionComponent>
        ),
      },
      {
        path: '*', // 捕获所有未匹配的路由
        element: <Navigate to={ENTRANCE_PATH} replace />,
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
