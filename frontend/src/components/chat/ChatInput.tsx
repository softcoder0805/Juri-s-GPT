import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl transition-all duration-300",
        "glass border-2",
        isFocused ? "glow-border border-primary/50" : "border-border/50"
      )}
      animate={{
        boxShadow: isFocused
          ? "0 0 30px hsl(var(--primary) / 0.2)"
          : "0 0 0px transparent",
      }}
    >
      {/* Sparkle indicator when focused */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </motion.div>
      )}

      <div className="flex items-end gap-2 p-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask LawBot anything about law..."
          className={cn(
            "flex-1 min-h-[44px] max-h-[200px] resize-none",
            "bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/50 text-foreground"
          )}
          rows={1}
        />

        {/* Voice input button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Send button */}
        <Button
          size="icon"
          disabled={!message.trim() || isLoading}
          onClick={handleSubmit}
          className={cn(
            "h-9 w-9 rounded-xl shrink-0 transition-all duration-200",
            message.trim() && !isLoading
              ? "bg-primary hover:bg-primary/90 glow-blue"
              : "bg-muted text-muted-foreground"
          )}
        >
          <motion.div
            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
          >
            <Send className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </motion.div>
  );
}
