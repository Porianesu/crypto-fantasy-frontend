import { observer } from 'mobx-react-lite'
import React from 'react'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { Content, Description, Dialog, Portal, Title, DialogOverlay } from '@radix-ui/react-dialog'
import styles from './LoginModal.module.css'
import classNames from 'classnames'
import { checkHasAlreadyReadGuide, setStorageUserInfo } from '@/utils/common.ts'
import { useNavigate } from 'react-router-dom'
import { getHomePath, getIntroductionPath } from '@/navigation/routes.tsx'
import { toast } from 'react-toastify'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'

const LoginModal: React.FC = () => {
  const {
    modalStore: { loginModalVisible, changeLoginModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')
    if (!email) return toast.warn('Please enter your email.')
    const password = formData.get('password')
    if (!password) return toast.warn('Please enter your password.')
    if (email !== 'fantasydemo') return toast.error('Wrong account!')
    if (password !== 'fantasy666') return toast.error('Wrong password!')
    setStorageUserInfo({
      email: email as string,
    })
    changeLoginModalVisible(false)
    const checkResult = checkHasAlreadyReadGuide()
    if (checkResult) {
      return navigate(getHomePath())
    } else {
      return navigate(getIntroductionPath())
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
            <Title className={styles.modalTitle}>Login</Title>
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
              <button className={styles.submitButton} type={'submit'}>
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
