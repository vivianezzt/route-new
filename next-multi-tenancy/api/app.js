const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8000;
const SECRET_KEY = 'supersecretkey'; // Use uma variável de ambiente

// Middleware
app.use(express.json());
app.use(cors());

// Mock database
const tenants = [
  { id: 'company1', name: 'Company One' },
  { id: 'company2', name: 'Company Two' },
];

const users = [
  { id: 1, username: 'user1', password: 'password1', tenantId: 'company1' },
  { id: 2, username: 'user2', password: 'password2', tenantId: 'company2' },
  { id: 2, username: 'user3', password: 'password3', tenantId: 'company1' },
];

const projects = {
  company1: [{ id: 1, name: 'Project A' }],
  company2: [{ id: 2, name: 'Project B' }],
};

const tasks = {
  company1: [{ id: 1, title: 'Task 1', projectId: 1 }],
  company2: [{ id: 2, title: 'Task 2', projectId: 2 }],
};

// Middleware to verify JWT and extract tenant
function tenantMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.tenantId = decoded.tenantId;
    req.user = { id: decoded.sub, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Routes

// Login route to generate a JWT token
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create JWT token with tenant and user info
  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      tenantId: user.tenantId,
    },
    SECRET_KEY,
    { expiresIn: '1d' },
  );

  res.json({ token });
});

// Get all projects for the current tenant
app.get('/projects', tenantMiddleware, (req, res) => {
  const tenantProjects = projects[req.tenantId] || [];
  res.json(tenantProjects);
});

// Add a new project for the current tenant
app.post('/projects', tenantMiddleware, (req, res) => {
  const { name } = req.body;

  const newProject = {
    id: Date.now(),
    name,
  };

  projects[req.tenantId] = projects[req.tenantId] || [];
  projects[req.tenantId].push(newProject);

  res.status(201).json(newProject);
});

// Get tasks for a specific project in the current tenant
app.get('/projects/:projectId/tasks', tenantMiddleware, (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const tenantTasks = tasks[req.tenantId] || [];

  const projectTasks = tenantTasks.filter(
    (task) => task.projectId === projectId,
  );

  res.json(projectTasks);
});

// Add a new task to a project in the current tenant
app.post('/projects/:projectId/tasks', tenantMiddleware, (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const { title } = req.body;

  const newTask = {
    id: Date.now(),
    title,
    projectId,
  };

  tasks[req.tenantId] = tasks[req.tenantId] || [];
  tasks[req.tenantId].push(newTask);

  res.status(201).json(newTask);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
