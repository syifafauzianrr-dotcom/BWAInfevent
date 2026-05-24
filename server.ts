import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Room, Option } from "./src/types";

// Helper to generate pastel colors
const colors = [
  '#F87171', '#FB923C', '#FBBF24', '#34D399', 
  '#60A5FA', '#818CF8', '#A78BFA', '#F472B6', 
  '#2DD4BF', '#A3E635'
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // In-memory data store for voting rooms
  const roomsStore = new Map<string, Room>();

  // Cleanup old rooms (older than 4 hours) to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [id, room] of roomsStore.entries()) {
      if (now - room.createdAt > 4 * 60 * 60 * 1000) {
        roomsStore.delete(id);
      }
    }
  }, 30 * 60 * 1000);

  // Generate unique room ID
  function generateRoomId(): string {
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; // No O/0 to avoid confusion
    let id = "";
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (roomsStore.has(id)) {
      return generateRoomId();
    }
    return id;
  }

  // --- API ENDPOINTS ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, roomsCount: roomsStore.size });
  });

  // Create a Room
  app.post("/api/rooms", (req, res) => {
    const { title, description, optionsText } = req.body;
    
    if (!title || !Array.isArray(optionsText) || optionsText.length === 0) {
      return res.status(400).json({ error: "Judul ruangan dan pilihan menu wajib diisi." });
    }

    const roomId = generateRoomId();
    
    // Construct Options
    const options: Option[] = optionsText.map((text: string, idx: number) => ({
      id: `opt-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      text: text.trim(),
      isEliminated: false,
      color: colors[idx % colors.length]
    }));

    const newRoom: Room = {
      id: roomId,
      title: title.trim(),
      description: (description || "").trim(),
      options,
      voters: {},
      isEnded: false,
      spinning: false,
      resultOptionId: null,
      vetoedOptionIds: [],
      createdAt: Date.now()
    };

    roomsStore.set(roomId, newRoom);
    res.json(newRoom);
  });

  // Get Room Details
  app.get("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: `Ruangan dengan ID ${id.toUpperCase()} tidak ditemukan.` });
    }

    res.json(room);
  });

  // Join Room as Voter
  app.post("/api/rooms/:id/join", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Nama partisipan tidak boleh kosong." });
    }

    const cleanName = name.trim();

    // If candidate isn't already in voters map, add them
    if (room.voters[cleanName] === undefined) {
      room.voters[cleanName] = null;
    }

    res.json(room);
  });

  // Vote for an option
  app.post("/api/rooms/:id/vote", (req, res) => {
    const { id } = req.params;
    const { name, optionId } = req.body; // optionId is null if unvoting
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    const cleanName = name?.trim();
    if (!cleanName || room.voters[cleanName] === undefined) {
      return res.status(400).json({ error: "Partisipan belum bergabung di ruangan." });
    }

    if (optionId !== null) {
      const optionExists = room.options.find(o => o.id === optionId && !o.isEliminated);
      if (!optionExists) {
        return res.status(400).json({ error: "Pilihan yang dipilih tidak ditemukan atau sudah veto." });
      }
    }

    // Assign vote
    room.voters[cleanName] = optionId;
    res.json(room);
  });

  // Add Option to Room (if anyone wants to suggest something)
  app.post("/api/rooms/:id/add-option", (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Pilihan tidak boleh kosong." });
    }

    const cleanText = text.trim();
    if (room.options.some(o => o.text.toLowerCase() === cleanText.toLowerCase())) {
      return res.status(400).json({ error: "Pilihan tersebut sudah ada." });
    }

    const idx = room.options.length;
    const newOpt: Option = {
      id: `opt-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      text: cleanText,
      isEliminated: false,
      color: colors[idx % colors.length]
    };

    room.options.push(newOpt);
    res.json(room);
  });

  // Delete Option from Room
  app.post("/api/rooms/:id/delete-option", (req, res) => {
    const { id } = req.params;
    const { optionId } = req.body;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    if (room.options.length <= 2) {
      return res.status(400).json({ error: "Minimal harus ada 2 pilihan sisa demi perdamaian batin!" });
    }

    const initialLen = room.options.length;
    room.options = room.options.filter(o => o.id !== optionId);

    if (room.options.length === initialLen) {
      return res.status(404).json({ error: "Pilihan tidak ditemukan." });
    }

    // Clean up votes for this deleted option
    for (const vName of Object.keys(room.voters)) {
      if (room.voters[vName] === optionId) {
        delete room.voters[vName];
      }
    }

    // Reset result if it was the deleted item
    if (room.resultOptionId === optionId) {
      room.resultOptionId = null;
      room.isEnded = false;
    }

    res.json(room);
  });

  // Veto & Elimination inside Group Vote
  app.post("/api/rooms/:id/veto", (req, res) => {
    const { id } = req.params;
    const { optionId } = req.body;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    const opt = room.options.find(o => o.id === optionId);
    if (!opt) {
      return res.status(404).json({ error: "Pilihan tidak ditemukan." });
    }

    opt.isEliminated = true;
    if (!room.vetoedOptionIds.includes(optionId)) {
      room.vetoedOptionIds.push(optionId);
    }

    // Clear any voters who voted for this eliminated item
    for (const voterName in room.voters) {
      if (room.voters[voterName] === optionId) {
        room.voters[voterName] = null;
      }
    }

    // Reset result if it was the vetoed item
    if (room.resultOptionId === optionId) {
      room.resultOptionId = null;
    }

    res.json(room);
  });

  // Set Spinning / Trigger Result
  app.post("/api/rooms/:id/spin", (req, res) => {
    const { id } = req.params;
    const { spinning, resultOptionId } = req.body;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    room.spinning = !!spinning;
    if (resultOptionId !== undefined) {
      room.resultOptionId = resultOptionId;
      if (resultOptionId !== null) {
        room.isEnded = true;
      }
    }

    res.json(room);
  });

  // Reset Room Voting State (allows re-spin, enables vetoed things or just clean slate)
  app.post("/api/rooms/:id/reset", (req, res) => {
    const { id } = req.params;
    const room = roomsStore.get(id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan." });
    }

    const { fullReset } = req.body; // if full reset: restore vetoes. If soft: keep options but reset winner/spin

    room.isEnded = false;
    room.spinning = false;
    room.resultOptionId = null;

    if (fullReset) {
      room.vetoedOptionIds = [];
      room.options.forEach(o => o.isEliminated = false);
      // Clear votes
      for (const voterName in room.voters) {
        room.voters[voterName] = null;
      }
    }

    res.json(room);
  });

  // Vite Integration for Serving Assets & SPA routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
