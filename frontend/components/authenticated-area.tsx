"use client"

import React, { useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSessions, Session, SessionItem } from "@/lib/session-store"
import { FileUploadZone } from "@/components/file-upload-zone"
import { QuestionsList } from "@/components/questions-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function AuthenticatedArea() {
  const { token, logout } = useAuth()
  const { sessions, selected, createSession, updateSession, deleteSession, selectSession } = useSessions()

  // Upload & setup form state
  const [uploadType, setUploadType] = useState<'jd' | 'resume'>('jd')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [roleFocus, setRoleFocus] = useState("")
  const [seniority, setSeniority] = useState('Mid')
  const [questionTypes, setQuestionTypes] = useState<string[]>(['Technical'])
  const [answerTone, setAnswerTone] = useState('Concise')
  const [questionCount, setQuestionCount] = useState(5)

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
      items: [],
    })

    toast.success('Session created', { description: 'Your interview prep session was created' })
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
        <div className="flex gap-6">
          {/* Left sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Sessions</h3>
              <div className="text-xs text-muted-foreground">{sessions.length}</div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Sessions</div>
              <Button size="sm" onClick={() => { const el = document.getElementById('uploader'); el?.scrollIntoView({behavior: 'smooth'}); }}>Create New Session</Button>
            </div>

            <div className="mb-3">
              <Input placeholder="Search sessions..." onChange={(e) => {/* TODO: wire search filter if available */}} />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {sessions.length === 0 && (
                <div className="p-4 bg-card border rounded-md text-sm text-muted-foreground">
                  No sessions yet. Create a new session to get started.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => { const el = document.getElementById('uploader'); el?.scrollIntoView({behavior: 'smooth'}); }}>Create New Session</Button>
                  </div>
                </div>
              )}

              {sessions.map((s) => (
                <div key={s.id} className={`p-3 border rounded-md cursor-pointer ${selected?.id === s.id ? 'ring-1 ring-primary' : ''}`} onClick={() => selectSession(s.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                    </div>
                    <Badge variant={s.status === 'New' ? 'secondary' : s.status === 'In Progress' ? 'outline' : 'default'} className="text-xs">{s.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {!selected ? (
              <div id="uploader" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadZone title="Paste job description" text={text} setText={setText} isTextArea />
                    <div className="mt-4 space-y-2">
                      <Input placeholder="Role focus" value={roleFocus} onChange={(e) => setRoleFocus(e.target.value)} />
                      <div className="flex gap-2 items-center">
                        <Select onValueChange={(v) => setSeniority(v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Question types:</label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2"><Checkbox checked={questionTypes.includes('Technical')} onCheckedChange={() => toggleQuestionType('Technical')} />Technical</label>
                          <label className="flex items-center gap-2"><Checkbox checked={questionTypes.includes('Behavioral')} onCheckedChange={() => toggleQuestionType('Behavioral')} />Behavioral</label>
                          <label className="flex items-center gap-2"><Checkbox checked={questionTypes.includes('Experience')} onCheckedChange={() => toggleQuestionType('Experience')} />Experience</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Answer tone:</label>
                        <Select onValueChange={(v) => setAnswerTone(v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Concise">Concise</SelectItem>
                            <SelectItem value="Detailed">Detailed</SelectItem>
                            <SelectItem value="STAR">STAR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Number of questions:</label>
                        <Input type="number" value={String(questionCount)} onChange={(e) => setQuestionCount(Number(e.target.value))} className="w-24" />
                      </div>

                      <div className="mt-4">
                        <Button onClick={() => { setUploadType('jd'); handleStart(); }}>
                          Start Interview Prep
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upload Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadZone title="Upload or paste your resume" file={file} setFile={setFile} text={text} setText={setText} accept=".pdf,.docx,.txt" />
                    <div className="mt-4 space-y-2">
                      <Input placeholder="Role focus" value={roleFocus} onChange={(e) => setRoleFocus(e.target.value)} />
                      <div className="flex gap-2 items-center">
                        <Select onValueChange={(v) => setSeniority(v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Question types:</label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2"><Checkbox checked={questionTypes.includes('Technical')} onCheckedChange={() => toggleQuestionType('Technical')} />Technical</label>
                          <label className="flex items-center gap-2"><Checkbox checked={questionTypes.includes('Behavioral')} onCheckedChange={() => toggleQuestionType('Behavioral')} />Behavioral</label>
                          <label className="flex items-center gap-2"><Checkbox checked={questionTypes.includes('Experience')} onCheckedChange={() => toggleQuestionType('Experience')} />Experience</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Answer tone:</label>
                        <Select onValueChange={(v) => setAnswerTone(v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Concise">Concise</SelectItem>
                            <SelectItem value="Detailed">Detailed</SelectItem>
                            <SelectItem value="STAR">STAR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Number of questions:</label>
                        <Input type="number" value={String(questionCount)} onChange={(e) => setQuestionCount(Number(e.target.value))} className="w-24" />
                      </div>

                      <div className="mt-4">
                        <Button onClick={() => { setUploadType('resume'); handleStart(); }}>
                          Start Interview Prep
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Session detail view
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{selected.title}</h2>
                    <div className="text-sm text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { /* Regenerate Questions - mock */ toast.success('Regenerating questions...'); setTimeout(()=>toast.success('Questions regenerated'), 800) }}>Regenerate Questions</Button>
                    <Button onClick={() => { /* Add More - mock */ toast.success('Adding more questions...'); setTimeout(()=>toast.success('Added questions'), 800) }}>Add More Questions</Button>
                    <Button onClick={() => toast.success('Export started (mock)')}>Export as PDF</Button>
                    <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(selected.items.map(i=>i.answer||i.question).join('\n\n'))); toast.success('Copied all answers') }}>Copy All</Button>
                    <Button variant="destructive" onClick={() => handleDelete(selected.id)}>Delete Session</Button>
                    <Button onClick={() => toast.success('Saved changes')}>Save Changes</Button>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <Button onClick={() => updateSession(selected.id, { status: 'In Progress' })}>Mark In Progress</Button>
                  <Button onClick={() => updateSession(selected.id, { status: 'Completed' })}>Mark Completed</Button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <Button onClick={() => {/* filter All */}}>All</Button>
                    <Button onClick={() => {/* filter technical */}}>Technical</Button>
                    <Button onClick={() => {/* filter behavioral */}}>Behavioral</Button>
                    <Button onClick={() => {/* filter experience */}}>Experience</Button>
                    <Input placeholder="Search questions..." onChange={(e) => {/* wire search */}} />
                  </div>
                </div>

                <QuestionsList
                  questions={selected.items.map((it) => ({ id: it.id, question: it.question, type: it.category, relevance_score: 0.8, difficulty: it.difficulty, answer: it.answer, created_at: it.createdAt }))}
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
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AuthenticatedArea
