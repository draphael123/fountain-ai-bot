import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Fountain Workflows Q&A
                </h1>
                <p className="text-sm text-slate-500">
                  Ask questions about internal procedures
                </p>
              </div>
            </div>
            
            <Link href="/sources">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Sources
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <ChatInterface />
      </div>
    </main>
  );
}

