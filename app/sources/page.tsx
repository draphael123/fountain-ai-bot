"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw, Loader2, CheckCircle, XCircle, Database, MessageSquare } from "lucide-react";
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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
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
                <h1 className="text-lg font-semibold text-foreground">
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
                <Button size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Go to Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-destructive">
                <XCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Card */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data?.ingested ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                      <Database className={`h-5 w-5 ${data?.ingested ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
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
                  <Badge variant={data?.ingested ? "default" : "secondary"} className={data?.ingested ? "bg-green-600" : ""}>
                    {data?.ingested ? "Ready" : "Not Ingested"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.ingested && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Chunks</p>
                      <p className="text-2xl font-semibold text-foreground">{data.chunkCount}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Sections</p>
                      <p className="text-2xl font-semibold text-foreground">{data.sectionCount}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Total Tokens</p>
                      <p className="text-2xl font-semibold text-foreground">{data.totalTokens.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Ingested</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(data.ingestedAt)}</p>
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
              <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="text-base">Document Sections</CardTitle>
                  <CardDescription>
                    {data.headings.length} unique sections found in the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.headings.map((heading, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {heading}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {!data?.ingested && (
              <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="text-base">Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Place your document</p>
                        <p className="text-sm text-muted-foreground">
                          Copy your .docx file to the <code className="bg-muted px-1 rounded">data/</code> folder
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Run ingestion</p>
                        <p className="text-sm text-muted-foreground">
                          Run <code className="bg-muted px-1 rounded">npm run ingest</code> or click the Re-ingest button above
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Start asking questions</p>
                        <p className="text-sm text-muted-foreground">
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
