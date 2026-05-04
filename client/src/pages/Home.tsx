// ============================================================
// Home Page — game selection dashboard
// Card Table Modernist theme — clean, functional, inviting
// ============================================================

import { useLocation } from "wouter";
import { getAllGames } from "@/lib/gameRegistry";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HERO_IMAGE = "/manus-storage/hero-banner_bc20a37b.png";

// The game registry is static after module-load — hoist to module scope
// so we don't allocate a new array on every Home render.
const games = getAllGames();

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Bridge card table"
          width="1200"
          height="300"
          className="w-full h-40 sm:h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Bridge Trainer
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-serif max-w-md">
            Sharpen your bridge skills with focused practice sessions. Choose a
            game below to get started.
          </p>
        </div>
      </div>

      {/* Game grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.config.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                role="button"
                tabIndex={0}
                aria-label={`Play ${game.config.name}`}
                className="border-border/50 shadow-sm hover:shadow-md hover:border-primary/30
                           transition-all duration-200 cursor-pointer group
                           outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => navigate(`/game/${game.config.id}`)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/game/${game.config.id}`);
                  }
                }}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <img
                    src={game.config.icon}
                    alt={game.config.name}
                    loading="lazy"
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {game.config.name}
                      </h3>
                      <ArrowRight
                        className="w-4 h-4 text-muted-foreground group-hover:text-primary
                                             group-hover:translate-x-0.5 transition-all shrink-0"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground font-serif mt-1 line-clamp-2">
                      {game.config.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
