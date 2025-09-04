// src/global.d.ts
import 'createjs'
import type { MetaMaskInpageProvider } from '@metamask/providers'

declare global {
  const createjs: typeof import('createjs') | undefined
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}
