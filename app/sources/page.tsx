"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw, Loader2, CheckCircle, XCircle, Database, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SourcesData {
  ingested: boolean;
  documentName: string | null;
  documentPath: string | null;
  chunkCount: number;
  sectionCount: number;
  totalTokens: number;
  ingestedAt: string | null;
  headings: string[];
}

export default function SourcesPage() {
  const [data, setData] = useState<SourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reingesting, setReingesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingestResult, setIngestResult] = useState<{success: boolean; message: string} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/sources");
      if (!response.ok) throw new Error("Failed to fetch sources");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReingest = async () => {
    try {
      setReingesting(true);
      setIngestResult(null);
      const response = await fetch("/api/ingest", { method: "POST" });
      const result = await response.json();
      
      if (result.success) {
        setIngestResult({ success: true, message: `Successfully ingested ${result.chunkCount} chunks` });
        await fetchData();
      } else {
        setIngestResult({ success: false, message: result.message || "Ingestion failed" });
      }
    } catch (err) {
      setIngestResult({ 
        success: false, 
        message: err instanceof Error ? err.message : "Ingestion failed" 
      });
    } finally {
      setReingesting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-background relative">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      {/* Header */}
      <header className="relative bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-green-500/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold gradient-text">
                  Document Sources
                </h1>
                <p className="text-sm text-muted-foreground">
                  View ingested document information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/chat">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
                  <MessageSquare className="h-4 w-4" />
                  Go to Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse-soft" />
              <Loader2 className="relative h-10 w-10 animate-spin text-purple-500" />
            </div>
          </div>
        ) : error ? (
          <Card className="border-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 shadow-lg">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Card */}
            <Card className="animate-fade-in-up border-0 shadow-xl overflow-hidden">
              <div className={`absolute inset-0 ${data?.ingested ? "bg-gradient-to-br from-green-500/5 to-cyan-500/5" : "bg-gradient-to-br from-amber-500/5 to-orange-500/5"}`} />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl shadow-lg ${
                      data?.ingested 
                        ? "bg-gradient-to-br from-green-500 to-cyan-500 shadow-green-500/30" 
                        : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30"
                    }`}>
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Document Status</CardTitle>
                      <CardDescription>
                        {data?.ingested 
                          ? "Document has been ingested and is ready for queries"
                          : "No document has been ingested yet"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${
                    data?.ingested 
                      ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/30" 
                      : "badge-orange"
                  } px-4 py-1`}>
                    {data?.ingested ? "✓ Ready" : "Not Ingested"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {data?.ingested && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 shadow-lg">
                      <p className="text-sm text-muted-foreground mb-1">Chunks</p>
                      <p className="text-3xl font-bold gradient-text">{data.chunkCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-xl p-4 shadow-lg">
                      <p className="text-sm text-muted-foreground mb-1">Sections</p>
                      <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{data.sectionCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-xl p-4 shadow-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Tokens</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{data.totalTokens.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 shadow-lg">
                      <p className="text-sm text-muted-foreground mb-1">Ingested</p>
                      <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">{formatDate(data.ingestedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Re-ingest button */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Re-ingest Document</p>
                      <p className="text-sm text-muted-foreground">
                        Parse and embed the source document again (dev mode only)
                      </p>
                    </div>
                    <Button
                      onClick={handleReingest}
                      disabled={reingesting}
                      variant="outline"
                      className="gap-2"
                    >
                      {reingesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {reingesting ? "Ingesting..." : "Re-ingest"}
                    </Button>
                  </div>

                  {ingestResult && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 animate-fade-in ${
                      ingestResult.success 
                        ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" 
                        : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                    }`}>
                      {ingestResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <p className="text-sm">{ingestResult.message}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Info */}
            {data?.ingested && data.documentName && (
              <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{data.documentName}</CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {data.documentPath}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Sections List */}
            {data?.ingested && data.headings.length > 0 && (
              <Card className="animate-fade-in-up border-0 shadow-xl overflow-hidden" style={{ animationDelay: "0.2s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 icon-purple" />
                    <CardTitle className="text-base gradient-text">Document Sections</CardTitle>
                  </div>
                  <CardDescription>
                    {data.headings.length} unique sections found in the document
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-wrap gap-2">
                    {data.headings.map((heading, i) => {
                      const colors = ["badge-purple", "badge-pink", "badge-cyan", "badge-orange", "badge-green", "badge-yellow"];
                      return (
                        <Badge key={i} className={`${colors[i % colors.length]} text-xs px-3 py-1 font-medium`}>
                          {heading}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {!data?.ingested && (
              <Card className="animate-fade-in-up border-0 shadow-xl overflow-hidden" style={{ animationDelay: "0.1s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 icon-purple" />
                    <CardTitle className="text-base gradient-text">Getting Started</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/30">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Place your document</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Copy your .docx file to the <code className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-2 py-0.5 rounded font-mono text-xs">data/</code> folder
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-green-500/10">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/30">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Run ingestion</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Run <code className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 px-2 py-0.5 rounded font-mono text-xs">npm run ingest</code> or click the Re-ingest button above
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-orange-500/30">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Start asking questions</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Go to the Chat page and ask questions about your document
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
