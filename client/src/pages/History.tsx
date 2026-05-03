// ============================================================
// History Page — session list + accuracy trend chart
// Card Table Modernist theme
// ============================================================

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllSessions,
  getCompletedSessionStats,
  deleteSession,
  type GameSession,
} from "@/lib/db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trash2, TrendingUp, Target, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const GAME_NAMES: Record<string, string> = {
  "point-counting": "Point Counting",
  "opening-bid": "Opening Bid",
};

export default function History() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState<{
    totalSessions: number;
    avgAccuracy: number;
    avgTime: number;
    bestAccuracy: number;
    recentTrend: { date: string; accuracy: number }[];
  } | null>(null);

  const loadData = async () => {
    const allSessions = await getAllSessions();
    setSessions(allSessions);

    if (filter !== "all") {
      const s = await getCompletedSessionStats(filter);
      setStats(s);
    } else {
      // Aggregate stats across all game types
      const gameTypes = Array.from(new Set(allSessions.map(s => s.gameType)));
      let totalSessions = 0;
      let totalAccuracy = 0;
      let totalTime = 0;
      let bestAccuracy = 0;
      const allTrend: { date: string; accuracy: number }[] = [];

      for (const gt of gameTypes) {
        const s = await getCompletedSessionStats(gt);
        totalSessions += s.totalSessions;
        totalAccuracy += s.avgAccuracy * s.totalSessions;
        totalTime += s.avgTime * s.totalSessions;
        bestAccuracy = Math.max(bestAccuracy, s.bestAccuracy);
        allTrend.push(...s.recentTrend);
      }

      setStats({
        totalSessions,
        avgAccuracy: totalSessions > 0 ? totalAccuracy / totalSessions : 0,
        avgTime: totalSessions > 0 ? totalTime / totalSessions : 0,
        bestAccuracy,
        recentTrend: allTrend
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-20),
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    loadData();
  };

  const filteredSessions =
    filter === "all" ? sessions : sessions.filter(s => s.gameType === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="point-counting">Point Counting</SelectItem>
            <SelectItem value="opening-bid">Opening Bid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats overview */}
      {stats && stats.totalSessions > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Trophy className="w-4 h-4" />}
            label="Sessions"
            value={String(stats.totalSessions)}
          />
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Avg Accuracy"
            value={`${Math.round(stats.avgAccuracy * 100)}%`}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Avg Time"
            value={`${(stats.avgTime / 1000).toFixed(1)}s`}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Best Accuracy"
            value={`${Math.round(stats.bestAccuracy * 100)}%`}
          />
        </div>
      )}

      {/* Trend chart */}
      {stats && stats.recentTrend.length > 1 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.recentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Accuracy"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--chart-1)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground font-serif">
              No sessions yet. Play some games to see your history!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <SessionRow session={session} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
        <p className="font-mono text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SessionRow({
  session,
  onDelete,
}: {
  session: GameSession;
  onDelete: (id: string) => void;
}) {
  const date = new Date(session.startedAt);
  const pct = Math.round(session.accuracy * 100);

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {GAME_NAMES[session.gameType] ?? session.gameType}
          </span>
          {!session.isComplete && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              Incomplete
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {date.toLocaleDateString()} at{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-sm font-semibold">
          {session.correctCount}/{session.totalHands}
        </p>
        <p className="text-xs text-muted-foreground">{pct}%</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-xs text-muted-foreground">
          {(session.averageTime / 1000).toFixed(1)}s avg
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive shrink-0"
        aria-label="Delete session"
        onClick={() => onDelete(session.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
