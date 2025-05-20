import React, { createContext } from 'react'
import { useState } from 'react'

const TransitionContext = createContext<{
  toggleCompleted: (value: boolean) => void
  completed: boolean
}>({ toggleCompleted: () => {}, completed: false })

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [completed, setCompleted] = useState(false)

  const toggleCompleted = (value: boolean) => {
    setCompleted(value)
  }

  return (
    <TransitionContext.Provider
      value={{
        toggleCompleted,
        completed,
      }}
    >
      {children}
    </TransitionContext.Provider>
  )
}

export default TransitionContext
