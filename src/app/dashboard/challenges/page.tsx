"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PremiumGate } from "@/components/PremiumGate";
import { challengesApi, type Challenge, type LeaderboardEntry, type MyChallengeHistory } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Users,
  Target,
  Calendar,
  Medal,
  Crown,
  Flame,
  ArrowLeft,
  Loader2,
  Swords,
  CheckCircle2,
  History,
} from "lucide-react";

type ViewMode = "list" | "detail";

export default function ChallengesPage() {
  const { token, user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState("active");
  const [myHistoryTab, setMyHistoryTab] = useState<"browse" | "history">("browse");
  const [myHistory, setMyHistory] = useState<MyChallengeHistory[]>([]);
  const [myHistoryLoading, setMyHistoryLoading] = useState(false);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await challengesApi.getAll({ status: statusFilter, limit: 20 });
      setChallenges(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const loadMyHistory = useCallback(async () => {
    if (!token) return;
    setMyHistoryLoading(true);
    try {
      const res = await challengesApi.getMyHistory(token);
      setMyHistory(res.data);
    } catch { /* ignore */ }
    setMyHistoryLoading(false);
  }, [token]);

  useEffect(() => {
    if (myHistoryTab === "history") loadMyHistory();
  }, [myHistoryTab, loadMyHistory]);

  const openDetail = async (challenge: Challenge) => {
    setSelected(challenge);
    setView("detail");
    try {
      const res = await challengesApi.getLeaderboard(challenge._id);
      setLeaderboard(res.data);
    } catch {
      setLeaderboard([]);
    }
  };

  const handleJoin = async () => {
    if (!selected || !token) return;
    setJoining(true);
    try {
      const res = await challengesApi.join(selected._id, token);
      setSelected(res.data);
      const lb = await challengesApi.getLeaderboard(selected._id);
      setLeaderboard(lb.data);
    } catch {
      // ignore
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!selected || !token) return;
    try {
      await challengesApi.leave(selected._id, token);
      const res = await challengesApi.getById(selected._id);
      setSelected(res.data);
      const lb = await challengesApi.getLeaderboard(selected._id);
      setLeaderboard(lb.data);
    } catch {
      // ignore
    }
  };

  const isJoined = selected?.participants?.some((p) => p.user?._id === user?._id);

  const getDaysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Ended";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground">{rank}</span>;
  };

  if (view === "detail" && selected) {
    return (
      <PremiumGate feature="Challenges">
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setView("list")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Challenges
        </Button>

        {/* Challenge Info */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-xl">{selected.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">{selected.difficulty}</Badge>
                <Badge className="capitalize bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">{selected.category}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Target className="h-4 w-4" /> {selected.targetValue} {selected.targetUnit}</div>
              <div className="flex items-center gap-1"><Users className="h-4 w-4" /> {selected.participants?.length || 0} participants</div>
              <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {getDaysLeft(selected.endDate)}</div>
              <div className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" /> {selected.rewards?.xpPoints} XP</div>
            </div>
          </CardHeader>
          <CardContent>
            {!isJoined ? (
              <Button onClick={handleJoin} disabled={joining} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                {joining ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Swords className="h-4 w-4 mr-2" />}
                Join Challenge
              </Button>
            ) : (
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Joined</Badge>
                <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-500">Leave</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No participants yet. Be the first to join!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user?._id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      entry.user?._id === user?._id
                        ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-800"
                        : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    <div className="h-8 w-8 flex items-center justify-center shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{entry.user?.name}</p>
                        {entry.isCompleted && <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={entry.percentage} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{entry.percentage}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{entry.progress}/{selected.targetValue}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </PremiumGate>
    );
  }

  return (
    <PremiumGate feature="Challenges">
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fitness Challenges</h1>
          <p className="text-sm text-muted-foreground">Compete with others and push your limits</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(["browse", "history"] as const).map((t) => (
          <button key={t} onClick={() => setMyHistoryTab(t)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all ${
              myHistoryTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t === "browse" ? <Swords className="h-4 w-4" /> : <History className="h-4 w-4" />}
            {t === "browse" ? "Browse Challenges" : "My History"}
          </button>
        ))}
      </div>

      {myHistoryTab === "history" && (
        <div className="space-y-3">
          {myHistoryLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : myHistory.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border p-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No challenges joined yet</p>
              <p className="text-sm text-muted-foreground mt-1">Join a challenge to track your progress here.</p>
            </div>
          ) : (
            myHistory.map((c) => (
              <div key={c._id} className="bg-white dark:bg-card rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{c.title}</p>
                      {c.myIsCompleted
                        ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                        : <span className="text-xs text-muted-foreground">In Progress</span>}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{c.difficulty} · {c.category}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress: {c.myProgress} / {c.targetValue} {c.targetUnit}</span>
                        <span>{Math.min(100, Math.round((c.myProgress / c.targetValue) * 100))}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((c.myProgress / c.targetValue) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Joined {new Date(c.myJoinedAt).toLocaleDateString()}</p>
                    {c.myCompletedAt && <p className="text-xs text-green-600 mt-0.5">Done {new Date(c.myCompletedAt).toLocaleDateString()}</p>}
                    <p className="text-xs font-medium text-orange-600 mt-1">{c.rewards.xpPoints} XP</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {myHistoryTab === "browse" && (<>
      {/* Filters */}
      <div className="flex gap-2">
        {["active", "upcoming", "ended"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : challenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No {statusFilter} challenges</p>
            <p className="text-sm text-muted-foreground">Check back later for new challenges!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <Card
              key={challenge._id}
              className="cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              onClick={() => openDetail(challenge)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{challenge.description}</p>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0 ml-2">{challenge.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {challenge.targetValue} {challenge.targetUnit}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {challenge.participants?.length || 0} joined</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {getDaysLeft(challenge.endDate)}</span>
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> {challenge.rewards?.xpPoints} XP</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </>)}
    </div>
    </PremiumGate>
  );
}
