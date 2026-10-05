import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";

const app = express();
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET in .env");
  process.exit(1);
}

app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(s => s.trim()) : true }));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." } });
app.use("/api/auth", limiter);
app.use("/api/contact", limiter);
app.use(express.json({ limit: "1mb" }));

function makeToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    country: user.country,
    createdAt: user.createdAt
  };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please sign in again."
    });
  }
}

function cleanString(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: "PathWise API is running.", database: "connected" });
  } catch {
    res.status(500).json({ success: false, message: "Database not reachable." });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const name = cleanString(req.body?.name, 100);
    const email = cleanString(req.body?.email, 160).toLowerCase();
    const country = ["NG", "GH", "XX"].includes(req.body?.country) ? req.body.country : null;
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, country }
    });

    const token = makeToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: publicUser(user)
      }
    });
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not create your account."
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = cleanString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email. Please create an account."
      });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again."
      });
    }

    const token = makeToken(user);

    return res.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        token,
        user: publicUser(user)
      }
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not sign you in."
    });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found."
      });
    }

    return res.json({
      success: true,
      data: { user: publicUser(user) }
    });
  } catch (error) {
    console.error("ME_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not load your account."
    });
  }
});

app.get("/api/assessments", requireAuth, async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { userId: req.userId },
      include: { career: true },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: {
        assessments: assessments.map(item => ({
          id: item.id,
          answers: JSON.parse(item.answersJson),
          result: item.resultJson ? JSON.parse(item.resultJson) : null,
          career: item.career,
          createdAt: item.createdAt
        }))
      }
    });
  } catch (error) {
    console.error("GET_ASSESSMENTS_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not load your assessment history."
    });
  }
});

app.post("/api/assessments", requireAuth, async (req, res) => {
  try {
    const answers = req.body?.answers;
    const result = req.body?.result ?? null;
    const careerId = cleanString(req.body?.careerId, 100) || null;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Assessment answers are required."
      });
    }

    if (careerId) {
      const careerExists = await prisma.career.findUnique({
        where: { id: careerId }
      });

      if (!careerExists) {
        return res.status(400).json({
          success: false,
          message: "The selected career could not be found."
        });
      }
    }

    const assessment = await prisma.assessment.create({
      data: {
        userId: req.userId,
        careerId,
        answersJson: JSON.stringify(answers),
        resultJson: result ? JSON.stringify(result) : null
      },
      include: { career: true }
    });

    return res.status(201).json({
      success: true,
      message: "Assessment saved.",
      data: {
        assessment: {
          id: assessment.id,
          answers,
          result,
          career: assessment.career,
          createdAt: assessment.createdAt
        }
      }
    });
  } catch (error) {
    console.error("SAVE_ASSESSMENT_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not save your assessment."
    });
  }
});

app.get("/api/careers", async (_req, res) => {
  try {
    const careers = await prisma.career.findMany({
      orderBy: { title: "asc" }
    });

    return res.json({
      success: true,
      data: { careers }
    });
  } catch (error) {
    console.error("CAREERS_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not load careers."
    });
  }
});

app.post("/api/careers/:careerId/save", requireAuth, async (req, res) => {
  try {
    const careerId = req.params.careerId;

    const career = await prisma.career.findUnique({
      where: { id: careerId }
    });

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Career not found."
      });
    }

    const saved = await prisma.savedCareer.upsert({
      where: {
        userId_careerId: {
          userId: req.userId,
          careerId
        }
      },
      update: {},
      create: {
        userId: req.userId,
        careerId
      },
      include: { career: true }
    });

    return res.status(201).json({
      success: true,
      data: { savedCareer: saved }
    });
  } catch (error) {
    console.error("SAVE_CAREER_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not save this career."
    });
  }
});

app.delete("/api/careers/:careerId/save", requireAuth, async (req, res) => {
  try {
    await prisma.savedCareer.deleteMany({
      where: { userId: req.userId, careerId: req.params.careerId }
    });
    return res.json({ success: true, data: {} });
  } catch (error) {
    console.error("UNSAVE_CAREER_ERROR", error);
    return res.status(500).json({ success: false, message: "Could not remove this career." });
  }
});

app.get("/api/me/saved-careers", requireAuth, async (req, res) => {
  try {
    const saved = await prisma.savedCareer.findMany({
      where: { userId: req.userId },
      include: { career: true },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: { careers: saved.map(item => item.career) }
    });
  } catch (error) {
    console.error("SAVED_CAREERS_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Could not load your saved careers."
    });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const name = cleanString(req.body?.name, 100);
    const email = cleanString(req.body?.email, 160);
    const message = cleanString(req.body?.message, 2000);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return res.status(400).json({ success: false, message: "Please fill in your name, a valid email and a message." });
    }
    await prisma.contactMessage.create({ data: { name, email, message } });
    return res.status(201).json({ success: true, message: "Message received." });
  } catch (error) {
    console.error("CONTACT_ERROR", error);
    return res.status(500).json({ success: false, message: "Could not send your message." });
  }
});

app.get("/api/admin/overview", async (req, res) => {
  if (!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Invalid admin key." });
  }
  try {
    const [users, assessments, saved, messages] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { assessments: true, savedCareers: true } } } }),
      prisma.assessment.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { name: true, email: true } } } }),
      prisma.savedCareer.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { name: true, email: true } }, career: { select: { title: true } } } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 })
    ]);
    res.json({ success: true, data: {
      users: users.map(u => ({ name: u.name, email: u.email, country: u.country, joined: u.createdAt, assessments: u._count.assessments, savedCareers: u._count.savedCareers })),
      assessments: assessments.map(a => ({ user: a.user.name, email: a.user.email, when: a.createdAt, result: a.resultJson ? JSON.parse(a.resultJson) : null })),
      saved: saved.map(s => ({ user: s.user.name, email: s.user.email, career: s.career.title, when: s.createdAt })),
      messages } });
  } catch (error) {
    console.error("ADMIN_ERROR", error);
    res.status(500).json({ success: false, message: "Could not load data." });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "PathWise API route not found."
  });
});

const server = app.listen(PORT, () => {
  console.log(`PathWise API is running on http://localhost:${PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
