import React, { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "@/modules/AuthContext/AuthContext"; // Import AuthContext
import axiosInstance from "@/modules/axios/axios";

export default function PodiumDashboard({ title = "Competition" }) {
  const confettiContainer = useRef(null);
  const { user } = useContext(AuthContext); // Get authenticated user
  const [winners, setWinners] = useState([
    { position: 2, name: "Runner up", amount: 1500 },
    { position: 1, name: "Winner", amount: 3000 },
    { position: 3, name: "Third", amount: 800 },
  ]); // Default winners, will be updated based on API data

  useEffect(() => {
    const interval = setInterval(() => launchConfetti(confettiContainer.current, 10), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWinners = async () => {
      if (!user?._id) return; // Exit if no user is authenticated

      try {
        // Step 1: Fetch participants for the authenticated user
        const participantResponse = await axiosInstance.get("/participants", {
          withCredentials: true,
        });

        const participants = participantResponse.data.data.filter(
          (participant) => participant.user._id === user._id
        );

        if (participants.length === 0) {
          console.log("No participant data found for user");
          return;
        }

        // Step 2: Get the competition IDs from participants
        const competitionIds = participants.map((p) => p.competition._id);

        // Step 3: Fetch prizes for the competitions
        const prizeResponse = await axiosInstance.get("/prizes", {
          withCredentials: true,
        });

        const prizes = prizeResponse.data.filter((prize) =>
          competitionIds.includes(prize.competition._id)
        );

        // Step 4: Map prizes to podium positions
        const byPos = { 1: null, 2: null, 3: null };
        prizes.forEach((prize) => {
          const positionMap = {
            "1st": 1,
            "2nd": 2,
            "3rd": 3,
          };
          const position = positionMap[prize.rank];
          if (position && [1, 2, 3].includes(position)) {
            byPos[position] = {
              position,
              name: prize.competition.name, // Use competition name or participant user name
              amount: parseFloat(prize.amount), // Convert Decimal128 to number
            };
          }
        });

        // Update winners state
        const updatedWinners = Object.values(byPos).filter((w) => w !== null);
        if (updatedWinners.length > 0) {
          setWinners(updatedWinners);
        }
      } catch (error) {
        console.error("Error fetching winners:", error);
      }
    };

    fetchWinners();
  }, [user]); // Re-run when user changes

  function launchConfetti(container, count = 50) {
    if (!container) return;
    const colors = ["#FFD700", "#FF6B6B", "#6BCB77", "#4D96FF", "#C77DFF"];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece absolute w-2 h-4 opacity-90 rounded-sm transform-gpu";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = Math.random() * 100 + "%";
      el.style.top = -10 - Math.random() * 20 + "%";
      el.style.rotate = Math.random() * 360 + "deg";
      const duration = 3000 + Math.random() * 3000;
      el.style.transition = `transform ${duration}ms linear, top ${duration}ms linear, opacity ${duration}ms linear`;
      container.appendChild(el);

      requestAnimationFrame(() => {
        el.style.top = 110 + Math.random() * 30 + "%";
        el.style.transform = `translateY(${200 + Math.random() * 200}px) rotate(${Math.random() * 720}deg)`;
        el.style.opacity = "0";
      });

      setTimeout(() => container.removeChild(el), duration + 400);
    }
  }

  const byPos = { 1: null, 2: null, 3: null };
  winners.forEach((w) => {
    if (w.position && [1, 2, 3].includes(w.position)) byPos[w.position] = w;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-2 tracking-tight drop-shadow-sm">
          {title}
        </h2>
        <p className="text-center text-sm md:text-base text-slate-500 mb-10">🏆 Podium Winners 🏆</p>

        <div className="relative z-10 flex items-end justify-center gap-6 flex-wrap md:flex-nowrap">
          {/* 2nd Place */}
          <div className="flex flex-col items-center flex-1 min-w-[120px] transition-transform duration-300 hover:-translate-y-1">
            <div className="amount text-sm md:text-lg font-semibold mb-2 text-slate-600">
              ₹{byPos[2]?.amount ?? "-"}
            </div>
            <div
              className="relative w-full rounded-t-2xl flex items-end justify-center bg-gradient-to-t from-slate-400/90 to-slate-200/70 backdrop-blur-sm shadow-lg border border-white/20"
              style={{ height: "180px" }}
            ></div>
            <div className="name mt-3 text-sm md:text-base font-medium text-slate-700">
              {byPos[2]?.name ?? "—"}
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center flex-1 min-w-[150px] -mb-8 transition-transform duration-300 hover:-translate-y-1.5">
            <div className="amount text-base md:text-xl font-bold mb-2 text-amber-600">
              ₹{byPos[1]?.amount ?? "-"}
            </div>
            <div
              className="relative w-full rounded-t-3xl flex items-end justify-center bg-gradient-to-t from-amber-500/90 to-yellow-200/70 backdrop-blur-md shadow-xl border border-white/30"
              style={{ height: "260px" }}
            ></div>
            <div className="name mt-5 text-base md:text-lg font-semibold text-slate-800">
              {byPos[1]?.name ?? "—"}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center flex-1 min-w-[120px] transition-transform duration-300 hover:-translate-y-1">
            <div className="amount text-sm md:text-lg font-semibold mb-2 text-slate-600">
              ₹{byPos[3]?.amount ?? "-"}
            </div>
            <div
              className="relative w-full rounded-t-xl flex items-end justify-center bg-gradient-to-t from-orange-400/80 to-orange-200/70 backdrop-blur-sm shadow-lg border border-white/20"
              style={{ height: "140px" }}
            ></div>
            <div className="name mt-3 text-sm md:text-base font-medium text-slate-700">
              {byPos[3]?.name ?? "—"}
            </div>
          </div>
        </div>

        {/* Confetti container */}
        <div ref={confettiContainer} className="pointer-events-none absolute inset-0 overflow-hidden"></div>

        <div className="absolute left-0 right-0 bottom-0 h-10 bg-gradient-to-t from-slate-200 to-transparent rounded-b-3xl" />
      </div>

      <style jsx>{`
        .confetti-piece {
          will-change: transform, top, opacity;
        }
      `}</style>
    </div>
  );
}