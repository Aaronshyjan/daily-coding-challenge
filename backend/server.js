import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: ["https://daily-coding-challenge.vercel.app/"], // replace with your real Vercel URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// MongoDB connection
mongoose.connect("mongodb+srv://aaron21:Test12345@coding.jstvqhm.mongodb.net/?retryWrites=true&w=majority&appName=coding", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.json({ success: false, message: "Email already exists" });
  const user = new User({ name, email, password, role });
  await user.save();
  res.json({ success: true, user });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.json({ success: false, message: "Invalid credentials" });
  res.json({ success: true, user });
});

app.get("/challenges", async (req, res) => {
  const challenges = await Challenge.find();
  res.json(challenges);
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
