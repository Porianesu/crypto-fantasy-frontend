// src/global.d.ts
import 'createjs'

declare global {
  const createjs: typeof import('createjs') | undefined
}
