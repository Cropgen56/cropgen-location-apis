require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();
app.set("trust proxy", true);

const allowedOrigins = new Set([
  "https://admin.cropgenapp.com",
  "https://www.cropgenapp.com",
  "https://app.cropgenapp.com",
  "https://cropydeals.cropgenapp.com",
  "https://test.cropgenapp.com",
  "https://biodrops.cropgenapp.com",
  "https://location.cropgenapp.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://10.0.2.2:7070",
  "http://localhost:5176",
]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients or same-origin requests without Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy: origin not allowed."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  const configuredBaseUrl = (process.env.PUBLIC_BASE_URL || "").trim();
  const host = req.get("x-forwarded-host") || req.get("host");
  const proto = req.get("x-forwarded-proto") || req.protocol;
  const requestOrigin = `${proto}://${host}`;
  const origin = configuredBaseUrl || requestOrigin;
  const endpoints = [
    {
      method: "GET",
      path: "/health",
      description: "Service health and uptime check.",
      sample: `${origin}/health`,
    },
    {
      method: "GET",
      path: "/api/countries",
      description: "Returns all countries sorted by name.",
      sample: `${origin}/api/countries`,
    },
    {
      method: "GET",
      path: "/api/states/:countryCode",
      description: "Returns states for selected country code.",
      sample: `${origin}/api/states/IN`,
    },
    {
      method: "GET",
      path: "/api/cities?state=XX&q=text&limit=20",
      description: "Searches cities by state and text (case-insensitive).",
      sample: `${origin}/api/cities?state=MH&q=yavatmal`,
    },
    {
      method: "GET",
      path: "/api/cities/all?state=XX&page=1&limit=100",
      description: "Returns paginated city list for a state.",
      sample: `${origin}/api/cities/all?state=MH&page=1&limit=100`,
    },
  ];

  res.status(200).render("index", {
    serviceName: "Cropgen World Location APIs",
    endpoints,
    baseUrl: origin,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "geo-location-api",
    },
  });
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
