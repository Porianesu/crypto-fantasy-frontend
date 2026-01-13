import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import styles from './CardGeneratePage.module.css'
import classNames from 'classnames'
import { useMutation } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import DifyApi, { type DifySendMessageParams } from '@/axios/difyApi.ts'

interface IFromData {
  name: string
  description: string
  style: string
}

const OpenRouterKey = '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'

const CardGeneratePage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { register, handleSubmit, watch, formState } = useForm<IFromData>({
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

  async function generateImage(prompt: string) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OpenRouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        stream: false,
        messages: [
          {
            role: 'system',
            content:
              'You are Nano Banana Pro (Gemini 3 Pro Image Preview), a large language model from google.\\n\\nFormatting Rules:\\n- Use Markdown for lists, tables, and styling.\\n- Use ```code fences``` for all code blocks.\\n- Format file names, paths, and function names with `inline code` backticks.\\n- **For all mathematical expressions, you must use dollar-sign delimiters. Use $...$ for inline math and $$...$$ for block math. Do not use (...) or [...] delimiters.**\\n- For responses with many sections where some are more important than others, use collapsible sections (HTML details/summary tags) to highlight key information while allowing users to expand less critical details.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })
    const data = await res.json()
    console.log('generateImage res', data)
    if (!data?.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
      return toast.error('Failed to generate image')
    }
    const url = data.choices[0].message.images[0].image_url.url
    setImageUrl(url)
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { scale: 0.98, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' },
      )
    }
  }

  const generateMutation = useMutation({
    mutationFn: (payload: IFromData) => {
      const requestBody: DifySendMessageParams = {
        files: [],
        inputs: {
          Card_Name: payload.name,
          Card_Description: payload.description,
          Art_Style: payload.style,
        },
        query: '开始吧',
        response_mode: 'blocking',
        user: '111',
      }
      return DifyApi.sendMessageBlock(requestBody)
    },
    onSuccess: async (res) => {
      if (res.data.answer) {
        const resultData = JSON.parse(res.data.answer) as { prompt: string }
        if (resultData.prompt) {
          await generateImage(resultData.prompt)
        }
      }
    },
    onError: () => {
      toast.error('Failed to generate image')
    },
  })

  const onSubmit = (values: IFromData) => {
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
              <div className={styles.outputMeta}></div>
              <button className={styles.downloadButton}>Download</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default observer(CardGeneratePage)
