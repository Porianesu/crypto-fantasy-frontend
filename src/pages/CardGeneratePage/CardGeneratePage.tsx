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
import API, { type IPostGenerateImageResponse } from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'

// 新表单类型：cardName/cardType/cardEffect 必填，cardDescription/artStyle 可选
interface IFromData {
  cardName: string
  cardType: string
  cardEffect: string
  cardDescription?: string
  artStyle?: string
}

const CardGeneratePage: React.FC = () => {
  const {
    appStore: { userInfo },
    cardGenerateStore: { initUserGallery },
  } = useMobxStore()
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const lastPayloadRef = useRef<IFromData | null>(null)
  const { register, handleSubmit, watch, formState } = useForm<IFromData>({
    mode: 'onChange',
    defaultValues: {
      cardName: '',
      cardType: '',
      cardEffect: '',
      cardDescription: '',
      artStyle: '',
    },
  })
  const watchedName = watch('cardName')
  const { isValid } = formState

  useEffect(() => {
    initUserGallery()
  }, [])

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

  // 保留网络调用实现，但使用新的字段映射。泛型 any 用于宽松接收后端返回
  const generateMutation = useMutation<any, any, IFromData>({
    mutationFn: (payload: IFromData) =>
      API.postGenerateImage({
        cardName: payload.cardName,
        cardType: payload.cardType,
        cardEffect: payload.cardEffect,
        cardDescription: payload.cardDescription,
        artStyle: payload.artStyle,
      }),
    onSuccess: async (res: AxiosResponse<IPostGenerateImageResponse>) => {
      // 如果后端返回 imageUrl 或 url，则设置预览；这里容错处理
      const maybeUrl = res?.data?.image?.url
      if (maybeUrl) {
        setImageUrl(maybeUrl)
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { scale: 0.98, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' },
          )
        }
      }
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
    // 将表单值按新的字段结构提交，并保存为 lastPayload 以便 Regenerate 使用
    const payload = {
      cardName: values.cardName.trim(),
      cardType: values.cardType.trim(),
      cardEffect: values.cardEffect.trim(),
      cardDescription: values.cardDescription?.trim(),
      artStyle: values.artStyle?.trim(),
    }
    lastPayloadRef.current = payload
    generateMutation.mutate(payload)
  }

  const handleRegenerate = async () => {
    // 使用上一次提交的 payload 重新触发生成
    if (!lastPayloadRef.current) return
    if (generateMutation.isPending) return
    generateMutation.mutate(lastPayloadRef.current)
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
              {...register('cardName', { required: true, maxLength: 256 })}
              maxLength={256}
              placeholder={"e.g. 'Arcane Blacksmith'"}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Card Type</div>
            <input
              className={styles.input}
              {...register('cardType', { required: true, maxLength: 128 })}
              maxLength={128}
              placeholder={'e.g. Spell / Minion / Weapon'}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Card Effect</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('cardEffect', { required: true, maxLength: 256 })}
              maxLength={256}
              placeholder={'e.g. Deal 3 damage to a minion.'}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Card Description (optional)</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('cardDescription', { maxLength: 256 })}
              maxLength={256}
              placeholder={"Describe the card's story and mood..."}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Art Style Details (optional)</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('artStyle', { maxLength: 256 })}
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
              disabled={!lastPayloadRef.current || generateMutation.isPending}
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
