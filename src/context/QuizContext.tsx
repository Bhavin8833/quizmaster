import React, { createContext, useContext, useState, useCallback } from "react";

export interface Group {
  id: string;
  name: string;
  scores: number[][]; // [round][subRound]
}

interface QuizState {
  groups: Group[];
  numRounds: number;
  numSubRounds: number[]; // e.g. [1, 2, 1] means 1 for round 0, 2 for round 1, etc.
  numWinners: number;
  currentRound: number;
  currentSubRound: number;
  isSetup: boolean;
}

interface QuizContextType extends QuizState {
  setupQuiz: (groups: Group[], numRounds: number, numSubRounds: number[], numWinners: number) => void;
  setCurrentRound: (round: number) => void;
  setCurrentSubRound: (subRound: number) => void;
  updateScore: (groupId: string, round: number, subRound: number, score: number) => void;
  resetQuiz: () => void;
  getTotalScore: (group: Group) => number;
  getLeaderboard: () => (Group & { total: number; rank: number })[];
  getRoundLeaderboard: (round: number) => (Group & { roundScore: number; rank: number })[];
  getSubRoundLeaderboard: (round: number, subRound: number) => (Group & { subRoundScore: number; rank: number })[];
}

const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
};

const SAVED_STATE_KEY = "quizmaster_live_state";

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuizState>(() => {
    const saved = localStorage.getItem(SAVED_STATE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        // Migration check: if scores are 1D arrays, convert them to 2D
        if (parsedState.groups && parsedState.groups.length > 0 && typeof parsedState.groups[0].scores[0] === 'number') {
            parsedState.groups = parsedState.groups.map((g: any) => ({
                ...g,
                scores: g.scores.map((s: number) => [s])
            }));
            parsedState.numSubRounds = Array(parsedState.numRounds).fill(1);
            parsedState.currentSubRound = 0;
        } else if (typeof parsedState.numSubRounds === 'number') {
            // Migrate single number to array
            parsedState.numSubRounds = Array(parsedState.numRounds).fill(parsedState.numSubRounds);
        }
        return {
          ...parsedState,
          numSubRounds: parsedState.numSubRounds || Array(parsedState.numRounds).fill(1),
          currentSubRound: parsedState.currentSubRound || 0
        };
      } catch (err) {
        console.error("Failed to parse saved quiz state", err);
      }
    }
    return {
      groups: [],
      numRounds: 3,
      numSubRounds: [1, 1, 1],
      numWinners: 3,
      currentRound: 0,
      currentSubRound: 0,
      isSetup: false,
    };
  });

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  }, [state]);

  const setupQuiz = useCallback((groups: Group[], numRounds: number, numSubRounds: number[], numWinners: number) => {
    setState({ groups, numRounds, numSubRounds, numWinners, currentRound: 0, currentSubRound: 0, isSetup: true });
  }, []);

  const setCurrentRound = useCallback((round: number) => {
    setState((s) => ({ ...s, currentRound: round }));
  }, []);

  const setCurrentSubRound = useCallback((subRound: number) => {
    setState((s) => ({ ...s, currentSubRound: subRound }));
  }, []);

  const updateScore = useCallback((groupId: string, round: number, subRound: number, score: number) => {
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              scores: g.scores.map((roundScores, rIdx) =>
                rIdx === round
                  ? roundScores.map((sc, sIdx) => (sIdx === subRound ? score : sc))
                  : roundScores
              ),
            }
          : g
      ),
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({ groups: [], numRounds: 3, numSubRounds: [1, 1, 1], numWinners: 3, currentRound: 0, currentSubRound: 0, isSetup: false });
  }, []);

  const getTotalScore = useCallback((group: Group) => {
    return group.scores.reduce((total, roundScores) => total + roundScores.reduce((a, b) => a + b, 0), 0);
  }, []);

  const getLeaderboard = useCallback(() => {
    const sorted = [...state.groups]
      .map((g) => ({
        ...g,
        total: g.scores.reduce((total, roundScores) => total + roundScores.reduce((a, b) => a + b, 0), 0),
      }))
      .sort((a, b) => b.total - a.total);
    return sorted.map((g, i) => ({ ...g, rank: i + 1 }));
  }, [state.groups]);

  const getRoundLeaderboard = useCallback((round: number) => {
    const sorted = [...state.groups]
      .map((g) => ({
        ...g,
        roundScore: (g.scores[round] || []).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.roundScore - a.roundScore);
    return sorted.map((g, i) => ({ ...g, rank: i + 1 }));
  }, [state.groups]);

  const getSubRoundLeaderboard = useCallback((round: number, subRound: number) => {
    const sorted = [...state.groups]
      .map((g) => ({
        ...g,
        subRoundScore: g.scores[round]?.[subRound] || 0
      }))
      .sort((a, b) => b.subRoundScore - a.subRoundScore);
    return sorted.map((g, i) => ({ ...g, rank: i + 1 }));
  }, [state.groups]);

  return (
    <QuizContext.Provider
      value={{ ...state, setupQuiz, setCurrentRound, setCurrentSubRound, updateScore, resetQuiz, getTotalScore, getLeaderboard, getRoundLeaderboard, getSubRoundLeaderboard }}
    >
      {children}
    </QuizContext.Provider>
  );
};
