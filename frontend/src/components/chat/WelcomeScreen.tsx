import { motion } from "framer-motion";
import { 
  Scale, 
  Search, 
  FileText, 
  Briefcase, 
  Gavel,
  Shield,
  BookOpen,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScalesOfJustice3D } from "@/components/3d/ScalesOfJustice3D";

interface WelcomeScreenProps {
  onQuickAction: (action: string) => void;
}

const quickActions = [
  {
    icon: Search,
    label: "Find Case Law",
    description: "Search legal precedents",
    action: "Help me find relevant case law for a personal injury case",
    color: "text-neon-blue",
    bgColor: "bg-neon-blue/10 hover:bg-neon-blue/20",
  },
  {
    icon: FileText,
    label: "Review Contract",
    description: "Analyze legal documents",
    action: "I need help reviewing a business contract for potential issues",
    color: "text-neon-purple",
    bgColor: "bg-neon-purple/10 hover:bg-neon-purple/20",
  },
  {
    icon: Gavel,
    label: "Legal Advice",
    description: "Get expert guidance",
    action: "What are my legal options for resolving a business dispute?",
    color: "text-neon-cyan",
    bgColor: "bg-neon-cyan/10 hover:bg-neon-cyan/20",
  },
  {
    icon: Briefcase,
    label: "Draft Document",
    description: "Create legal forms",
    action: "Help me draft a non-disclosure agreement for my startup",
    color: "text-neon-pink",
    bgColor: "bg-neon-pink/10 hover:bg-neon-pink/20",
  },
];

const features = [
  { icon: Shield, label: "Confidential & Secure" },
  { icon: BookOpen, label: "10M+ Cases Database" },
  { icon: Users, label: "Lawyers & Clients" },
];

export function WelcomeScreen({ onQuickAction }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      {/* 3D Element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-48 h-48 mb-6"
      >
        <ScalesOfJustice3D />
        
        {/* Glow effect behind */}
        <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-full" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="gradient-text">LawBot AI</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your intelligent legal assistant for case research, document review, and legal guidance
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4 mb-10"
      >
        {features.map((feature, index) => (
          <div
            key={feature.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground"
          >
            <feature.icon className="h-4 w-4 text-primary" />
            <span>{feature.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions - Bento Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
      >
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onQuickAction(action.action)}
            className={cn(
              "group relative p-5 rounded-2xl text-left transition-all duration-300",
              "glass border border-border/50 hover:border-primary/30",
              "hover:glow-border"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl", action.bgColor)}>
                <action.icon className={cn("h-6 w-6", action.color)} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {action.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Hover gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
