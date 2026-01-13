import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import styles from './CardGeneratePage.module.css'
import classNames from 'classnames'
import { useMutation } from '@tanstack/react-query'
import API, { type IGenerateCardImageRequest } from '@/axios/api.ts'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

const CardGeneratePage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { register, handleSubmit, watch, formState } = useForm<IGenerateCardImageRequest>({
    mode: 'onChange',
    defaultValues: { name: '', description: '', style: '' },
  })
  const { isValid } = formState
  const [imageUrl, setImageUrl] = useState<string>('')
  const watchedName = watch('name')

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
    mutationFn: (payload: IGenerateCardImageRequest) => API.generateCardImage(payload),
    onSuccess: (res) => {
      const url = res?.data?.imageUrl
      if (!url) {
        toast.error('No image returned')
        return
      }
      setImageUrl(url)
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 0.98, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' },
        )
      }
    },
    onError: () => {
      toast.error('Failed to generate image')
    },
  })

  const onSubmit = (values: IGenerateCardImageRequest) => {
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

  const handleRegenerate = () => {
    handleSubmit(onSubmit)()
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
              {...register('name', { required: true, maxLength: 60 })}
              maxLength={60}
              placeholder={"e.g. 'Arcane Blacksmith'"}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Card Description</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('description', { required: true, maxLength: 220 })}
              maxLength={220}
              placeholder={"Describe the card's story and mood..."}
            />
          </label>
          <label className={styles.field}>
            <div className={styles.label}>Art Style Details</div>
            <textarea
              className={classNames(styles.input, styles.textarea)}
              {...register('style', { required: true, maxLength: 220 })}
              maxLength={220}
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
              disabled={!isValid || generateMutation.isPending}
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
              <div className={styles.outputMeta}>
                <div className={styles.outputLabel}>Last result</div>
                <div className={styles.outputValue} title={imageUrl}>
                  {imageUrl}
                </div>
              </div>
              <a className={styles.linkButton} href={imageUrl} target={'_blank'} rel={'noreferrer'}>
                Open
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default observer(CardGeneratePage)
