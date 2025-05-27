import { observer } from 'mobx-react-lite'
import React from 'react'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import {
  Content,
  Description,
  Dialog,
  Portal,
  Title,
  Close,
  DialogOverlay,
} from '@radix-ui/react-dialog'
import styles from './LoginModal.module.css'
import classNames from 'classnames'
import { checkHasAlreadyReadGuide, setStorageUserInfo } from '@/utils/common.ts'
import { useNavigate } from 'react-router-dom'
import { getHomePath, getIntroductionPath } from '@/navigation/routes.tsx'

const LoginModal: React.FC = () => {
  const {
    modalStore: { loginModalVisible, changeLoginModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')
    console.log('邮箱:', email, '密码:', password)
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
            <div className={styles.modalHeader}>
              <Title className={styles.modalTitle}>Login Modal</Title>
              <Close className={'focus-visible:outline-none'}>
                <div className={classNames(styles.closeButton)}>❌</div>
              </Close>
            </div>
            <form onSubmit={handleSubmit}>
              <Description></Description>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input className={styles.input} type="text" id="email" name="email" />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input className={styles.input} type="password" id="password" name="password" />
              </div>
              <button className={styles.submitButton} type={'submit'}>
                Login
              </button>
            </form>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(LoginModal)
