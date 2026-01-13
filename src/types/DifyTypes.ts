export type ChunkChatCompletionResponse =
  | MessageEvent
  | MessageFileEvent
  | MessageEndEvent
  | TTSMessageEvent
  | TTSMessageEndEvent
  | MessageReplaceEvent
  | WorkflowStartedEvent
  | NodeStartedEvent
  | NodeFinishedEvent
  | WorkflowFinishedEvent
  | ErrorEvent
  | PingEvent

/* 公共/辅助类型 */
export interface Usage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  total_price?: number
  currency?: string
}

export interface RetrieverResource {
  id?: string
  source?: string
  text?: string
  url?: string
  metadata?: Record<string, any>
}

/* 1) event: message */
export interface MessageEvent {
  event: 'message'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
  from_variable_selector: Array<string>
}

/* 2) event: message_file */
export interface MessageFileEvent {
  event: 'message_file'
  id: string
  type: string // e.g. "image"
  belongs_to: string // "user" | "assistant"
  url: string
  conversation_id: string
}

/* 3) event: message_end */
export interface MessageEndEvent {
  event: 'message_end'
  task_id: string
  message_id: string
  conversation_id: string
  metadata?: Record<string, any>
  usage?: Usage
  retriever_resources?: RetrieverResource[]
}

/* 4) event: tts_message */
export interface TTSMessageEvent {
  event: 'tts_message'
  task_id: string
  message_id: string
  audio: string // base64 mp3 chunk
  created_at: number
}

/* 5) event: tts_message_end */
export interface TTSMessageEndEvent {
  event: 'tts_message_end'
  task_id: string
  message_id: string
  audio: string // empty string for end event
  created_at: number
}

/* 6) event: message_replace */
export interface MessageReplaceEvent {
  event: 'message_replace'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string // 替换后的完整文本
  created_at: number
}

/* 7) event: workflow_started */
export interface WorkflowStartedEvent {
  conversation_id: string
  created_at: number
  message_id: string
  event: 'workflow_started'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    sequence_number: number
    created_at: number
    [k: string]: any
  }
}

/* 8) event: node_started */
export interface NodeStartedEvent {
  event: 'node_started'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    node_type: string
    title: string
    index: number
    predecessor_node_id?: string
    inputs: Record<string, any>
    created_at: number
    [k: string]: any
  }
}

/* 9) event: node_finished */
export interface NodeFinishedEvent {
  event: 'node_finished'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    index: number
    predecessor_node_id?: string
    inputs?: Record<string, any>
    process_data?: any
    outputs?: any
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    error?: string
    elapsed_time?: number
    execution_metadata?: any
    total_tokens?: number
    total_price?: number
    currency?: string
    created_at?: number
    [k: string]: any
  }
}

/* 10) event: workflow_finished */
export interface WorkflowFinishedEvent {
  conversation_id: string
  event: 'workflow_finished'
  task_id: string
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    outputs?: any
    error?: string
    elapsed_time?: number
    total_tokens?: number
    total_steps?: number
    created_at?: number
    finished_at?: number
    [k: string]: any
  }
}

/* 11) event: error */
export interface ErrorEvent {
  event: 'error'
  task_id: string
  message_id?: string
  status: number
  code: string
  message: string
}

/* 12) event: ping */
export interface PingEvent {
  event: 'ping'
  // 可选地携带时间戳或其它保活信息
  timestamp?: number
}

export interface AppInfo {
  name: string
  description: string
  tags: string[]
}

// typescript
export type AutoPlay = 'enabled' | 'disabled'

export interface FeatureToggle {
  enabled: boolean
}

export interface SuggestedQuestionsAfterAnswer {
  enabled?: boolean
  suggested_questions?: string[]
}

export interface TextToSpeechConfig extends FeatureToggle {
  voice?: string
  language?: string
  autoPlay?: AutoPlay
}

export interface ImageUploadSettings {
  enabled?: boolean
  number_limits?: number
  // 支持的格式: png, jpg, jpeg, webp, gif
}

export type TransferMethod = 'remote_url' | 'local_file'

export interface FileUploadConfig {
  enabled?: boolean
  image?: ImageUploadSettings
  transfer_methods?: TransferMethod[]
}

export interface SystemParameters {
  file_size_limit?: number // MB
  image_file_size_limit?: number // MB
  audio_file_size_limit?: number // MB
  video_file_size_limit?: number // MB
}

/* 用户输入表单控件（union） */
interface BaseControl {
  type: 'text-input' | 'paragraph' | 'select' | 'file_upload'
  label: string
  variable: string
  required?: boolean
  default?: string
}

export interface TextInputControl extends BaseControl {
  type: 'text-input'
}

export interface ParagraphControl extends BaseControl {
  type: 'paragraph'
}

export interface SelectControl extends BaseControl {
  type: 'select'
  options: string[]
}

export interface FileUploadControl extends BaseControl {
  type: 'file_upload'
  // 可复用 file upload 全局配置或单控件 override
  file_upload?: FileUploadConfig
}

export type UserInputControl = {
  [k: string]: TextInputControl | ParagraphControl | SelectControl | FileUploadControl
}

/* 顶层配置 */
export interface AppParameters {
  opening_statement?: string
  suggested_questions?: string[]
  suggested_questions_after_answer?: SuggestedQuestionsAfterAnswer
  speech_to_text?: FeatureToggle
  text_to_speech?: TextToSpeechConfig
  retriever_resource?: FeatureToggle
  annotation_reply?: FeatureToggle
  user_input_form?: UserInputControl[]
  // 全局上传设置
  file_upload?: FileUploadConfig
  system_parameters?: SystemParameters
}

export interface DifyConversation {
  id: string
  name: string
  inputs: Record<string, any>
  status: string
  introduction: string
  created_at: number
  updated_at: number
  pin?: boolean
}

export interface DifyExtraConversation {
  create_date: number
  id: string
  name: string
  pin: boolean
  update_date: number
  user_id: number
}

export interface DifyChatCompletionResponse {
  id: string
  conversation_id: string
  event: 'message'
  task_id: string
  message_id: string
  mode: 'chat'
  answer: string
  metadata: Record<string, any>
  usage?: Usage
  retriever_resources?: RetrieverResource[]
  created_at: number
}

export interface DifyMessage {
  id: string
  conversation_id: string
  inputs: Record<string, any>
  query: string
  messages_files: Array<{
    id: string
    type: string
    url?: string
    belongs_to: 'user' | 'assistant'
  }>
  answer: string
  created_at: number
  feedback: {
    rating?: 'like' | 'dislike'
  }
  retriever_resources: Array<RetrieverResource>
}
