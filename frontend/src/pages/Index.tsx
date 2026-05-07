import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { CaseSearch } from "@/components/search/CaseSearch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ActiveView = "chat" | "search";

const Index = () => {
  const [activeView, setActiveView] = useState<ActiveView>("chat");

  return (
    <AppLayout>
      {/* Tab Navigation */}
      <div className="flex items-center justify-center pt-4 px-4 relative z-10">
        <div className="flex items-center gap-1 p-1 rounded-xl glass border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView("chat")}
            className={cn(
              "gap-2 rounded-lg transition-all duration-200",
              activeView === "chat"
                ? "bg-primary text-primary-foreground glow-blue"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView("search")}
            className={cn(
              "gap-2 rounded-lg transition-all duration-200",
              activeView === "search"
                ? "bg-primary text-primary-foreground glow-blue"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="h-4 w-4" />
            Case Research
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ChatInterface />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CaseSearch />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Index;
