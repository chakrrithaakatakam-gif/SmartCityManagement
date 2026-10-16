require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const sqliteEngine = require('./sqlite-engine');

let oracleDb = null;
try {
  oracleDb = require('./db');
} catch (e) {
  console.warn('[server] Oracle driver module not loaded, using SQLite engine.');
}

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'urbanos-super-secure-smart-city-jwt-secret-key-2026-v1';
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173')
  .split(',')
  .map(x => x.trim());

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: '2mb' }));

let isOracleActive = false;
let oracleCheckDone = false;

async function checkOracle() {
  if (oracleCheckDone) return isOracleActive;
  oracleCheckDone = true;
  if (!oracleDb) {
    isOracleActive = false;
    return false;
  }
  try {
    await oracleDb.ping();
    isOracleActive = true;
    console.log('[server] Connected to Oracle Database successfully.');
  } catch (err) {
    isOracleActive = false;
    console.log(`[server] Oracle not reachable (${err.message}). Using local embedded SQLite engine.`);
  }
  return isOracleActive;
}

function apiError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function makeToken(user) {
  return jwt.sign({ sub: user.email, role: user.role, name: user.name }, JWT_SECRET, {
    expiresIn: '8h',
    issuer: 'urbanos-api'
  });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return apiError(res, 401, 'Sign in to continue.');
  try {
    req.user = jwt.verify(token, JWT_SECRET, { issuer: 'urbanos-api' });
    next();
  } catch {
    return apiError(res, 401, 'Session expired or invalid. Please sign in again.');
  }
}

function authority(req, res, next) {
  if (req.user.role !== 'authority' && req.user.role !== 'admin') {
    return apiError(res, 403, 'Municipal authority access required.');
  }
  next();
}

function clean(v, max = 2000) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// ---------------- HEALTH CHECK ENDPOINTS ----------------
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'UrbanOS Smart City API is operational',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health/db', async (_req, res) => {
  const oracleOk = await checkOracle();
  if (oracleOk) {
    try {
      const ping = await oracleDb.ping();
      return res.json({
        success: true,
        engine: 'oracle',
        message: 'Connected to Oracle Database',
        database: ping
      });
    } catch (e) {
      isOracleActive = false;
    }
  }

  try {
    await sqliteEngine.getDb();
    res.json({
      success: true,
      engine: 'sqlite',
      message: 'Connected to UrbanOS Relational Engine (SQLite)',
      database: {
        CURRENT_USER: 'URBANOS_ADMIN',
        SERVICE_NAME: 'EMBEDDED_RELATIONAL_ENGINE',
        DATABASE_TIME: new Date().toISOString()
      }
    });
  } catch (err) {
    apiError(res, 503, `Database initialization error: ${err.message}`);
  }
});

// ---------------- AUTHENTICATION ----------------
app.post('/api/auth/login', (req, res) => {
  const email = clean(req.body?.email, 255).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const citizenEmail = (process.env.DEMO_CITIZEN_EMAIL || 'citizen@demo.local').toLowerCase();
  const citizenPassword = process.env.DEMO_CITIZEN_PASSWORD || 'demo123';
  const authorityEmail = (process.env.DEMO_AUTHORITY_EMAIL || 'admin@demo.local').toLowerCase();
  const authorityPassword = process.env.DEMO_AUTHORITY_PASSWORD || 'demo123';

  let user;
  if (email === citizenEmail && password === citizenPassword) {
    user = { email, role: 'citizen', name: 'Demo Citizen' };
  } else if (email === authorityEmail && password === authorityPassword) {
    user = { email, role: 'authority', name: 'Municipal Commissioner' };
  } else if (email === 'officer.roads@demo.local' && password === 'demo123') {
    user = { email, role: 'authority', name: 'Eng. Vikram Seth' };
  } else {
    return apiError(res, 401, 'Invalid demo email or password. Use demo credentials.');
  }

  try {
    res.json({ success: true, token: makeToken(user), user });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    success: true,
    user: { email: req.user.sub, role: req.user.role, name: req.user.name }
  });
});

// ---------------- COMPLAINTS CRUD ----------------
app.get('/api/complaints', auth, async (req, res) => {
  try {
    const isAuth = req.user.role === 'authority' || req.user.role === 'admin';
    const filterEmail = isAuth ? null : req.user.sub;
    const rows = await sqliteEngine.listAllComplaints(filterEmail);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[get complaints]', e.message);
    apiError(res, 500, 'Could not retrieve complaints from database.');
  }
});

