import { useQuiz } from "@/context/QuizContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const medalConfig = [
  { bg: "bg-gold/20", border: "border-gold", text: "text-gold", icon: Trophy, label: "🥇" },
  { bg: "bg-silver/20", border: "border-silver", text: "text-silver", icon: Medal, label: "🥈" },
  { bg: "bg-bronze/20", border: "border-bronze", text: "text-bronze", icon: Award, label: "🥉" },
];

export default function Leaderboard({ fullscreen = false }: { fullscreen?: boolean }) {
  const { getLeaderboard, numRounds } = useQuiz();
  const leaderboard = getLeaderboard();

  return (
    <div className={fullscreen ? "min-h-screen bg-background p-6 md:p-12" : ""}>
      <div className="max-w-3xl mx-auto">
        {fullscreen && (
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-2">
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-xl">{numRounds} Rounds</p>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="flex justify-center items-end gap-3 md:gap-4 mb-8">
            {[1, 0, 2].map((podiumIdx) => {
              const entry = leaderboard[podiumIdx];
              const medal = medalConfig[podiumIdx];
              const heights = ["h-36 md:h-44", "h-28 md:h-36", "h-24 md:h-32"];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: podiumIdx * 0.15, type: "spring" }}
                  className="flex flex-col items-center"
                >
                  <span className={`text-3xl md:text-4xl mb-2 ${podiumIdx === 0 ? "animate-trophy-bounce" : ""}`}>
                    {medal.label}
                  </span>
                  <span className="font-display font-bold text-sm md:text-base mb-1 text-center truncate max-w-[100px] md:max-w-[140px]">
                    {entry.name}
                  </span>
                  <div
                    className={`${heights[podiumIdx]} w-20 md:w-28 rounded-t-xl ${medal.bg} border-2 ${medal.border} flex items-center justify-center`}
                  >
                    <span className={`font-display font-bold text-2xl md:text-3xl ${medal.text}`}>
                      {entry.total}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Ranking Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_auto] gap-0 text-sm font-medium bg-muted/50 px-4 py-3 border-b">
            <span>Rank</span>
            <span>Group</span>
            <span className="w-20 text-center">Score</span>
          </div>
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, idx) => {
              const medal = idx < 3 ? medalConfig[idx] : null;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`grid grid-cols-[3rem_1fr_auto] gap-0 items-center px-4 py-3 border-b last:border-b-0 ${
                    medal ? medal.bg : "hover:bg-quiz-surface/50"
                  } transition-colors`}
                >
                  <span className={`font-display font-bold text-lg ${medal ? medal.text : "text-muted-foreground"}`}>
                    #{entry.rank}
                  </span>
                  <span className="font-display font-semibold truncate pr-2">{entry.name}</span>
                  <span className="w-20 text-center font-display font-bold text-xl">{entry.total}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
