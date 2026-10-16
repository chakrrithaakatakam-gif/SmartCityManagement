const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = path.join(__dirname, 'urbanos.sqlite');
let dbInstance = null;
let sqlModule = null;

async function getSqlModule() {
  if (!sqlModule) {
    sqlModule = await initSqlJs();
  }
  return sqlModule;
}

function persistDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch (err) {
    console.warn('[sqlite-engine] Could not persist db to file:', err.message);
  }
}

async function getDb() {
  if (dbInstance) return dbInstance;
  const SQL = await getSqlModule();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      // Run schema migrations/checks in case new tables are added
      initializeSchema(dbInstance);
      persistDb();
      return dbInstance;
    } catch (err) {
      console.warn('[sqlite-engine] Could not load existing db, re-initializing:', err.message);
    }
  }

  dbInstance = new SQL.Database();
  initializeSchema(dbInstance);
  persistDb();
  return dbInstance;
}

function initializeSchema(db) {
  // 1. USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      status TEXT DEFAULT 'Active' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 2. CITIZEN_PROFILES
  db.run(`
    CREATE TABLE IF NOT EXISTS citizen_profiles (
      profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      locality TEXT,
      landmark TEXT,
      preferred_notifications TEXT DEFAULT 'email,sms' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 3. DEPARTMENTS
  db.run(`
    CREATE TABLE IF NOT EXISTS city_departments (
      department_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      head_officer TEXT,
      contact_email TEXT,
      phone TEXT,
      active_cases INTEGER DEFAULT 0,
      sla_hours INTEGER DEFAULT 48,
      status TEXT DEFAULT 'Active' NOT NULL,
      categories_handled TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 4. COMPLAINTS
  db.run(`
    CREATE TABLE IF NOT EXISTS city_complaints (
      complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_code TEXT NOT NULL UNIQUE,
      citizen_name TEXT NOT NULL,
      citizen_email TEXT NOT NULL,
      phone TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT,
      latitude REAL,
      longitude REAL,
      photo_url TEXT,
      severity TEXT DEFAULT 'Medium' NOT NULL,
      safety_risk INTEGER DEFAULT 0 NOT NULL,
      department TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium' NOT NULL,
      status TEXT DEFAULT 'Open' NOT NULL,
      assigned_to TEXT DEFAULT 'Unassigned',
      resolution TEXT,
      resolution_photo TEXT,
      expected_resolution_date TEXT,
      reopened_count INTEGER DEFAULT 0,
      reopen_reason TEXT,
      withdrawal_reason TEXT,
      is_draft INTEGER DEFAULT 0 NOT NULL,
      history_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 5. COMPLAINT_HISTORY
  db.run(`
    CREATE TABLE IF NOT EXISTS complaint_history (
      history_id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_ref TEXT NOT NULL,
      action TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      user_role TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 6. COMPLAINT_ATTACHMENTS
  db.run(`
    CREATE TABLE IF NOT EXISTS complaint_attachments (
      attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_ref TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size TEXT,
      file_type TEXT,
      uploaded_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 7. SERVICE_REQUESTS
  db.run(`
    CREATE TABLE IF NOT EXISTS service_requests (
      request_id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_code TEXT NOT NULL UNIQUE,
      citizen_name TEXT NOT NULL,
      citizen_email TEXT NOT NULL,
      phone TEXT,
      service_type TEXT NOT NULL,
      address TEXT NOT NULL,
      locality TEXT NOT NULL,
      landmark TEXT,
      preferred_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT DEFAULT 'Pending' NOT NULL,
      assigned_staff TEXT DEFAULT 'Unassigned',
      notes TEXT,
      completion_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 8. WORK_ORDERS
  db.run(`
    CREATE TABLE IF NOT EXISTS work_orders (
      work_order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      complaint_ref TEXT,
      service_request_ref TEXT,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      assigned_worker TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium' NOT NULL,
      planned_date TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'Assigned' NOT NULL,
      materials_used TEXT,
      labour_hours REAL DEFAULT 0,
      completion_notes TEXT,
      completion_photo TEXT,
      delay_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 9. STAFF
  db.run(`
    CREATE TABLE IF NOT EXISTS staff (
      staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active' NOT NULL,
      assigned_cases INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 10. ASSETS
  db.run(`
    CREATE TABLE IF NOT EXISTS city_assets (
      asset_id TEXT PRIMARY KEY,
      asset_name TEXT NOT NULL,
      category TEXT NOT NULL,
      zone TEXT NOT NULL,
      location_address TEXT NOT NULL,
      installation_date TEXT DEFAULT '2024-01-15',
      condition TEXT DEFAULT 'Good' NOT NULL,
      health_score INTEGER DEFAULT 95 NOT NULL,
      status TEXT DEFAULT 'Operational' NOT NULL,
      last_inspection TEXT DEFAULT '2026-09-15',
      failure_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 11. MAINTENANCE_RECORDS
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_records (
      maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id TEXT NOT NULL,
      work_order_ref TEXT,
      inspection_date TEXT DEFAULT CURRENT_TIMESTAMP,
      findings TEXT NOT NULL,
      actions_taken TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      cost REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 12. ANNOUNCEMENTS
  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      department TEXT NOT NULL,
      affected_area TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      status TEXT DEFAULT 'Published' NOT NULL,
      priority TEXT DEFAULT 'Normal' NOT NULL,
      author TEXT DEFAULT 'City Administration',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 13. FEEDBACK
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_type TEXT NOT NULL,
      reference_id TEXT NOT NULL,
      citizen_name TEXT NOT NULL,
      citizen_email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comments TEXT,
      is_fully_resolved INTEGER DEFAULT 1 NOT NULL,
      dissatisfaction_reason TEXT,
      official_response TEXT,
      escalated INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 14. BUDGETS
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
      financial_year TEXT NOT NULL,
      department TEXT NOT NULL,
      project_name TEXT NOT NULL,
      allocated_amount REAL NOT NULL,
      spent_amount REAL DEFAULT 0 NOT NULL,
      remaining_amount REAL NOT NULL,
      approved_by TEXT NOT NULL,
      status TEXT DEFAULT 'Approved' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 15. EXPENDITURES
  db.run(`
    CREATE TABLE IF NOT EXISTS expenditures (
      expenditure_id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_id INTEGER,
      work_order_ref TEXT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      department TEXT NOT NULL,
      authorized_by TEXT NOT NULL,
      invoice_ref TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 16. NOTIFICATIONS
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      recipient_role TEXT DEFAULT 'citizen' NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT DEFAULT 'General' NOT NULL,
      reference_id TEXT,
      is_read INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // 17. AUDIT_LOGS
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      role TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  // Operational telemetry modules
  db.run(`
    CREATE TABLE IF NOT EXISTS smart_utilities (
      utility_id TEXT PRIMARY KEY,
      utility_type TEXT NOT NULL,
      name TEXT NOT NULL,
      zone TEXT NOT NULL,
      status TEXT DEFAULT 'Optimal' NOT NULL,
      capacity_metric TEXT,
      current_load_pct INTEGER DEFAULT 50,
      auto_mode INTEGER DEFAULT 1,
      last_ping TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS traffic_nodes (
      node_id TEXT PRIMARY KEY,
      junction_name TEXT NOT NULL,
      zone TEXT NOT NULL,
      signal_mode TEXT DEFAULT 'Adaptive' NOT NULL,
      congestion_index INTEGER DEFAULT 40,
      vehicle_count_per_min INTEGER DEFAULT 60,
      status TEXT DEFAULT 'Normal' NOT NULL,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_units (
      unit_id TEXT PRIMARY KEY,
      unit_type TEXT NOT NULL,
      callsign TEXT NOT NULL,
      zone TEXT NOT NULL,
      status TEXT DEFAULT 'Available' NOT NULL,
      crew_count INTEGER DEFAULT 4,
      eta_minutes INTEGER DEFAULT 5,
      last_dispatched TEXT
    );
  `);

  // Core Database Views
  db.run(`
    CREATE VIEW IF NOT EXISTS complaints AS
    SELECT 
      complaint_id AS db_id,
      reference_code AS id,
      citizen_name AS citizen,
      citizen_email AS email,
      phone,
      category,
      title,
      description,
      area,
      address,
      landmark,
      latitude,
      longitude,
      photo_url,
      severity,
      safety_risk,
      department,
      priority,
      status,
      assigned_to AS assignedTo,
      resolution,
      resolution_photo,
      expected_resolution_date,
      reopened_count,
      reopen_reason,
      withdrawal_reason,
      is_draft,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM city_complaints;
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS unresolved_complaints_view AS
    SELECT reference_code, title, category, department, priority, status, created_at
    FROM city_complaints
    WHERE status NOT IN ('Resolved', 'Closed', 'Withdrawn', 'Draft');
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS department_performance_view AS
    SELECT 
      d.name AS department_name,
      d.head_officer,
      COUNT(c.complaint_id) AS total_complaints,
      SUM(CASE WHEN c.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS resolved_complaints,
      SUM(CASE WHEN c.status NOT IN ('Resolved', 'Closed', 'Withdrawn', 'Draft') THEN 1 ELSE 0 END) AS pending_complaints,
      d.sla_hours
    FROM city_departments d
    LEFT JOIN city_complaints c ON c.department = d.name
    GROUP BY d.department_id, d.name, d.head_officer, d.sla_hours;
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS budget_overview_view AS
    SELECT 
      b.financial_year,
      b.department,
      b.project_name,
      b.allocated_amount,
      b.spent_amount,
      b.remaining_amount,
      ROUND((b.spent_amount / b.allocated_amount) * 100, 1) AS utilization_pct
    FROM budgets b;
  `);

  // Seed any empty tables
  seedInitialData(db);
}

function tableCount(db, tbl) {
  try {
    const r = db.exec(`SELECT COUNT(*) FROM "${tbl}";`);
    return r.length && r[0].values.length ? r[0].values[0][0] : 0;
  } catch {
    return 0;
  }
}

function seedInitialData(db) {
  // 1. Users
  if (tableCount(db, 'users') === 0) {
    const users = [
      ['citizen@demo.local', 'demo123', 'citizen', 'Demo Citizen', '9876543210', null, 'Active'],
      ['admin@demo.local', 'demo123', 'authority', 'Municipal Commissioner', '9876543211', 'Executive Administration', 'Active'],
      ['officer.roads@demo.local', 'demo123', 'authority', 'Eng. Vikram Seth', '9876543212', 'Roads & Infrastructure', 'Active'],
      ['worker.raj@demo.local', 'demo123', 'staff', 'Rajesh Field Tech', '9876543213', 'Roads & Infrastructure', 'Active'],
      ['finance@demo.local', 'demo123', 'authority', 'Sunita Mehta (CFO)', '9876543214', 'Finance & Audit', 'Active']
    ];
    for (const u of users) {
      db.run(`INSERT OR IGNORE INTO users (email, password, role, name, phone, department, status) VALUES (?, ?, ?, ?, ?, ?, ?);`, u);
    }
  }

  // 2. Citizen Profiles
  if (tableCount(db, 'citizen_profiles') === 0) {
    db.run(`
      INSERT OR IGNORE INTO citizen_profiles (user_email, full_name, phone, address, locality, landmark, preferred_notifications)
      VALUES ('citizen@demo.local', 'Demo Citizen', '9876543210', 'Flat 402, Green Meadows Apartment, Lake View Road', 'North Zone', 'Opposite Lake View Garden', 'email,sms');
    `);
  }

  // 3. Departments
  if (tableCount(db, 'city_departments') === 0) {
    const depts = [
      ['Roads & Infrastructure', 'Road maintenance, potholes, resurfacing and bridges', 'Eng. Vikram Seth', 'roads@smartcity.gov', '020-25501001', 12, 48, 'Active', 'Roads, Potholes, Bridges, Footpaths'],
      ['Sanitation & Waste', 'Daily waste collection, recycling and street cleanliness', 'Officer Radha Nair', 'sanitation@smartcity.gov', '020-25501002', 8, 24, 'Active', 'Garbage collection, Street sweeping, Waste dumping'],
      ['Electrical & Streetlights', 'Grid power lines, transformers and smart streetlights', 'Eng. Manoj Kumar', 'electrical@smartcity.gov', '020-25501003', 5, 24, 'Active', 'Streetlights, Power failure, Hanging wires'],
      ['Water Supply & Quality', 'Potable water distribution, pipe repairs and pressure', 'Eng. Priya Sharma', 'water@smartcity.gov', '020-25501004', 14, 12, 'Active', 'Water supply, Leakage, Low pressure, Contamination'],
      ['Drainage & Sewerage', 'Storm water drainage, canals desilting and flood control', 'Eng. Rajesh Verma', 'drainage@smartcity.gov', '020-25501005', 4, 36, 'Active', 'Drainage blockage, Manhole overflow, Desilting'],
      ['Public Parks & Greenery', 'Municipal park maintenance, tree pruning and horticulture', 'Officer Anjali Patil', 'parks@smartcity.gov', '020-25501006', 3, 48, 'Active', 'Fallen trees, Park lighting, Grass maintenance'],
      ['Transport & Traffic', 'Public transit schedules and signal synchronization', 'Director S. Rao', 'transport@smartcity.gov', '020-25501007', 7, 24, 'Active', 'Traffic signals, Signboards, Bus stops'],
      ['Emergency & Safety', 'Fire rescue, medical disaster and hazardous incidents', 'Chief A. Deshmukh', 'emergency@smartcity.gov', '020-25501008', 2, 6, 'Active', 'Fire, Flood rescue, Structural collapse']
    ];
    for (const d of depts) {
      db.run(
        `INSERT OR IGNORE INTO city_departments (name, description, head_officer, contact_email, phone, active_cases, sla_hours, status, categories_handled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        d
      );
    }
  }

  // 4. Complaints
  const complaints = [
    [
      'CMP-2026-1001', 'Demo Citizen', 'citizen@demo.local', '9876543210',
      'Roads', 'Large pothole near municipal school gate',
      'A deep pothole has formed near the municipal school entrance and vehicles are swerving dangerously into pedestrian walkway.',
      'Central Zone', 'MG Road, near Municipal School Entrance', 'Opposite Gate 2', 18.5204, 73.8567,
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      'High', 1, 'Roads & Infrastructure', 'High', 'Open', 'Unassigned', null, null, '2026-10-18', 0, null, null, 0,
      JSON.stringify([{ action: 'Complaint registered', by: 'Citizen (Demo Citizen)', at: '2026-10-08T08:30:00.000Z' }]),
      '2026-10-08 08:30:00', '2026-10-08 08:30:00'
    ],
    [
      'CMP-2026-1002', 'Demo Citizen', 'citizen@demo.local', '9876543210',
      'Garbage', 'Missed waste collection on Sector 4 Lake View',
      'Municipal garbage collection vehicle has missed Sector 4 for three days consecutively. Community bins are overflowing.',
      'North Zone', 'Lake View Street, Block B, Sector 4', 'Near Community Park', 18.5310, 73.8440,
      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      'Medium', 0, 'Sanitation & Waste', 'Medium', 'In Progress', 'Sanitation Rapid Crew 2', null, null, '2026-10-15', 0, null, null, 0,
      JSON.stringify([
        { action: 'Complaint registered', by: 'Citizen (Demo Citizen)', at: '2026-10-07T07:15:00.000Z' },
        { action: 'Verified & assigned to Sanitation Rapid Crew 2', by: 'Municipal Authority', at: '2026-10-07T09:00:00.000Z' },
        { action: 'Work order WO-2026-04 created', by: 'Municipal Authority', at: '2026-10-07T09:10:00.000Z' }
      ]),
      '2026-10-07 07:15:00', '2026-10-07 09:10:00'
    ],
    [
      'CMP-2026-1003', 'Demo Citizen', 'citizen@demo.local', '9876543210',
      'Streetlights', 'Streetlight pole SL-18 completely dead at night',
      'Sodium vapor streetlight flickering and shut down completely, creating an unsafe pitch-dark corridor on Temple Road.',
      'South Zone', 'Temple Road, Pole SL-18', 'Near Shiva Mandir', 18.5020, 73.8610,
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      'Medium', 1, 'Electrical & Streetlights', 'Medium', 'Resolved', 'Electrical Tech Team 1',
      'Old high-pressure sodium bulb replaced with energy-efficient 60W IP66 LED luminaire. Circuit breaker re-tested and fully operational.',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      '2026-10-06', 0, null, null, 0,
      JSON.stringify([
        { action: 'Complaint registered', by: 'Citizen (Demo Citizen)', at: '2026-10-05T15:40:00.000Z' },
        { action: 'Assigned to Electrical Tech Team 1', by: 'Municipal Authority', at: '2026-10-05T16:20:00.000Z' },
        { action: 'Field repairs completed. Replaced fixture with 60W LED luminaire.', by: 'Eng. Manoj Kumar', at: '2026-10-06T11:00:00.000Z' },
        { action: 'Marked resolved with post-repair photographic evidence.', by: 'Municipal Authority', at: '2026-10-06T11:05:00.000Z' }
      ]),
      '2026-10-05 15:40:00', '2026-10-06 11:05:00'
    ],
    [
      'CMP-2026-1004', 'Ananya Das', 'ananya@example.test', '9000000004',
      'Water', 'Major 8-inch water distribution line rupture flooding roadway',
      'Main distribution line valve blown out during morning pressure cycle, high volume clean potable water flooding into commercial market shops.',
      'Central Zone', 'Market Street, Ward 4 Commercial Hub', 'Near Old Clock Tower', 18.5190, 73.8550,
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      'Critical', 1, 'Water Supply & Quality', 'Critical', 'Assigned', 'Rapid Water Emergency Squad', null, null, '2026-10-10', 0, null, null, 0,
      JSON.stringify([
        { action: 'Complaint registered', by: 'Citizen (Ananya Das)', at: '2026-10-09T06:10:00.000Z' },
        { action: 'Priority escalated to Critical due to public property flooding', by: 'Municipal Authority', at: '2026-10-09T06:20:00.000Z' },
        { action: 'Assigned to Rapid Water Emergency Squad', by: 'Municipal Authority', at: '2026-10-09T06:45:00.000Z' }
      ]),
      '2026-10-09 06:10:00', '2026-10-09 06:45:00'
    ]
  ];

  for (const c of complaints) {
    db.run(
      `INSERT OR IGNORE INTO city_complaints 
       (reference_code, citizen_name, citizen_email, phone, category, title, description, area, address, landmark, latitude, longitude, photo_url, severity, safety_risk, department, priority, status, assigned_to, resolution, resolution_photo, expected_resolution_date, reopened_count, reopen_reason, withdrawal_reason, is_draft, history_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      c
    );
  }

  // 5. Service Requests
  if (tableCount(db, 'service_requests') === 0) {
    const serviceRequests = [
      [
        'SR-2026-001', 'Demo Citizen', 'citizen@demo.local', '9876543210',
        'Bulk Waste Collection', 'Flat 402, Green Meadows Apartment, Lake View Road', 'North Zone', 'Opposite Lake View Garden',
        '2026-10-20', 'Morning (08:00 - 12:00)', 'Scheduled', 'Sanitation Truck #14', 'Furniture renovation scrap and broken wooden wardrobes.', null,
        '2026-10-12 10:00:00', '2026-10-12 11:30:00'
      ],
      [
        'SR-2026-002', 'Demo Citizen', 'citizen@demo.local', '9876543210',
        'Water Tanker Delivery', 'Green Meadows Housing Society, Sector 4', 'North Zone', 'Main Gate Overhead Tank',
        '2026-10-16', 'Afternoon (12:00 - 16:00)', 'Pending', 'Unassigned', '10,000 Liters requested due to scheduled pipeline pressure drop.', null,
        '2026-10-14 09:15:00', '2026-10-14 09:15:00'
      ],
      [
        'SR-2026-003', 'Rohan Kulkarni', 'rohan@example.test', '9822012345',
        'Tree Pruning & Park Care', '12 Sunshine Enclave, Riverside Avenue', 'South Zone', 'Near Riverside Jogging Track',
        '2026-10-18', 'Morning (08:00 - 12:00)', 'Approved', 'Parks Horticulture Team B', 'Overhanging Gulmohar tree branches brushing against domestic power line.', null,
        '2026-10-11 14:00:00', '2026-10-12 09:00:00'
      ]
    ];
    for (const s of serviceRequests) {
      db.run(
        `INSERT OR IGNORE INTO service_requests (reference_code, citizen_name, citizen_email, phone, service_type, address, locality, landmark, preferred_date, time_slot, status, assigned_staff, notes, completion_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        s
      );
    }
  }

  // 6. Work Orders
  if (tableCount(db, 'work_orders') === 0) {
    const workOrders = [
      [
        'WO-2026-01', 'CMP-2026-1003', null, 'Emergency Luminaire Replacement on Pole SL-18', 'Electrical & Streetlights',
        'Electrical Tech Team 1', 'Medium', '2026-10-06', '2026-10-06', 'Completed',
        '1x 60W IP66 LED Fixture, 15m Copper Cable 2.5mm, 1x MCB 10A', 3.5,
        'Replaced blown fixture and replaced rusted mounting clamp. Checked light output 6000 lumens.',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
        null, '2026-10-05 16:20:00', '2026-10-06 11:00:00'
      ],
      [
        'WO-2026-02', 'CMP-2026-1004', null, 'Excavation & Pipeline Patching on Market Street', 'Water Supply & Quality',
        'Rapid Water Emergency Squad', 'Critical', '2026-10-09', '2026-10-10', 'In Progress',
        '1x 8-inch Cast Iron Pipe Sleeve, Heavy Duty Rubber Gaskets, 2 Tons Gravel Bedding', 6.0,
        'Excavation complete. Isolating valve 4B and installing compression clamp.', null, null,
        '2026-10-09 06:45:00', '2026-10-09 10:15:00'
      ],
      [
        'WO-2026-03', 'CMP-2026-1001', null, 'Cold Asphalt Pothole Restoration at School Gate', 'Roads & Infrastructure',
        'Rajesh Field Tech', 'High', '2026-10-16', '2026-10-17', 'Assigned',
        '6 Bags Cold Mix Bitumen, Road Roller Compactor Rental, Barricade Cones', 0,
        'Scheduled for Saturday morning to minimize disruption to school traffic.', null, null,
        '2026-10-10 11:00:00', '2026-10-10 11:00:00'
      ]
    ];
    for (const w of workOrders) {
      db.run(
        `INSERT OR IGNORE INTO work_orders (order_code, complaint_ref, service_request_ref, title, department, assigned_worker, priority, planned_date, deadline, status, materials_used, labour_hours, completion_notes, completion_photo, delay_reason, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        w
      );
    }
  }

  // 7. Staff
  if (tableCount(db, 'staff') === 0) {
    const staffMembers = [
      ['Eng. Vikram Seth', 'vikram.seth@smartcity.gov', '9810101001', 'Roads & Infrastructure', 'Department Officer', 'Active', 4],
      ['Rajesh Field Tech', 'rajesh.tech@smartcity.gov', '9810101002', 'Roads & Infrastructure', 'Field Worker', 'Active', 2],
      ['Officer Radha Nair', 'radha.nair@smartcity.gov', '9810101003', 'Sanitation & Waste', 'Department Officer', 'Active', 3],
      ['Eng. Manoj Kumar', 'manoj.kumar@smartcity.gov', '9810101004', 'Electrical & Streetlights', 'Department Officer', 'Active', 2],
      ['Eng. Priya Sharma', 'priya.sharma@smartcity.gov', '9810101005', 'Water Supply & Quality', 'Department Officer', 'Active', 5],
      ['Chief A. Deshmukh', 'deshmukh@smartcity.gov', '9810101006', 'Emergency & Safety', 'Administrator', 'Active', 1],
      ['Sunita Mehta (CFO)', 'sunita.mehta@smartcity.gov', '9810101007', 'Finance & Audit', 'Finance Officer', 'Active', 0]
    ];
    for (const sm of staffMembers) {
      db.run(
        `INSERT OR IGNORE INTO staff (name, email, phone, department, role, status, assigned_cases) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        sm
      );
    }
  }

  // 8. Public Announcements
  if (tableCount(db, 'announcements') === 0) {
    const announcements = [
      [
        'Planned 12-Hour Water Supply Shutdown in Central Ward', 'Water Shutdown', 'Water Supply & Quality',
        'Central Zone (Wards 3, 4, and 7)', 'Major maintenance and valve upgrade on 400mm feeder line at Reservoir 3. Water supply will be suspended from 08:00 to 20:00 on Sunday.',
        '2026-10-18', '2026-10-19', 'Published', 'Urgent', 'Chief Hydraulic Engineer'
      ],
      [
        'MG Road Flyover Resurfacing & Night Lane Closure', 'Road Closure', 'Roads & Infrastructure',
        'MG Road Elevated Flyover Corridor', 'Night-time milling and asphalt resurfacing. One lane open between 23:00 and 05:30. Motorists advised to use Old Bypass Road.',
        '2026-10-16', '2026-10-22', 'Published', 'High', 'Municipal Road Works Bureau'
      ],
      [
        'Annual Monsoon Stormwater Drainage Cleaning Drive', 'Sanitation Drive', 'Drainage & Sewerage',
        'All City Zones (North, Central, South)', 'Citizens are requested not to dump construction debris in open drainage gutters. Dedicated desilting squads operating around the clock.',
        '2026-10-01', '2026-10-31', 'Published', 'Normal', 'Director of Municipal Sanitation'
      ]
    ];
    for (const an of announcements) {
      db.run(
        `INSERT OR IGNORE INTO announcements (title, category, department, affected_area, description, start_date, expiry_date, status, priority, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        an
      );
    }
  }

  // 9. Feedback
  if (tableCount(db, 'feedback') === 0) {
    const feedbackList = [
      [
        'Complaint', 'CMP-2026-1003', 'Demo Citizen', 'citizen@demo.local', 5,
        'The electrical team replaced the streetlight bulb within 24 hours of lodging the complaint. The street is bright and safe again. Excellent prompt service!',
        1, null, 'Thank you for your civic feedback. We are glad our team could restore safety quickly.', 0
      ],
      [
        'Complaint', 'CMP-2026-1002', 'Demo Citizen', 'citizen@demo.local', 3,
        'Work was in progress, but waste was spilled near the pavement during loading.',
        0, 'Spilled waste was left on pavement', 'Acknowledged. Team 2 instructed to perform secondary cleanup sweep.', 0
      ]
    ];
    for (const fb of feedbackList) {
      db.run(
        `INSERT OR IGNORE INTO feedback (reference_type, reference_id, citizen_name, citizen_email, rating, comments, is_fully_resolved, dissatisfaction_reason, official_response, escalated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        fb
      );
    }
  }

  // 10. Budgets
  if (tableCount(db, 'budgets') === 0) {
    const budgets = [
      ['FY 2026-27', 'Roads & Infrastructure', 'City Pothole Patching & Road Safety Resurfacing', 1500000, 480000, 1020000, 'Standing Finance Committee', 'Approved'],
      ['FY 2026-27', 'Water Supply & Quality', 'Distribution Feeder Valve & Rupture Replacements', 1800000, 720000, 1080000, 'Municipal Commissioner', 'Approved'],
      ['FY 2026-27', 'Electrical & Streetlights', 'Smart LED Streetlight Transition Phase 3', 950000, 310000, 640000, 'Standing Finance Committee', 'Approved'],
      ['FY 2026-27', 'Sanitation & Waste', 'Mechanized Sweeper Fleet & Bin Deployment', 1200000, 550000, 650000, 'Municipal Commissioner', 'Approved'],
      ['FY 2026-27', 'Drainage & Sewerage', 'Pre-Monsoon Stormwater Canal Desilting', 800000, 240000, 560000, 'Standing Finance Committee', 'Approved']
    ];
    for (const bg of budgets) {
      db.run(
        `INSERT OR IGNORE INTO budgets (financial_year, department, project_name, allocated_amount, spent_amount, remaining_amount, approved_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        bg
      );
    }
  }

  // 11. Expenditures
  if (tableCount(db, 'expenditures') === 0) {
    const expenditures = [
      [1, 'WO-2026-03', 'Bituminous cold asphalt bags and compactor charges for Ward 2', 45000, 'Roads & Infrastructure', 'Eng. Vikram Seth', 'INV-RDS-8821'],
      [2, 'WO-2026-02', 'Cast iron ductile sleeve and high-pressure gaskets for Market St pipeline', 82000, 'Water Supply & Quality', 'Eng. Priya Sharma', 'INV-WTR-3904'],
      [3, 'WO-2026-01', '60W IP66 LED streetlight fixture luminaire replacement and cables', 12500, 'Electrical & Streetlights', 'Eng. Manoj Kumar', 'INV-ELE-1049']
    ];
    for (const ex of expenditures) {
      db.run(
        `INSERT OR IGNORE INTO expenditures (budget_id, work_order_ref, description, amount, department, authorized_by, invoice_ref) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        ex
      );
    }
  }

  // 12. Notifications
  if (tableCount(db, 'notifications') === 0) {
    const notifications = [
      ['citizen@demo.local', 'citizen', 'Complaint Status Update', 'Your complaint CMP-2026-1002 has been verified and assigned to Sanitation Rapid Crew 2.', 'Complaint', 'CMP-2026-1002', 0],
      ['citizen@demo.local', 'citizen', 'Complaint Resolved', 'Complaint CMP-2026-1003 has been marked Resolved. Tap to inspect before/after photos and submit feedback.', 'Complaint', 'CMP-2026-1003', 0],
      ['citizen@demo.local', 'citizen', 'Service Request Scheduled', 'Your Bulk Waste Collection request SR-2026-001 has been scheduled for Oct 20 (Morning Slot).', 'Service Request', 'SR-2026-001', 0],
      ['citizen@demo.local', 'citizen', 'City Advisory: Water Shutdown', 'Planned 12-Hour Water Shutdown in Central Ward on Sunday. Check notices for affected streets.', 'Notice', 'AN-001', 1],
      ['admin@demo.local', 'authority', 'Critical Pothole Alert', 'Safety-critical pothole reported near Municipal School Gate (CMP-2026-1001). Awaiting department allocation.', 'Complaint', 'CMP-2026-1001', 0]
    ];
    for (const n of notifications) {
      db.run(
        `INSERT OR IGNORE INTO notifications (recipient_email, recipient_role, title, message, category, reference_id, is_read) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        n
      );
    }
  }

  // 13. Audit Logs
  if (tableCount(db, 'audit_logs') === 0) {
    const auditLogs = [
      ['COMPLAINT', 'CMP-2026-1001', 'INSERT', 'Demo Citizen', 'Citizen', 'Lodged complaint: Large pothole near school gate (MG Road)'],
      ['COMPLAINT', 'CMP-2026-1002', 'ASSIGNMENT', 'Municipal Authority', 'Authority', 'Assigned case to Sanitation Rapid Crew 2 with SLA 24h'],
      ['WORK_ORDER', 'WO-2026-01', 'INSERT', 'Municipal Authority', 'Authority', 'Issued work order WO-2026-01 for Streetlight SL-18'],
      ['COMPLAINT', 'CMP-2026-1003', 'STATUS_CHANGE', 'Eng. Manoj Kumar', 'Authority', 'Status updated from In Progress to Resolved (evidence attached)'],
      ['EXPENDITURE', 'INV-WTR-3904', 'INSERT', 'Eng. Priya Sharma', 'Authority', 'Authorized expenditure ₹82,000 against Water distribution budget'],
      ['SECURITY', 'admin@demo.local', 'LOGIN', 'Municipal Commissioner', 'Authority', 'Successful secure authentication from internal operations IP']
    ];
    for (const al of auditLogs) {
      db.run(
        `INSERT OR IGNORE INTO audit_logs (entity_type, entity_id, action, changed_by, role, details) VALUES (?, ?, ?, ?, ?, ?);`,
        al
      );
    }
  }

  // 14. City Assets
  if (tableCount(db, 'city_assets') === 0) {
    const assets = [
      ['AST-LGT-104', 'Smart LED Streetlight SL-18', 'Streetlight', 'South Zone', 'Temple Road, Pole SL-18', '2024-03-10', 'Good', 98, 'Operational', '2026-10-06', 1],
      ['AST-WTR-209', 'Central Water Trunk Feeder Pipe 400mm', 'Water Pipeline', 'Central Zone', 'MG Road & Market Street Crossing', '2021-06-15', 'Fair', 76, 'Under Maintenance', '2026-10-09', 2],
      ['AST-RDS-088', 'MG Road Elevated Section & School Frontage', 'Road Section', 'Central Zone', 'MG Road, km 2.4 - 3.1', '2022-11-20', 'Poor', 62, 'Degraded', '2026-09-28', 4],
      ['AST-BIN-042', 'Smart IoT Fill-Sensor Compactor Bin #42', 'Public Bin', 'North Zone', 'Lake View Street, Sector 4', '2025-01-18', 'Good', 91, 'Operational', '2026-10-05', 0],
      ['AST-DRN-015', 'Sub-Canal Drainage Culvert 15', 'Drainage Network', 'Central Zone', 'Market Street Underpass', '2023-04-12', 'Good', 88, 'Operational', '2026-09-15', 1],
      ['AST-TRF-009', 'High-Voltage Stepdown Substation Transformer T-9', 'Power Transformer', 'North Zone', 'Substation North Bay Yard', '2020-08-30', 'Fair', 79, 'Operational', '2026-09-22', 1]
    ];
    for (const a of assets) {
      db.run(
        `INSERT OR IGNORE INTO city_assets (asset_id, asset_name, category, zone, location_address, installation_date, condition, health_score, status, last_inspection, failure_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        a
      );
    }
  }

  // 15. Maintenance Records
  if (tableCount(db, 'maintenance_records') === 0) {
    const maintenance = [
      ['AST-LGT-104', 'WO-2026-01', '2026-10-06', 'Blown sodium bulb and worn wiring harness.', 'Installed 60W IP66 LED luminaire and tested circuit.', 'Electrical Tech Team 1', 12500],
      ['AST-WTR-209', 'WO-2026-02', '2026-10-09', 'High pressure rupture at pipe joint flange.', 'Fitted ductile cast iron compression repair sleeve.', 'Rapid Water Emergency Squad', 82000]
    ];
    for (const m of maintenance) {
      db.run(
        `INSERT OR IGNORE INTO maintenance_records (asset_id, work_order_ref, inspection_date, findings, actions_taken, performed_by, cost) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        m
      );
    }
  }

  // 16. Smart Utilities & Traffic
  const utilities = [
    ['UTIL-PWR-01', 'Power Grid', 'Substation Central Alpha', 'Central Zone', 'Optimal', '450 MVA', 68, 1],
    ['UTIL-PWR-02', 'Power Grid', 'Substation North Bay', 'North Zone', 'Warning', '320 MVA', 89, 1],
    ['UTIL-WTR-01', 'Water Network', 'Reservoir Pump Station 3', 'Central Zone', 'Optimal', '12M Liters/Day', 54, 1],
    ['UTIL-WTR-02', 'Water Network', 'South Treatment Plant', 'South Zone', 'Optimal', '8M Liters/Day', 62, 1],
    ['UTIL-LGT-01', 'Street Lighting', 'Central Boulevard Smart LEDs', 'Central Zone', 'Optimal', '1,420 Fixtures', 40, 1],
    ['UTIL-SLR-01', 'Solar Station', 'Civic Center Solar Array', 'South Zone', 'Optimal', '1.8 MW Peak', 75, 1]
  ];
  for (const u of utilities) {
    db.run(
      `INSERT OR IGNORE INTO smart_utilities (utility_id, utility_type, name, zone, status, capacity_metric, current_load_pct, auto_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      u
    );
  }

  const traffic = [
    ['TRF-NODE-01', 'MG Road & Grand Trunk Cross', 'Central Zone', 'Adaptive', 72, 88, 'Congested'],
    ['TRF-NODE-02', 'Tech Corridor Expressway Exit 4', 'North Zone', 'Adaptive', 45, 52, 'Normal'],
    ['TRF-NODE-03', 'Metro Station South Plaza', 'South Zone', 'Manual Override', 30, 35, 'Clear'],
    ['TRF-NODE-04', 'Harbor Boulevard Junction', 'Central Zone', 'Adaptive', 58, 64, 'Normal']
  ];
  for (const t of traffic) {
    db.run(
      `INSERT OR IGNORE INTO traffic_nodes (node_id, junction_name, zone, signal_mode, congestion_index, vehicle_count_per_min, status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      t
    );
  }

  const units = [
    ['EMG-FIRE-01', 'Fire Rescue', 'Blaze Engine 4', 'Central Zone', 'Available', 6, 4],
    ['EMG-MED-02', 'Medical Ambulance', 'LifeSupport Alpha', 'Central Zone', 'Dispatched', 3, 7],
    ['EMG-POL-05', 'Police Patrol', 'Sector Cruiser 12', 'North Zone', 'Available', 2, 3],
    ['EMG-DIS-01', 'Disaster Response', 'Urban Relief Squad 1', 'South Zone', 'Available', 10, 12]
  ];
  for (const u of units) {
    db.run(
      `INSERT OR IGNORE INTO emergency_units (unit_id, unit_type, callsign, zone, status, crew_count, eta_minutes) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      u
    );
  }
}

// Determine Command Category: DDL, DML, or DQL
function classifyCommand(sql) {
  const clean = sql.trim().toUpperCase();
  if (/^(CREATE|ALTER|DROP|TRUNCATE|RENAME)\b/.test(clean)) return 'DDL';
  if (/^(INSERT|UPDATE|DELETE|MERGE|REPLACE)\b/.test(clean)) return 'DML';
  if (/^(SELECT|WITH|EXPLAIN|PRAGMA)\b/.test(clean)) return 'DQL';
  return 'OTHER';
}

async function executeSql(sql) {
  const db = await getDb();
  const trimmed = sql.trim().replace(/;\s*$/, '');
  const commandType = classifyCommand(trimmed);
  const startTime = Date.now();

  try {
    if (commandType === 'DQL') {
      const results = db.exec(sql);
      const executionTimeMs = Date.now() - startTime;
      if (!results || results.length === 0) {
        return {
          success: true,
          commandType: 'DQL',
          columns: [],
          rows: [],
          message: 'Query executed successfully. 0 rows returned.',
          executionTimeMs
        };
      }
      const first = results[0];
      return {
        success: true,
        commandType: 'DQL',
        columns: first.columns,
        rows: first.values,
        message: `${first.values.length} row(s) returned.`,
        executionTimeMs
      };
    } else {
      // DDL or DML
      db.run(sql);
      const executionTimeMs = Date.now() - startTime;
      const rowsAffected = db.getRowsModified();
      persistDb();

      let msg = '';
      if (commandType === 'DDL') {
        msg = `DDL command executed successfully. Database schema updated.`;
      } else if (commandType === 'DML') {
        msg = `DML command executed successfully. ${rowsAffected} row(s) affected.`;
      } else {
        msg = `Command executed successfully.`;
      }

      return {
        success: true,
        commandType,
        rowsAffected,
        columns: [],
        rows: [],
        message: msg,
        executionTimeMs
      };
    }
  } catch (err) {
    return {
      success: false,
      commandType,
      message: err.message,
      executionTimeMs: Date.now() - startTime
    };
  }
}

async function listSchema() {
  const db = await getDb();
  try {
    const tablesRes = db.exec(`
      SELECT name, type 
      FROM sqlite_master 
      WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
      ORDER BY type, name;
    `);

    if (!tablesRes.length) return [];

    const tables = [];
    for (const [name, type] of tablesRes[0].values) {
      const colRes = db.exec(`PRAGMA table_info("${name}");`);
      const columns = colRes.length ? colRes[0].values.map(c => ({
        cid: c[0],
        name: c[1],
        type: c[2],
        notnull: c[3] === 1,
        dflt_value: c[4],
        pk: c[5] === 1
      })) : [];

      let rowCount = 0;
      try {
        const countRes = db.exec(`SELECT COUNT(*) FROM "${name}";`);
        rowCount = countRes.length ? countRes[0].values[0][0] : 0;
      } catch (e) {
        // views might fail if base table not present
      }

      tables.push({
        name,
        type: type.toUpperCase(),
        columns,
        rowCount
      });
    }

    return tables;
  } catch (err) {
    console.error('[sqlite listSchema]', err.message);
    return [];
  }
}

// ---------------- ENTITY HELPER METHODS ----------------

// Complaints API
async function listAllComplaints(filterEmail = null) {
  const db = await getDb();
  let query = `
    SELECT 
      reference_code, citizen_name, citizen_email, phone, category, title, description,
      area, address, landmark, latitude, longitude, photo_url, severity, safety_risk,
      department, priority, status, assigned_to, resolution, resolution_photo,
      expected_resolution_date, reopened_count, reopen_reason, withdrawal_reason, is_draft,
      history_json, created_at, updated_at
    FROM city_complaints
  `;
  if (filterEmail) {
    query += ` WHERE LOWER(citizen_email) = LOWER('${filterEmail.replace(/'/g, "''")}')`;
  }
  query += ` ORDER BY created_at DESC;`;

  const res = db.exec(query);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const obj = {};
    cols.forEach((col, idx) => { obj[col] = row[idx]; });
    let history = [];
    try { history = obj.history_json ? JSON.parse(obj.history_json) : []; } catch {}
    return {
      id: obj.reference_code,
      citizen: obj.citizen_name,
      email: obj.citizen_email,
      phone: obj.phone || '',
      category: obj.category,
      title: obj.title,
      description: obj.description,
      area: obj.area,
      address: obj.address,
      landmark: obj.landmark || '',
      latitude: obj.latitude,
      longitude: obj.longitude,
      photoUrl: obj.photo_url || '',
      severity: obj.severity || 'Medium',
      safetyRisk: obj.safety_risk === 1,
      department: obj.department,
      priority: obj.priority,
      status: obj.status,
      assignedTo: obj.assigned_to || 'Unassigned',
      resolution: obj.resolution || '',
      resolutionPhoto: obj.resolution_photo || '',
      expectedResolutionDate: obj.expected_resolution_date || '',
      reopenedCount: obj.reopened_count || 0,
      reopenReason: obj.reopen_reason || '',
      withdrawalReason: obj.withdrawal_reason || '',
      isDraft: obj.is_draft === 1,
      history,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at
    };
  });
}

async function insertComplaint(c) {
  const db = await getDb();
  const id = `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-7)}`;
  const now = new Date().toISOString();
  const history = [{ action: c.isDraft ? 'Saved draft' : 'Complaint registered', by: c.by || 'Citizen', at: now }];

  db.run(`
    INSERT INTO city_complaints 
    (reference_code, citizen_name, citizen_email, phone, category, title, description, area, address, landmark, latitude, longitude, photo_url, severity, safety_risk, department, priority, status, assigned_to, resolution, resolution_photo, expected_resolution_date, reopened_count, reopen_reason, withdrawal_reason, is_draft, history_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unassigned', NULL, NULL, ?, 0, NULL, NULL, ?, ?, ?, ?);
  `, [
    id, c.citizen, c.email, c.phone || null, c.category, c.title, c.description,
    c.area, c.address, c.landmark || null, c.latitude || null, c.longitude || null,
    c.photoUrl || null, c.severity || 'Medium', c.safetyRisk ? 1 : 0,
    c.department, c.priority || 'Medium', c.isDraft ? 'Draft' : 'Open',
    c.expectedResolutionDate || null, c.isDraft ? 1 : 0,
    JSON.stringify(history), now, now
  ]);

  // Insert audit log
  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('COMPLAINT', ?, 'INSERT', ?, ?, ?);
  `, [id, c.by || c.citizen, c.role || 'Citizen', `Lodged complaint: ${c.title} in ${c.area}`]);

  // Insert initial notification for citizen
  db.run(`
    INSERT INTO notifications (recipient_email, recipient_role, title, message, category, reference_id)
    VALUES (?, 'citizen', 'Complaint Registered', ?, 'Complaint', ?);
  `, [c.email, `Your complaint ${id} has been registered and queued for municipal review. Expected response: 48h.`, id]);

  persistDb();
  return id;
}

async function updateComplaintRow(id, data, actionBy = 'Municipal Authority', role = 'authority') {
  const db = await getDb();
  const existing = await listAllComplaints();
  const found = existing.find(x => x.id === id);
  if (!found) throw new Error('Complaint not found.');

  const updatedHistory = [...(found.history || [])];
  updatedHistory.push({
    action: data.auditAction || (data.status ? `Status changed to ${data.status}` : 'Complaint record updated'),
    by: actionBy,
    at: new Date().toISOString()
  });

  const isAuthority = role === 'authority';
  // Citizen edit permissions: can edit title, description, phone, area, address, landmark, photo while in Open/Draft/Submitted
  const title = !isAuthority && data.title ? data.title : found.title;
  const description = !isAuthority && data.description ? data.description : found.description;
  const category = !isAuthority && data.category ? data.category : (data.category || found.category);
  const area = !isAuthority && data.area ? data.area : (data.area || found.area);
  const address = !isAuthority && data.address ? data.address : (data.address || found.address);
  const landmark = !isAuthority && data.landmark !== undefined ? data.landmark : found.landmark;
  const photoUrl = !isAuthority && data.photoUrl !== undefined ? data.photoUrl : found.photoUrl;

  // Authority or special actions
  const department = data.department || found.department;
  const priority = data.priority || found.priority;
  const status = data.status || found.status;
  const assigned = data.assignedTo !== undefined ? data.assignedTo : found.assignedTo;
  const resolution = data.resolution !== undefined ? data.resolution : found.resolution;
  const resolutionPhoto = data.resolutionPhoto !== undefined ? data.resolutionPhoto : found.resolutionPhoto;
  const phone = data.phone !== undefined ? data.phone : found.phone;
  const expectedDate = data.expectedResolutionDate !== undefined ? data.expectedResolutionDate : found.expectedResolutionDate;
  const reopenReason = data.reopenReason !== undefined ? data.reopenReason : found.reopenReason;
  const withdrawalReason = data.withdrawalReason !== undefined ? data.withdrawalReason : found.withdrawalReason;
  const reopenedCount = data.reopenReason ? (found.reopenedCount + 1) : found.reopenedCount;
  const isDraft = data.isDraft !== undefined ? (data.isDraft ? 1 : 0) : (found.isDraft ? 1 : 0);
  const now = new Date().toISOString();

  db.run(`
    UPDATE city_complaints SET
      title = ?, description = ?, category = ?, area = ?, address = ?, landmark = ?, photo_url = ?,
      department = ?, priority = ?, status = ?, assigned_to = ?, resolution = ?, resolution_photo = ?,
      phone = ?, expected_resolution_date = ?, reopened_count = ?, reopen_reason = ?, withdrawal_reason = ?,
      is_draft = ?, history_json = ?, updated_at = ?
    WHERE reference_code = ?;
  `, [
    title, description, category, area, address, landmark, photoUrl,
    department, priority, status, assigned, resolution, resolutionPhoto,
    phone || null, expectedDate || null, reopenedCount, reopenReason || null, withdrawalReason || null,
    isDraft, JSON.stringify(updatedHistory), now, id
  ]);

  // Record audit log
  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('COMPLAINT', ?, ?, ?, ?, ?);
  `, [id, data.status ? 'STATUS_CHANGE' : 'UPDATE', actionBy, role, data.auditAction || `Complaint ${id} status: ${status}, assigned: ${assigned}`]);

  // If status changed to Resolved, notify citizen
  if (data.status === 'Resolved' && found.email) {
    db.run(`
      INSERT INTO notifications (recipient_email, recipient_role, title, message, category, reference_id)
      VALUES (?, 'citizen', 'Complaint Resolved', ?, 'Complaint', ?);
    `, [found.email, `Your complaint ${id} has been marked Resolved. Tap to review resolution notes and rate service.`, id]);
  }

  persistDb();
  return true;
}

async function deleteComplaintRow(id) {
  const db = await getDb();
  db.run(`DELETE FROM city_complaints WHERE reference_code = ?;`, [id]);
  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('COMPLAINT', ?, 'DELETE', 'Authorized System', 'Authority', 'Permanently deleted unsubmitted/test record');
  `, [id]);
  persistDb();
  return db.getRowsModified() > 0;
}

// Service Requests
async function listAllServiceRequests(filterEmail = null) {
  const db = await getDb();
  let query = `SELECT * FROM service_requests`;
  if (filterEmail) {
    query += ` WHERE LOWER(citizen_email) = LOWER('${filterEmail.replace(/'/g, "''")}')`;
  }
  query += ` ORDER BY created_at DESC;`;
  const res = db.exec(query);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertServiceRequest(req) {
  const db = await getDb();
  const id = `SR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  db.run(`
    INSERT INTO service_requests (reference_code, citizen_name, citizen_email, phone, service_type, address, locality, landmark, preferred_date, time_slot, status, assigned_staff, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Unassigned', ?);
  `, [id, req.citizen_name, req.citizen_email, req.phone || null, req.service_type, req.address, req.locality, req.landmark || null, req.preferred_date, req.time_slot, req.notes || null]);

  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('SERVICE_REQUEST', ?, 'INSERT', ?, 'Citizen', ?);
  `, [id, req.citizen_name, `Requested municipal service: ${req.service_type}`]);

  persistDb();
  return id;
}

async function updateServiceRequest(id, data, actionBy = 'Municipal Authority') {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(`
    UPDATE service_requests SET
      status = COALESCE(?, status),
      assigned_staff = COALESCE(?, assigned_staff),
      preferred_date = COALESCE(?, preferred_date),
      time_slot = COALESCE(?, time_slot),
      completion_notes = COALESCE(?, completion_notes),
      updated_at = ?
    WHERE reference_code = ?;
  `, [data.status || null, data.assigned_staff || null, data.preferred_date || null, data.time_slot || null, data.completion_notes || null, now, id]);

  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('SERVICE_REQUEST', ?, 'UPDATE', ?, 'Authority', ?);
  `, [id, actionBy, `Service request ${id} updated status to ${data.status || 'Active'}`]);

  persistDb();
  return true;
}

// Work Orders
async function listAllWorkOrders() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM work_orders ORDER BY created_at DESC;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertWorkOrder(wo) {
  const db = await getDb();
  const id = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  db.run(`
    INSERT INTO work_orders (order_code, complaint_ref, service_request_ref, title, department, assigned_worker, priority, planned_date, deadline, status, materials_used, labour_hours, completion_notes, completion_photo, delay_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Assigned', ?, ?, ?, ?, ?);
  `, [
    id, wo.complaint_ref || null, wo.service_request_ref || null, wo.title, wo.department,
    wo.assigned_worker, wo.priority || 'Medium', wo.planned_date || null, wo.deadline || null,
    wo.materials_used || null, wo.labour_hours || 0, wo.completion_notes || null,
    wo.completion_photo || null, wo.delay_reason || null
  ]);

  // If linked to a complaint, update complaint status to 'Assigned' or 'In Progress'
  if (wo.complaint_ref) {
    db.run(`
      UPDATE city_complaints SET status = 'In Progress', assigned_to = ?, updated_at = CURRENT_TIMESTAMP
      WHERE reference_code = ? AND status IN ('Open', 'Assigned');
    `, [wo.assigned_worker, wo.complaint_ref]);
  }

  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('WORK_ORDER', ?, 'INSERT', ?, 'Authority', ?);
  `, [id, wo.assigned_by || 'City Admin', `Created work order: ${wo.title} assigned to ${wo.assigned_worker}`]);

  persistDb();
  return id;
}

async function updateWorkOrder(id, data, actionBy = 'Field Supervisor') {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(`
    UPDATE work_orders SET
      status = COALESCE(?, status),
      assigned_worker = COALESCE(?, assigned_worker),
      priority = COALESCE(?, priority),
      materials_used = COALESCE(?, materials_used),
      labour_hours = COALESCE(?, labour_hours),
      completion_notes = COALESCE(?, completion_notes),
      completion_photo = COALESCE(?, completion_photo),
      delay_reason = COALESCE(?, delay_reason),
      updated_at = ?
    WHERE order_code = ?;
  `, [
    data.status || null, data.assigned_worker || null, data.priority || null,
    data.materials_used || null, data.labour_hours !== undefined ? data.labour_hours : null,
    data.completion_notes || null, data.completion_photo || null, data.delay_reason || null,
    now, id
  ]);

  db.run(`
    INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, role, details)
    VALUES ('WORK_ORDER', ?, 'UPDATE', ?, 'Staff', ?);
  `, [id, actionBy, `Work order ${id} status: ${data.status || 'Updated'}`]);

  persistDb();
  return true;
}

// Announcements
async function listAnnouncements() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM announcements ORDER BY created_at DESC;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertAnnouncement(an) {
  const db = await getDb();
  db.run(`
    INSERT INTO announcements (title, category, department, affected_area, description, start_date, expiry_date, status, priority, author)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    an.title, an.category, an.department, an.affected_area, an.description,
    an.start_date, an.expiry_date, an.status || 'Published', an.priority || 'Normal', an.author || 'City Administration'
  ]);
  persistDb();
  return true;
}

// Feedback
async function listAllFeedback() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM feedback ORDER BY created_at DESC;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertFeedback(fb) {
  const db = await getDb();
  db.run(`
    INSERT INTO feedback (reference_type, reference_id, citizen_name, citizen_email, rating, comments, is_fully_resolved, dissatisfaction_reason, official_response, escalated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `, [
    fb.reference_type || 'Complaint', fb.reference_id, fb.citizen_name, fb.citizen_email,
    fb.rating, fb.comments || null, fb.is_fully_resolved !== undefined ? (fb.is_fully_resolved ? 1 : 0) : 1,
    fb.dissatisfaction_reason || null, fb.official_response || null, fb.escalated ? 1 : 0
  ]);
  persistDb();
  return true;
}

async function updateFeedback(id, data) {
  const db = await getDb();
  db.run(`
    UPDATE feedback SET
      official_response = COALESCE(?, official_response),
      escalated = COALESCE(?, escalated)
    WHERE feedback_id = ?;
  `, [data.official_response || null, data.escalated !== undefined ? (data.escalated ? 1 : 0) : null, id]);
  persistDb();
  return true;
}

// Budgets & Expenditures
async function listBudgets() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM budgets ORDER BY financial_year DESC, department;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertBudget(bg) {
  const db = await getDb();
  const remaining = bg.allocated_amount - (bg.spent_amount || 0);
  db.run(`
    INSERT INTO budgets (financial_year, department, project_name, allocated_amount, spent_amount, remaining_amount, approved_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `, [bg.financial_year, bg.department, bg.project_name, bg.allocated_amount, bg.spent_amount || 0, remaining, bg.approved_by, bg.status || 'Approved']);
  persistDb();
  return true;
}

async function listExpenditures() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM expenditures ORDER BY created_at DESC;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertExpenditure(ex) {
  const db = await getDb();
  db.run(`
    INSERT INTO expenditures (budget_id, work_order_ref, description, amount, department, authorized_by, invoice_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `, [ex.budget_id || null, ex.work_order_ref || null, ex.description, ex.amount, ex.department, ex.authorized_by, ex.invoice_ref || null]);

  // Update budget spent & remaining
  if (ex.budget_id) {
    db.run(`
      UPDATE budgets SET
        spent_amount = spent_amount + ?,
        remaining_amount = allocated_amount - (spent_amount + ?)
      WHERE budget_id = ?;
    `, [ex.amount, ex.amount, ex.budget_id]);
  }

  persistDb();
  return true;
}

// Notifications
async function listNotifications(email) {
  const db = await getDb();
  let query = `SELECT * FROM notifications`;
  if (email) {
    query += ` WHERE LOWER(recipient_email) = LOWER('${email.replace(/'/g, "''")}')`;
  }
  query += ` ORDER BY created_at DESC;`;
  const res = db.exec(query);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function markNotificationRead(id) {
  const db = await getDb();
  db.run(`UPDATE notifications SET is_read = 1 WHERE notification_id = ?;`, [id]);
  persistDb();
  return true;
}

async function clearNotifications(email) {
  const db = await getDb();
  db.run(`DELETE FROM notifications WHERE LOWER(recipient_email) = LOWER(?);`, [email]);
  persistDb();
  return true;
}

// Users
async function listUsers() {
  const db = await getDb();
  const res = db.exec(`SELECT user_id, email, role, name, phone, department, status, created_at FROM users ORDER BY created_at DESC;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertUser(u) {
  const db = await getDb();
  db.run(`
    INSERT INTO users (email, password, role, name, phone, department, status)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `, [u.email, u.password || 'demo123', u.role, u.name, u.phone || null, u.department || null, u.status || 'Active']);
  persistDb();
  return true;
}

async function updateUserStatus(userId, status) {
  const db = await getDb();
  db.run(`UPDATE users SET status = ? WHERE user_id = ?;`, [status, userId]);
  persistDb();
  return true;
}

// Staff
async function listStaff() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM staff ORDER BY department, name;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertStaff(s) {
  const db = await getDb();
  db.run(`
    INSERT INTO staff (name, email, phone, department, role, status, assigned_cases)
    VALUES (?, ?, ?, ?, ?, ?, 0);
  `, [s.name, s.email, s.phone || null, s.department, s.role, s.status || 'Active']);
  persistDb();
  return true;
}

async function deleteStaff(email) {
  const db = await getDb();
  db.run(`DELETE FROM staff WHERE email = ?;`, [email]);
  persistDb();
  return true;
}

// Assets
async function listAssets() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM city_assets ORDER BY asset_id;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

async function insertAsset(a) {
  const db = await getDb();
  db.run(`
    INSERT INTO city_assets (asset_id, asset_name, category, zone, location_address, installation_date, condition, health_score, status, last_inspection, failure_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);
  `, [
    a.asset_id, a.asset_name, a.category, a.zone, a.location_address,
    a.installation_date || '2025-01-01', a.condition || 'Good', a.health_score || 95,
    a.status || 'Operational', a.last_inspection || new Date().toISOString().slice(0, 10)
  ]);
  persistDb();
  return true;
}

async function updateAsset(id, data) {
  const db = await getDb();
  db.run(`
    UPDATE city_assets 
    SET health_score = COALESCE(?, health_score),
        condition = COALESCE(?, condition),
        status = COALESCE(?, status),
        last_inspection = COALESCE(?, last_inspection)
    WHERE asset_id = ?;
  `, [
    data.health_score !== undefined ? data.health_score : null,
    data.condition || null,
    data.status || null,
    data.last_inspection || null,
    id
  ]);
  persistDb();
  return true;
}

// Audit Logs
async function listAuditLogs() {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200;`);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const o = {};
    cols.forEach((c, i) => o[c] = row[i]);
    return o;
  });
}

// Stats Summary
async function getStatsSummary() {
  const complaints = await listAllComplaints();
  const total = complaints.length;
  const open = complaints.filter(c => ['Open', 'Assigned', 'In Progress', 'Submitted', 'Under Review'].includes(c.status)).length;
  const resolved = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
  const critical = complaints.filter(c => (c.priority === 'Critical' || c.safetyRisk) && !['Resolved', 'Closed'].includes(c.status)).length;
  const drafts = complaints.filter(c => c.isDraft).length;
  return { TOTAL: total, OPEN_COUNT: open, RESOLVED_COUNT: resolved, CRITICAL_COUNT: critical, DRAFT_COUNT: drafts };
}

module.exports = {
  getDb,
  executeSql,
  listSchema,
  listAllComplaints,
  insertComplaint,
  updateComplaintRow,
  deleteComplaintRow,
  listAllServiceRequests,
  insertServiceRequest,
  updateServiceRequest,
  listAllWorkOrders,
  insertWorkOrder,
  updateWorkOrder,
  listAnnouncements,
  insertAnnouncement,
  listAllFeedback,
  insertFeedback,
  updateFeedback,
  listBudgets,
  insertBudget,
  listExpenditures,
  insertExpenditure,
  listNotifications,
  markNotificationRead,
  clearNotifications,
  listUsers,
  insertUser,
  updateUserStatus,
  listStaff,
  insertStaff,
  deleteStaff,
  listAssets,
  insertAsset,
  updateAsset,
  listAuditLogs,
  getStatsSummary,
  classifyCommand
};
