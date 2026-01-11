import Link from "next/link";
import { ArrowRight, FileText, Shield, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-50" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Internal Operations Tool
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Fountain Workflows
              <span className="block text-blue-600">Assistant</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
              Get instant, accurate answers about internal workflows and procedures.
              All responses are grounded in official documentation with full citations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/chat">
                <Button size="lg" className="gap-2">
                  Start Asking Questions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sources">
                <Button variant="outline" size="lg">
                  View Document Sources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="max-w-4xl mx-auto px-6 -mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Internal Use Only</p>
              <p className="text-sm text-amber-700 mt-1">
                This tool is for internal operations staff only. Do not share externally.
                Do not enter any Protected Health Information (PHI) or patient data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Document-Grounded</CardTitle>
              <CardDescription>
                Every answer comes directly from official workflow documentation.
                No hallucinations or made-up information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Full Citations</CardTitle>
              <CardDescription>
                See exactly which section each piece of information comes from.
                Click to view the original text.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Strict Mode</CardTitle>
              <CardDescription>
                Enforces answers only from the document. 
                If it&apos;s not in the doc, it says so clearly.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          How It Works
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-slate-900">Ask your question</p>
              <p className="text-sm text-slate-600 mt-1">
                Type any question about workflows, procedures, or policies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-slate-900">System finds relevant sections</p>
              <p className="text-sm text-slate-600 mt-1">
                The most relevant parts of the documentation are retrieved using semantic search.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-slate-900">Get a grounded answer</p>
              <p className="text-sm text-slate-600 mt-1">
                Receive a clear answer with numbered citations linking to source sections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-slate-500">
            Fountain Workflows Assistant &bull; Internal Use Only &bull; Do Not Share Externally
          </p>
        </div>
      </footer>
    </main>
  );
}

