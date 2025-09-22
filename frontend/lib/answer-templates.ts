export interface AnswerTemplate {
  type: string
  description: string
  structure: string[]
  example: string
  tips: string[]
}

export async function generateAnswerTemplate(question: any): Promise<AnswerTemplate> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const questionType = question.type.toLowerCase()

  switch (questionType) {
    case "behavioral":
      return generateBehavioralTemplate(question)
    case "technical":
      return generateTechnicalTemplate(question)
    case "experience":
      return generateExperienceTemplate(question)
    case "problem-solving":
      return generateProblemSolvingTemplate(question)
    case "leadership":
      return generateLeadershipTemplate(question)
    default:
      return generateGeneralTemplate(question)
  }
}

function generateBehavioralTemplate(question: any): AnswerTemplate {
  return {
    type: "Behavioral",
    description: "Use the STAR method to structure your behavioral answer effectively.",
    structure: [
      "Situation: Set the context and background",
      "Task: Describe what needed to be accomplished",
      "Action: Explain the specific actions you took",
      "Result: Share the outcomes and what you learned",
    ],
    example: `Situation: In my previous role at TechCorp, our team was facing a critical deadline for a client project, but we discovered a major bug in the system just two days before delivery.

Task: As the lead developer, I needed to quickly identify the root cause, fix the issue, and ensure we could still meet our commitment to the client.

Action: I immediately organized a war room session with the team to analyze the problem. I divided the team into two groups - one to investigate the bug while the other prepared a rollback plan. After identifying that the issue was in our new authentication module, I worked through the night to implement a fix and thoroughly test it. I also communicated transparently with the client about the situation and our resolution plan.

Result: We successfully deployed the fix and delivered the project on time. The client appreciated our transparency and proactive communication. This experience taught me the importance of having robust testing procedures and maintaining open communication during crisis situations. We implemented additional code review processes that prevented similar issues in future projects.`,
    tips: [
      "Choose a specific, relevant example",
      "Quantify results when possible",
      "Focus on your individual contributions",
      "End with lessons learned or improvements made",
    ],
  }
}

function generateTechnicalTemplate(question: any): AnswerTemplate {
  return {
    type: "Technical",
    description: "Structure your technical answer to demonstrate both knowledge and practical application.",
    structure: [
      "Concept: Explain the technical concept clearly",
      "Experience: Share your hands-on experience",
      "Implementation: Describe how you've applied it",
      "Best Practices: Mention key considerations and best practices",
    ],
    example: `Concept: React is a JavaScript library for building user interfaces, particularly single-page applications. It uses a component-based architecture and virtual DOM for efficient rendering.

Experience: I've been working with React for over 3 years, building everything from small internal tools to large-scale customer-facing applications. In my current role, I've developed and maintained React applications serving over 50,000 users.

Implementation: In my most recent project, I used React to build a real-time dashboard for monitoring system performance. I implemented custom hooks for data fetching, used Context API for state management, and optimized performance with React.memo and useMemo. The application handles live data updates and provides interactive charts using React and D3.js integration.

Best Practices: I always focus on component reusability, proper state management, and performance optimization. I use TypeScript for better type safety, implement proper error boundaries, and follow React's recommended patterns like lifting state up and composition over inheritance. I also ensure accessibility compliance and write comprehensive unit tests using React Testing Library.`,
    tips: [
      "Start with clear definitions",
      "Provide concrete examples from your experience",
      "Mention specific tools and technologies",
      "Discuss performance and best practices",
    ],
  }
}

function generateExperienceTemplate(question: any): AnswerTemplate {
  return {
    type: "Experience",
    description: "Highlight your relevant experience with specific examples and achievements.",
    structure: [
      "Context: Provide background about the role/project",
      "Responsibilities: Outline your key duties",
      "Achievements: Highlight specific accomplishments",
      "Impact: Describe the broader impact of your work",
    ],
    example: `Context: During my 2-year tenure as Senior Software Engineer at StartupXYZ, I was part of a small but dynamic team responsible for building the company's core product - a SaaS platform for project management.

Responsibilities: My primary responsibilities included architecting and developing the frontend application using React and TypeScript, designing and implementing RESTful APIs with Node.js, collaborating with the product team on feature specifications, and mentoring two junior developers.

Achievements: I successfully led the development of the real-time collaboration feature, which became one of our most popular functionalities. I also optimized our application's performance, reducing load times by 40% and improving user engagement metrics. Additionally, I established our code review process and testing standards, which reduced production bugs by 60%.

Impact: The features I developed directly contributed to a 150% increase in user retention and helped the company secure Series A funding. The performance improvements I implemented enhanced user satisfaction scores and reduced customer support tickets related to technical issues. My mentoring efforts helped grow our development team and establish a strong engineering culture.`,
    tips: [
      "Use specific metrics and numbers",
      "Focus on business impact, not just technical details",
      "Highlight leadership and collaboration",
      "Connect your work to company goals",
    ],
  }
}

