export type ExportFormat = "comprehensive" | "compact" | "questions-only" | "answers-only"

export interface ExportOptions {
  includeAnswers: boolean
  includeQuestionTypes: boolean
  includeRelevanceScores: boolean
  includeTips: boolean
  includeHeader: boolean
  includeFooter: boolean
  pageBreakBetweenQuestions: boolean
}

export interface ExportData {
  questions: any[]
  answers: Record<string, string>
  format: ExportFormat
  options: ExportOptions
}

export async function exportToPDF(data: ExportData): Promise<void> {
  // In a real implementation, you would use a library like jsPDF or Puppeteer
  // For now, we'll create a comprehensive HTML document and trigger download

  const htmlContent = generateHTMLContent(data)

  // Create a new window for printing/PDF generation
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please check your popup blocker.")
  }

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Note: In a real implementation, you might want to keep the window open
      // or use a proper PDF generation library
    }, 500)
  }
}

function generateHTMLContent(data: ExportData): string {
  const { questions, answers, format, options } = data
  const timestamp = new Date().toLocaleDateString()

  const styles = `
    <style>
      @media print {
        body { margin: 0; }
        .page-break { page-break-before: always; }
        .no-print { display: none; }
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: white;
      }
      
      .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .header h1 {
        color: #1f2937;
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: 600;
      }
      
      .header .subtitle {
        color: #6b7280;
        font-size: 16px;
        margin: 0;
      }
      
      .stats {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-top: 15px;
        font-size: 14px;
      }
      
      .stat {
        text-align: center;
      }
      
      .stat-number {
        font-size: 20px;
        font-weight: 600;
        color: #3b82f6;
        display: block;
      }
      
      .question-item {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #fafafa;
      }
      
      .question-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 15px;
      }
      
      .question-number {
        background: #3b82f6;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
      }
      
      .question-content {
        flex: 1;
      }
      
      .question-text {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
        margin: 0 0 10px 0;
        line-height: 1.5;
      }
      
      .question-meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      
      .badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .badge-type {
        background: #dbeafe;
        color: #1e40af;
      }
      
      .badge-score {
        background: #dcfce7;
        color: #166534;
      }
      
      .badge-difficulty {
        background: #fef3c7;
        color: #92400e;
      }
      
      .answer-section {
        margin-top: 20px;
        padding: 15px;
        background: white;
        border-radius: 6px;
        border-left: 4px solid #3b82f6;
      }
      
      .answer-label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .answer-text {
        color: #4b5563;
        white-space: pre-wrap;
        line-height: 1.6;
      }
      
      .no-answer {
        color: #9ca3af;
        font-style: italic;
      }
      
      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
      
      .tips-section {
        margin-top: 15px;
        padding: 12px;
        background: #fffbeb;
        border-radius: 6px;
        border-left: 4px solid #f59e0b;
      }
      
      .tips-title {
        font-weight: 600;
        color: #92400e;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .tips-list {
        margin: 0;
        padding-left: 20px;
        color: #78350f;
      }
      
      .tips-list li {
        margin-bottom: 4px;
      }
    </style>
  `

  const header = options.includeHeader
    ? `
    <div class="header">
      <h1>Interview Preparation Guide</h1>
      <p class="subtitle">Generated on ${timestamp}</p>
      <div class="stats">
        <div class="stat">
          <span class="stat-number">${questions.length}</span>
          <span>Questions</span>
        </div>
        <div class="stat">
          <span class="stat-number">${Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length}</span>
          <span>Answered</span>
        </div>
        <div class="stat">
          <span class="stat-number">${Math.round((questions.reduce((sum, q) => sum + q.relevanceScore, 0) / questions.length) * 100)}%</span>
          <span>Avg. Relevance</span>
        </div>
      </div>
    </div>
  `
    : ""

  const questionsHTML = questions
    .map((question, index) => {
      const hasAnswer = answers[question.id]?.trim().length > 0
      const pageBreak = options.pageBreakBetweenQuestions && index > 0 ? "page-break" : ""

      let questionHTML = `
      <div class="question-item ${pageBreak}">
        <div class="question-header">
          <div class="question-number">${index + 1}</div>
          <div class="question-content">
            <h3 class="question-text">${question.text}</h3>
    `

      if (options.includeQuestionTypes || options.includeRelevanceScores) {
        questionHTML += '<div class="question-meta">'

        if (options.includeQuestionTypes) {
          questionHTML += `<span class="badge badge-type">${question.type}</span>`
          if (question.difficulty) {
            questionHTML += `<span class="badge badge-difficulty">${question.difficulty} level</span>`
          }
        }

        if (options.includeRelevanceScores) {
          questionHTML += `<span class="badge badge-score">${Math.round(question.relevanceScore * 100)}% match</span>`
        }

        questionHTML += "</div>"
      }

      questionHTML += "</div></div>"

      // Add answer section based on format
      if (format !== "questions-only" && options.includeAnswers) {
        questionHTML += `
        <div class="answer-section">
          <div class="answer-label">Your Answer:</div>
          <div class="answer-text ${!hasAnswer ? "no-answer" : ""}">
            ${hasAnswer ? answers[question.id] : "No answer provided yet."}
          </div>
        </div>
      `
      }

      // Add tips section if enabled
      if (options.includeTips && hasAnswer) {
        const tips = generateAnswerTips(question.type)
        questionHTML += `
        <div class="tips-section">
          <div class="tips-title">💡 Interview Tips:</div>
          <ul class="tips-list">
            ${tips.map((tip) => `<li>${tip}</li>`).join("")}
          </ul>
        </div>
      `
      }

      questionHTML += "</div>"
      return questionHTML
    })
    .join("")

  const footer = options.includeFooter
    ? `
    <div class="footer">
      <p>Generated by InterviewBot • ${timestamp}</p>
      <p>Good luck with your interview! 🚀</p>
    </div>
  `
    : ""

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Preparation Guide</title>
      ${styles}
    </head>
    <body>
      ${header}
      ${questionsHTML}
      ${footer}
    </body>
    </html>
  `
}

function generateAnswerTips(questionType: string): string[] {
  const tipsByType: Record<string, string[]> = {
    behavioral: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Be specific with examples and quantify results when possible",
      "Focus on your individual contributions and learnings",
    ],
    technical: [
      "Explain concepts clearly and provide concrete examples",
      "Discuss best practices and potential trade-offs",
      "Mention relevant tools and technologies you've used",
    ],
    experience: [
      "Highlight specific achievements and their business impact",
      "Connect your experience to the role requirements",
      "Show progression and continuous learning",
    ],
    "problem-solving": [
      "Walk through your thought process step by step",
      "Explain how you analyzed the problem and considered alternatives",
      "Describe how you validated your solution worked",
    ],
    leadership: [
      "Focus on how you influenced and developed others",
      "Share specific examples of team or organizational impact",
      "Demonstrate emotional intelligence and adaptability",
    ],
  }

  return (
    tipsByType[questionType] || [
      "Be specific and provide concrete examples",
      "Connect your answer to the role and company",
      "Show enthusiasm and genuine interest",
    ]
  )
}

// Alternative export function using jsPDF (would require the library)
export async function exportToPDFAdvanced(data: ExportData): Promise<void> {
  // This would use jsPDF for more advanced PDF generation
  // Implementation would require: npm install jspdf html2canvas

  throw new Error("Advanced PDF export requires jsPDF library installation")
}

// Export to other formats
export async function exportToWord(data: ExportData): Promise<void> {
  // This would generate a Word document
  // Implementation would require a library like docx

  throw new Error("Word export not implemented yet")
}

export async function exportToMarkdown(data: ExportData): Promise<void> {
  const { questions, answers, options } = data
  const timestamp = new Date().toLocaleDateString()

  let markdown = ""

  if (options.includeHeader) {
    markdown += `# Interview Preparation Guide\n\n`
    markdown += `*Generated on ${timestamp}*\n\n`
    markdown += `**Statistics:**\n`
    markdown += `- Questions: ${questions.length}\n`
    markdown += `- Answered: ${Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length}\n`
    markdown += `- Average Relevance: ${Math.round((questions.reduce((sum, q) => sum + q.relevanceScore, 0) / questions.length) * 100)}%\n\n`
    markdown += `---\n\n`
  }

  questions.forEach((question, index) => {
    markdown += `## ${index + 1}. ${question.text}\n\n`

    if (options.includeQuestionTypes || options.includeRelevanceScores) {
      markdown += `**Metadata:** `
      if (options.includeQuestionTypes) {
        markdown += `Type: ${question.type} | `
        if (question.difficulty) {
          markdown += `Difficulty: ${question.difficulty} | `
        }
      }
      if (options.includeRelevanceScores) {
        markdown += `Relevance: ${Math.round(question.relevanceScore * 100)}%`
      }
      markdown += `\n\n`
    }

    if (options.includeAnswers && answers[question.id]) {
      markdown += `**Your Answer:**\n\n${answers[question.id]}\n\n`
    }

    markdown += `---\n\n`
  })

  if (options.includeFooter) {
    markdown += `*Generated by InterviewBot*\n`
  }

  // Create and download the markdown file
  const blob = new Blob([markdown], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `interview-prep-${timestamp.replace(/\//g, "-")}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
