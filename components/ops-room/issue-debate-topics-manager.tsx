'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarRange, Loader2, MessageSquarePlus, RefreshCw, Save, Trash2 } from 'lucide-react'
import {
  createAdminDebateTopic,
  deleteAdminDebateTopic,
  getAdminDebateTopics,
  updateAdminDebateTopic,
  type AdminDebateTopicSummary,
} from '@/app/actions/debate-topics-admin'
import { getDebateTopicTiming } from '@/lib/debate-schedule'
import { getIssueDisplayTitle } from '@/lib/issue-display'

interface IssueOption {
  id: string
  label: string
  title: string
}

interface TopicDraft {
  title: string
  issueIds: string[]
  startsAt: string
  endsAt: string
}

interface IssueDebateTopicsManagerProps {
  issues: IssueOption[]
  loginPath: string
}

type MessageTone = 'error' | 'success'

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '未设置'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function buildTopicDraft(topic: AdminDebateTopicSummary): TopicDraft {
  return {
    title: topic.title,
    issueIds: topic.linkedIssueIds,
    startsAt: toDateTimeLocalValue(topic.startsAt),
    endsAt: toDateTimeLocalValue(topic.endsAt),
  }
}

function getTopicStatus(topic: AdminDebateTopicSummary) {
  if (!topic.startsAt || !topic.endsAt) {
    return {
      label: '时间待定',
      className: 'bg-[#EFEBE9] text-[#7D7D7D]',
    }
  }

  const timing = getDebateTopicTiming(topic.startsAt, topic.endsAt)

  if (timing.status === 'ongoing') {
    return {
      label: '进行中',
      className: 'bg-green-100 text-green-700',
    }
  }

  if (timing.status === 'not_started') {
    return {
      label: '未开始',
      className: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: '已结束',
    className: 'bg-[#EFEBE9] text-[#7D7D7D]',
  }
}

export default function IssueDebateTopicsManager({
  issues,
  loginPath,
}: IssueDebateTopicsManagerProps) {
  const router = useRouter()
  const [selectedIssueId, setSelectedIssueId] = useState('')
  const [topics, setTopics] = useState<AdminDebateTopicSummary[]>([])
  const [drafts, setDrafts] = useState<Record<string, TopicDraft>>({})
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingTopicId, setSavingTopicId] = useState('')
  const [deletingTopicId, setDeletingTopicId] = useState('')
  const [confirmDeleteTopicId, setConfirmDeleteTopicId] = useState('')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<MessageTone>('success')
  const [newTitle, setNewTitle] = useState('')
  const [newIssueIds, setNewIssueIds] = useState<string[]>([])
  const [newStartsAt, setNewStartsAt] = useState('')
  const [newEndsAt, setNewEndsAt] = useState('')

  useEffect(() => {
    setSelectedIssueId((currentIssueId) => {
      if (currentIssueId && issues.some((issue) => issue.id === currentIssueId)) {
        return currentIssueId
      }

      return issues[0]?.id ?? ''
    })
  }, [issues])

  useEffect(() => {
    if (!selectedIssueId) {
      setNewIssueIds([])
      return
    }

    setNewIssueIds([selectedIssueId])
  }, [selectedIssueId])

  const handleGuardFailure = useCallback(
    (error?: string, fallbackMessage?: string) => {
      if (error === 'NOT_AUTHENTICATED') {
        router.replace(loginPath)
        return true
      }

      if (fallbackMessage) {
        setMessage(fallbackMessage)
        setMessageTone('error')
      }

      return false
    },
    [loginPath, router]
  )

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId]
  )

  const issueLabelMap = useMemo(
    () =>
      new Map(
        issues.map((issue) => [issue.id, `${issue.label} · ${getIssueDisplayTitle(issue)}`])
      ),
    [issues]
  )

  const loadTopics = useCallback(
    async (nextIssueId = selectedIssueId) => {
      if (!nextIssueId) {
        setTopics([])
        setDrafts({})
        setLoading(false)
        return
      }

      setLoading(true)
      const result = await getAdminDebateTopics(nextIssueId)

      if (!result.success) {
        handleGuardFailure(result.error, result.message)
        setLoading(false)
        return
      }

      const nextTopics = result.data ?? []
      setTopics(nextTopics)
      setDrafts(
        Object.fromEntries(nextTopics.map((topic) => [topic.id, buildTopicDraft(topic)]))
      )
      setConfirmDeleteTopicId((currentTopicId) =>
        nextTopics.some((topic) => topic.id === currentTopicId) ? currentTopicId : ''
      )
      setLoading(false)
    },
    [handleGuardFailure, selectedIssueId]
  )

  useEffect(() => {
    void loadTopics()
  }, [loadTopics])

  const updateDraft = (topicId: string, patch: Partial<TopicDraft>) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [topicId]: {
        title: currentDrafts[topicId]?.title ?? '',
        issueIds: currentDrafts[topicId]?.issueIds ?? [],
        startsAt: currentDrafts[topicId]?.startsAt ?? '',
        endsAt: currentDrafts[topicId]?.endsAt ?? '',
        ...patch,
      },
    }))
  }

  const resetCreateForm = () => {
    setNewTitle('')
    setNewIssueIds(selectedIssueId ? [selectedIssueId] : [])
    setNewStartsAt('')
    setNewEndsAt('')
  }

  const toggleIssueId = (issueIds: string[], issueId: string) => {
    if (issueIds.includes(issueId)) {
      return issueIds.filter((currentIssueId) => currentIssueId !== issueId)
    }

    return [...issueIds, issueId]
  }

  const handleCreate = async () => {
    if (!selectedIssueId) {
      setMessage('请先选择要绑定的期刊。')
      setMessageTone('error')
      return
    }

    setCreating(true)
    setMessage('')

    const result = await createAdminDebateTopic({
      issueIds: newIssueIds,
      title: newTitle,
      startsAt: newStartsAt ? new Date(newStartsAt).toISOString() : null,
      endsAt: newEndsAt ? new Date(newEndsAt).toISOString() : null,
    })

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setCreating(false)
      return
    }

    setMessage(result.message)
    setMessageTone('success')
    resetCreateForm()
    await loadTopics(selectedIssueId)
    setCreating(false)
  }

  const handleSave = async (topicId: string) => {
    const draft = drafts[topicId]
    if (!draft) {
      return
    }

    setSavingTopicId(topicId)
    setMessage('')

    const result = await updateAdminDebateTopic({
      topicId,
      issueIds: draft.issueIds,
      title: draft.title,
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
      endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
    })

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setSavingTopicId('')
      return
    }

    setMessage(result.message)
    setMessageTone('success')
    await loadTopics(selectedIssueId)
    setSavingTopicId('')
  }

  const handleDelete = async (topicId: string) => {
    setDeletingTopicId(topicId)
    setMessage('')

    const result = await deleteAdminDebateTopic(topicId)

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setDeletingTopicId('')
      return
    }

    const deletedCommentCount = result.data?.deletedCommentCount ?? 0
    setMessage(
      deletedCommentCount > 0
        ? `${result.message} 同时清掉了 ${deletedCommentCount} 条纸条互动。`
        : result.message
    )
    setMessageTone('success')
    setConfirmDeleteTopicId('')
    await loadTopics(selectedIssueId)
    setDeletingTopicId('')
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#E8E4DF] bg-[#FCFBF8] p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-[#E8E4DF] pb-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#F7F5F0] p-2.5">
            <CalendarRange className="h-4 w-4 text-[#A1887F]" />
          </div>
          <div>
            <h3 className="font-youyou text-xl text-[#3A3A3A]">期刊辩题调度</h3>
            <p className="mt-1 text-sm leading-6 text-[#8D8D8D]">
              给每一期设置辩题和开始、结束时间。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedIssueId}
            onChange={(event) => setSelectedIssueId(event.target.value)}
            className="rounded-xl border border-[#E8E4DF] bg-white px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
          >
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.label} · {getIssueDisplayTitle(issue)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void loadTopics()}
            disabled={loading || !selectedIssueId}
            className="rounded-lg p-2 text-[#5D5D5D] transition-colors hover:bg-[#F7F5F0] hover:text-[#3A3A3A] disabled:opacity-50"
            title="刷新辩题列表"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-youyou ${
            messageTone === 'error'
              ? 'border-red-100 bg-red-50 text-red-600'
              : 'border-green-100 bg-green-50 text-green-600'
          }`}
        >
          {message}
        </div>
      ) : null}

      {!selectedIssue ? (
        <div className="py-10 text-center text-sm text-[#8D8D8D]">
          还没有期刊可选，请先在上方创建期刊。
        </div>
      ) : (
        <>
          <div className="mt-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#F7F5F0] p-2.5">
                <MessageSquarePlus className="h-4 w-4 text-[#A1887F]" />
              </div>
              <div>
                <h4 className="font-youyou text-lg text-[#3A3A3A]">
                  为 {selectedIssue.label} · {getIssueDisplayTitle(selectedIssue)} 新建辩题
                </h4>
                <p className="text-xs text-[#8D8D8D]">
                  开始和结束时间可以先留空，后面再补。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">辩题标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="例如：年轻人是否应该尽早离开舒适圈？"
                  className="w-full rounded-xl border border-[#E8E4DF] bg-white px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                />
              </div>

              <div className="md:col-span-2">
                <span className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">显示期刊</span>
                <div className="flex flex-wrap gap-2">
                  {issues.map((issue) => {
                    const checked = newIssueIds.includes(issue.id)

                    return (
                      <label
                        key={issue.id}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                          checked
                            ? 'border-[#A1887F] bg-[#F7F1EC] text-[#6B5648]'
                            : 'border-[#E8E4DF] bg-white text-[#8D8D8D]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setNewIssueIds((currentIssueIds) => toggleIssueId(currentIssueIds, issue.id))}
                          className="h-3.5 w-3.5 rounded border-[#D7CCC8] text-[#A1887F] focus:ring-[#A1887F]"
                        />
                        <span>{issue.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">开始时间</label>
                <input
                  type="datetime-local"
                  value={newStartsAt}
                  onChange={(event) => setNewStartsAt(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E4DF] bg-white px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">结束时间</label>
                <input
                  type="datetime-local"
                  value={newEndsAt}
                  onChange={(event) => setNewEndsAt(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E4DF] bg-white px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={creating || !newTitle.trim() || newIssueIds.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3A3A3A] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquarePlus className="h-4 w-4" />
                )}
                <span className="font-youyou">{creating ? '创建中...' : '新增辩题'}</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4">
              <h4 className="font-youyou text-lg text-[#3A3A3A]">当前期刊辩题列表</h4>
              <p className="mt-1 text-xs text-[#8D8D8D]">
                共 {topics.length} 个辩题。
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-[#E8E4DF] bg-white px-6 py-12 text-center text-sm text-[#8D8D8D]">
                正在读取辩题列表...
              </div>
            ) : topics.length === 0 ? (
              <div className="rounded-2xl border border-[#E8E4DF] bg-white px-6 py-12 text-center text-sm text-[#8D8D8D]">
                这一期还没有辩题，先在上方新增一个吧。
              </div>
            ) : (
              <div className="space-y-4">
                {topics.map((topic) => {
                  const draft = drafts[topic.id] ?? buildTopicDraft(topic)
                  const topicStatus = getTopicStatus(topic)
                  const isSaving = savingTopicId === topic.id
                  const isDeleting = deletingTopicId === topic.id
                  const isDeleteConfirming = confirmDeleteTopicId === topic.id

                  return (
                    <div
                      key={topic.id}
                      className="rounded-2xl border border-[#E8E4DF] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(56,39,24,0.4)]"
                    >
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-youyou text-lg text-[#3A3A3A]">{topic.title}</h5>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${topicStatus.className}`}
                            >
                              {topicStatus.label}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-[#8D8D8D]">
                            开始：{formatDateTime(topic.startsAt)} ｜ 结束：{formatDateTime(topic.endsAt)}
                          </p>
                          <p className="text-xs leading-6 text-[#8D8D8D]">
                            显示于：
                            {draft.issueIds
                              .map((issueId) => issueLabelMap.get(issueId))
                              .filter(Boolean)
                              .join('、') || '未选择期刊'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSave(topic.id)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#3A3A3A] px-4 py-1.5 text-xs text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            <span>{isSaving ? '保存中...' : '保存修改'}</span>
                          </button>

                          {isDeleteConfirming ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void handleDelete(topic.id)}
                                disabled={isDeleting}
                                className="rounded-full bg-red-600 px-4 py-1.5 text-xs text-white transition-colors hover:bg-red-700 disabled:bg-red-300"
                              >
                                {isDeleting ? '删除中...' : '确认删除'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTopicId('')}
                                disabled={isDeleting}
                                className="rounded-full border border-[#D7CCC8] px-4 py-1.5 text-xs text-[#7C746D] transition-colors hover:border-[#A1887F] hover:text-[#A1887F] disabled:opacity-50"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTopicId(topic.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>删除辩题</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">
                            辩题标题
                          </label>
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(event) =>
                              updateDraft(topic.id, {
                                title: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-[#E8E4DF] bg-[#FCFBF8] px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <span className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">
                            显示期刊
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {issues.map((issue) => {
                              const checked = draft.issueIds.includes(issue.id)

                              return (
                                <label
                                  key={issue.id}
                                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                                    checked
                                      ? 'border-[#A1887F] bg-[#F7F1EC] text-[#6B5648]'
                                      : 'border-[#E8E4DF] bg-white text-[#8D8D8D]'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      updateDraft(topic.id, {
                                        issueIds: toggleIssueId(draft.issueIds, issue.id),
                                      })
                                    }
                                    className="h-3.5 w-3.5 rounded border-[#D7CCC8] text-[#A1887F] focus:ring-[#A1887F]"
                                  />
                                  <span>{issue.label}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">
                            开始时间
                          </label>
                          <input
                            type="datetime-local"
                            value={draft.startsAt}
                            onChange={(event) =>
                              updateDraft(topic.id, {
                                startsAt: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-[#E8E4DF] bg-[#FCFBF8] px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">
                            结束时间
                          </label>
                          <input
                            type="datetime-local"
                            value={draft.endsAt}
                            onChange={(event) =>
                              updateDraft(topic.id, {
                                endsAt: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-[#E8E4DF] bg-[#FCFBF8] px-3 py-2.5 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
