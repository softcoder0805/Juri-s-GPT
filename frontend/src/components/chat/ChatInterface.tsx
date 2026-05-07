import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, HistoryIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService, type ApiMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploader } from "./DocumentUploader";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  sources?: Array<{
    ref: string;
    heading: string;
    source: string;
    content?: string;
  }>;
}


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const { toast } = useToast();
  
  const toggleDocumentUploader = () => {
    setShowDocumentUploader(!showDocumentUploader);
  };

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare history for API - only include user and assistant messages, exclude typing indicators
      const history = messages
        .filter(msg => !msg.isTyping) // Exclude typing messages
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call the backend API
      const response = await apiService.chat({
        message: content,
        history: history
      });

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling chat API:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from the legal assistant. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-lg font-semibold">Legal Assistant</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDocumentUploader}
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            {showDocumentUploader ? "Hide" : "Upload"}
          </Button>
        </div>
      </div>
      
      {/* Document Uploader */}
      {showDocumentUploader && (
        <div className="px-4 mb-4">
          <DocumentUploader />
        </div>
      )}
      
      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 px-4 md:px-8" 
        ref={scrollRef}
        onScrollCapture={(e) => {
          const target = e.target as HTMLElement;
          const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
          setShowScrollButton(!isNearBottom);
        }}
      >
        <div className="max-w-4xl mx-auto py-8">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <WelcomeScreen onQuickAction={handleQuickAction} />
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChatMessage message={message} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2"
          >
            <Button
              size="icon"
              variant="secondary"
              onClick={scrollToBottom}
              className="rounded-full shadow-lg glow-border"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
          <p className="text-xs text-muted-foreground text-center mt-2">
            LawBot AI provides general legal information. Always consult a licensed attorney for legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}