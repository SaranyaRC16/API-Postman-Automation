// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // your db file
const middlewares = jsonServer.defaults();
const fs = require("fs");

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = router.db; // lowdb instance

function lookupByAltId(collection, altKey, altVal) {
  const val = isNaN(+altVal) ? altVal : +altVal;
  const item = db.get(collection).find({ [altKey]: val }).value();
  if (!item) return null;
  // json-server stores its own "id" for path operations
  const real = db.get(collection).find({ [altKey]: val }).value();
  return { item: real, realId: real.id };
}
// custom validation candidates Key param value not in acceptable list
server.use((req, res, next) => {
  if (req.method === "GET" && req.path === "/candidates") {
    const role = req.query.Role;
    const allowedRoles = ["Tester", "Developer", "Data Scientist"];

    if (role && !allowedRoles.includes(role)){
      return res.status(400).json({
        error: "Invalid Role",
        message: `Role '${role}' is not allowed. Accepted values: ${allowedRoles.join(", ")}`
      });
    }
  }
  next();
});

// custom validation Jobs Key param value not in acceptable list
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

// Authorization for Employments API
server.use((req, res, next) => {
  // Apply only for /employments API
  if (req.path.startsWith("/employments")) {
    const authHeader = req.headers["authorization"];

    // Check if Bearer token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization token is missing or invalid"
      });
    }

      }

  next(); // continue to the actual route
});


// Utility: generate random 16-character alphanumeric token
function generateAccessToken() {
  return [...Array(16)]
    .map(() => Math.random().toString(36)[2]) // random alphanumeric
    .join("")
    .toUpperCase(); // make it uppercase
}

// Register Admin API
server.post("/api-admin", (req, res) => {
  const { adminName, adminEmail } = req.body;

  if (!adminEmail) {
    return res.status(400).json({
      error: "Bad Request",
      message: "adminEmail is required"
    });
  }

  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const existingUser = db.admins?.find((a) => a.adminEmail === adminEmail);

  if (existingUser) {
    return res.status(409).json({
      error: "Conflict",
      message: "User already registered. Please try with different email id"
    });
  }

  const token = generateAccessToken();
  const newAdmin = {
    id: Date.now(),
    adminName,
    adminEmail,
    token
  };

  db.admins = db.admins || [];
  db.admins.push(newAdmin);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

  return res.status(201).json({
    message: "Admin registered successfully",
    accessToken: token
  });
});


// Middleware: Protect Employments APIs
server.use((req, res, next) => {
  if (req.path.startsWith("/employments")) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "token invalid"
      });
    }

    const token = authHeader.split(" ")[1];
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const validUser = db.admins?.find((a) => a.token === token);

    if (!validUser) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "token invalid"
      });
    }
  }
  next();
});

// ---------- Candidates (/candidates/:candidateId) ----------
server.get('/candidates/:candidateId', (req, res) => {
  const found = lookupByAltId('candidates', 'candidateId', req.params.candidateId);
  if (!found) return res.status(404).json({ message: 'Candidate not found' });
  res.json(found.item);
});

server.delete('/candidates/:candidateId', (req, res) => {
  const found = lookupByAltId('candidates', 'candidateId', req.params.candidateId);
  if (!found) return res.status(404).json({ message: 'Candidate not found' });
  db.get('candidates').remove({ id: found.realId }).write();
  res.status(204).end();
});

server.patch('/candidates/:candidateId', (req, res) => {
  const found = lookupByAltId('candidates', 'candidateId', req.params.candidateId);
  if (!found) return res.status(404).json({ message: 'Candidate not found' });
  const updated = db.get('candidates').find({ id: found.realId }).assign(req.body).write();
  res.status(200).json(updated);
});

server.put('/candidates/:candidateId', (req, res) => {
  const found = lookupByAltId('candidates', 'candidateId', req.params.candidateId);
  if (!found) return res.status(404).json({ message: 'Candidate not found' });
  const updated = db.get('candidates').find({ id: found.realId }).assign(req.body).write();
  res.status(200).json(updated);
});

// ---------- Jobs (/jobs/:jobId) ----------
server.get('/jobs/:jobId', (req, res) => {
  const found = lookupByAltId('jobs', 'JobId', req.params.jobId); // Note: key is "JobId" (capital J)
  if (!found) return res.status(404).json({ message: 'Job not found' });
  res.json(found.item);
});

server.delete('/jobs/:jobId', (req, res) => {
  const found = lookupByAltId('jobs', 'JobId', req.params.jobId);
  if (!found) return res.status(404).json({ message: 'Job not found' });
  db.get('jobs').remove({ id: found.realId }).write();
  res.status(204).end();
});

server.patch('/jobs/:jobId', (req, res) => {
  const found = lookupByAltId('jobs', 'JobId', req.params.jobId);
  if (!found) return res.status(404).json({ message: 'Job not found' });
  const updated = db.get('jobs').find({ id: found.realId }).assign(req.body).write();
  res.status(200).json(updated);
});

server.put('/jobs/:jobId', (req, res) => {
  const found = lookupByAltId('jobs', 'JobId', req.params.jobId);
  if (!found) return res.status(404).json({ message: 'Job not found' });
  const updated = db.get('jobs').find({ id: found.realId }).assign(req.body).write();
  res.status(200).json(updated);
});

// ---------- Employments (/employments/:employmentId) ----------
server.get('/employments/:employmentId', (req, res) => {
  const found = lookupByAltId('employments', 'employmentId', req.params.employmentId);
  if (!found) return res.status(404).json({ message: 'Employment not found' });
  res.json(found.item);
});

server.delete('/employments/:employmentId', (req, res) => {
  const found = lookupByAltId('employments', 'employmentId', req.params.employmentId);
  if (!found) return res.status(404).json({ message: 'Employment not found' });
  db.get('employments').remove({ id: found.realId }).write();
  res.status(204).end();
});

server.patch('/employments/:employmentId', (req, res) => {
  const found = lookupByAltId('employments', 'employmentId', req.params.employmentId);
  if (!found) return res.status(404).json({ message: 'Employment not found' });
  const updated = db.get('employments').find({ id: found.realId }).assign(req.body).write();
  res.status(200).json(updated);
});

server.put('/employments/:employmentId', (req, res) => {
  const found = lookupByAltId('employments', 'employmentId', req.params.employmentId);
  if (!found) return res.status(404).json({ message: 'Employment not found' });
  const updated = db.get('employments').find({ id: found.realId }).assign(req.body).write();
  res.status(200).json(updated);
});

// ---------- Default CRUD for collections ----------
server.use(router);

server.listen(3000, () => {
  console.log('Employment API running at http://localhost:3000');
});