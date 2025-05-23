import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import {
  CARD_PATH,
  cardPageLoader,
  ENTRANCE_PATH,
  HOME_PATH,
  homePageLoader,
  INTRODUCTION_PATH,
  introductionPageLoader,
  ROOT_PATH,
} from '@/navigation/routes.tsx'
import { TransitionProvider } from '@/context/TransitionContext.tsx'
import React, { type PropsWithChildren, Suspense } from 'react'
import PageContainer from '@/components/PageContainer.tsx'
import TransitionComponent from '@/components/Transition.tsx'
import LoadingPage from '@/pages/EntrancePage.tsx'
import HomePage from '@/pages/HomePage.tsx'
import CardPage from '@/pages/CardPage.tsx'
import IntroductionPage from '@/pages/IntroductionPage.tsx'

const CommonPageSuspense: React.FC<PropsWithChildren> = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}

export const router = createBrowserRouter([
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
        path: INTRODUCTION_PATH,
        loader: introductionPageLoader,
        element: (
          <TransitionComponent>
            <CommonPageSuspense>
              <IntroductionPage></IntroductionPage>
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
