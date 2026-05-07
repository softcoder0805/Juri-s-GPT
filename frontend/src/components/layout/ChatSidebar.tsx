import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Search, 
  FileText, 
  Scale, 
  Briefcase,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const chatHistory = [
  { id: 1, title: "Contract review for merger", date: "Today" },
  { id: 2, title: "Employment law question", date: "Today" },
  { id: 3, title: "IP rights consultation", date: "Yesterday" },
  { id: 4, title: "Criminal defense strategy", date: "Yesterday" },
  { id: 5, title: "Real estate transaction", date: "3 days ago" },
];

const navItems = [
  { icon: MessageSquare, label: "General Q&A", href: "#chat" },
  { icon: Search, label: "Case Research", href: "#search" },
  { icon: FileText, label: "Document Review", href: "#documents" },
  { icon: Briefcase, label: "Legal Forms", href: "#forms" },
];

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 288 : 64 }}
        className={cn(
          "fixed left-0 top-0 h-full z-50",
          "bg-sidebar border-r border-sidebar-border",
          "flex flex-col glass-strong"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <Scale className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg gradient-text">LawBot AI</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-sidebar-accent"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            className={cn(
              "w-full justify-start gap-2 glow-border",
              "bg-primary/10 hover:bg-primary/20 text-primary",
              !isOpen && "justify-center px-2"
            )}
          >
            <Plus className="h-4 w-4" />
            {isOpen && <span>New Chat</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => setActiveTab(item.href.slice(1))}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground",
                "hover:bg-sidebar-accent transition-all duration-200",
                !isOpen && "justify-center px-2",
                activeTab === item.href.slice(1) && "bg-sidebar-accent text-primary"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Chat History */}
        {isOpen && (
          <div className="flex-1 mt-6 overflow-hidden">
            <div className="px-4 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Chats
              </span>
            </div>
            <ScrollArea className="h-full px-2">
              <div className="space-y-1 pb-4">
                {chatHistory.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 h-auto py-2 px-3",
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                        "hover:bg-sidebar-accent group"
                      )}
                    >
                      <Clock className="h-3 w-3 shrink-0 opacity-50" />
                      <div className="flex-1 text-left truncate">
                        <p className="text-sm truncate">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">{chat.date}</p>
                      </div>
                      <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto p-3 border-t border-sidebar-border space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground",
              !isOpen && "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4" />
            {isOpen && <span>Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground",
              !isOpen && "justify-center px-2"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            {isOpen && <span>Help</span>}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
