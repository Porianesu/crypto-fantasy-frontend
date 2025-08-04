import { observer } from 'mobx-react-lite'
import React from 'react'
import classNames from 'classnames'
import styles from './Profile.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import API from '@/axios/api.ts'
import { toast } from 'react-toastify'

interface IProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormValues {
  nickname: string
  avatar: string
}

const ProfileModal: React.FC<IProfileModalProps> = ({ open, onOpenChange }) => {
  const { appStore } = useMobxStore()
  const { updateUserInfo } = appStore
  const userInfo = appStore.userInfo!
  const appConfig = appStore.appConfig!

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
    },
  })

  const onValid: SubmitHandler<FormValues> = async (data) => {
    const res = await API.patchUserInfo(data)
    if (res?.data?.user?.email === userInfo.email) {
      // 更新用户信息
      updateUserInfo(res.data.user)
      toast.success('Profile updated successfully')
      onOpenChange(false)
    }
  }

  const onSubmit = handleSubmit(onValid)

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
                rules={{ required: true, maxLength: 20, minLength: 2 }}
                render={({ field }) => (
                  <input
                    {...field}
                    className={styles.nicknameInput}
                    placeholder="Enter your nickname"
                  />
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
              <button type="submit" className={styles.saveButton}>
                Save
              </button>
            </form>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(ProfileModal)
