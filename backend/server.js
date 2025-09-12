import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["https://daily-coding-challenge.vercel.app"], // ✅ removed trailing slash
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// MongoDB connection
mongoose.connect(
  "mongodb+srv://aaron21:Test12345@coding.jstvqhm.mongodb.net/coding?retryWrites=true&w=majority",
)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const ChallengeSchema = new mongoose.Schema({
  question: String,
  answer: String,
  options: [String],
  category: String,
  type: String,
  difficulty: String,
  date: String,
  createdBy: String,
});

const User = mongoose.model("User", UserSchema);
const Challenge = mongoose.model("Challenge", ChallengeSchema);

// Routes
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already exists" });
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "Invalid credentials" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/challenges", async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    console.error("Fetch challenges error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
