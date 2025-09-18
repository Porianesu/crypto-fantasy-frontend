import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './ProfileModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import API from '@/axios/api.ts'
import { toast } from 'react-toastify'
import { PowerIcon } from '@heroicons/react/24/outline'
import { clearAccessToken } from '@/utils/common.ts'
import { ENTRANCE_PATH } from '@/navigation/routes.tsx'

interface IProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormValues {
  nickname: string
  avatar: string
}

const ProfileModal: React.FC<IProfileModalProps> = ({ open, onOpenChange }) => {
  const {
    appStore,
    thirdPartAppStore: { twitterAccount, getXRequestToken },
  } = useMobxStore()
  const { updateUserInfo } = appStore
  const userInfo = appStore.userInfo!
  const appConfig = appStore.appConfig!
  const [confirmButtonLoading, setConfirmButtonLoading] = useState(false)
  const [bindXLoading, setBindXLoading] = useState(false)

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
    },
  })

  useEffect(() => {
    if (open && userInfo) {
      setValue('avatar', userInfo.avatar)
      setValue('nickname', userInfo.nickname)
    }
  }, [open])

  const onValid: SubmitHandler<FormValues> = async (data) => {
    setConfirmButtonLoading(true)
    const res = await API.patchUserInfo(data)
    if (res?.data?.user?.email === userInfo.email) {
      // 更新用户信息
      updateUserInfo(res.data.user)
      toast.success('Profile updated successfully')
      onOpenChange(false)
    }
    setConfirmButtonLoading(false)
  }

  const onSubmit = handleSubmit(onValid)

  const handleLogout = () => {
    clearAccessToken()
    window.location.replace(ENTRANCE_PATH)
  }

  const handleBindXAccount = async () => {
    if (bindXLoading) return
    setBindXLoading(true)
    await getXRequestToken()
    setBindXLoading(false)
  }

  const renderXAccount = () => {
    return (
      <div className={styles.XAccountContainer}>
        XAccount:
        {twitterAccount ? (
          <a
            href={`https://x.com/i/user/${twitterAccount.twitterUserId}`}
            target={`_blank`}
            rel="noreferrer"
          >
            {twitterAccount.screenName || twitterAccount.twitterUserId}
          </a>
        ) : (
          <button
            className={classNames({ button: !bindXLoading })}
            onClick={handleBindXAccount}
            disabled={bindXLoading}
          >
            Bind
          </button>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Content className={styles.modalContent}>
            <Title className={styles.title}>Profile Settings</Title>
            <Description></Description>
            <form onSubmit={onSubmit} className={styles.formContainer}>
              <label className={styles.label}>Nickname</label>
              <Controller
                name="nickname"
                control={control}
                rules={{
                  required: { value: true, message: 'Nickname is required.' },
                  maxLength: { value: 20, message: 'Nickname must be at most 20 characters.' },
                  minLength: { value: 2, message: 'Nickname must be at least 2 characters.' },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      {...field}
                      className={styles.nicknameInput}
                      placeholder="Enter your nickname"
                    />
                    {fieldState.error && (
                      <span className="text-red-500 text-sm mt-1">{fieldState.error.message}</span>
                    )}
                  </>
                )}
              />
              <label className={styles.label}>Avatar</label>
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => (
                  <div className={styles.avatarsContainer}>
                    {appConfig.DefaultAvatars?.map((url: string) => (
                      <button
                        type="button"
                        key={url}
                        className={classNames(
                          styles.avatarContainer,
                          field.value === url
                            ? styles.avatarContainerSelected
                            : styles.avatarContainerUnselected,
                        )}
                        onClick={() => field.onChange(url)}
                      >
                        <img src={url} alt="avatar" />
                      </button>
                    ))}
                  </div>
                )}
              />
              {renderXAccount()}
              <button
                type="submit"
                className={classNames(styles.saveButton, {
                  button: !confirmButtonLoading,
                })}
                disabled={confirmButtonLoading}
              >
                Save
              </button>
              <button
                type={'button'}
                className={classNames(styles.logoutButton)}
                onClick={handleLogout}
              >
                Login out
                <PowerIcon></PowerIcon>
              </button>
            </form>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(ProfileModal)
