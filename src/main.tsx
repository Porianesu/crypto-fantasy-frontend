import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/HomePage.tsx'
import { gsap } from 'gsap'
import { StoreProvider } from '@/stores/StoreProvider.tsx'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { HOME_PATH, LOADING_PATH, LOGIN_PATH, ROOT_PATH } from '@/navigation/routes.tsx'
import PageContainer from '@/components/PageContainer.tsx'
import { SplitText } from 'gsap/SplitText'
import { TransitionProvider } from '@/context/TransitionContext.tsx'
import TransitionComponent from '@/components/Transition.tsx'
import Header from '@/components/Header.tsx'
import LoginPage from '@/pages/LoginPage.tsx'
import LoadingPage from '@/pages/LoadingPage.tsx'
gsap.registerPlugin(SplitText)

const router = createBrowserRouter([
  {
    path: ROOT_PATH,
    errorElement: null,
    element: (
      <PageContainer>
        <Header></Header>
        <Outlet></Outlet>
      </PageContainer>
    ),
    children: [
      {
        path: HOME_PATH,
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
        path: LOADING_PATH,
        element: (
          <TransitionComponent>
            <LoadingPage></LoadingPage>
          </TransitionComponent>
        ),
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
