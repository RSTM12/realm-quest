"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});

const navigation = [
  { icon: "⚔️", label: "Dungeon" },
  { icon: "🎒", label: "Inventory" },
  { icon: "🏪", label: "Market" },
  { icon: "🔨", label: "Craft" },
  { icon: "👤", label: "Profile" },
];

export default function HomePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("Dungeon");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top, #18262d 0%, #0b1116 48%, #070a0e 100%)",
      }}
    >
      <header
        style={{
          minHeight: "64px",
          padding: "10px 20px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #293239",
          background: "rgba(7, 11, 15, 0.95)",
        }}
      >
        <div>
          <div
            style={{
              color: "#d9a84e",
              fontWeight: 800,
              fontSize: "20px",
              letterSpacing: "1px",
            }}
          >
            REALM QUEST
          </div>

          <div
            style={{
              color: "#78838c",
              fontSize: "10px",
              letterSpacing: "2px",
            }}
          >
            EXTRACTION RPG
          </div>
        </div>

        <button
          style={{
            flexShrink: 0,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #3e4b54",
            background: "#161d23",
            color: "#f3ead2",
            fontWeight: 700,
          }}
        >
          Connect Wallet
        </button>
      </header>

      <section
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            width: "min(1200px, 100%)",
            overflow: "hidden",
            border: "1px solid #303940",
            borderRadius: "16px",
            background: "#10171c",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              minHeight: "300px",
              position: "relative",
              overflow: "hidden",
              background: "#0b1116",
            }}
          >
            {activeTab === "Dungeon" ? (
              gameStarted ? (
                <GameCanvas />
              ) : (
                <StartScreen
                  onPlay={() => {
                    setGameStarted(true);
                  }}
                />
              )
            ) : (
              <ComingSoonPage title={activeTab} />
            )}
          </div>

          <nav
            style={{
              minHeight: "76px",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              borderTop: "1px solid #303940",
              background: "#0c1216",
            }}
          >
            {navigation.map((item) => {
              const isActive = activeTab === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                  }}
                  style={{
                    minWidth: 0,
                    padding: "10px 4px",
                    border: "none",
                    borderRight: "1px solid #20282e",
                    background: isActive
                      ? "rgba(217, 168, 78, 0.08)"
                      : "transparent",
                    color: isActive ? "#d9a84e" : "#7f8a91",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    {item.icon}
                  </span>

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "clamp(8px, 2vw, 11px)",
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </section>
    </main>
  );
}

function StartScreen({
  onPlay,
}: {
  onPlay: () => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
        background:
          "radial-gradient(circle, #25343b 0%, #121b20 55%, #0c1216 100%)",
      }}
    >
      <div>
        <div
          style={{
            marginBottom: "12px",
            fontSize: "clamp(38px, 8vw, 64px)",
          }}
        >
          ⚔️
        </div>

        <h1
          style={{
            margin: 0,
            color: "#f0d79c",
            fontSize: "clamp(28px, 6vw, 64px)",
          }}
        >
          Enter The Dungeon
        </h1>

        <p
          style={{
            maxWidth: "520px",
            margin: "16px auto 28px",
            color: "#9aa6ad",
            lineHeight: 1.6,
          }}
        >
          Explore dangerous dungeons, defeat monsters, collect rare loot and
          extract before it is too late.
        </p>

        <button
          onClick={onPlay}
          style={{
            padding: "14px 32px",
            border: "1px solid #d0a34d",
            borderRadius: "8px",
            background:
              "linear-gradient(180deg, #d6aa50 0%, #9b6d25 100%)",
            color: "#171008",
            fontSize: "16px",
            fontWeight: 900,
            boxShadow: "0 6px 24px rgba(211, 163, 71, 0.2)",
          }}
        >
          Play Game
        </button>
      </div>
    </div>
  );
}

function ComingSoonPage({
  title,
}: {
  title: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            marginBottom: "12px",
            fontSize: "48px",
          }}
        >
          🛠️
        </div>

        <h2
          style={{
            margin: 0,
            color: "#f0d79c",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#7f8a91",
          }}
        >
          This feature is coming soon.
        </p>
      </div>
    </div>
  );
}
