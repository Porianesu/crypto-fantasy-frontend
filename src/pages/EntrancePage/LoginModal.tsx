import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { Content, Description, Dialog, Portal, Title, DialogOverlay } from '@radix-ui/react-dialog'
import styles from './LoginModal.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import api from '@/axios/api.ts'
import MetamaskIcon from '../../assets/images/common/MetaMask-icon-fox.svg'

const LoginModal: React.FC = () => {
  const {
    appStore: { loginAndRegister },
    modalStore: { loginModalVisible, changeLoginModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const [loginButtonLoading, setLoginButtonLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (loginButtonLoading) return
    e.preventDefault()
    setLoginButtonLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const result = await loginAndRegister('email', { email, password })
    setLoginButtonLoading(false)
    if (result) {
      changeLoginModalVisible(false)
      navigate(result as unknown as string)
    }
  }

  async function handleMetaMaskLogin() {
    if (loginButtonLoading) return
    if (!window.ethereum) {
      toast.error('MetaMask not installed')
      return
    }
    try {
      setLoginButtonLoading(true)
      // 请求账户授权
      const accounts = await window.ethereum.request<string>({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found.')
        return
      }
      const address = accounts[0]
      if (!address) {
        toast.error('Failed to get the account address.')
        return
      }
      const provider = new ethers.BrowserProvider(window.ethereum)
      // 后端返回 nonce，前端用钱包签名
      const [signer, nonceResult] = await Promise.all([provider.getSigner(), api.getNonce(address)])
      if (!nonceResult?.data?.nonce)
        return toast.error('Failed to get nonce from server. Please try again.')
      const signature = await signer.signMessage(nonceResult.data.nonce) // 这里的 '123456' 应该替换为后端返回的 nonce
      const result = await loginAndRegister('wallet', {
        address,
        signature,
        nonce: nonceResult.data.nonce,
      })
      if (result) {
        changeLoginModalVisible(false)
        navigate(result as unknown as string)
      }
    } catch (err) {
      toast.error((err as any)?.message ? (err as any).message : 'Failed to login with MetaMask.')
      console.error(err)
    } finally {
      setLoginButtonLoading(false)
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
                'relative grow shrink basis-0 overflow-hidden flex flex-col items-stretch self-stretch '
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
              <div className={classNames(styles.inputGroup, 'mb-4')}>
                <label htmlFor="password">Password</label>
                <input
                  className={styles.input}
                  type="password"
                  id="password"
                  name="password"
                  placeholder={'Please enter your Password'}
                />
              </div>
              <div className={styles.divider}>
                <span>or</span>
              </div>
              <button
                type={'button'}
                onClick={handleMetaMaskLogin}
                className={classNames(styles.metamaskLoginButton, {
                  button: !loginButtonLoading,
                })}
              >
                <div>Continue with MetaMask</div>
                <img src={MetamaskIcon} alt={'Metamask-Icon'}></img>
              </button>
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
