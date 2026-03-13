import { useQuiz } from "@/context/QuizContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import RoundLeaderboard from "./RoundLeaderboard";
import { Monitor } from "lucide-react";

export default function RoundScoring({ 
  onShareRound, 
  onShareSubRound,
  onStopSharing
}: { 
  onShareRound?: (round: number) => void;
  onShareSubRound?: (round: number, subRound: number) => void;
  onStopSharing?: () => void;
}) {
  const { groups, currentRound, currentSubRound, numRounds, numSubRounds, updateScore, setCurrentRound, setCurrentSubRound } = useQuiz();

  return (
    <div className="space-y-6">
      {/* Round Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Array.from({ length: numRounds }, (_, i) => (
          <button
            key={i}
            onClick={() => {
                setCurrentRound(i);
                setCurrentSubRound(0); // Reset sub-round when changing rounds
            }}
            className={`px-5 py-2.5 rounded-xl font-display font-semibold text-sm whitespace-nowrap transition-all ${currentRound === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            Round {i + 1}
          </button>
        ))}
      </div>

      {/* Sub-Round Tabs */}
      {numSubRounds[currentRound] > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {Array.from({ length: numSubRounds[currentRound] }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSubRound(i)}
              className={`px-4 py-1.5 rounded-lg font-display font-medium text-xs whitespace-nowrap transition-all ${currentSubRound === i
                  ? "bg-[#544ee3]/10 text-[#544ee3] ring-1 ring-[#544ee3]/20 shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              Sub-Round {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Card Grid - like reference image 2 */}
      <motion.div
        key={`${currentRound}-${currentSubRound}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">
            Round {currentRound + 1} {numSubRounds[currentRound] > 1 ? `— Sub-Round ${currentSubRound + 1}` : "— Score Entry"}
          </h2>
          <div className="flex items-center gap-2">
            {onShareSubRound && numSubRounds[currentRound] > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShareSubRound(currentRound, currentSubRound)}
                className="gap-1.5 text-xs border-[#544ee3]/30 text-[#544ee3] hover:bg-[#544ee3]/5"
              >
                <Monitor className="w-3.5 h-3.5" />
                Share Sub-Round {currentSubRound + 1}
              </Button>
            )}
            {onShareRound && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShareRound(currentRound)}
                className="gap-1.5 text-xs"
              >
                <Monitor className="w-3.5 h-3.5" />
                Share Round {currentRound + 1} Total
              </Button>
            )}
            {onStopSharing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStopSharing}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/5"
              >
                Stop Sharing
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {groups.map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-card rounded-2xl border border-border/60 p-4 hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <h3 className="font-display font-bold text-primary text-base mb-3 truncate">
                {group.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Score</span>
                  <Input
                    type="number"
                    value={group.scores[currentRound]?.[currentSubRound] ?? 0}
                    onChange={(e) => updateScore(group.id, currentRound, currentSubRound, Number(e.target.value) || 0)}
                    className="w-20 text-center font-display font-bold h-9 text-base bg-muted/30 focus-visible:bg-background border-muted-foreground/20 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Round Leaderboard */}
      <RoundLeaderboard round={currentRound} />
    </div>
  );
}
