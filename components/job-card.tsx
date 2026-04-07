"use client"

import { JobMetadata } from "@/lib/storage"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Download, FileIcon, Loader2, AlertCircle, CheckCircle2, Archive } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface JobCardProps {
  job: JobMetadata
}

export function JobCard({ job }: JobCardProps) {
  const isCompleted = job.status === "completed"
  const isFailed = job.status === "failed"
  const isProcessing = ["downloading", "zipping", "pending"].includes(job.status)

  const getStatusBadge = () => {
    switch (job.status) {
      case "completed": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</Badge>
      case "failed": return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>
      case "zipping": return <Badge variant="warning" className="gap-1 animate-pulse"><Archive className="h-3 w-3" /> Zipping</Badge>
      case "downloading": return <Badge variant="default" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Fetching</Badge>
      default: return <Badge variant="secondary">Pending</Badge>
    }
  }

  const totalProgress = job.files.reduce((acc, f) => acc + f.progress, 0) / job.files.length

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-border/50 group">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {job.isZip ? <Archive className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                {job.isZip ? `Bundle (${job.files.length} files)` : job.files[0].name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                </span>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {isCompleted && (
              <Button asChild size="sm" className="shadow-sm">
                <a href={`/api/download/${job.id}`} download>
                  <Download className="h-4 w-4 mr-2" /> Download
                </a>
              </Button>
            )}
            {isFailed && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {job.error}
              </span>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-muted-foreground">Overall Progress</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-1.5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {job.files.map((file, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-2 rounded-md bg-muted/30 text-[10px] sm:text-xs">
                   <div className="flex justify-between items-center overflow-hidden">
                     <span className="truncate flex-1 pr-2">{file.name}</span>
                     <span className={file.status === 'failed' ? 'text-destructive' : 'text-primary'}>
                       {file.status === 'completed' ? 'Done' : `${file.progress}%`}
                     </span>
                   </div>
                   <Progress value={file.progress} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
