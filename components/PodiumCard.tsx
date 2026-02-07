"use client";
import { motion } from "framer-motion";
import { useState, memo } from "react";

type PodiumPosition = 1 | 2 | 3;

interface PodiumUser {
  position: PodiumPosition;
  username: string;
  image?: string | null;
  totalDistance: string;
}

interface PodiumCardProps {
  thisMonth: PodiumUser[];
  lastMonth: PodiumUser[];
}

// Hoisted configuration objects (rendering-hoist-jsx)
const GRADIENT_COLORS: Record<PodiumPosition, string> = {
  1: "from-yellow-400 to-amber-500",
  2: "from-gray-300 to-gray-400",
  3: "from-orange-400 to-orange-600"
};

const PODIUM_HEIGHTS: Record<PodiumPosition, string> = {
  1: "h-32",
  2: "h-24",
  3: "h-20"
};

const PODIUM_LABELS: Record<PodiumPosition, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd"
};

const MEDAL_EMOJIS: Record<PodiumPosition, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉"
};

const BORDER_COLORS: Record<PodiumPosition, string> = {
  1: "border-yellow-400",
  2: "border-gray-400",
  3: "border-orange-400"
};

const HEIGHT_MAP: Record<string, string> = {
  "h-32": "8rem",
  "h-24": "6rem",
  "h-20": "5rem"
};

// Helper functions using hoisted config
function getGradientColors(position: PodiumPosition): string {
  return GRADIENT_COLORS[position];
}

function getPodiumHeightClass(position: PodiumPosition): string {
  return PODIUM_HEIGHTS[position];
}

function getPodiumLabel(position: PodiumPosition): string {
  return PODIUM_LABELS[position];
}

function getMedalEmoji(position: PodiumPosition): string {
  return MEDAL_EMOJIS[position];
}

function getBorderColor(position: PodiumPosition): string {
  return BORDER_COLORS[position];
}

function getTargetHeight(heightClass: string): string {
  return HEIGHT_MAP[heightClass] || "5rem";
}

// Memoized image component (rerender-memo)
const ImageWithFallback = memo(function ImageWithFallback({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string 
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc("/rarity-pony-cartoon.png")}
    />
  );
});

type TabType = 'thisMonth' | 'lastMonth';

export function PodiumCard({ thisMonth, lastMonth }: Readonly<PodiumCardProps>) {
  const [activeTab, setActiveTab] = useState<TabType>('thisMonth');
  
  const users = activeTab === 'thisMonth' ? thisMonth : lastMonth;
  
  // Sort users by position to ensure correct order: 2nd, 1st, 3rd
  const sortedUsers = [...users].sort((a, b) => {
    const order = { 2: 0, 1: 1, 3: 2 };
    return order[a.position] - order[b.position];
  });

  return (
    <div className="card-premium">
      <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
        🏆 Top Runners 🏆
      </h3>
      
      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('thisMonth')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'thisMonth'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
              : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setActiveTab('lastMonth')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'lastMonth'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
              : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
          }`}
        >
          Last Month
        </button>
      </div>
      
      <div className="relative flex justify-center items-end gap-4 pb-4">
        {/* Podium with Users */}
        <div className="relative z-10 flex items-end gap-2 sm:gap-4">
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user) => {
              const bgColor = getGradientColors(user.position);
              const heightClass = getPodiumHeightClass(user.position);
              const podiumLabel = getPodiumLabel(user.position);
              const emoji = getMedalEmoji(user.position);
              const borderColor = getBorderColor(user.position);

              return (
                <div 
                  key={`${activeTab}-${user.position}`} 
                  className="flex flex-col items-center"
                >
                  {/* Pony Avatar */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (user.position * 0.1), duration: 0.5 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 mb-2 shadow-lg ${borderColor} bg-white`}
                  >
                    <ImageWithFallback 
                      src={user.image || "/rarity-pony-cartoon.png"} 
                      alt={`Pony ${user.position}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Podium Block */}
                  <motion.div 
                    className={`
                      ${heightClass} w-20 sm:w-24 
                      bg-gradient-to-t ${bgColor} 
                      rounded-t-xl 
                      flex flex-col items-center justify-center
                      shadow-lg
                    `}
                    initial={{ height: 0 }}
                    whileInView={{ height: "var(--target-height)" }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.8, 
                      ease: "easeOut",
                      delay: 0.1 * user.position 
                    }}
                    style={{ "--target-height": getTargetHeight(heightClass) } as any}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-xl sm:text-2xl mb-1">{emoji}</span>
                      <span className="text-white font-bold text-lg leading-none">{podiumLabel}</span>
                      <span className="text-white/90 text-xs font-medium mt-1">{user.totalDistance}</span>
                    </motion.div>
                  </motion.div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-foreground/60">
              <p>No data available for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Bottom */}
      <div className="mt-4 flex justify-center">
        <div className="flex gap-2 items-center">
          <span className="text-2xl">🐴</span>
          <span className="text-sm text-foreground/60 font-medium">Rarity Runner Champions</span>
          <span className="text-2xl">🐴</span>
        </div>
      </div>
    </div>
  );
}
