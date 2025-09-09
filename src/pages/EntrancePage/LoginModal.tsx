import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
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
import validator from 'validator'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import API from '@/axios/api.ts'

interface FormValues {
  email: string
  password: string
  verificationCode: string
}
const LoginModal: React.FC = () => {
  const {
    appStore: { loginAndRegister },
    modalStore: { loginModalVisible, changeLoginModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const [loginButtonLoading, setLoginButtonLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      verificationCode: '',
    },
  })

  const onValid: SubmitHandler<FormValues> = async (data) => {
    if (loginButtonLoading) return
    setLoginButtonLoading(true)
    if (!data.email || !validator.isEmail(data.email)) return toast.error('Wrong email format')
    const result = await loginAndRegister('email', {
      email: data.email,
      password: data.password,
      code: data.verificationCode,
    })
    setLoginButtonLoading(false)
    if (result) {
      changeLoginModalVisible(false)
      navigate(result as unknown as string)
    }
  }

  const onSubmit = handleSubmit(onValid)

  const handleGetVerificationCode = async () => {
    const email = watch('email')
    if (!email || !validator.isEmail(email)) return toast.error('Wrong email format')
    if (countdown > 0) return // 倒计时期间禁止重复点击
    setCountdown(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    const result = await API.getVerificationCode(email)
    if (result?.data?.success) {
      toast.success('Verification code sent!')
    } else {
      toast.error('Failed to send verification code. Please try again.')
      setCountdown(0)
      if (timerRef.current) clearInterval(timerRef.current)
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
                Please enter the 6-characters verification code that was sent to your email. The code
                is valid for 5 minutes.
              </PopoverContent>
            </Popover>
            <Title className={styles.modalTitle}>Login/Register</Title>
            <Description></Description>
            <form
              onSubmit={onSubmit}
              className={'relative shrink-0 flex flex-col items-stretch self-stretch '}
            >
              <Controller
                name="email"
                control={control}
                rules={{
                  required: { value: true, message: 'Email is required.' },
                  validate: (value) => validator.isEmail(value) || 'Wrong email format.',
                }}
                render={({ field, fieldState }) => (
                  <div className={classNames(styles.inputGroup)}>
                    <label htmlFor="email">Email</label>
                    <input
                      className={styles.input}
                      placeholder={'Please enter your account.'}
                      {...field}
                    />
                    {fieldState.error ? (
                      <div className={styles.error}>{fieldState.error.message}</div>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{
                  required: { value: true, message: 'Password is required.' },
                }}
                render={({ field, fieldState }) => (
                  <div className={classNames(styles.inputGroup)}>
                    <label htmlFor="password">Password</label>
                    <input
                      className={styles.input}
                      placeholder={'Please enter your password'}
                      type={'password'}
                      {...field}
                    />
                    {fieldState.error ? (
                      <div className={styles.error}>{fieldState.error.message}</div>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="verificationCode"
                control={control}
                rules={{
                  required: { value: true, message: 'Verification code is required.' },
                  maxLength: { value: 6, message: 'Wrong verification code format.' },
                }}
                render={({ field, fieldState }) => (
                  <div className={classNames(styles.inputGroup)}>
                    <label htmlFor="password">Verification</label>
                    <div className={styles.inputWrapper}>
                      <button
                        className={styles.verificationCodeButton}
                        type="button"
                        onClick={handleGetVerificationCode}
                        disabled={countdown > 0}
                      >
                        {countdown > 0 ? `Resend (${countdown}s)` : 'Get code'}
                      </button>
                      <input
                        className={styles.input}
                        placeholder={'Please enter code'}
                        {...field}
                      />
                    </div>
                    {fieldState.error ? (
                      <div className={styles.error}>{fieldState.error.message}</div>
                    ) : null}
                  </div>
                )}
              />
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
