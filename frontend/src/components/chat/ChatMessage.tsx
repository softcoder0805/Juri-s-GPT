import { motion } from "framer-motion";
import { Scale, User, Copy, ThumbsUp, ThumbsDown, Check, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Message } from "./ChatInterface";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-4 py-6",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          isAssistant
            ? "bg-primary/20 text-primary glow-blue"
            : "bg-accent/20 text-accent"
        )}
      >
        {isAssistant ? (
          <Scale className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 space-y-2", !isAssistant && "text-right")}>
        <div
          className={cn(
            "inline-block max-w-full",
            isAssistant ? "text-left" : "text-right"
          )}
        >
          <div
            className={cn(
              "inline-block px-4 py-3 rounded-2xl",
              isAssistant
                ? "glass text-foreground rounded-tl-md"
                : "bg-primary text-primary-foreground rounded-tr-md"
            )}
          >
            {message.isTyping ? (
              <TypingIndicator />
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <MessageContent content={message.content} />
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Sources */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-left w-full max-w-2xl"
          >
            <p className="text-xs text-muted-foreground font-medium mb-2 pl-2">Sources & Live Preview</p>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {message.sources.map((source, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-lg bg-card/30 px-3 overflow-hidden shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-2.5 text-sm">
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground line-clamp-1">{source.source}</span>
                      <span className="text-xs text-primary/80 bg-primary/10 px-2 flex-shrink-0 py-0.5 rounded-full border border-primary/20">
                        {source.ref}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pt-1 pb-3 leading-relaxed">
                     <div className="border-l-2 border-primary/40 pl-3 italic bg-muted/20 p-2 rounded-r-md">
                        {source.content ? source.content : "No preview available for this source."}
                     </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}

        {/* Actions (only for assistant messages) */}
        {isAssistant && !message.isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 text-muted-foreground hover:text-foreground",
                feedback === "up" && "text-success"
              )}
              onClick={() => setFeedback(feedback === "up" ? null : "up")}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 text-muted-foreground hover:text-foreground",
                feedback === "down" && "text-destructive"
              )}
              onClick={() => setFeedback(feedback === "down" ? null : "down")}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Render content using the pre-wrap style requested to preserve newlines
  const renderFormattedText = (text: string) => {
    if (!text.includes("**")) return text;
    
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-primary font-semibold">{part.replace(/\*\*/g, "")}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-2">
      <p style={{ whiteSpace: 'pre-wrap' }} className="text-foreground/90 leading-relaxed">
        {renderFormattedText(content)}
      </p>
    </div>
  );
}