app.get('/api/complaints/:id', auth, async (req, res) => {
  const id = clean(req.params.id, 30);
  try {
    const rows = await sqliteEngine.listAllComplaints();
    const found = rows.find(c => c.id === id);
    if (!found) return apiError(res, 404, 'Complaint not found.');
    if (req.user.role === 'citizen' && found.email.toLowerCase() !== req.user.sub.toLowerCase()) {
      return apiError(res, 403, 'You may only view your own complaints.');
    }
    res.json({ success: true, data: found });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/complaints', auth, async (req, res) => {
  const b = req.body || {};
  const citizen = clean(b.citizen, 100) || req.user.name;
  const email = req.user.role === 'citizen' ? req.user.sub : clean(b.email, 255).toLowerCase();
  const category = clean(b.category, 100);
  const title = clean(b.title, 200);
  const description = clean(b.description, 2000);
  const area = clean(b.area, 100);
  const address = clean(b.address, 500);
  const landmark = clean(b.landmark, 200);
  const department = clean(b.department, 120);
  const priority = ['Low', 'Medium', 'High', 'Critical'].includes(b.priority) ? b.priority : 'Medium';
  const severity = ['Low', 'Medium', 'High', 'Critical'].includes(b.severity) ? b.severity : priority;
  const safetyRisk = Boolean(b.safetyRisk);
  const photoUrl = clean(b.photoUrl, 500);
  const isDraft = Boolean(b.isDraft);

  if (!isDraft && (!validEmail(email) || !citizen || !category || !title || !description || !area || !address || !department)) {
    return apiError(res, 400, 'Complete all required fields with a valid email.');
  }

  try {
    const id = await sqliteEngine.insertComplaint({
      citizen, email, phone: clean(b.phone, 25), category, title, description,
      area, address, landmark, latitude: b.latitude, longitude: b.longitude,
      photoUrl, severity, safetyRisk, department, priority,
      isDraft, by: req.user.name, role: req.user.role
    });
    res.status(201).json({ success: true, message: isDraft ? 'Draft saved successfully' : 'Complaint lodged successfully', id });
  } catch (e) {
    console.error('[create complaint]', e.message);
    apiError(res, 500, `Could not save complaint: ${e.message}`);
  }
});

app.put('/api/complaints/:id', auth, async (req, res) => {
  const id = clean(req.params.id, 30);
  const b = req.body || {};
  try {
    await sqliteEngine.updateComplaintRow(id, b, req.user.name, req.user.role);
    res.json({ success: true, message: 'Complaint updated successfully' });
  } catch (e) {
    console.error('[update complaint]', e.message);
    apiError(res, 500, `Could not update complaint: ${e.message}`);
  }
});

app.delete('/api/complaints/:id', auth, async (req, res) => {
  const id = clean(req.params.id, 30);
  try {
    // Citizens can delete unsubmitted drafts only
    const rows = await sqliteEngine.listAllComplaints();
    const found = rows.find(c => c.id === id);
    if (!found) return apiError(res, 404, 'Complaint not found.');
    if (req.user.role === 'citizen' && !found.isDraft) {
      return apiError(res, 403, 'Official complaints cannot be deleted. You may withdraw the complaint instead.');
    }
    const ok = await sqliteEngine.deleteComplaintRow(id);
    if (!ok) return apiError(res, 404, 'Complaint not found.');
    res.json({ success: true, message: 'Complaint deleted from database' });
  } catch (e) {
    console.error('[delete complaint]', e.message);
    apiError(res, 500, `Could not delete complaint: ${e.message}`);
  }
});

// ---------------- SERVICE REQUESTS ----------------
app.get('/api/services', auth, async (req, res) => {
  try {
    const filterEmail = req.user.role === 'citizen' ? req.user.sub : null;
    const items = await sqliteEngine.listAllServiceRequests(filterEmail);
    res.json({ success: true, data: items });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/services', auth, async (req, res) => {
  const b = req.body || {};
  try {
    const id = await sqliteEngine.insertServiceRequest({
      citizen_name: b.citizen_name || req.user.name,
      citizen_email: req.user.role === 'citizen' ? req.user.sub : b.citizen_email,
      phone: b.phone,
      service_type: b.service_type,
      address: b.address,
      locality: b.locality,
      landmark: b.landmark,
      preferred_date: b.preferred_date,
      time_slot: b.time_slot,
      notes: b.notes
    });
    res.status(201).json({ success: true, message: 'Service request booked successfully', id });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/services/:id', auth, async (req, res) => {
  const id = clean(req.params.id, 30);
  try {
    await sqliteEngine.updateServiceRequest(id, req.body || {}, req.user.name);
    res.json({ success: true, message: 'Service request updated' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- WORK ORDERS ----------------
app.get('/api/work-orders', auth, authority, async (_req, res) => {
  try {
    const orders = await sqliteEngine.listAllWorkOrders();
    res.json({ success: true, data: orders });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/work-orders', auth, authority, async (req, res) => {
  try {
    const id = await sqliteEngine.insertWorkOrder({
      ...req.body,
      assigned_by: req.user.name
    });
    res.status(201).json({ success: true, message: 'Work order created successfully', id });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/work-orders/:id', auth, authority, async (req, res) => {
  const id = clean(req.params.id, 30);
  try {
    await sqliteEngine.updateWorkOrder(id, req.body || {}, req.user.name);
    res.json({ success: true, message: 'Work order updated' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- DEPARTMENTS & STAFF ----------------
app.get('/api/departments', auth, async (_req, res) => {
  try {
    const result = await sqliteEngine.executeSql('SELECT * FROM city_departments ORDER BY name;');
    const cols = result.columns;
    const depts = result.rows.map(r => {
      const obj = {};
      cols.forEach((c, idx) => { obj[c] = r[idx]; });
      return obj;
    });
    res.json({ success: true, data: depts });
  } catch (e) {
    apiError(res, 500, 'Could not retrieve departments.');
  }
});

app.post('/api/departments', auth, authority, async (req, res) => {
  const b = req.body || {};
  try {
    await sqliteEngine.executeSql(`
      INSERT INTO city_departments (name, description, head_officer, contact_email, phone, sla_hours, status, categories_handled)
      VALUES ('${clean(b.name, 120)}', '${clean(b.description, 500)}', '${clean(b.head_officer, 100)}', '${clean(b.contact_email, 120)}', '${clean(b.phone, 30)}', ${Number(b.sla_hours) || 48}, '${b.status || 'Active'}', '${clean(b.categories_handled, 255)}');
    `);
    res.status(201).json({ success: true, message: 'Department created successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/departments/:id', auth, authority, async (req, res) => {
  const id = Number(req.params.id);
  const b = req.body || {};
  try {
    await sqliteEngine.executeSql(`
      UPDATE city_departments SET
        head_officer = COALESCE('${clean(b.head_officer, 100)}', head_officer),
        status = COALESCE('${b.status}', status),
        sla_hours = ${Number(b.sla_hours) || 48}
      WHERE department_id = ${id};
    `);
    res.json({ success: true, message: 'Department updated' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.get('/api/staff', auth, authority, async (_req, res) => {
  try {
    const list = await sqliteEngine.listStaff();
    res.json({ success: true, data: list });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/staff', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.insertStaff(req.body);
    res.status(201).json({ success: true, message: 'Staff registered successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.delete('/api/staff/:email', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.deleteStaff(req.params.email);
    res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- ASSETS & INFRASTRUCTURE ----------------
app.get('/api/assets', auth, async (_req, res) => {
  try {
    const assets = await sqliteEngine.listAssets();
    res.json({ success: true, data: assets });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/assets', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.insertAsset(req.body);
    res.status(201).json({ success: true, message: 'Asset registered successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/assets/:id', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.updateAsset(req.params.id, req.body);
    res.json({ success: true, message: 'Asset updated successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- PUBLIC ANNOUNCEMENTS ----------------
app.get('/api/announcements', auth, async (_req, res) => {
  try {
    const items = await sqliteEngine.listAnnouncements();
    res.json({ success: true, data: items });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/announcements', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.insertAnnouncement({
      ...req.body,
      author: req.user.name
    });
    res.status(201).json({ success: true, message: 'Announcement published successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- FEEDBACK & RATINGS ----------------
app.get('/api/feedback', auth, async (req, res) => {
  try {
    const items = await sqliteEngine.listAllFeedback();
    const filtered = req.user.role === 'citizen'
      ? items.filter(f => f.citizen_email?.toLowerCase() === req.user.sub.toLowerCase())
      : items;
    res.json({ success: true, data: filtered });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/feedback', auth, async (req, res) => {
  try {
    await sqliteEngine.insertFeedback({
      ...req.body,
      citizen_name: req.body.citizen_name || req.user.name,
      citizen_email: req.user.sub
    });
    res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/feedback/:id', auth, authority, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await sqliteEngine.updateFeedback(id, req.body || {});
    res.json({ success: true, message: 'Feedback review updated' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- BUDGET & EXPENDITURE ----------------
app.get('/api/budgets', auth, authority, async (_req, res) => {
  try {
    const budgets = await sqliteEngine.listBudgets();
    const expenditures = await sqliteEngine.listExpenditures();
    res.json({ success: true, data: { budgets, expenditures } });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/budgets', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.insertBudget({
      ...req.body,
      approved_by: req.user.name
    });
    res.status(201).json({ success: true, message: 'Budget allocated' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/expenditures', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.insertExpenditure({
      ...req.body,
      authorized_by: req.user.name
    });
    res.status(201).json({ success: true, message: 'Expenditure recorded against budget' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- NOTIFICATIONS ----------------
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const notes = await sqliteEngine.listNotifications(req.user.sub);
    res.json({ success: true, data: notes });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/notifications/:id/read', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await sqliteEngine.markNotificationRead(id);
    res.json({ success: true });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.delete('/api/notifications/clear', auth, async (req, res) => {
  try {
    await sqliteEngine.clearNotifications(req.user.sub);
    res.json({ success: true });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- USERS & ACCESS MANAGEMENT ----------------
app.get('/api/users', auth, authority, async (_req, res) => {
  try {
    const users = await sqliteEngine.listUsers();
    res.json({ success: true, data: users });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.post('/api/users', auth, authority, async (req, res) => {
  try {
    await sqliteEngine.insertUser(req.body);
    res.status(201).json({ success: true, message: 'User created' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/users/:id/status', auth, authority, async (req, res) => {
  const id = Number(req.params.id);
  const status = clean(req.body?.status, 30);
  try {
    await sqliteEngine.updateUserStatus(id, status);
    res.json({ success: true, message: 'User status updated' });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- AUDIT LOGS ----------------
app.get('/api/audit-logs', auth, authority, async (_req, res) => {
  try {
    const logs = await sqliteEngine.listAuditLogs();
    res.json({ success: true, data: logs });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- REPORTS & SUMMARY ----------------
app.get('/api/reports/summary', auth, authority, async (_req, res) => {
  try {
    const summary = await sqliteEngine.getStatsSummary();
    res.json({ success: true, data: summary });
  } catch (e) {
    apiError(res, 500, 'Could not load report summary.');
  }
});

// ---------------- SMART CITY DOMAIN ENDPOINTS ----------------
app.get('/api/city/overview', auth, async (_req, res) => {
  try {
    const [complaintsSum, utilitiesRes, trafficRes, emergencyRes, assetsRes] = await Promise.all([
      sqliteEngine.getStatsSummary(),
      sqliteEngine.executeSql('SELECT * FROM smart_utilities;'),
      sqliteEngine.executeSql('SELECT * FROM traffic_nodes;'),
      sqliteEngine.executeSql('SELECT * FROM emergency_units;'),
      sqliteEngine.executeSql('SELECT * FROM city_assets;')
    ]);

    res.json({
      success: true,
      data: {
        complaints: complaintsSum,
        utilitiesCount: utilitiesRes.rows.length,
        trafficNodesCount: trafficRes.rows.length,
        emergencyUnitsCount: emergencyRes.rows.length,
        assetsCount: assetsRes.rows.length,
        cityHealthScore: 94,
        powerGridStatus: 'Optimal',
        waterQualityIndex: '98% Potable',
        trafficCongestionAverage: '48%',
        emergencyReadiness: '100% Units Online'
      }
    });
  } catch (e) {
    apiError(res, 500, 'Could not load city overview data.');
  }
});

app.get('/api/city/utilities', auth, async (_req, res) => {
  try {
    const r = await sqliteEngine.executeSql('SELECT * FROM smart_utilities ORDER BY utility_id;');
    const cols = r.columns;
    const items = r.rows.map(row => {
      const o = {};
      cols.forEach((c, i) => o[c] = row[i]);
      return o;
    });
    res.json({ success: true, data: items });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/city/utilities/:id', auth, authority, async (req, res) => {
  const id = clean(req.params.id, 30);
  const status = clean(req.body?.status, 50);
  const load = Number(req.body?.current_load_pct);
  try {
    await sqliteEngine.executeSql(`
      UPDATE smart_utilities 
      SET status = '${status}', current_load_pct = ${isNaN(load) ? 50 : load}, last_ping = CURRENT_TIMESTAMP
      WHERE utility_id = '${id}';
    `);
    res.json({ success: true, message: `Utility ${id} updated` });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.get('/api/city/traffic', auth, async (_req, res) => {
  try {
    const r = await sqliteEngine.executeSql('SELECT * FROM traffic_nodes ORDER BY node_id;');
    const cols = r.columns;
    const items = r.rows.map(row => {
      const o = {};
      cols.forEach((c, i) => o[c] = row[i]);
      return o;
    });
    res.json({ success: true, data: items });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/city/traffic/:id', auth, authority, async (req, res) => {
  const id = clean(req.params.id, 30);
  const signalMode = clean(req.body?.signal_mode, 50);
  try {
    await sqliteEngine.executeSql(`
      UPDATE traffic_nodes 
      SET signal_mode = '${signalMode}', last_updated = CURRENT_TIMESTAMP
      WHERE node_id = '${id}';
    `);
    res.json({ success: true, message: `Traffic node ${id} signal updated to ${signalMode}` });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.get('/api/city/emergency', auth, async (_req, res) => {
  try {
    const r = await sqliteEngine.executeSql('SELECT * FROM emergency_units ORDER BY unit_id;');
    const cols = r.columns;
    const items = r.rows.map(row => {
      const o = {};
      cols.forEach((c, i) => o[c] = row[i]);
      return o;
    });
    res.json({ success: true, data: items });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

app.put('/api/city/emergency/:id/dispatch', auth, authority, async (req, res) => {
  const id = clean(req.params.id, 30);
  const status = clean(req.body?.status, 50) || 'Dispatched';
  try {
    await sqliteEngine.executeSql(`
      UPDATE emergency_units 
      SET status = '${status}', last_dispatched = CURRENT_TIMESTAMP
      WHERE unit_id = '${id}';
    `);
    res.json({ success: true, message: `Emergency unit ${id} updated to ${status}` });
  } catch (e) {
    apiError(res, 500, e.message);
  }
});

// ---------------- SQL WORKSPACE (DDL, DML, DQL ENGINE) ----------------
app.post(['/api/sql/execute', '/api/sql/query'], auth, async (req, res) => {
  const sql = typeof req.body?.sql === 'string' ? req.body.sql.trim() : '';
  if (!sql) return apiError(res, 400, 'Enter a SQL statement to execute.');

  const commandType = sqliteEngine.classifyCommand(sql);

  // Role-based SQL permissions: Citizens have read-only DQL access for civic transparency
  if (req.user.role === 'citizen') {
    if (commandType !== 'DQL') {
      return apiError(
        res,
        403,
        'Access Denied: Citizens have read-only DQL (SELECT) access for public civic transparency. DDL schema modifications and administrative DML updates require Municipal Authority credentials.'
      );
    }
  }

  // Safety checks
  if (/\b(SHUTDOWN|DROP\s+DATABASE)\b/i.test(sql)) {
    return apiError(res, 400, 'Database drop or server shutdown operations are prohibited.');
  }

  try {
    const result = await sqliteEngine.executeSql(sql);
    if (!result.success) {
      return apiError(res, 400, result.message);
    }
    res.json(result);
  } catch (err) {
    console.error('[sql execute]', err.message);
    apiError(res, 400, `Execution rejected: ${err.message}`);
  }
});

app.get('/api/sql/schema', auth, async (_req, res) => {
  try {
    const tables = await sqliteEngine.listSchema();
    res.json({ success: true, data: tables });
  } catch (err) {
    console.error('[sql schema]', err.message);
    apiError(res, 500, 'Could not retrieve database schema.');
  }
});

// Error handling & Server start
app.use((err, _req, res, _next) => {
  console.error('[request error]', err.message);
  if (!res.headersSent) apiError(res, 500, 'Server internal error.');
});

app.listen(PORT, async () => {
  console.log(`UrbanOS Smart City API listening at http://localhost:${PORT}`);
  await checkOracle();
});
