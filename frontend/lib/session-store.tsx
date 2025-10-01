"use client"

import { useEffect, useState, useCallback } from "react"
import { nanoid } from "nanoid"

export type SessionType = "jd" | "resume"

export type SessionItem = {
  id: string
  category: "technical" | "behavioral" | "experience"
  question: string
  answer: string
  difficulty?: string
  createdAt: string
}

export type Session = {
  id: string
  type: SessionType
  title: string
  createdAt: string
  status: "New" | "In Progress" | "Completed"
  options: {
    roleFocus: string
    seniority: string
    questionTypes: string[]
    answerTone: string
    questionCount: number
  }
  items: SessionItem[]
}

const STORAGE_KEY = "ib_sessions_v1"

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setSessions(JSON.parse(raw))
      }
    } catch (e) {
      console.error("Failed to read sessions from storage", e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch (e) {
      console.error("Failed to persist sessions", e)
    }
  }, [sessions])

  const createSession = useCallback((data: Partial<Session> & { type: SessionType; title?: string }) => {
    const newSession: Session = {
      id: nanoid(),
      type: data.type,
      title: data.title || (data.type === "jd" ? "Job Description Session" : "Resume Session"),
      createdAt: new Date().toISOString(),
      status: "New",
      options: {
        roleFocus: data.options?.roleFocus || "",
        seniority: data.options?.seniority || "Mid",
        questionTypes: data.options?.questionTypes || ["Technical"],
        answerTone: data.options?.answerTone || "Concise",
        questionCount: data.options?.questionCount || 5,
      },
      items: data.items || [],
    }

    setSessions((s) => [newSession, ...s])
    setSelectedId(newSession.id)
    return newSession
  }, [])

  const updateSession = useCallback((id: string, patch: Partial<Session>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setSelectedId((cur) => (cur === id ? null : cur))
  }, [])

  const selectSession = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const selected = sessions.find((s) => s.id === selectedId) || null

  return {
    sessions,
    selected,
    selectedId,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
  }
}
