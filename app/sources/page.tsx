"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw, Loader2, CheckCircle, XCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
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
                  Document Sources
                </h1>
                <p className="text-sm text-slate-500">
                  View ingested document information
                </p>
              </div>
            </div>

            <Link href="/chat">
              <Button size="sm" className="gap-2">
                Go to Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-red-800">
                <XCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data?.ingested ? "bg-green-100" : "bg-amber-100"}`}>
                      <Database className={`h-5 w-5 ${data?.ingested ? "text-green-600" : "text-amber-600"}`} />
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
                  <Badge variant={data?.ingested ? "success" : "warning"}>
                    {data?.ingested ? "Ready" : "Not Ingested"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.ingested && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-500">Chunks</p>
                      <p className="text-2xl font-semibold text-slate-900">{data.chunkCount}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-500">Sections</p>
                      <p className="text-2xl font-semibold text-slate-900">{data.sectionCount}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-500">Total Tokens</p>
                      <p className="text-2xl font-semibold text-slate-900">{data.totalTokens.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-500">Ingested</p>
                      <p className="text-sm font-medium text-slate-900">{formatDate(data.ingestedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Re-ingest button */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Re-ingest Document</p>
                      <p className="text-sm text-slate-500">
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
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                      ingestResult.success 
                        ? "bg-green-50 text-green-800 border border-green-200" 
                        : "bg-red-50 text-red-800 border border-red-200"
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
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
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
              <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Place your document</p>
                        <p className="text-sm text-slate-500">
                          Copy your .docx file to the <code className="bg-slate-100 px-1 rounded">data/</code> folder
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Run ingestion</p>
                        <p className="text-sm text-slate-500">
                          Run <code className="bg-slate-100 px-1 rounded">npm run ingest</code> or click the Re-ingest button above
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Start asking questions</p>
                        <p className="text-sm text-slate-500">
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

