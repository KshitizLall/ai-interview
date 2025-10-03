"use client"

import React, { useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSessions, Session, SessionItem } from "@/lib/session-store"
import { FileUploadZone } from "@/components/file-upload-zone"
import { QuestionsList } from "@/components/questions-list"
import InputsPane from "@/components/inputs-pane"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { apiService } from "@/lib/api-service"

export function AuthenticatedArea() {
  const { token, logout } = useAuth()
  const { sessions, selected, createSession, updateSession, deleteSession, selectSession } = useSessions()
  const [questionFilter, setQuestionFilter] = useState<'all' | 'technical' | 'behavioral' | 'experience'>('all')

  // Upload & setup form state
  const [uploadType, setUploadType] = useState<'jd' | 'resume'>('jd')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [roleFocus, setRoleFocus] = useState("")
  const [seniority, setSeniority] = useState('Mid')
  const [questionTypes, setQuestionTypes] = useState<string[]>(['Technical'])
  const [answerTone, setAnswerTone] = useState('Concise')
  const [questionCount, setQuestionCount] = useState(5)
  const [companyFilter, setCompanyFilter] = useState<string | 'all'>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<string | 'all'>('all')

  // No separate tabs for JD/Resume: show all sessions in one list

  function toggleQuestionType(type: string) {
    setQuestionTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleStart = () => {
    if (!file && text.trim() === "") {
      toast.error('Please upload a file or paste text before starting')
      return
    }

    if (!roleFocus) {
      toast.error('Missing required options: Role focus')
      return
    }

    // Start generation and create session with generated questions
    setIsGenerating(true)

    const request = {
      resume_text: uploadType === 'jd' ? undefined : text,
      job_description: uploadType === 'resume' ? undefined : text,
      mode: uploadType,
      question_count: questionCount,
      include_answers: false,
      question_types: questionTypes.length ? questionTypes : undefined,
      difficulty_levels: undefined,
      company_name: companyName || undefined,
      position_level: seniority || undefined,
    }

    apiService.generateQuestions(request).then((response) => {
      const items = (response.questions || []).map((q: any) => ({
        id: q.id,
        category: q.type || q.category || 'technical',
        question: q.question || q.text || q.prompt || '',
        answer: q.answer || '',
        difficulty: q.difficulty || 'Medium',
        createdAt: q.created_at || new Date().toISOString(),
      }))

      const newSession = createSession({
        type: uploadType,
        title: uploadType === 'jd' ? `JD - ${roleFocus}` : `Resume - ${roleFocus}`,
        options: {
          roleFocus,
          seniority,
          questionTypes,
          answerTone,
          questionCount,
          companyName: companyName || undefined,
        },
        items,
      })

      if (newSession && (newSession as any).id) selectSession((newSession as any).id)
      toast.success('Session created')
    }).catch((err) => {
      console.error('Generation failed', err)
      toast.error('Question generation failed. Please try again.')
    }).finally(() => setIsGenerating(false))
  }

  // When generation runs inside InputsPane, create a session with the generated questions
  const handleGeneratedQuestions = (questions: any[]) => {
    if (!questions || questions.length === 0) return

    const items: SessionItem[] = questions.map((q: any) => ({
      id: q.id,
      question: q.question || q.text || q.prompt || "",
      answer: q.answer || "",
      category: q.type || q.category || "Technical",
      difficulty: q.difficulty || "Medium",
      createdAt: q.created_at || new Date().toISOString(),
    }))

    const newSession = createSession({
      type: uploadType,
      title: uploadType === 'jd' ? `JD - ${roleFocus}` : `Resume - ${roleFocus}`,
      options: {
        roleFocus,
        seniority,
        questionTypes,
        answerTone,
        questionCount,
      },
      items,
    })

    // Select the newly-created session so the user sees the results immediately
    if (newSession && (newSession as any).id) selectSession((newSession as any).id)
    toast.success('Session created from generated questions')
  }

  // Save answers from InputsPane into the currently selected session (if any)
  const handleSaveAnswers = (answersOrUpdater: any) => {
    if (!selected) return
    const currentMap = selected.items.reduce((acc: any, item: any) => ({ ...acc, [item.id]: item.answer }), {})
    const newAnswers = typeof answersOrUpdater === 'function' ? answersOrUpdater(currentMap) : answersOrUpdater

    const updatedItems = selected.items.map((it: any) => ({ ...it, answer: newAnswers[it.id] ?? it.answer }))
    updateSession(selected.id, { items: updatedItems })
    toast.success('Answers saved to session')
  }

  const handleDelete = (id: string) => {
    // Confirm using browser confirm (reusing existing confirm dialog would be better but this keeps it minimal)
    if (!confirm('Are you sure you want to delete this session?')) return
    deleteSession(id)
    toast.success('Session deleted')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Sessions</h3>
              <div className="text-xs text-muted-foreground">{sessions.length}</div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Sessions</div>
              <Button size="sm" onClick={() => { const el = document.getElementById('uploader'); el?.scrollIntoView({behavior: 'smooth'}); }}>Create New Session</Button>
            </div>

            <div className="mb-3">
              <Input className="w-full" placeholder="Search sessions..." onChange={(e) => {/* TODO: wire search filter if available */}} />
            </div>

            <div className="mb-3">
              <div className="text-sm font-medium mb-2">Filter by company</div>
              <Select onValueChange={(v) => setCompanyFilter(v as string | 'all')}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  {Array.from(new Set(sessions.map(s => s.options?.companyName).filter(Boolean))).map((c: any) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-[40vh] md:max-h-[55vh] lg:max-h-[60vh] overflow-y-auto">
              {sessions.length === 0 && (
                <div className="p-4 bg-card border rounded-md text-sm text-muted-foreground">
                  No sessions yet. Create a new session to get started.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => { const el = document.getElementById('uploader'); el?.scrollIntoView({behavior: 'smooth'}); }}>Create New Session</Button>
                  </div>
                </div>
              )}

              {sessions
                .filter(s => companyFilter === 'all' || !companyFilter || s.options?.companyName === companyFilter)
                .map((s) => (
                <div key={s.id} className={`p-3 border rounded-md cursor-pointer ${selected?.id === s.id ? 'ring-1 ring-primary' : ''}`} onClick={() => selectSession(s.id)}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                      {s.options?.companyName && <div className="text-xs text-muted-foreground">{s.options.companyName}</div>}
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant={s.status === 'New' ? 'secondary' : s.status === 'In Progress' ? 'outline' : 'default'} className="text-xs">{s.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {!selected ? (
              <div id="uploader" className="grid grid-cols-1">
                <Card className="min-h-[320px] lg:min-h-[420px]">
                  <CardHeader>
                    <CardTitle>Upload Job Description / Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Use shared InputsPane so logic for upload and generation is consistent with public page */}
                        <InputsPane
                          resumeFile={file}
                          setResumeFile={setFile}
                          resumeText={text}
                          setResumeText={setText}
                          jobDescription={text}
                          setJobDescription={setText}
                          companyName={companyName}
                          setCompanyName={setCompanyName}
                          positionLevel={seniority}
                          setPositionLevel={setSeniority}
                          isGenerating={isGenerating}
                          setIsGenerating={setIsGenerating}
                          setQuestions={handleGeneratedQuestions}
                          setAnswers={handleSaveAnswers}
                        />
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Session detail view
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold">{selected.title}</h2>
                    <div className="text-sm text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-1">
                    <div className="flex gap-2 md:gap-3 whitespace-nowrap">
                      <Button className="md:w-auto" onClick={() => { /* Regenerate Questions - mock */ toast.success('Regenerating questions...'); setTimeout(()=>toast.success('Questions regenerated'), 800) }}>Regenerate</Button>
                      <Button className="md:w-auto" onClick={() => { /* Add More - mock */ toast.success('Adding more questions...'); setTimeout(()=>toast.success('Added questions'), 800) }}>Add More</Button>
                      <Button className="md:w-auto" onClick={() => toast.success('Export started (mock)')}>Export PDF</Button>
                      <Button className="md:w-auto" onClick={() => { navigator.clipboard.writeText(JSON.stringify(selected.items.map(i=>i.answer||i.question).join('\n\n'))); toast.success('Copied all answers') }}>Copy All</Button>
                      <Button className="md:w-auto" variant="destructive" onClick={() => handleDelete(selected.id)}>Delete</Button>
                      <Button className="md:w-auto" onClick={() => toast.success('Saved changes')}>Save</Button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <Button onClick={() => updateSession(selected.id, { status: 'In Progress' })}>Mark In Progress</Button>
                  <Button onClick={() => updateSession(selected.id, { status: 'Completed' })}>Mark Completed</Button>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant={questionFilter === 'all' ? 'default' : 'outline'} onClick={() => setQuestionFilter('all')}>All</Button>
                      <Button variant={questionFilter === 'technical' ? 'default' : 'outline'} onClick={() => setQuestionFilter('technical')}>Technical</Button>
                      <Button variant={questionFilter === 'behavioral' ? 'default' : 'outline'} onClick={() => setQuestionFilter('behavioral')}>Behavioral</Button>
                      <Button variant={questionFilter === 'experience' ? 'default' : 'outline'} onClick={() => setQuestionFilter('experience')}>Experience</Button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Input className="w-full" placeholder="Search questions..." onChange={(e) => {/* wire search */}} />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value as any)} className="h-8 px-2 border rounded-md bg-input text-sm">
                        <option value="all">All difficulties</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>

                      <select value={"all"} /* placeholder for future status filter */ onChange={() => {}} className="h-8 px-2 border rounded-md bg-input text-sm">
                        <option value="all">All</option>
                      </select>

                      <select value={"newest"} onChange={() => {}} className="h-8 px-2 border rounded-md bg-input text-sm">
                        <option value="newest">Sort: Newest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="relevance">Sort: Relevance</option>
                      </select>
                    </div>
                  </div>
                </div>
                {
                  (() => {
                    // Apply all filters and sorting
                    let filtered = selected.items.slice()
                    if (questionFilter !== 'all') filtered = filtered.filter(it => it.category === questionFilter)
                    if (difficultyFilter !== 'all') filtered = filtered.filter(it => (it.difficulty || '').toLowerCase().includes(difficultyFilter))

                    // Placeholder for answered/unanswered filter and sorting (can be extended)
                    // Default: sort by createdAt desc
                    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                    return (
                      <QuestionsList
                        questions={filtered.map((it) => ({ id: it.id, question: it.question, type: it.category, relevance_score: 0.8, difficulty: it.difficulty, answer: it.answer, created_at: it.createdAt }))}
                        savedQuestions={[]}
                        setSavedQuestions={() => {}}
                        answers={selected.items.reduce((acc, item) => ({ ...acc, [item.id]: item.answer }), {} as Record<string, string>)}
                        // setAnswers accepts either a record or updater; normalize to record
                        setAnswers={(a: any) => {
                          const newAnswers = typeof a === 'function' ? a(selected.items.reduce((acc, item) => ({ ...acc, [item.id]: item.answer }), {} as Record<string, string>)) : a
                          const updated = selected.items.map((it) => ({ ...it, answer: newAnswers[it.id] ?? it.answer }))
                          updateSession(selected.id, { items: updated })
                        }}
                        resumeText=""
                        jobDescription=""
                      />
                    )
                  })()
                }
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AuthenticatedArea
