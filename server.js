// server.js
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const fs = require("fs");

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = router.db; // lowdb instance

// ----------------- UTILITIES -----------------
function lookupByAltId(collection, altKey, altVal) {
  const val = isNaN(+altVal) ? altVal : +altVal;
  const item = db.get(collection).find({ [altKey]: val }).value();
  if (!item) return null;
  return { item, realId: item.id };
}

function generateAccessToken() {
  return [...Array(16)]
    .map(() => Math.random().toString(36)[2])
    .join("")
    .toUpperCase();
}

// ----------------- VALIDATION -----------------
server.use((req, res, next) => {
  if (req.method === "GET" && req.path === "/candidates") {
    const role = req.query.Role;
    const allowedRoles = ["Tester", "Developer", "Data Scientist"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid Role",
        message: `Role '${role}' is not allowed. Accepted values: ${allowedRoles.join(", ")}`
      });
    }
  }
  next();
});

server.use((req, res, next) => {
  if (req.method === "GET" && req.path === "/jobs") {
    const domain = req.query.Domain;
    const allowedDomain = ["Testing", "Development", "Data Scientist"];
    if (domain && !allowedDomain.includes(domain)) {
      return res.status(400).json({
        error: "Invalid Domain",
        message: `Domain '${domain}' is not allowed. Accepted values: ${allowedDomain.join(", ")}`
      });
    }
  }
  next();
});

// ----------------- AUTH MIDDLEWARE -----------------
server.use((req, res, next) => {
  if (req.path.startsWith("/employments")) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization token is missing or invalid"
      });
    }
    const token = authHeader.split(" ")[1];
    const dbFile = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const validUser = dbFile.admins?.find(a => a.token === token);
    if (!validUser) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    }
  }
  next();
});

// ----------------- CUSTOM ROUTES -----------------
// Admin Registration
server.post("/api-admin", (req, res) => {
  const { adminName, adminEmail } = req.body;
  if (!adminEmail) {
    return res.status(400).json({ error: "Bad Request", message: "adminEmail is required" });
  }

  const dbFile = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const existingUser = dbFile.admins?.find(a => a.adminEmail === adminEmail);
  if (existingUser) {
    return res.status(409).json({
      error: "Conflict",
      message: "User already registered. Try different email"
    });
  }

  const token = generateAccessToken();
  const timestamp = new Date().toISOString(); // ✅ create datetime in ISO format
  const newAdmin = { id: Date.now(), adminName, adminEmail, token, createdDate: timestamp };

  dbFile.admins = dbFile.admins || [];
  dbFile.admins.push(newAdmin);
  fs.writeFileSync("db.json", JSON.stringify(dbFile, null, 2));

  res.status(201).json({
    message: "Admin registered successfully",
    accessToken: token,
	createdDate: timestamp
  });
});

// Candidates by candidateId
server.get("/candidates/:candidateId", (req, res) => {
  const found = lookupByAltId("candidates", "candidateId", req.params.candidateId);
  if (!found) return res.status(404).json({ message: "Candidate not found" });
  res.json(found.item);
});

// Jobs by JobId
server.get("/jobs/:jobId", (req, res) => {
  const found = lookupByAltId("jobs", "JobId", req.params.jobId);
  if (!found) return res.status(404).json({ message: "Job not found" });
  res.json(found.item);
});

// Employments by employmentId
server.get("/employments/:employmentId", (req, res) => {
  const found = lookupByAltId("employments", "employmentId", req.params.employmentId);
  if (!found) return res.status(404).json({ message: "Employment not found" });
  res.json(found.item);
});

// Update employment by employmentId
server.patch("/employments/:employmentId", (req, res) => {
  const found = lookupByAltId("employments", "employmentId", req.params.employmentId);
  if (!found) return res.status(404).json({ message: "Employment not found" });

  const updated = db
    .get("employments")
    .find({ id: found.realId })
    .assign(req.body)
    .write();

  res.status(200).json(updated);
});

// Delete employment by employmentId
server.delete("/employments/:employmentId", (req, res) => {
  const found = lookupByAltId("employments", "employmentId", req.params.employmentId);
  if (!found) return res.status(404).json({ message: "Employment not found" });

  db.get("employments").remove({ id: found.realId }).write();
  res.status(204).end();
});

// ----------------- CANDIDATE ROUTES -----------------

// POST /candidate  -> add new candidate
server.post("/candidate", (req, res) => {
  const { candidateId, candidateName, Role, Company, available } = req.body;

  if (!candidateId || !candidateName || !Role) {
    return res.status(400).json({
      error: "Bad Request",
      message: "candidateId, candidateName and Role are required"
    });
  }

  // check if already exists
  const existing = db.get("candidates").find({ candidateId }).value();
  if (existing) {
    return res.status(409).json({
      error: "Conflict",
      message: `Candidate with candidateId ${candidateId} already exists`
    });
  }

  const newCandidate = {
  //  id: Date.now(),
    candidateId,
    candidateName,
    Role,
    Company: Company || null,
    available: available ?? true
  };

  db.get("candidates").push(newCandidate).write();
  res.status(201).json(newCandidate);
});

// DELETE /candidates/:candidateId -> delete candidate by candidateId
server.delete("/candidates/:candidateId", (req, res) => {
  const candidateId = +req.params.candidateId;

  const existing = db.get("candidates").find({ candidateId }).value();
  if (!existing) {
    return res.status(404).json({
      error: "Not Found",
      message: `Candidate with candidateId ${candidateId} not found`
    });
  }

  db.get("candidates").remove({ candidateId }).write();
  res.status(200).json({ message: `Candidate ${candidateId} deleted successfully` });
});

// ----------------- JOB ROUTES -----------------

// POST /job -> add new job
server.post("/job", (req, res) => {
  const { JobId, JobName, Domain, Company, available } = req.body;

  // Validate required fields
  if (!JobId || !JobName || !Domain) {
    return res.status(400).json({
      error: "Bad Request",
      message: "JobId, JobName, and Domain are required"
    });
  }

  // Check for existing job
  const existing = db.get("jobs").find({ JobId }).value();
  if (existing) {
    return res.status(409).json({
      error: "Conflict",
      message: `Job with JobId ${JobId} already exists`
    });
  }

  // Create new job object
  const newJob = {
   // id: Date.now(),
    JobId,
    JobName,
    Domain,
    Company: Company || null,
    available: available ?? false
  };

  // Save to database
  db.get("jobs").push(newJob).write();

  // Respond with created job
  res.status(201).json(newJob);
});

// DELETE /jobs/:jobId -> delete job by JobId
server.delete("/jobs/:jobId", (req, res) => {
  const jobId = +req.params.jobId;

  const existing = db.get("jobs").find({ JobId: jobId }).value();
  if (!existing) {
    return res.status(404).json({
      error: "Not Found",
      message: `Job with JobId ${jobId} not found`
    });
  }

  db.get("jobs").remove({ JobId: jobId }).write();
  res.status(200).json({ message: `Job ${jobId} deleted successfully` });
});

// ----------------- FALLBACK CRUD -----------------
server.use(router);

// ----------------- START -----------------
server.listen(3000, () => {
  console.log("✅ Employment API running at http://localhost:3000");
});