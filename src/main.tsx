import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import {
  commonPageLoader,
  GALLERY_PATH,
  ENTRANCE_PATH,
  HOME_PATH,
  INTRODUCTION_PATH,
  ROOT_PATH,
  TOURNAMENT_PATH,
  FUSION_PATH,
  SHOP_PATH,
  REWARD_PATH,
  RedirectWithQuery,
  CARD_GENERATE_PATH,
  CARD_GENERATE__CREATE_PATH,
  CARD_GENERATE__HISTORY_PATH,
} from '@/navigation/routes.tsx'
import { TransitionProvider } from '@/context/TransitionContext.tsx'
import React, { type PropsWithChildren, Suspense } from 'react'
import PageContainer from '@/components/PageContainer.tsx'
import EntrancePage from '@/pages/EntrancePage/EntrancePage.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { myQueryClient } from '@/utils/constant.ts'

const HomePage = React.lazy(() => import('@/pages/HomePage/HomePage.tsx'))
const GalleryPage = React.lazy(() => import('@/pages/GalleryPage/GalleryPage.tsx'))
const IntroductionPage = React.lazy(() => import('@/pages/IntroductionPage/IntroductionPage.tsx'))
const TournamentPage = React.lazy(() => import('@/pages/TournamentPage/TournamentPage.tsx'))
const FusionPage = React.lazy(() => import('@/pages/FusionPage/FusionPage.tsx'))
const ShopPage = React.lazy(() => import('@/pages/ShopPage/ShopPage.tsx'))
const RewardPage = React.lazy(() => import('@/pages/RewardPage/RewardPage.tsx'))
const CardGenerateCreatePage = React.lazy(
  () => import('@/pages/CardGeneratePage/CardGenerateCreatePage.tsx'),
)
const CardGenerateHistoryPage = React.lazy(
  () => import('@/pages/CardGeneratePage/CardGenerateHistoryPage.tsx'),
)

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
        element: <RedirectWithQuery></RedirectWithQuery>,
      },
      {
        path: ENTRANCE_PATH,
        element: <EntrancePage></EntrancePage>,
      },
      {
        path: HOME_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <HomePage></HomePage>
          </CommonPageSuspense>
        ),
      },
      {
        path: GALLERY_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <GalleryPage></GalleryPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: INTRODUCTION_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <IntroductionPage></IntroductionPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: TOURNAMENT_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <TournamentPage></TournamentPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: FUSION_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <FusionPage></FusionPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: SHOP_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <ShopPage></ShopPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: REWARD_PATH,
        loader: commonPageLoader,
        element: (
          <CommonPageSuspense>
            <RewardPage></RewardPage>
          </CommonPageSuspense>
        ),
      },
      {
        path: CARD_GENERATE_PATH,
        loader: commonPageLoader,
        children: [
          {
            path: CARD_GENERATE__CREATE_PATH,
            element: (
              <CommonPageSuspense>
                <CardGenerateCreatePage></CardGenerateCreatePage>
              </CommonPageSuspense>
            ),
          },
          {
            path: CARD_GENERATE__HISTORY_PATH,
            element: (
              <CommonPageSuspense>
                <CardGenerateHistoryPage></CardGenerateHistoryPage>
              </CommonPageSuspense>
            ),
          },
        ],
      },
      {
        path: '*', // 捕获所有未匹配的路由
        element: <RedirectWithQuery></RedirectWithQuery>,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StoreProvider initialState={null}>
    <TransitionProvider>
      <QueryClientProvider client={myQueryClient}>
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
