import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import styles from './CardGeneratePage.module.css'
import classNames from 'classnames'
import { useMutation } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { toast } from 'react-toastify'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import API from '@/axios/api.ts'

interface IFromData {
  name: string
  description: string
  style: string
}

const CardGeneratePage: React.FC = () => {
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const { register, handleSubmit, watch, formState } = useForm<IFromData>({
    mode: 'onChange',
    defaultValues: { name: '', description: '', style: '' },
  })
  const { isValid } = formState
  const [imageUrl, setImageUrl] = useState<string>('')
  const watchedName = watch('name')

  // 在 useForm 后添加
  useEffect(() => {
    const subscription = watch(() => {
      setCurrentPrompt('') // 任意字段变化都清空
    })
    return () => subscription.unsubscribe()
  }, [watch, setCurrentPrompt])

  useGSAP(
    () => {
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { y: 1200, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        )
      }
      if (previewRef.current) {
        gsap.fromTo(
          previewRef.current,
          { y: 1200, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.05, ease: 'power3.out' },
        )
      }
    },
    { scope: pageRef, dependencies: [] },
  )

  const generateMutation = useMutation({
    mutationFn: (payload: IFromData) =>
      API.generateImage({
        cardName: payload.name,
        cardType: '法术牌',
        cardEffect: '对一个随从造成3点伤害。',
        cardDescription: payload.description,
        artStyle: payload.style,
      }),
    onSuccess: async (res) => {
      debugger
    },
    onError: () => {
      toast.error('Failed to generate image')
    },
  })

  const onSubmit: SubmitHandler<IFromData> = (values) => {
    if (!userInfo?.id) return
    if (generateMutation.isPending) return
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { boxShadow: '0 0 0 rgba(0,0,0,0)' },
        { boxShadow: '0 0 20px rgba(255,215,128,0.35)', duration: 0.35 },
      )
    }
    generateMutation.mutate({
      name: values.name.trim(),
      description: values.description.trim(),
      style: values.style.trim(),
    })
  }

  const handleRegenerate = async () => {
    if (!currentPrompt) return
    await generateImage(currentPrompt)
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${watchedName || 'card-illustration'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.header}>
        <div className={styles.title}>Card Forge</div>
        <div className={styles.subtitle}>
          Craft a Hearthstone-style card illustration from your prompts.
        </div>
      </div>
      <div className={styles.contentGrid}>
        <div className={styles.panel} ref={formRef}>
          <div className={styles.panelTitle}>Prompt</div>
          <label className={styles.field}>
            <div className={styles.label}>Card Name</div>
            <input
              className={styles.input}
              {...register('name', { required: true, maxLength: 256 })}
              maxLength={256}
              placeholder={"e.g. 'Arcane Blacksmith'"}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Card Description</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('description', { required: true, maxLength: 256 })}
              maxLength={256}
              placeholder={"Describe the card's story and mood..."}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Art Style Details</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('style', { required: true, maxLength: 256 })}
              maxLength={256}
              placeholder={'Lighting, composition, colors, painterly style...'}
            />
          </label>
          <div className={styles.actions}>
            <button
              className={classNames(styles.button, styles.primaryButton)}
              disabled={!isValid || generateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {generateMutation.isPending ? 'Forging...' : 'Generate'}
            </button>
            <button
              className={classNames(styles.button, styles.secondaryButton)}
              disabled={!currentPrompt || generateMutation.isPending}
              onClick={handleRegenerate}
            >
              Regenerate
            </button>
          </div>
          <div className={styles.hint}>Tip: richer style details usually yield better results.</div>
        </div>
        <div className={classNames(styles.panel, styles.previewContainer)} ref={previewRef}>
          <div className={styles.panelTitle}>Preview</div>
          <div className={styles.previewFrame}>
            {generateMutation.isPending ? (
              <div className={styles.loaderBlock}>
                <div className={styles.spinner} />
                <div className={styles.loaderText}>Summoning pixels...</div>
              </div>
            ) : imageUrl ? (
              <img
                ref={imageRef}
                className={styles.previewImage}
                src={imageUrl}
                alt={watchedName}
              />
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderTitle}>No image yet</div>
                <div className={styles.placeholderText}>
                  Fill in the prompts and click Generate.
                </div>
              </div>
            )}
          </div>
          {imageUrl ? (
            <div className={styles.outputBar}>
              <div className={styles.outputMeta}></div>
              <button
                className={styles.downloadButton}
                onClick={handleDownload}
                disabled={!imageUrl}
              >
                Download
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default observer(CardGeneratePage)
