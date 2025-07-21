import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { Content, Description, Dialog, Portal, Title, DialogOverlay } from '@radix-ui/react-dialog'
import styles from './LoginModal.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'

const LoginModal: React.FC = () => {
  const {
    appStore: { loginAndRegister },
    modalStore: { loginModalVisible, changeLoginModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const [loginButtonLoading, setLoginButtonLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginButtonLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const result = await loginAndRegister(email, password)
    setLoginButtonLoading(false)
    if (result) {
      changeLoginModalVisible(false)
      navigate(result as unknown as string)
    }
  }

  return (
    <Dialog open={loginModalVisible} onOpenChange={changeLoginModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Content className={styles.modalContent}>
            <Popover>
              <PopoverTrigger asChild>
                <div className={styles.hintIcon} tabIndex={0}>
                  <QuestionMarkCircleIcon />
                </div>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className={styles.tooltipContent}>
                Please join the waitlist to get a demo account.
              </PopoverContent>
            </Popover>
            <Title className={styles.modalTitle}>Login/Register</Title>
            <Description></Description>
            <form
              onSubmit={handleSubmit}
              className={
                'grow shrink basis-0 overflow-hidden flex flex-col items-stretch self-stretch '
              }
            >
              <div className={classNames(styles.inputGroup, 'mb-7.5')}>
                <label htmlFor="email">Email</label>
                <input
                  className={styles.input}
                  type="text"
                  id="email"
                  name="email"
                  placeholder={'Please enter your account.'}
                />
              </div>
              <div className={classNames(styles.inputGroup, 'mb-auto')}>
                <label htmlFor="password">Password</label>
                <input
                  className={styles.input}
                  type="password"
                  id="password"
                  name="password"
                  placeholder={'Please enter your Password'}
                />
              </div>
              <button
                className={classNames(styles.submitButton, {
                  button: !loginButtonLoading,
                })}
                type={'submit'}
                disabled={loginButtonLoading}
              >
                Confirm
              </button>
            </form>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(LoginModal)