function generateProblemSolvingTemplate(question: any): AnswerTemplate {
  return {
    type: "Problem-Solving",
    description: "Demonstrate your analytical thinking and systematic approach to solving problems.",
    structure: [
      "Problem: Clearly define the challenge",
      "Analysis: Describe your investigation process",
      "Solution: Explain your approach and reasoning",
      "Validation: Share how you verified the solution worked",
    ],
    example: `Problem: Our e-commerce platform was experiencing intermittent slowdowns during peak traffic hours, causing cart abandonment rates to increase by 25% and customer complaints to spike.

Analysis: I started by analyzing our monitoring data and identified that the slowdowns correlated with database query spikes. I used profiling tools to examine our most frequent queries and discovered that our product search functionality was causing N+1 query problems. I also noticed that our caching strategy wasn't optimized for our traffic patterns.

Solution: I implemented a multi-pronged approach: First, I optimized the problematic queries by adding proper joins and indexes. Second, I implemented Redis caching for frequently accessed product data with a smart invalidation strategy. Third, I added database connection pooling to handle concurrent requests more efficiently. Finally, I set up comprehensive monitoring to catch similar issues early.

Validation: After deploying these changes, we saw a 70% reduction in average response times during peak hours. Cart abandonment rates returned to normal levels, and customer satisfaction scores improved. The monitoring system I implemented has since helped us proactively identify and resolve three other performance issues before they impacted users.`,
    tips: [
      "Show systematic thinking",
      "Explain your reasoning process",
      "Mention tools and methodologies used",
      "Quantify the impact of your solution",
    ],
  }
}

function generateLeadershipTemplate(question: any): AnswerTemplate {
  return {
    type: "Leadership",
    description: "Showcase your leadership skills and ability to guide teams toward success.",
    structure: [
      "Challenge: Describe the leadership challenge",
      "Approach: Explain your leadership strategy",
      "Execution: Detail how you implemented your approach",
      "Outcome: Share the results and team development",
    ],
    example: `Challenge: When I was promoted to Tech Lead, I inherited a team of 5 developers who were struggling with low morale due to unclear project requirements, frequent scope changes, and missed deadlines. The team was also dealing with technical debt that was slowing down development.

Approach: I focused on three key areas: improving communication, establishing clear processes, and addressing technical challenges. I scheduled one-on-one meetings with each team member to understand their concerns and career goals. I also worked with product management to establish clearer requirements and change management processes.

Execution: I implemented weekly sprint planning sessions and daily standups to improve communication. I created a technical debt backlog and allocated 20% of each sprint to addressing it. I also established code review standards and pair programming sessions to share knowledge across the team. To boost morale, I advocated for the team's professional development and secured budget for conference attendance and training.

Outcome: Within three months, our team's velocity increased by 40% and we started consistently meeting our sprint commitments. Team satisfaction scores improved significantly, and we reduced our technical debt by 60%. Two team members received promotions, and the team became known as one of the most effective in the organization. The processes we established became a model for other teams in the company.`,
    tips: [
      "Focus on people development, not just task management",
      "Show how you influenced without authority",
      "Highlight both team and business outcomes",
      "Demonstrate emotional intelligence and empathy",
    ],
  }
}

function generateGeneralTemplate(question: any): AnswerTemplate {
  return {
    type: "General",
    description: "A flexible structure that works for most interview questions.",
    structure: [
      "Context: Provide relevant background",
      "Details: Share specific information or examples",
      "Impact: Explain the significance or results",
      "Learning: Mention what you gained from the experience",
    ],
    example: `Context: This question relates to my experience with [relevant topic/situation]. Let me share a specific example that demonstrates my capabilities in this area.

Details: [Provide specific details about your experience, including what you did, how you did it, and any challenges you faced. Be concrete and use specific examples.]

Impact: [Explain the results of your actions, including any measurable outcomes, improvements, or benefits. Quantify when possible.]

Learning: [Share what you learned from this experience and how it has influenced your approach to similar situations. This shows growth mindset and self-reflection.]`,
    tips: [
      "Adapt the structure to fit the specific question",
      "Use concrete examples and specific details",
      "Quantify results whenever possible",
      "Show continuous learning and improvement",
    ],
  }
}
