import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import {
  GALLERY_PATH,
  galleryPageLoader,
  ENTRANCE_PATH,
  HOME_PATH,
  homePageLoader,
  INTRODUCTION_PATH,
  introductionPageLoader,
  ROOT_PATH,
  TOURNAMENT_PATH,
  tournamentPageLoader,
} from '@/navigation/routes.tsx'
import { TransitionProvider } from '@/context/TransitionContext.tsx'
import React, { type PropsWithChildren, Suspense } from 'react'
import PageContainer from '@/components/PageContainer.tsx'
import EntrancePage from '@/pages/EntrancePage/EntrancePage.tsx'
const HomePage = React.lazy(() => import('@/pages/HomePage/HomePage.tsx'))
const GalleryPage = React.lazy(() => import('@/pages/GalleryPage/GalleryPage.tsx'))
const IntroductionPage = React.lazy(() => import('@/pages/IntroductionPage/IntroductionPage.tsx'))
const TournamentPage = React.lazy(() => import('@/pages/TournamentPage/TournamentPage.tsx'))
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'

const queryClient = new QueryClient()

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
        element: <EntrancePage></EntrancePage>,
      },
      {
        path: HOME_PATH,
        loader: homePageLoader,
        element: (
          <CommonPageSuspense>
            <HomePage></HomePage>
          </CommonPageSuspense>
        ),
      },
      {
        path: GALLERY_PATH,
        loader: galleryPageLoader,
        element: (
          <CommonPageSuspense>
            <GalleryPage></GalleryPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: INTRODUCTION_PATH,
        loader: introductionPageLoader,
        element: (
          <CommonPageSuspense>
            <IntroductionPage></IntroductionPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: TOURNAMENT_PATH,
        loader: tournamentPageLoader,
        element: (
          <CommonPageSuspense>
            <TournamentPage></TournamentPage>
          </CommonPageSuspense>
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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer
          position={'top-right'}
          autoClose={1500}
          theme={'colored'}
          newestOnTop={true}
        ></ToastContainer>
      </QueryClientProvider>
    </TransitionProvider>
  </StoreProvider>,
)
