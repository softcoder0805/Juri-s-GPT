import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bookmark, 
  Share2, 
  ExternalLink, 
  Calendar, 
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CaseResult } from "@/types/search";

interface CaseResultCardProps {
  result: CaseResult;
}

export function CaseResultCard({ result }: CaseResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relevanceColor = 
    result.relevanceScore >= 90 
      ? "text-success" 
      : result.relevanceScore >= 70 
        ? "text-warning" 
        : "text-muted-foreground";

  return (
    <motion.div
      layout
      className={cn(
        "group relative rounded-2xl transition-all duration-300",
        "glass border border-border/50",
        "hover:border-primary/30 hover:glow-border"
      )}
    >
      {/* Relevance indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${result.relevanceScore}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-primary to-accent"
        />
      </div>

      <div className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {result.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 font-mono text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {result.citation}
                {copied ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>

          {/* Relevance score */}
          <div className="flex flex-col items-center">
            <div className={cn("text-2xl font-bold", relevanceColor)}>
              {result.relevanceScore}%
            </div>
            <span className="text-xs text-muted-foreground">Relevance</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span>{result.court}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(result.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {result.topics.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="text-xs bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
            >
              {topic}
            </Badge>
          ))}
        </div>

        {/* Summary */}
        <p className={cn(
          "text-muted-foreground text-sm leading-relaxed",
          !isExpanded && "line-clamp-2"
        )}>
          {result.summary}
        </p>

        {/* Expand/Collapse */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Read more
            </>
          )}
        </Button>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                "h-8 w-8",
                isBookmarked ? "text-warning" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Case
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
