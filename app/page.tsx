"use client";

export default function HomePage() {
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
          height: "64px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #293239",
          background: "rgba(7, 11, 15, 0.9)",
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
          display: "grid",
          placeItems: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "min(900px, 100%)",
            minHeight: "500px",
            border: "1px solid #303940",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#10171c",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              minHeight: "420px",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: "30px",
              background:
                "radial-gradient(circle, #25343b 0%, #121b20 55%, #0c1216 100%)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "56px",
                  marginBottom: "16px",
                }}
              >
                ⚔️
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(30px, 6vw, 64px)",
                  color: "#f0d79c",
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
                Explore dangerous dungeons, defeat monsters, collect rare loot
                and extract before it is too late.
              </p>

              <button
                style={{
                  padding: "14px 28px",
                  border: "1px solid #d0a34d",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(180deg, #d6aa50 0%, #9b6d25 100%)",
                  color: "#171008",
                  fontWeight: 900,
                  fontSize: "16px",
                  boxShadow: "0 6px 24px rgba(211, 163, 71, 0.2)",
                }}
              >
                Play Game
              </button>
            </div>
          </div>

          <nav
            style={{
              minHeight: "78px",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              borderTop: "1px solid #303940",
              background: "#0c1216",
            }}
          >
            {[
              ["⚔️", "Dungeon"],
              ["🎒", "Inventory"],
              ["🏪", "Market"],
              ["🔨", "Craft"],
              ["👤", "Profile"],
            ].map(([icon, label]) => (
              <button
                key={label}
                style={{
                  border: "none",
                  borderRight: "1px solid #20282e",
                  background: "transparent",
                  color: label === "Dungeon" ? "#d9a84e" : "#7f8a91",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                <span style={{ fontSize: "20px" }}>{icon}</span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
