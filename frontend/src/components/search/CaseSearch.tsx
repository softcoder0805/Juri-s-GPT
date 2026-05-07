import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Mic, 
  SlidersHorizontal, 
  X,
  Calendar,
  MapPin,
  Tag,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseResultCard } from "./CaseResultCard";
import { SearchFilters } from "./SearchFilters";
import type { CaseResult, SearchFiltersType } from "@/types/search";

const mockResults: CaseResult[] = [
  {
    id: "1",
    title: "Smith v. Johnson Corp.",
    citation: "123 F.3d 456 (9th Cir. 2023)",
    court: "U.S. Court of Appeals, Ninth Circuit",
    date: "2023-06-15",
    topics: ["Employment Law", "Wrongful Termination", "Discrimination"],
    summary: "The court held that the employer's failure to accommodate the plaintiff's disability constituted a violation of the ADA. The decision established new precedent for reasonable accommodation standards in technology companies.",
    relevanceScore: 98,
  },
  {
    id: "2",
    title: "Rodriguez v. State of California",
    citation: "45 Cal.4th 789 (2023)",
    court: "Supreme Court of California",
    date: "2023-04-22",
    topics: ["Criminal Law", "Fourth Amendment", "Search and Seizure"],
    summary: "Landmark decision regarding digital privacy rights and the scope of warrantless searches of electronic devices during traffic stops.",
    relevanceScore: 94,
  },
  {
    id: "3",
    title: "TechStart Inc. v. Innovation Partners",
    citation: "567 U.S. 890 (2022)",
    court: "U.S. Supreme Court",
    date: "2022-11-08",
    topics: ["Intellectual Property", "Patent Law", "Trade Secrets"],
    summary: "The Supreme Court clarified the standard for determining trade secret misappropriation in the context of employee mobility between competing technology companies.",
    relevanceScore: 91,
  },
  {
    id: "4",
    title: "Green Energy Coalition v. EPA",
    citation: "890 F.2d 123 (D.C. Cir. 2023)",
    court: "U.S. Court of Appeals, D.C. Circuit",
    date: "2023-08-30",
    topics: ["Environmental Law", "Administrative Law", "Clean Air Act"],
    summary: "Challenge to EPA regulations regarding carbon emissions standards for power plants. The court upheld the agency's authority while establishing limits on regulatory interpretation.",
    relevanceScore: 87,
  },
  {
    id: "5",
    title: "FirstBank v. Consumer Protection Bureau",
    citation: "234 F.Supp.3d 567 (S.D.N.Y. 2023)",
    court: "U.S. District Court, Southern District of New York",
    date: "2023-02-14",
    topics: ["Banking Law", "Consumer Protection", "Financial Regulation"],
    summary: "Significant ruling on the scope of CFPB enforcement authority and the application of unfair lending practices standards to digital banking platforms.",
    relevanceScore: 85,
  },
];

export function CaseSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<CaseResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    jurisdictions: [],
    dateRange: null,
    topics: [],
  });

  const activeFilterCount = 
    filters.jurisdictions.length + 
    filters.topics.length + 
    (filters.dateRange ? 1 : 0);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setResults(mockResults);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      jurisdictions: [],
      dateRange: null,
      topics: [],
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero Search Section */}
      <div className="relative py-12 px-4 md:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="gradient-text">Case Law Research</span>
            </h2>
            <p className="text-muted-foreground">
              Search through 10M+ legal cases across all jurisdictions
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "relative rounded-2xl transition-all duration-300",
              "glass border-2",
              "focus-within:glow-border focus-within:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2 p-3">
              <Search className="h-5 w-5 text-muted-foreground ml-2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search cases, citations, legal topics..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-10 w-10 relative",
                  showFilters ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="h-5 w-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="h-10 px-6 rounded-xl glow-blue"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.div>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <SearchFilters 
                  filters={filters} 
                  onChange={setFilters} 
                  onClear={clearFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          {activeFilterCount > 0 && !showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {filters.jurisdictions.map((j) => (
                <Badge
                  key={j}
                  variant="secondary"
                  className="gap-1 px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30"
                >
                  <MapPin className="h-3 w-3" />
                  {j}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        jurisdictions: f.jurisdictions.filter((x) => x !== j),
                      }))
                    }
                  />
                </Badge>
              ))}
              {filters.topics.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="gap-1 px-3 py-1 bg-accent/20 text-accent hover:bg-accent/30"
                >
                  <Tag className="h-3 w-3" />
                  {t}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        topics: f.topics.filter((x) => x !== t),
                      }))
                    }
                  />
                </Badge>
              ))}
              {filters.dateRange && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1 bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30"
                >
                  <Calendar className="h-3 w-3" />
                  {filters.dateRange}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((f) => ({ ...f, dateRange: null }))}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground h-7"
              >
                Clear all
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 px-4 md:px-8 pb-8">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto">
            {/* Results header */}
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-6"
              >
                <p className="text-muted-foreground">
                  {isSearching ? (
                    "Searching..."
                  ) : (
                    <>
                      Found <span className="text-foreground font-semibold">{results.length}</span> cases
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Relevance
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loading state */}
            {isSearching && (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl glass shimmer"
                  />
                ))}
              </div>
            )}

            {/* Results grid */}
            {!isSearching && results.length > 0 && (
              <div className="grid gap-4">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CaseResultCard result={result} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isSearching && hasSearched && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Filter className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cases found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </motion.div>
            )}

            {/* Initial state */}
            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start your research</h3>
                <p className="text-muted-foreground">
                  Enter a search query above to find relevant case law
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
