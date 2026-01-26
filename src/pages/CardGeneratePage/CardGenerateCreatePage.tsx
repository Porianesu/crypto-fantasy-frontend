import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './CardGenerateCreatePage.module.css'
import classNames from 'classnames'
import { useMutation } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { toast } from 'react-toastify'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import API from '@/axios/api.ts'
import { ArrowRightIcon, PhotoIcon, XCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useLocation, useNavigate } from 'react-router-dom'
import { CARD_GENERATE_HISTORY_PATH, getCardGenerateHistoryPath } from '@/navigation/routes.tsx'
import { objectUrlToBase64 } from '@/utils/common.ts'

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

type Session = {
  id: number
  label: string
  prompt: string
  aspectRatio: string
  resolution: string
  imagesBase64: string[]
  imageUrl: string
  lastPayload?: { prompt: string; images: string[] }
  isPending?: boolean
}

const createEmptySession = (id: number, index = 1): Session => ({
  id,
  label: `Session ${index}`,
  prompt: '',
  aspectRatio: 'auto',
  resolution: '1K',
  imagesBase64: [],
  imageUrl: '',
  lastPayload: undefined,
  isPending: false,
})

const CardGenerateCreatePage: React.FC = () => {
  const {
    appStore: { userInfo },
    cardGenerateStore: { generatedImageCache, addImageToUserGallery },
  } = useMobxStore()
  const location = useLocation()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  // multi-session state
  const [sessions, setSessions] = useState<Session[]>(() => [createEmptySession(Date.now(), 1)])
  const [activeSessionId, setActiveSessionId] = useState<number>(sessions[0].id)
  // local UI states synced with active session
  const [imagesBase64, setImagesBase64] = useState<string[]>(sessions[0].imagesBase64)
  const imageUrl = useMemo(
    () => sessions.find((se) => se.id === activeSessionId)?.imageUrl || '',
    [activeSessionId, sessions],
  )

  const { register, handleSubmit, formState, setValue, watch, getValues } = useForm<IFromData>({
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
    // if location.state carries an imageId from history, use it for the active session
    const state = location.state as { imageId?: number; from: string } | null
    if (state?.from === CARD_GENERATE_HISTORY_PATH && state.imageId) {
      const idx = sessions.findIndex((s) => s.id === activeSessionId)
      // don't create unused 'existing' variable
      if (generatedImageCache.has(state.imageId)) {
        const cachedObjectUrl = generatedImageCache.get(state.imageId)!
        objectUrlToBase64(cachedObjectUrl).then((res) => {
          // set on active session
          setImagesBase64([res])
          setValue('prompt', '')
          // persist to sessions
          setSessions((prev) => {
            const copy = [...prev]
            copy[idx] = { ...copy[idx], imageUrl: res, imagesBase64: [res], prompt: '' }
            return copy
          })
        })
      }
      navigate(location.pathname, { replace: true, state: undefined })
    }
    // We only want to run this when location.state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

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

  // mutation hook (we'll call mutateAsync and manage per-session pending flags)
  const generateMutation = useMutation<any, any, { prompt: string; images: string[] }>({
    mutationFn: (payload) =>
      API.postGenerateImage({
        prompt: payload.prompt,
        images: payload.images,
      }),
  })

  // helpers to read/update active session
  const getActiveSessionIndex = () => sessions.findIndex((s) => s.id === activeSessionId)
  const getActiveSession = () => sessions.find((s) => s.id === activeSessionId)!

  const persistCurrentFormToSession = () => {
    const idx = getActiveSessionIndex()
    if (idx === -1) return
    const vals = getValues()
    setSessions((prev) => {
      const copy = [...prev]
      copy[idx] = {
        ...copy[idx],
        prompt: vals.prompt || '',
        aspectRatio: vals.aspectRatio || 'auto',
        resolution: vals.resolution || '1K',
        imagesBase64,
        imageUrl,
      }
      return copy
    })
  }

  const switchToSession = (id: number) => {
    // persist current
    persistCurrentFormToSession()
    // find target
    const target = sessions.find((s) => s.id === id)
    if (!target) return
    setActiveSessionId(id)
    // load into local form and states
    setValue('prompt', target.prompt)
    setValue('aspectRatio', target.aspectRatio)
    setValue('resolution', target.resolution)
    setImagesBase64(target.imagesBase64 || [])
  }

  const addSession = () => {
    persistCurrentFormToSession()
    const id = Date.now()
    setSessions((prev) => {
      const newSession = createEmptySession(id, prev.length + 1)
      return [...prev, newSession]
    })
    // immediately activate the new session locally
    setActiveSessionId(id)
    setValue('prompt', '')
    setValue('aspectRatio', 'auto')
    setValue('resolution', '1K')
    setImagesBase64([])
  }

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    const toProcess = arr.slice(0, MAX_IMAGES - imagesBase64.length)
    try {
      const promises = toProcess.map((f) => fileToBase64(f))
      const results = await Promise.all(promises)
      setImagesBase64((prev) => [...prev, ...results])
    } catch (err) {
      console.error(err)
      toast.error('Failed to read some images')
    }
  }

  const removeImageAt = (index: number) => {
    setImagesBase64((prev) => prev.filter((_, i) => i !== index))
  }

  // per-session generate
  const generateForActiveSession = async (payload: { prompt: string; images: string[] }) => {
    const idx = getActiveSessionIndex()
    if (idx === -1) return
    // mark pending for this session
    setSessions((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], isPending: true }
      return copy
    })
    try {
      const res = await generateMutation.mutateAsync(payload)
      if (res?.data?.image) {
        const { url: maybeUrl, ...generatedImage } = res.data.image
        if (generatedImage.id) {
          addImageToUserGallery(generatedImage)
          // also cache maybe generate cache - not changed here
        }
        if (maybeUrl) {
          setSessions((prev) => {
            const copy = [...prev]
            copy[idx] = {
              ...copy[idx],
              imageUrl: maybeUrl,
              lastPayload: payload,
              imagesBase64: payload.images,
            }
            return copy
          })
          if (imageRef.current) {
            gsap.fromTo(
              imageRef.current,
              { scale: 0.98, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' },
            )
          }
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate image')
    } finally {
      setSessions((prev) => {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], isPending: false }
        return copy
      })
    }
  }

  const onSubmit: SubmitHandler<IFromData> = (values) => {
    if (!userInfo?.id) return
    const activeIdx = getActiveSessionIndex()
    if (sessions[activeIdx]?.isPending) return
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
    // persist last payload for session
    setSessions((prev) => {
      const copy = [...prev]
      const idx = getActiveSessionIndex()
      copy[idx] = { ...copy[idx], lastPayload: payload }
      return copy
    })
    generateForActiveSession(payload)
  }

  const handleRegenerate = async () => {
    const idx = getActiveSessionIndex()
    const session = sessions[idx]
    if (!session?.lastPayload) return
    if (session.isPending) return
    await generateForActiveSession(session.lastPayload)
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

  const handleHistoryClick = () => {
    navigate(getCardGenerateHistoryPath())
  }

  // persist session when navigating away/unmount
  useEffect(() => {
    return () => {
      persistCurrentFormToSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // when sessions change and activeSessionId not found, switch to first
  useEffect(() => {
    if (!sessions.find((s) => s.id === activeSessionId) && sessions.length) {
      setActiveSessionId(sessions[0].id)
      setValue('prompt', sessions[0].prompt)
      setValue('aspectRatio', sessions[0].aspectRatio)
      setValue('resolution', sessions[0].resolution)
      setImagesBase64(sessions[0].imagesBase64 || [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions])

  // UI helpers
  const activeSession = getActiveSession()

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>Card Forge</div>
          <div className={styles.subtitle}>Craft a image from your prompts.</div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.historyButton} onClick={handleHistoryClick}>
            History
            <ArrowRightIcon className={styles.icon}></ArrowRightIcon>
          </button>
        </div>
      </div>
      <div className={styles.contentGrid}>
        {/* Sidebar for sessions */}
        <div className={styles.sidebar}>
          <div className={styles.sideHeader}>Sessions</div>
          <div className={styles.sessionList}>
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                className={classNames(styles.sessionItem, {
                  [styles.sessionActive]: s.id === activeSessionId,
                  [styles.sessionDeActive]: s.id !== activeSessionId,
                })}
                onClick={() => switchToSession(s.id)}
              >
                <div className={styles.sessionLabel}>{s.label}</div>
                {s.isPending ? <div className={styles.sessionDot} /> : null}
              </button>
            ))}
          </div>
          <button className={styles.addSessionButton} onClick={addSession} title="Add session">
            <PlusIcon className={styles.addSessionIcon} />
          </button>
        </div>

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
              disabled={!isValid || activeSession.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {activeSession.isPending ? 'Forging...' : 'Generate'}
            </button>
            <button
              className={classNames(styles.button, styles.secondaryButton)}
              disabled={!activeSession.lastPayload || activeSession.isPending}
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
            {activeSession.isPending ? (
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
