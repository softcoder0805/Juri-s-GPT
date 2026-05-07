import { motion } from "framer-motion";
import { MapPin, Calendar, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SearchFiltersType } from "@/types/search";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  onClear: () => void;
}

const jurisdictions = [
  "U.S. Supreme Court",
  "Federal Courts",
  "California",
  "New York",
  "Texas",
  "Florida",
  "International",
];

const dateRanges = [
  "Last 30 days",
  "Last year",
  "Last 5 years",
  "Last 10 years",
  "All time",
];

const legalTopics = [
  "Criminal Law",
  "Civil Rights",
  "Contract Law",
  "Family Law",
  "Immigration",
  "Intellectual Property",
  "Employment Law",
  "Personal Injury",
  "Environmental Law",
  "Corporate Law",
];

export function SearchFilters({ filters, onChange, onClear }: SearchFiltersProps) {
  const toggleJurisdiction = (j: string) => {
    const current = filters.jurisdictions;
    onChange({
      ...filters,
      jurisdictions: current.includes(j)
        ? current.filter((x) => x !== j)
        : [...current, j],
    });
  };

  const toggleTopic = (t: string) => {
    const current = filters.topics;
    onChange({
      ...filters,
      topics: current.includes(t)
        ? current.filter((x) => x !== t)
        : [...current, t],
    });
  };

  const setDateRange = (range: string) => {
    onChange({
      ...filters,
      dateRange: filters.dateRange === range ? null : range,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 p-6 rounded-2xl glass border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Jurisdiction */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <Label className="font-medium">Jurisdiction</Label>
          </div>
          <div className="space-y-2">
            {jurisdictions.map((j) => (
              <div key={j} className="flex items-center gap-2">
                <Checkbox
                  id={`j-${j}`}
                  checked={filters.jurisdictions.includes(j)}
                  onCheckedChange={() => toggleJurisdiction(j)}
                />
                <Label
                  htmlFor={`j-${j}`}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {j}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-neon-cyan" />
            <Label className="font-medium">Date Range</Label>
          </div>
          <div className="space-y-2">
            {dateRanges.map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(range)}
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground",
                  filters.dateRange === range && "bg-neon-cyan/20 text-neon-cyan"
                )}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Legal Topics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-accent" />
            <Label className="font-medium">Legal Topics</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {legalTopics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "text-xs rounded-full transition-all",
                  filters.topics.includes(topic)
                    ? "bg-accent/20 text-accent border-accent/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
