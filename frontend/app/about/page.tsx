import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { PageHeader } from "@/components/page-header"
import { ContentSection } from "@/components/content-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Lightbulb, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us | AI Interview Prep",
  description: "Learn about our mission to revolutionize interview preparation with AI-powered tools.",
}

export default function AboutPage() {
  return (
    <PageLayout>
      <PageHeader
        title="About AI Interview Prep"
        description="Empowering professionals with AI-driven interview preparation tools to unlock their career potential."
      />

      <ContentSection className="space-y-12">
        {/* Mission Section */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To democratize access to high-quality interview preparation by leveraging
                artificial intelligence, helping job seekers present their best selves and
                land their dream careers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A world where career opportunities are accessible to everyone, regardless of
                their background, through personalized AI-powered interview coaching and
                preparation tools.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Do */}
        <div>
          <h2 className="text-2xl font-bold mb-6">What We Do</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Question Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI analyzes your resume and job descriptions to generate
                  relevant, personalized interview questions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Answer Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered suggestions to improve your answers and
                  communicate your value effectively.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practice & Export</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Practice with realistic scenarios and export your
                  preparation materials for offline use.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Values */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="p-2">
                  <Users className="h-4 w-4" />
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">User-Centric Design</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature is designed with the job seeker's success in mind,
                  ensuring intuitive and effective preparation tools.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="p-2">
                  <Award className="h-4 w-4" />
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Excellence</h3>
                <p className="text-sm text-muted-foreground">
                  We strive for continuous improvement in our AI algorithms and
                  user experience to deliver exceptional results.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="p-2">
                  <Target className="h-4 w-4" />
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  Making professional interview preparation accessible to job seekers
                  at all career levels and backgrounds.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="p-2">
                  <Lightbulb className="h-4 w-4" />
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  Leveraging cutting-edge AI technology to solve real problems
                  in career development and job searching.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Stats */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Making an Impact</h2>
          <div className="grid gap-6 md:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Questions Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2K+</div>
              <div className="text-sm text-muted-foreground">Users Prepared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Interview Game?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of professionals who have successfully prepared for their interviews with AI Interview Prep.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Start Preparing Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Contact Us
            </a>
          </div>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
