const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // your db.json file
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Example custom admin route
server.post('/api-admin', (req, res) => {
  const { adminName, adminEmail } = req.body;
  if (!adminName || !adminEmail) {
    return res.status(400).json({ message: "adminName and adminEmail are required" });
  }
  res.status(201).json({
    access_token: "test-token-12345",
    token_type: "Bearer",
    expires_in: 3600
  });
});

// Example: PATCH /employments/:id/status
server.patch('/employments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const status = req.body.Status;
  if (!status) {
    return res.status(400).json({ message: "Status field is required" });
  }
  const db = router.db; // lowdb instance
  const employment = db.get('employments').find({ id }).value();

  if (!employment) {
    return res.status(404).json({ message: "Employment not found" });
  }

  db.get('employments').find({ id }).assign({ status }).write();
  res.status(204).end();
});

// Use default router for standard CRUD
server.use(router);

server.listen(3000, () => {
  console.log('Employment API running at http://localhost:3000');
});