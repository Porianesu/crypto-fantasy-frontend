import type {
  ChunkChatCompletionResponse,
  DifyChatCompletionResponse,
  PingEvent,
} from '@/types/DifyTypes.ts'
import axios from 'axios'

const request = axios.create({
  baseURL: 'https://dify.defed.network/v1',
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const Dify_API_Key = 'app-ob9MKtLv57SBYCEB5fSafc5O'

export interface DifySendMessageParams {
  query: string
  inputs: Record<string, any>
  response_mode: 'streaming' | 'blocking'
  user: string
  conversation_id?: string
  files: Array<{
    type: 'document' | 'image' | 'video' | 'audio' | 'custom'
    transfer_method: 'remote_url' | 'local_file'
  }>
  auto_generate_name?: boolean
  parent_message_id?: string
}

const DifyApi = {
  sendMessageBlock: async (params: DifySendMessageParams) => {
    const authorization = `Bearer ${Dify_API_Key}`
    // Always send JSON as request body so server can parse it; when expecting a streaming response,
    // include Accept: 'text/event-stream' to tell the server we'd like streamed events back.
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: authorization, // 添加 Bearer Token
    }
    return request.post<DifyChatCompletionResponse>('/chat-messages', params, {
      headers: reqHeaders,
    })
  },
  // New: stream-aware send method using fetch so we can process ReadableStream on the client
  // - onEvent: called for each parsed event object
  // - signal: optional AbortSignal to cancel the streaming request
  sendMessageStream: async (
    params: DifySendMessageParams,
    onEvent: (ev: ChunkChatCompletionResponse) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    // Build URL from axios instance baseURL to keep consistency
    const base = (request.defaults.baseURL as string) || ''
    const url = base.replace(/\/$/, '') + '/chat-messages'

    const authorization = `Bearer ${Dify_API_Key}`

    // Always send JSON as request body so server can parse it; when expecting a streaming response,
    // include Accept: 'text/event-stream' to tell the server we'd like streamed events back.
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: authorization, // 添加 Bearer Token
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(params),
      signal,
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`Request failed ${res.status}: ${txt}`)
    }

    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // split by newlines; keep last partial chunk in buffer
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() || ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue

        // SSE-style lines may start with "data:"
        const payload = line.startsWith('data:') ? line.replace(/^data:\s*/, '') : line
        if (payload === 'event: ping') {
          const pingEvent: PingEvent = {
            event: 'ping',
            timestamp: Date.now(),
          }
          onEvent(pingEvent)
        } else {
          try {
            const ev = JSON.parse(payload)
            onEvent(ev)
          } catch (err) {
            // ignore parse errors for partial chunks, but still continue
            console.warn('parse chunk failed', payload, err)
          }
        }
      }
    }

    // final buffer
    if (buffer.trim()) {
      const final = buffer.trim()
      const payload = final.startsWith('data:') ? final.replace(/^data:\s*/, '') : final
      try {
        const ev = JSON.parse(payload)
        onEvent(ev)
      } catch (err) {
        console.warn('final parse failed', payload, err)
      }
    }
  },
}

export default DifyApi
