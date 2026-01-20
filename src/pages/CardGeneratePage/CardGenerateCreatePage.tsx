import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import styles from './CardGenerateCreatePage.module.css'
import classNames from 'classnames'
import { useMutation } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { toast } from 'react-toastify'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import API, { type IPostGenerateImageResponse } from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'
import { ArrowRightIcon, PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'

// 新表单类型：prompt 必填，images 为 base64 字符串数组，同时增加aspectRatio和resolution
interface IFromData {
  prompt: string
  aspectRatio: string
  resolution: string
}
// 限制最大图片数以避免过大负载
const MAX_IMAGES = 6

// aspect & resolution options
const ASPECT_OPTIONS = [
  'auto',
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '4:5',
  '5:4',
  '16:9',
  '9:16',
  '21:9',
]
const RESOLUTION_OPTIONS = ['1K', '2K', '4K']

const CardGenerateCreatePage: React.FC = () => {
  const {
    appStore: { userInfo },
    cardGenerateStore: { initUserGallery },
  } = useMobxStore()
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imagesBase64, setImagesBase64] = useState<string[]>([])
  const lastPayloadRef = useRef<{ prompt: string; images: string[] } | null>(null)
  const { register, handleSubmit, formState, setValue, watch } = useForm<IFromData>({
    mode: 'onChange',
    defaultValues: {
      prompt: '',
      aspectRatio: 'auto',
      resolution: '1K',
    },
  })
  const { isValid } = formState

  // keep local watched values for UI
  const watchedAspect = watch('aspectRatio')
  const watchedResolution = watch('resolution')

  useEffect(() => {
    initUserGallery()
  }, [initUserGallery])

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

  // helper: read File -> base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    const toProcess = arr.slice(0, MAX_IMAGES - imagesBase64.length)
    try {
      const promises = toProcess.map((f) => fileToBase64(f))
      const results = await Promise.all(promises)
      setImagesBase64((prev) => [...prev, ...results])
    } catch (e) {
      console.error(e)
      toast.error('Failed to read some images')
    }
  }

  const removeImageAt = (index: number) => {
    setImagesBase64((prev) => prev.filter((_, i) => i !== index))
  }

  // 使用新的 payload 结构：{ prompt, images }
  const generateMutation = useMutation<any, any, { prompt: string; images: string[] }>({
    mutationFn: (payload) =>
      API.postGenerateImage({
        prompt: payload.prompt,
        images: payload.images,
      }),
    onSuccess: async (res: AxiosResponse<IPostGenerateImageResponse>) => {
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
    // append selected options into prompt so backend receives them
    const finalPrompt =
      `${values.prompt.trim()} ${values.aspectRatio ? `[Aspect Ratio: ${values.aspectRatio}]` : ''} ${values.resolution ? `[Resolution: ${values.resolution}]` : ''}`.trim()
    const payload = {
      prompt: finalPrompt,
      images: imagesBase64,
    }
    lastPayloadRef.current = payload
    generateMutation.mutate(payload)
  }

  const handleRegenerate = async () => {
    if (!lastPayloadRef.current) return
    if (generateMutation.isPending) return
    generateMutation.mutate(lastPayloadRef.current)
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // file input ref to trigger from a styled button
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const triggerFileInput = () => fileInputRef.current?.click()

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>Card Forge</div>
          <div className={styles.subtitle}>
            Craft a Hearthstone-style card illustration from your prompts.
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.historyButton}>
            History
            <ArrowRightIcon className={styles.icon}></ArrowRightIcon>
          </button>
        </div>
      </div>
      <div className={styles.contentGrid}>
        <div className={styles.panel} ref={formRef}>
          <div className={styles.panelTitle}>Prompt</div>
          {/* References: moved above prompt */}
          <div className={styles.field}>
            <div className={styles.label}>References (optional)</div>
            <div className={styles.referencesBox}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFilesSelected(e.target.files)}
                style={{ display: 'none' }}
              />
              <div className={styles.referencesInner}>
                {imagesBase64.length > 0 && (
                  <div className={styles.imagePreviewGrid}>
                    {imagesBase64.map((b64, idx) => (
                      <div key={idx} className={styles.imagePreviewItem}>
                        <img src={b64} alt={`ref-${idx}`} className={styles.previewThumb} />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => removeImageAt(idx)}
                          aria-label={`Remove image ${idx + 1}`}
                        >
                          <XCircleIcon></XCircleIcon>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={styles.addButton}
                  title="Add reference images"
                  onClick={triggerFileInput}
                >
                  <div className={styles.addIcon} aria-hidden>
                    <PhotoIcon className={styles.addIconSvg} />
                  </div>
                  <div className={styles.addText}>Add</div>
                </button>
              </div>
              <div className={styles.countBadge}>
                {imagesBase64.length}/{MAX_IMAGES}
              </div>
            </div>
          </div>

          {/* Prompt textarea */}
          <div className={styles.field}>
            <div className={styles.label}>Prompt</div>
            <textarea
              className={classNames(styles.input, styles.textarea, styles.bigTextarea)}
              {...register('prompt', { required: true, maxLength: 2000 })}
              maxLength={2000}
              placeholder={'Describe the scene, style and details for the AI to paint...'}
              rows={8}
            />
          </div>

          {/* New options: Aspect Ratio & Resolution */}
          <div className={styles.field}>
            <div className={styles.label}>Aspect Ratio</div>
            <div className={styles.optionGroup} role="list">
              {ASPECT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={classNames(styles.optionButton, {
                    [styles.optionButtonUnSelected]: watchedAspect !== opt,
                    [styles.optionButtonSelected]: watchedAspect == opt,
                  })}
                  onClick={() => setValue('aspectRatio', opt, { shouldDirty: true })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Resolution</div>
            <div className={styles.optionGroup} role="list">
              {RESOLUTION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={classNames(styles.optionButton, {
                    [styles.optionButtonSelected]: watchedResolution === opt,
                    [styles.optionButtonUnSelected]: watchedResolution !== opt,
                  })}
                  onClick={() => setValue('resolution', opt, { shouldDirty: true })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

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
          <div className={styles.hint}>
            Tip: richer prompts and reference images usually yield better results.
          </div>
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
                alt={'generated-image'}
                ref={imageRef}
                className={styles.previewImage}
                src={imageUrl}
              />
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderTitle}>No image yet</div>
                <div className={styles.placeholderText}>Fill in the prompt and click Generate.</div>
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
export default observer(CardGenerateCreatePage)
