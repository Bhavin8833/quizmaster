import { useState, useCallback } from "react";
import { useQuiz } from "@/context/QuizContext";
import RoundScoring from "./RoundScoring";
import FinalLeaderboard from "./FinalLeaderboard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, RotateCcw, Trophy, Share2, Monitor, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { ref, set, remove } from "firebase/database";

export default function QuizDashboard() {
  const { resetQuiz, groups, currentRound, currentSubRound, numRounds, numWinners, getRoundLeaderboard, getSubRoundLeaderboard, getLeaderboard } = useQuiz();
  const [showFinal, setShowFinal] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayUrl = `${window.location.origin}${import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL}display`;

  const copyDisplayLink = useCallback(() => {
    navigator.clipboard.writeText(displayUrl).then(() => {
      setCopied(true);
      toast.success("Display link copied! Open it on your projector.");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [displayUrl]);

  const shareRoundToDisplay = useCallback((round: number) => {
    const lb = getRoundLeaderboard(round);
    const data = {
      type: "round" as const,
      round,
      groups: lb.map((g) => ({ id: g.id, name: g.name, score: g.roundScore, rank: g.rank })),
    };
    set(ref(db, "quiz-display"), data);
    toast.success(`Round ${round + 1} total sent to display!`);
  }, [getRoundLeaderboard]);

  const shareSubRoundToDisplay = useCallback((round: number, subRound: number) => {
    const lb = getSubRoundLeaderboard(round, subRound);
    const data = {
      type: "sub-round" as const,
      round,
      subRound,
      groups: lb.map((g) => ({ id: g.id, name: g.name, score: g.subRoundScore, rank: g.rank })),
    };
    set(ref(db, "quiz-display"), data);
    toast.success(`Round ${round + 1} Sub-Round ${subRound + 1} sent to display!`);
  }, [getSubRoundLeaderboard]);

  const stopSharing = useCallback(() => {
    remove(ref(db, "quiz-display"));
    toast.info("Sharing stopped. Display is on standby.");
  }, []);

  const shareFinalToDisplay = useCallback(() => {
    const lb = getLeaderboard();
    const data = {
      type: "final" as const,
      numWinners,
      groups: lb.map((g) => ({ id: g.id, name: g.name, score: g.total, rank: g.rank })),
    };
    set(ref(db, "quiz-display"), data);
    toast.success("Final leaderboard sent to display!");
  }, [getLeaderboard, numWinners]);

  if (showFinal) {
    return <FinalLeaderboard onClose={() => setShowFinal(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#f8f9fc] border-b border-border/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 w-56">
            <div className="w-10 h-10 rounded-xl bg-[#eef0ff] border border-[#dce0ff] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#544ee3]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl leading-tight text-slate-900">QuizMaster Live</span>
              <span className="text-xs text-slate-500 font-medium leading-none mt-0.5">Host Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={copyDisplayLink}
              className="gap-2 text-sm font-semibold bg-white text-slate-800 border-slate-200 hover:bg-slate-50 rounded-xl h-10 px-4 shadow-sm transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Display Link"}
            </Button>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <Button
              onClick={() => shareRoundToDisplay(currentRound)}
              className="gap-2 text-sm font-semibold bg-[#544ee3] hover:bg-[#453eb5] text-white shadow-sm rounded-xl h-10 px-5 transition-transform active:scale-95"
            >
              <Monitor className="w-4 h-4" />
              Share Round {currentRound + 1}
            </Button>
            <Button
              variant="outline"
              onClick={stopSharing}
              className="gap-2 text-sm font-semibold bg-white text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40 rounded-xl h-10 px-4 shadow-sm transition-colors"
            >
              <Monitor className="w-4 h-4 opacity-70" />
              Stop sharing
            </Button>
            <Button
              onClick={() => {
                shareFinalToDisplay();
                setShowFinal(true);
              }}
              className="gap-2 font-display font-bold text-sm bg-[#4bb394] hover:bg-[#3ea083] text-[#b04818] shadow-sm rounded-xl h-10 px-5 border-none transition-transform active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              Final Reveal
            </Button>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <Button
              variant="ghost"
              size="icon"
              onClick={resetQuiz}
              className="text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full w-10 h-10 transition-colors"
              title="Reset Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RoundScoring 
          onShareRound={shareRoundToDisplay} 
          onShareSubRound={shareSubRoundToDisplay}
          onStopSharing={stopSharing}
        />
      </div>
    </div>
  );
}
