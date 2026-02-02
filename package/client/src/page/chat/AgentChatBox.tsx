import type { UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function formatToolTitle(type: string) {
  if (type.startsWith('tool-')) return type.slice('tool-'.length)
  return type
}

type DynamicToolPart = {
  type: 'dynamic-tool'
  toolName: string
  state?: string
  toolCallId?: string
  input?: unknown
  output?: unknown
  errorText?: unknown
}

function isDynamicToolPart(part: unknown): part is DynamicToolPart {
  if (!isRecord(part)) return false
  return part.type === 'dynamic-tool' && typeof part.toolName === 'string'
}

export function AgentChatBox(props: {
  messages: UIMessage[]
  status: string
  error?: Error
}) {
  const { messages, status, error } = props

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const thresholdPx = 80
    const update = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setIsNearBottom(distanceToBottom <= thresholdPx)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!isNearBottom) return
    bottomAnchorRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, status, isNearBottom])

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 space-y-4 overflow-y-auto p-4"
    >
      <div className="text-xs text-gray-500">
        Agent 状态：{status}
        {error ? `（${error.message}）` : ''}
      </div>
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <div className="text-sm font-medium">{message.role}</div>
          <div className="space-y-2">
            {(message.parts as unknown[]).map((part, index) => {
              const p = part

              if (
                isRecord(p) &&
                p.type === 'text' &&
                typeof p.text === 'string'
              ) {
                return (
                  <div
                    key={`${message.id}-text-${index}`}
                    className="whitespace-pre-wrap"
                  >
                    {p.text}
                  </div>
                )
              }

              if (
                isRecord(p) &&
                typeof p.type === 'string' &&
                p.type.startsWith('tool-')
              ) {
                const title = formatToolTitle(p.type)
                return (
                  <div
                    key={`${message.id}-tool-${index}`}
                    className="rounded border border-slate-200 bg-slate-50 p-2"
                  >
                    <div className="text-xs font-medium">
                      tool: {title} · state: {String(p.state ?? '')}
                    </div>
                    {'toolCallId' in p ? (
                      <div className="text-xs text-gray-500">
                        toolCallId:{' '}
                        {String(
                          (p as Record<string, unknown>).toolCallId ?? '',
                        )}
                      </div>
                    ) : null}
                    {'input' in p ? (
                      <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
                        {JSON.stringify(
                          (p as Record<string, unknown>).input ?? null,
                          null,
                          2,
                        )}
                      </pre>
                    ) : null}
                    {'output' in p ? (
                      <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
                        {JSON.stringify(
                          (p as Record<string, unknown>).output ?? null,
                          null,
                          2,
                        )}
                      </pre>
                    ) : null}
                    {'errorText' in p ? (
                      <div className="mt-2 text-xs text-red-600">
                        {String((p as Record<string, unknown>).errorText)}
                      </div>
                    ) : null}
                  </div>
                )
              }

              if (isDynamicToolPart(p)) {
                return (
                  <div
                    key={`${message.id}-dynamic-tool-${index}`}
                    className="rounded border border-slate-200 bg-slate-50 p-2"
                  >
                    <div className="text-xs font-medium">
                      tool: {p.toolName} · state: {String(p.state ?? '')}
                    </div>
                    {p.toolCallId ? (
                      <div className="text-xs text-gray-500">
                        toolCallId: {p.toolCallId}
                      </div>
                    ) : null}
                    {'input' in p ? (
                      <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
                        {JSON.stringify(p.input ?? null, null, 2)}
                      </pre>
                    ) : null}
                    {'output' in p ? (
                      <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
                        {JSON.stringify(p.output ?? null, null, 2)}
                      </pre>
                    ) : null}
                    {'errorText' in p ? (
                      <div className="mt-2 text-xs text-red-600">
                        {String(p.errorText)}
                      </div>
                    ) : null}
                  </div>
                )
              }

              if (isRecord(p) && p.type === 'reasoning') {
                return (
                  <pre
                    key={`${message.id}-reasoning-${index}`}
                    className="overflow-auto rounded bg-slate-50 p-2 text-xs"
                  >
                    {String(
                      (p as Record<string, unknown>).text ??
                        (p as Record<string, unknown>).reasoning ??
                        '',
                    )}
                  </pre>
                )
              }

              return (
                <pre
                  key={`${message.id}-unknown-${index}`}
                  className="overflow-auto rounded bg-slate-50 p-2 text-xs"
                >
                  {JSON.stringify(p ?? null, null, 2)}
                </pre>
              )
            })}
          </div>
        </div>
      ))}
      <div ref={bottomAnchorRef} />
    </div>
  )
}
