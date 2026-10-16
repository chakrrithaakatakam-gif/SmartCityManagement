import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Clock3,
  Code2,
  Cpu,
  Database,
  Download,
  Edit,
  Edit3,
  Eye,
  FileCheck,
  FilePlus2,
  FileText,
  Filter,
  Flame,
  Gauge,
  HardDrive,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Play,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  Sun,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Truck,
  User,
  UserCheck,
  Users,
  Wifi,
  Wrench,
  X,
  Zap,
  Camera,
  Upload,
  LayoutGrid,
  Table
} from 'lucide-react';

const SESSION_KEY = 'urbanos.demo.session';
const THEME_KEY = 'urbanos.theme';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function apiHeaders(token, hasBody = true) {
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function apiRequest(path, options = {}) {
  const token = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')?.token;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...apiHeaders(token, options.body !== undefined),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({ message: 'Invalid response from server' }));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Initial Data Seed Fallback (so app functions 100% offline or online)
const SEED_COMPLAINTS = [
  {
    id: 'CMP-2026-1001',
    citizen: 'Demo Citizen',
    email: 'citizen@demo.local',
    phone: '9876543210',
    category: 'Roads',
    title: 'Large pothole near municipal school gate',
    description: 'A deep pothole has formed near the municipal school entrance and vehicles are swerving dangerously into pedestrian walkway.',
    area: 'Central Zone',
    address: 'MG Road, near Municipal School Entrance',
    landmark: 'Opposite Gate 2',
    latitude: 18.5204,
    longitude: 73.8567,
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    severity: 'High',
    safetyRisk: true,
    department: 'Roads & Infrastructure',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-10-08T08:30:00.000Z',
    updatedAt: '2026-10-08T08:30:00.000Z',
    assignedTo: 'Unassigned',
    resolution: '',
    resolutionPhoto: '',
    expectedResolutionDate: '2026-10-18',
    reopenedCount: 0,
    isDraft: false,
    history: [{ action: 'Complaint registered', by: 'Citizen (Demo Citizen)', at: '2026-10-08T08:30:00.000Z' }]
  },
  {
    id: 'CMP-2026-1002',
    citizen: 'Demo Citizen',
    email: 'citizen@demo.local',
    phone: '9876543210',
    category: 'Garbage',
    title: 'Missed waste collection on Sector 4 Lake View',
    description: 'Municipal garbage collection vehicle has missed Sector 4 for three days consecutively. Community bins are overflowing.',
    area: 'North Zone',
    address: 'Lake View Street, Block B, Sector 4',
    landmark: 'Near Community Park',
    latitude: 18.5310,
    longitude: 73.8440,
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    severity: 'Medium',
    safetyRisk: false,
    department: 'Sanitation & Waste',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-10-07T07:15:00.000Z',
    updatedAt: '2026-10-07T09:10:00.000Z',
    assignedTo: 'Sanitation Rapid Crew 2',
    resolution: '',
    resolutionPhoto: '',
    expectedResolutionDate: '2026-10-15',
    reopenedCount: 0,
    isDraft: false,
    history: [
      { action: 'Complaint registered', by: 'Citizen (Demo Citizen)', at: '2026-10-07T07:15:00.000Z' },
      { action: 'Verified & assigned to Sanitation Rapid Crew 2', by: 'Municipal Authority', at: '2026-10-07T09:00:00.000Z' },
      { action: 'Work order WO-2026-04 created', by: 'Municipal Authority', at: '2026-10-07T09:10:00.000Z' }
    ]
  },
  {
    id: 'CMP-2026-1003',
    citizen: 'Demo Citizen',
    email: 'citizen@demo.local',
    phone: '9876543210',
    category: 'Streetlights',
    title: 'Streetlight pole SL-18 completely dead at night',
    description: 'Sodium vapor streetlight flickering and shut down completely, creating an unsafe pitch-dark corridor on Temple Road.',
    area: 'South Zone',
    address: 'Temple Road, Pole SL-18',
    landmark: 'Near Shiva Mandir',
    latitude: 18.5020,
    longitude: 73.8610,
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    severity: 'Medium',
    safetyRisk: true,
    department: 'Electrical & Streetlights',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-10-05T15:40:00.000Z',
    updatedAt: '2026-10-06T11:05:00.000Z',
    assignedTo: 'Electrical Tech Team 1',
    resolution: 'Old high-pressure sodium bulb replaced with energy-efficient 60W IP66 LED luminaire. Circuit breaker re-tested and fully operational.',
    resolutionPhoto: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    expectedResolutionDate: '2026-10-06',
    reopenedCount: 0,
    isDraft: false,
    history: [
      { action: 'Complaint registered', by: 'Citizen (Demo Citizen)', at: '2026-10-05T15:40:00.000Z' },
      { action: 'Assigned to Electrical Tech Team 1', by: 'Municipal Authority', at: '2026-10-05T16:20:00.000Z' },
      { action: 'Field repairs completed. Replaced fixture with 60W LED luminaire.', by: 'Eng. Manoj Kumar', at: '2026-10-06T11:00:00.000Z' },
      { action: 'Marked resolved with post-repair photographic evidence.', by: 'Municipal Authority', at: '2026-10-06T11:05:00.000Z' }
    ]
  },
  {
    id: 'CMP-2026-1004',
    citizen: 'Ananya Das',
    email: 'ananya@example.test',
    phone: '9000000004',
    category: 'Water',
    title: 'Major 8-inch water distribution line rupture flooding roadway',
    description: 'Main distribution line valve blown out during morning pressure cycle, high volume clean potable water flooding into commercial market shops.',
    area: 'Central Zone',
    address: 'Market Street, Ward 4 Commercial Hub',
    landmark: 'Near Old Clock Tower',
    latitude: 18.5190,
    longitude: 73.8550,
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    severity: 'Critical',
    safetyRisk: true,
    department: 'Water Supply & Quality',
    priority: 'Critical',
    status: 'Assigned',
    createdAt: '2026-10-09T06:10:00.000Z',
    updatedAt: '2026-10-09T06:45:00.000Z',
    assignedTo: 'Rapid Water Emergency Squad',
    resolution: '',
    resolutionPhoto: '',
    expectedResolutionDate: '2026-10-10',
    reopenedCount: 0,
    isDraft: false,
    history: [
      { action: 'Complaint registered', by: 'Citizen (Ananya Das)', at: '2026-10-09T06:10:00.000Z' },
      { action: 'Priority escalated to Critical due to public property flooding', by: 'Municipal Authority', at: '2026-10-09T06:20:00.000Z' },
      { action: 'Assigned to Rapid Water Emergency Squad', by: 'Municipal Authority', at: '2026-10-09T06:45:00.000Z' }
    ]
  }
];

const SEED_SERVICES = [
  {
    request_id: 1,
    reference_code: 'SR-2026-001',
    citizen_name: 'Demo Citizen',
    citizen_email: 'citizen@demo.local',
    phone: '9876543210',
    service_type: 'Bulk Waste Collection',
    address: 'Flat 402, Green Meadows Apartment, Lake View Road',
    locality: 'North Zone',
    landmark: 'Opposite Lake View Garden',
    preferred_date: '2026-10-20',
    time_slot: 'Morning (08:00 - 12:00)',
    status: 'Scheduled',
    assigned_staff: 'Sanitation Truck #14',
    notes: 'Furniture renovation scrap and broken wooden wardrobes.',
    completion_notes: '',
    created_at: '2026-10-12 10:00:00'
  },
  {
    request_id: 2,
    reference_code: 'SR-2026-002',
    citizen_name: 'Demo Citizen',
    citizen_email: 'citizen@demo.local',
    phone: '9876543210',
    service_type: 'Water Tanker Delivery',
    address: 'Green Meadows Housing Society, Sector 4',
    locality: 'North Zone',
    landmark: 'Main Gate Overhead Tank',
    preferred_date: '2026-10-16',
    time_slot: 'Afternoon (12:00 - 16:00)',
    status: 'Pending',
    assigned_staff: 'Unassigned',
    notes: '10,000 Liters requested due to scheduled pipeline pressure drop.',
    completion_notes: '',
    created_at: '2026-10-14 09:15:00'
  },
  {
    request_id: 3,
    reference_code: 'SR-2026-003',
    citizen_name: 'Rohan Kulkarni',
    citizen_email: 'rohan@example.test',
    phone: '9822012345',
    service_type: 'Tree Pruning & Park Care',
    address: '12 Sunshine Enclave, Riverside Avenue',
    locality: 'South Zone',
    landmark: 'Near Riverside Jogging Track',
    preferred_date: '2026-10-18',
    time_slot: 'Morning (08:00 - 12:00)',
    status: 'Approved',
    assigned_staff: 'Parks Horticulture Team B',
    notes: 'Overhanging Gulmohar tree branches brushing against domestic power line.',
    completion_notes: '',
    created_at: '2026-10-11 14:00:00'
  }
];

const SEED_WORK_ORDERS = [
  {
    work_order_id: 1,
    order_code: 'WO-2026-01',
    complaint_ref: 'CMP-2026-1003',
    service_request_ref: null,
    title: 'Emergency Luminaire Replacement on Pole SL-18',
    department: 'Electrical & Streetlights',
    assigned_worker: 'Electrical Tech Team 1',
    priority: 'Medium',
    planned_date: '2026-10-06',
    deadline: '2026-10-06',
    status: 'Completed',
    materials_used: '1x 60W IP66 LED Fixture, 15m Copper Cable 2.5mm, 1x MCB 10A',
    labour_hours: 3.5,
    completion_notes: 'Replaced blown fixture and replaced rusted mounting clamp. Checked light output 6000 lumens.',
    completion_photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    delay_reason: null,
    created_at: '2026-10-05 16:20:00'
  },
  {
    work_order_id: 2,
    order_code: 'WO-2026-02',
    complaint_ref: 'CMP-2026-1004',
    service_request_ref: null,
    title: 'Excavation & Pipeline Patching on Market Street',
    department: 'Water Supply & Quality',
    assigned_worker: 'Rapid Water Emergency Squad',
    priority: 'Critical',
    planned_date: '2026-10-09',
    deadline: '2026-10-10',
    status: 'In Progress',
    materials_used: '1x 8-inch Cast Iron Pipe Sleeve, Heavy Duty Rubber Gaskets, 2 Tons Gravel Bedding',
    labour_hours: 6.0,
    completion_notes: 'Excavation complete. Isolating valve 4B and installing compression clamp.',
    completion_photo: null,
    delay_reason: null,
    created_at: '2026-10-09 06:45:00'
  },
  {
    work_order_id: 3,
    order_code: 'WO-2026-03',
    complaint_ref: 'CMP-2026-1001',
    service_request_ref: null,
    title: 'Cold Asphalt Pothole Restoration at School Gate',
    department: 'Roads & Infrastructure',
    assigned_worker: 'Rajesh Field Tech',
    priority: 'High',
    planned_date: '2026-10-16',
    deadline: '2026-10-17',
    status: 'Assigned',
    materials_used: '6 Bags Cold Mix Bitumen, Road Roller Compactor Rental, Barricade Cones',
    labour_hours: 0,
    completion_notes: 'Scheduled for Saturday morning to minimize disruption to school traffic.',
    completion_photo: null,
    delay_reason: null,
    created_at: '2026-10-10 11:00:00'
  }
];

const SEED_ANNOUNCEMENTS = [
  {
    announcement_id: 1,
    title: 'Planned 12-Hour Water Supply Shutdown in Central Ward',
    category: 'Water Shutdown',
    department: 'Water Supply & Quality',
    affected_area: 'Central Zone (Wards 3, 4, and 7)',
    description: 'Major maintenance and valve upgrade on 400mm feeder line at Reservoir 3. Water supply will be suspended from 08:00 to 20:00 on Sunday. Drinking water tankers will be stationed at key intersections.',
    start_date: '2026-10-18',
    expiry_date: '2026-10-19',
    status: 'Published',
    priority: 'Urgent',
    author: 'Chief Hydraulic Engineer',
    created_at: '2026-10-12'
  },
  {
    announcement_id: 2,
    title: 'MG Road Flyover Resurfacing & Night Lane Closure',
    category: 'Road Closure',
    department: 'Roads & Infrastructure',
    affected_area: 'MG Road Elevated Flyover Corridor',
    description: 'Night-time milling and asphalt resurfacing. One lane open between 23:00 and 05:30. Motorists advised to use Old Bypass Road.',
    start_date: '2026-10-16',
    expiry_date: '2026-10-22',
    status: 'Published',
    priority: 'High',
    author: 'Municipal Road Works Bureau',
    created_at: '2026-10-10'
  },
  {
    announcement_id: 3,
    title: 'Annual Monsoon Stormwater Drainage Cleaning Drive',
    category: 'Sanitation Drive',
    department: 'Drainage & Sewerage',
    affected_area: 'All City Zones (North, Central, South)',
    description: 'Citizens are requested not to dump construction debris in open drainage gutters. Dedicated desilting squads operating around the clock.',
    start_date: '2026-10-01',
    expiry_date: '2026-10-31',
    status: 'Published',
    priority: 'Normal',
    author: 'Director of Municipal Sanitation',
    created_at: '2026-10-01'
  }
];

const SEED_FEEDBACK = [
  {
    feedback_id: 1,
    reference_type: 'Complaint',
    reference_id: 'CMP-2026-1003',
    citizen_name: 'Demo Citizen',
    citizen_email: 'citizen@demo.local',
    rating: 5,
    comments: 'The electrical team replaced the streetlight bulb within 24 hours of lodging the complaint. The street is bright and safe again. Excellent prompt service!',
    is_fully_resolved: 1,
    dissatisfaction_reason: '',
    official_response: 'Thank you for your civic feedback. We are glad our team could restore safety quickly.',
    escalated: 0,
    created_at: '2026-10-06 14:00:00'
  },
  {
    feedback_id: 2,
    reference_type: 'Complaint',
    reference_id: 'CMP-2026-1002',
    citizen_name: 'Demo Citizen',
    citizen_email: 'citizen@demo.local',
    rating: 3,
    comments: 'Work was in progress, but waste was spilled near the pavement during loading.',
    is_fully_resolved: 0,
    dissatisfaction_reason: 'Spilled waste was left on pavement',
    official_response: 'Acknowledged. Team 2 instructed to perform secondary cleanup sweep.',
    escalated: 0,
    created_at: '2026-10-08 10:30:00'
  }
];

const SEED_BUDGETS = [
  { budget_id: 1, financial_year: 'FY 2026-27', department: 'Roads & Infrastructure', project_name: 'City Pothole Patching & Road Safety Resurfacing', allocated_amount: 1500000, spent_amount: 480000, remaining_amount: 1020000, approved_by: 'Standing Finance Committee', status: 'Approved' },
  { budget_id: 2, financial_year: 'FY 2026-27', department: 'Water Supply & Quality', project_name: 'Distribution Feeder Valve & Rupture Replacements', allocated_amount: 1800000, spent_amount: 720000, remaining_amount: 1080000, approved_by: 'Municipal Commissioner', status: 'Approved' },
  { budget_id: 3, financial_year: 'FY 2026-27', department: 'Electrical & Streetlights', project_name: 'Smart LED Streetlight Transition Phase 3', allocated_amount: 950000, spent_amount: 310000, remaining_amount: 640000, approved_by: 'Standing Finance Committee', status: 'Approved' },
  { budget_id: 4, financial_year: 'FY 2026-27', department: 'Sanitation & Waste', project_name: 'Mechanized Sweeper Fleet & Bin Deployment', allocated_amount: 1200000, spent_amount: 550000, remaining_amount: 650000, approved_by: 'Municipal Commissioner', status: 'Approved' },
  { budget_id: 5, financial_year: 'FY 2026-27', department: 'Drainage & Sewerage', project_name: 'Pre-Monsoon Stormwater Canal Desilting', allocated_amount: 800000, spent_amount: 240000, remaining_amount: 560000, approved_by: 'Standing Finance Committee', status: 'Approved' }
];

const SEED_EXPENDITURES = [
  { expenditure_id: 1, budget_id: 1, work_order_ref: 'WO-2026-03', description: 'Bituminous cold asphalt bags and compactor charges for Ward 2', amount: 45000, department: 'Roads & Infrastructure', authorized_by: 'Eng. Vikram Seth', invoice_ref: 'INV-RDS-8821', created_at: '2026-10-10' },
  { expenditure_id: 2, budget_id: 2, work_order_ref: 'WO-2026-02', description: 'Cast iron ductile sleeve and high-pressure gaskets for Market St pipeline', amount: 82000, department: 'Water Supply & Quality', authorized_by: 'Eng. Priya Sharma', invoice_ref: 'INV-WTR-3904', created_at: '2026-10-09' },
  { expenditure_id: 3, budget_id: 3, work_order_ref: 'WO-2026-01', description: '60W IP66 LED streetlight fixture luminaire replacement and cables', amount: 12500, department: 'Electrical & Streetlights', authorized_by: 'Eng. Manoj Kumar', invoice_ref: 'INV-ELE-1049', created_at: '2026-10-06' }
];

const SEED_NOTIFICATIONS = [
  { notification_id: 1, recipient_email: 'citizen@demo.local', recipient_role: 'citizen', title: 'Complaint Status Update', message: 'Your complaint CMP-2026-1002 has been verified and assigned to Sanitation Rapid Crew 2.', category: 'Complaint', reference_id: 'CMP-2026-1002', is_read: 0, created_at: '2026-10-07 09:05:00' },
  { notification_id: 2, recipient_email: 'citizen@demo.local', recipient_role: 'citizen', title: 'Complaint Resolved', message: 'Complaint CMP-2026-1003 has been marked Resolved. Tap to inspect before/after photos and submit feedback.', category: 'Complaint', reference_id: 'CMP-2026-1003', is_read: 0, created_at: '2026-10-06 11:10:00' },
  { notification_id: 3, recipient_email: 'citizen@demo.local', recipient_role: 'citizen', title: 'Service Request Scheduled', message: 'Your Bulk Waste Collection request SR-2026-001 has been scheduled for Oct 20 (Morning Slot).', category: 'Service Request', reference_id: 'SR-2026-001', is_read: 0, created_at: '2026-10-12 11:35:00' },
  { notification_id: 4, recipient_email: 'citizen@demo.local', recipient_role: 'citizen', title: 'City Advisory: Water Shutdown', message: 'Planned 12-Hour Water Shutdown in Central Ward on Sunday. Check notices for affected streets.', category: 'Notice', reference_id: 'AN-001', is_read: 1, created_at: '2026-10-12 10:00:00' },
  { notification_id: 5, recipient_email: 'admin@demo.local', recipient_role: 'authority', title: 'Critical Pothole Alert', message: 'Safety-critical pothole reported near Municipal School Gate (CMP-2026-1001). Awaiting department allocation.', category: 'Complaint', reference_id: 'CMP-2026-1001', is_read: 0, created_at: '2026-10-08 08:35:00' }
];

const SEED_STAFF = [
  { staff_id: 1, name: 'Eng. Vikram Seth', email: 'vikram.seth@smartcity.gov', phone: '9810101001', department: 'Roads & Infrastructure', role: 'Department Officer', status: 'Active', assigned_cases: 4 },
  { staff_id: 2, name: 'Rajesh Field Tech', email: 'rajesh.tech@smartcity.gov', phone: '9810101002', department: 'Roads & Infrastructure', role: 'Field Worker', status: 'Active', assigned_cases: 2 },
  { staff_id: 3, name: 'Officer Radha Nair', email: 'radha.nair@smartcity.gov', phone: '9810101003', department: 'Sanitation & Waste', role: 'Department Officer', status: 'Active', assigned_cases: 3 },
  { staff_id: 4, name: 'Eng. Manoj Kumar', email: 'manoj.kumar@smartcity.gov', phone: '9810101004', department: 'Electrical & Streetlights', role: 'Department Officer', status: 'Active', assigned_cases: 2 },
  { staff_id: 5, name: 'Eng. Priya Sharma', email: 'priya.sharma@smartcity.gov', phone: '9810101005', department: 'Water Supply & Quality', role: 'Department Officer', status: 'Active', assigned_cases: 5 },
  { staff_id: 6, name: 'Chief A. Deshmukh', email: 'deshmukh@smartcity.gov', phone: '9810101006', department: 'Emergency & Safety', role: 'Administrator', status: 'Active', assigned_cases: 1 },
  { staff_id: 7, name: 'Sunita Mehta (CFO)', email: 'sunita.mehta@smartcity.gov', phone: '9810101007', department: 'Finance & Audit', role: 'Finance Officer', status: 'Active', assigned_cases: 0 }
];

const SEED_DEPARTMENTS = [
  { department_id: 1, name: 'Roads & Infrastructure', description: 'Road maintenance, potholes, resurfacing and bridges', head_officer: 'Eng. Vikram Seth', contact_email: 'roads@smartcity.gov', phone: '020-25501001', active_cases: 12, sla_hours: 48, status: 'Active', categories_handled: 'Roads, Potholes, Bridges, Footpaths' },
  { department_id: 2, name: 'Sanitation & Waste', description: 'Daily waste collection, recycling and street cleanliness', head_officer: 'Officer Radha Nair', contact_email: 'sanitation@smartcity.gov', phone: '020-25501002', active_cases: 8, sla_hours: 24, status: 'Active', categories_handled: 'Garbage collection, Street sweeping, Waste dumping' },
  { department_id: 3, name: 'Electrical & Streetlights', description: 'Grid power lines, transformers and smart streetlights', head_officer: 'Eng. Manoj Kumar', contact_email: 'electrical@smartcity.gov', phone: '020-25501003', active_cases: 5, sla_hours: 24, status: 'Active', categories_handled: 'Streetlights, Power failure, Hanging wires' },
  { department_id: 4, name: 'Water Supply & Quality', description: 'Potable water distribution, pipe repairs and pressure', head_officer: 'Eng. Priya Sharma', contact_email: 'water@smartcity.gov', phone: '020-25501004', active_cases: 14, sla_hours: 12, status: 'Active', categories_handled: 'Water supply, Leakage, Low pressure, Contamination' },
  { department_id: 5, name: 'Drainage & Sewerage', description: 'Storm water drainage, canals desilting and flood control', head_officer: 'Eng. Rajesh Verma', contact_email: 'drainage@smartcity.gov', phone: '020-25501005', active_cases: 4, sla_hours: 36, status: 'Active', categories_handled: 'Drainage blockage, Manhole overflow, Desilting' },
  { department_id: 6, name: 'Public Parks & Greenery', description: 'Municipal park maintenance, tree pruning and horticulture', head_officer: 'Officer Anjali Patil', contact_email: 'parks@smartcity.gov', phone: '020-25501006', active_cases: 3, sla_hours: 48, status: 'Active', categories_handled: 'Fallen trees, Park lighting, Grass maintenance' },
  { department_id: 7, name: 'Transport & Traffic', description: 'Public transit schedules and signal synchronization', head_officer: 'Director S. Rao', contact_email: 'transport@smartcity.gov', phone: '020-25501007', active_cases: 7, sla_hours: 24, status: 'Active', categories_handled: 'Traffic signals, Signboards, Bus stops' },
  { department_id: 8, name: 'Emergency & Safety', description: 'Fire rescue, medical disaster and hazardous incidents', head_officer: 'Chief A. Deshmukh', contact_email: 'emergency@smartcity.gov', phone: '020-25501008', active_cases: 2, sla_hours: 6, status: 'Active', categories_handled: 'Fire, Flood rescue, Structural collapse' }
];

const SEED_ASSETS = [
  { asset_id: 'AST-LGT-104', asset_name: 'Smart LED Streetlight SL-18', category: 'Streetlight', zone: 'South Zone', location_address: 'Temple Road, Pole SL-18', installation_date: '2024-03-10', condition: 'Good', health_score: 98, status: 'Operational', last_inspection: '2026-10-06', failure_count: 1 },
  { asset_id: 'AST-WTR-209', asset_name: 'Central Water Trunk Feeder Pipe 400mm', category: 'Water Pipeline', zone: 'Central Zone', location_address: 'MG Road & Market Street Crossing', installation_date: '2021-06-15', condition: 'Fair', health_score: 76, status: 'Under Maintenance', last_inspection: '2026-10-09', failure_count: 2 },
  { asset_id: 'AST-RDS-088', asset_name: 'MG Road Elevated Section & School Frontage', category: 'Road Section', zone: 'Central Zone', location_address: 'MG Road, km 2.4 - 3.1', installation_date: '2022-11-20', condition: 'Poor', health_score: 62, status: 'Degraded', last_inspection: '2026-09-28', failure_count: 4 },
  { asset_id: 'AST-BIN-042', asset_name: 'Smart IoT Fill-Sensor Compactor Bin #42', category: 'Public Bin', zone: 'North Zone', location_address: 'Lake View Street, Sector 4', installation_date: '2025-01-18', condition: 'Good', health_score: 91, status: 'Operational', last_inspection: '2026-10-05', failure_count: 0 },
  { asset_id: 'AST-DRN-015', asset_name: 'Sub-Canal Drainage Culvert 15', category: 'Drainage Network', zone: 'Central Zone', location_address: 'Market Street Underpass', installation_date: '2023-04-12', condition: 'Good', health_score: 88, status: 'Operational', last_inspection: '2026-09-15', failure_count: 1 },
  { asset_id: 'AST-TRF-009', asset_name: 'High-Voltage Stepdown Substation Transformer T-9', category: 'Power Transformer', zone: 'North Zone', location_address: 'Substation North Bay Yard', installation_date: '2020-08-30', condition: 'Fair', health_score: 79, status: 'Operational', last_inspection: '2026-09-22', failure_count: 1 }
];

const SEED_USERS = [
  { user_id: 1, email: 'citizen@demo.local', role: 'citizen', name: 'Demo Citizen', phone: '9876543210', department: null, status: 'Active', created_at: '2026-01-10' },
  { user_id: 2, email: 'admin@demo.local', role: 'authority', name: 'Municipal Commissioner', phone: '9876543211', department: 'Executive Administration', status: 'Active', created_at: '2026-01-01' },
  { user_id: 3, email: 'officer.roads@demo.local', role: 'authority', name: 'Eng. Vikram Seth', phone: '9876543212', department: 'Roads & Infrastructure', status: 'Active', created_at: '2026-02-15' },
  { user_id: 4, email: 'worker.raj@demo.local', role: 'staff', name: 'Rajesh Field Tech', phone: '9876543213', department: 'Roads & Infrastructure', status: 'Active', created_at: '2026-03-01' },
  { user_id: 5, email: 'finance@demo.local', role: 'authority', name: 'Sunita Mehta (CFO)', phone: '9876543214', department: 'Finance & Audit', status: 'Active', created_at: '2026-01-15' }
];

const SEED_AUDIT_LOGS = [
  { log_id: 1, entity_type: 'COMPLAINT', entity_id: 'CMP-2026-1001', action: 'INSERT', changed_by: 'Demo Citizen', role: 'Citizen', details: 'Lodged complaint: Large pothole near school gate (MG Road)', timestamp: '2026-10-08 08:30:00' },
  { log_id: 2, entity_type: 'COMPLAINT', entity_id: 'CMP-2026-1002', action: 'ASSIGNMENT', changed_by: 'Municipal Authority', role: 'Authority', details: 'Assigned case to Sanitation Rapid Crew 2 with SLA 24h', timestamp: '2026-10-07 09:00:00' },
  { log_id: 3, entity_type: 'WORK_ORDER', entity_id: 'WO-2026-01', action: 'INSERT', changed_by: 'Municipal Authority', role: 'Authority', details: 'Issued work order WO-2026-01 for Streetlight SL-18', timestamp: '2026-10-05 16:20:00' },
  { log_id: 4, entity_type: 'COMPLAINT', entity_id: 'CMP-2026-1003', action: 'STATUS_CHANGE', changed_by: 'Eng. Manoj Kumar', role: 'Authority', details: 'Status updated from In Progress to Resolved (evidence attached)', timestamp: '2026-10-06 11:05:00' },
  { log_id: 5, entity_type: 'EXPENDITURE', entity_id: 'INV-WTR-3904', action: 'INSERT', changed_by: 'Eng. Priya Sharma', role: 'Authority', details: 'Authorized expenditure ₹82,000 against Water distribution budget', timestamp: '2026-10-09 10:15:00' },
  { log_id: 6, entity_type: 'SECURITY', entity_id: 'admin@demo.local', action: 'LOGIN', changed_by: 'Municipal Commissioner', role: 'Authority', details: 'Successful secure authentication from internal operations IP', timestamp: '2026-10-15 08:00:00' }
];

const CATEGORIES = ['Roads', 'Garbage', 'Water', 'Drainage', 'Streetlights', 'Sanitation', 'Public Parks'];
const ZONES = ['Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const CATEGORY_CONFIG = [
  { id: 'Roads', name: 'Roads & Potholes', dept: 'Roads & Infrastructure' },
  { id: 'Garbage', name: 'Garbage & Waste', dept: 'Solid Waste Management' },
  { id: 'Water', name: 'Water Supply', dept: 'Water Supply & Sewerage' },
  { id: 'Drainage', name: 'Drainage & Sewage', dept: 'Drainage & Stormwater' },
  { id: 'Streetlights', name: 'Streetlights', dept: 'Electrical & Street Lighting' },
  { id: 'Sanitation', name: 'Sanitation & Hygiene', dept: 'Public Sanitation' },
  { id: 'Public Parks', name: 'Parks & Trees', dept: 'Public Parks & Horticulture' }
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

// ---------------- MAIN APPLICATION ----------------
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [session, setSession] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return saved?.token ? saved : null;
    } catch {
      return null;
    }
  });

  const isCitizen = session?.role === 'citizen';
  const [page, setPage] = useState(isCitizen ? 'citizen-dashboard' : 'dashboard');
  
  // Responsive sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  // Entities state
  const [complaints, setComplaints] = useState(SEED_COMPLAINTS);
  const [services, setServices] = useState(SEED_SERVICES);
  const [workOrders, setWorkOrders] = useState(SEED_WORK_ORDERS);
  const [announcements, setAnnouncements] = useState(SEED_ANNOUNCEMENTS);
  const [feedbackList, setFeedbackList] = useState(SEED_FEEDBACK);
  const [budgets, setBudgets] = useState(SEED_BUDGETS);
  const [expenditures, setExpenditures] = useState(SEED_EXPENDITURES);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [departments, setDepartments] = useState(SEED_DEPARTMENTS);
  const [staff, setStaff] = useState(SEED_STAFF);
  const [assets, setAssets] = useState(SEED_ASSETS);
  const [users, setUsers] = useState(SEED_USERS);
  const [auditLogs, setAuditLogs] = useState(SEED_AUDIT_LOGS);

  const [apiState, setApiState] = useState('connected');
  const [dbEngine, setDbEngine] = useState('UrbanOS Relational Engine (SQLite + Oracle Dialect)');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  // Filters for Complaints
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [layoutMode, setLayoutMode] = useState('table'); // 'table' or 'card'

  // SQL Studio state
  const [sqlTab, setSqlTab] = useState(isCitizen ? 'dql' : 'ddl');
  const [sqlQuery, setSqlQuery] = useState(() => {
    return isCitizen
      ? `SELECT reference_code, title, category, status, priority, area, created_at\nFROM city_complaints\nORDER BY created_at DESC;`
      : `CREATE TABLE IF NOT EXISTS public_ev_chargers (\n  charger_id VARCHAR2(30) PRIMARY KEY,\n  location VARCHAR2(100) NOT NULL,\n  charging_speed_kw NUMBER DEFAULT 150,\n  operational_status VARCHAR2(20) DEFAULT 'Active'\n);`;
  });
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlError, setSqlError] = useState('');
  const [schemaTables, setSchemaTables] = useState([]);

  // Theme synchronization
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Sync with API when session is active
  useEffect(() => {
    if (!session) return;
    async function loadData() {
      try {
        const [complaintsRes, servicesRes, annRes, notifRes, schemaRes] = await Promise.allSettled([
          apiRequest('/complaints'),
          apiRequest('/services'),
          apiRequest('/announcements'),
          apiRequest('/notifications'),
          apiRequest('/sql/schema')
        ]);

        if (complaintsRes.status === 'fulfilled' && complaintsRes.value.success) {
          setComplaints(complaintsRes.value.data);
        }
        if (servicesRes.status === 'fulfilled' && servicesRes.value.success) {
          setServices(servicesRes.value.data);
        }
        if (annRes.status === 'fulfilled' && annRes.value.success) {
          setAnnouncements(annRes.value.data);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.success) {
          setNotifications(notifRes.value.data);
        }
        if (schemaRes.status === 'fulfilled' && schemaRes.value.success) {
          setSchemaTables(schemaRes.value.data);
        }

        if (!isCitizen) {
          const [woRes, deptsRes, staffRes, assetsRes, fbRes, bgRes, usersRes, auditRes] = await Promise.allSettled([
            apiRequest('/work-orders'),
            apiRequest('/departments'),
            apiRequest('/staff'),
            apiRequest('/assets'),
            apiRequest('/feedback'),
            apiRequest('/budgets'),
            apiRequest('/users'),
            apiRequest('/audit-logs')
          ]);
          if (woRes.status === 'fulfilled' && woRes.value.success) setWorkOrders(woRes.value.data);
          if (deptsRes.status === 'fulfilled' && deptsRes.value.success) setDepartments(deptsRes.value.data);
          if (staffRes.status === 'fulfilled' && staffRes.value.success) setStaff(staffRes.value.data);
          if (assetsRes.status === 'fulfilled' && assetsRes.value.success) setAssets(assetsRes.value.data);
          if (fbRes.status === 'fulfilled' && fbRes.value.success) setFeedbackList(fbRes.value.data);
          if (bgRes.status === 'fulfilled' && bgRes.value.success) {
            setBudgets(bgRes.value.data.budgets || []);
            setExpenditures(bgRes.value.data.expenditures || []);
          }
          if (usersRes.status === 'fulfilled' && usersRes.value.success) setUsers(usersRes.value.data);
          if (auditRes.status === 'fulfilled' && auditRes.value.success) setAuditLogs(auditRes.value.data);
        }

        setApiState('connected');
      } catch (err) {
        setApiState('fallback');
      }
    }
    loadData();
  }, [session, isCitizen]);

  // Auth Handlers
  const handleLogin = async (role, email, password) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const sess = { ...data.user, token: data.token };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      setSession(sess);
      setPage(sess.role === 'citizen' ? 'citizen-dashboard' : 'dashboard');
      showToast(`Welcome back, ${sess.name}`);
    } catch {
      // Fallback in-memory session if API not reachable
      const sess = {
        name: role === 'citizen' ? 'Demo Citizen' : 'Municipal Commissioner',
        email,
        role,
        token: 'local-demo-token-active'
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      setSession(sess);
      setPage(role === 'citizen' ? 'citizen-dashboard' : 'dashboard');
      showToast(`Logged in locally as ${sess.name}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setModal(null);
    showToast('Signed out securely');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter(c => ['Open', 'Submitted', 'Under Review'].includes(c.status)).length;
    const inProgress = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length;
    const resolved = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
    const critical = complaints.filter(c => (c.priority === 'Critical' || c.safetyRisk) && !['Resolved', 'Closed'].includes(c.status)).length;
    const drafts = complaints.filter(c => c.isDraft).length;
    const unreadNotifications = notifications.filter(n => !n.is_read).length;
    return { total, open, inProgress, resolved, critical, drafts, unreadNotifications };
  }, [complaints, notifications]);

  // Filtered complaints for current view
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (isCitizen && c.email.toLowerCase() !== session?.email.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
      return true;
    });
  }, [complaints, isCitizen, session, search, statusFilter, categoryFilter, priorityFilter]);

  // Navigation Items according to Blueprint specification:
  // Citizen: 10 tabs | Authority: 12 tabs
  const navItems = isCitizen
    ? [
        { id: 'citizen-dashboard', label: 'Dashboard / Home', icon: LayoutDashboard },
        { id: 'lodge', label: 'Report a Problem', icon: FilePlus2 },
        { id: 'my-complaints', label: 'My Complaints / Track', icon: ClipboardList, count: stats.open },
        { id: 'manage-complaints', label: 'Manage Complaints', icon: Edit3, count: stats.drafts },
        { id: 'services', label: 'Municipal Services', icon: Building2 },
        { id: 'notices', label: 'City Updates & Notices', icon: Bell },
        { id: 'feedback', label: 'Feedback & Ratings', icon: Star },
        { id: 'notifications', label: 'Notifications', icon: Bell, count: stats.unreadNotifications },
        { id: 'profile', label: 'Profile & Settings', icon: User },
        { id: 'sql', label: 'Civic SQL Explorer', icon: Terminal, tag: 'DQL' }
      ]
    : [
        { id: 'dashboard', label: 'Operations Command', icon: LayoutDashboard },
        { id: 'complaints', label: 'Complaint Management', icon: ClipboardList, count: stats.open },
        { id: 'departments', label: 'Department Management', icon: Building2 },
        { id: 'work-orders', label: 'Staff & Work Orders', icon: Wrench, count: workOrders.filter(w => w.status !== 'Completed').length },
        { id: 'assets', label: 'Infrastructure & Assets', icon: HardDrive },
        { id: 'service-mgmt', label: 'Service Request Desk', icon: Truck, count: services.filter(s => s.status === 'Pending').length },
        { id: 'announcements-mgmt', label: 'Public Notices Desk', icon: Sparkles },
        { id: 'budgets', label: 'Budget & Expenditure', icon: BarChart3 },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'grievances', label: 'Citizen Grievances', icon: Star },
        { id: 'audit-sql', label: 'Database & Audit Studio', icon: Terminal, tag: 'SQL' }
      ];

  const currentNav = navItems.find(n => n.id === page);

  // If not logged in, show Login Screen
  if (!session) {
    return (
      <LoginScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogin={handleLogin}
      />
    );
  }

  // SQL Execution Engine
  async function handleRunSQL() {
    setSqlError('');
    setSqlResult(null);
    try {
      const data = await apiRequest('/sql/execute', {
        method: 'POST',
        body: JSON.stringify({ sql: sqlQuery })
      });
      setSqlResult(data);
      showToast(data.message || 'Statement executed successfully');
      // Refresh schema if DDL
      if (data.commandType === 'DDL' || data.commandType === 'DML') {
        const schema = await apiRequest('/sql/schema').catch(() => null);
        if (schema?.data) setSchemaTables(schema.data);
      }
    } catch (err) {
      setSqlError(err.message || 'SQL execution failed');
    }
  }

  // Export to CSV helper
  const exportCSV = (filename, rows) => {
    if (!rows || !rows.length) {
      showToast('No records to export');
      return;
    }
    const headers = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename} successfully`);
  };

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${mobileNav ? 'active' : ''}`}
        onClick={() => setMobileNav(false)}
      />

      {/* Main Sidebar Navigation */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-info">
            <div className="brand-icon">U</div>
            <div className="brand-text">
              <strong>UrbanOS</strong>
              <small>SMART CITY PLATFORM</small>
            </div>
          </div>
          {/* Functional Close / Collapse Button */}
          <button
            className="sidebar-close-btn icon-button"
            title={sidebarCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            onClick={() => {
              if (window.innerWidth <= 900) {
                setMobileNav(false);
              } else {
                setSidebarCollapsed(true);
              }
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="side-caption">
          {isCitizen ? 'CITIZEN SERVICES' : 'MUNICIPAL OPERATIONS'}
        </div>

        <nav>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
              onClick={() => {
                setPage(item.id);
                setMobileNav(false);
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && <span className="nav-count">{item.count}</span>}
              {item.tag && <span className="nav-tag-sql">{item.tag}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="online-dot" />
          <div>
            <b>{sidebarCollapsed ? 'ONLINE' : dbEngine}</b>
            <small>{apiState === 'connected' ? 'Live Relational API' : 'Standalone In-Memory'}</small>
          </div>
        </div>
      </aside>

      {/* Main Application Area */}
      <main className={`main-area ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="top-left">
            {/* Functional Hamburger Toggle Button */}
            <button
              className={`mobile-menu icon-button ${sidebarCollapsed ? 'active' : ''}`}
              title={sidebarCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
              onClick={() => {
                if (window.innerWidth <= 900) {
                  setMobileNav(!mobileNav);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <b>{currentNav?.label || 'Portal'}</b>
          </div>

          <div className="top-right">
            {/* Theme Toggle Switch */}
            <ThemeToggleSwitch theme={theme} onToggle={toggleTheme} />

            <div className="top-divider" />

            {/* Quick Notifications shortcut */}
            <button
              className="icon-button"
              title="Notifications"
              style={{ position: 'relative' }}
              onClick={() => setPage(isCitizen ? 'notifications' : 'dashboard')}
            >
              <Bell size={16} />
              {stats.unreadNotifications > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#e11d48'
                  }}
                />
              )}
            </button>

            {/* User Profile display */}
            <div className="top-user" onClick={() => isCitizen && setPage('profile')} style={{ cursor: 'pointer' }}>
              <div className="avatar">{isCitizen ? 'CT' : 'MA'}</div>
              <div className="top-user-info">
                <b>{session.name}</b>
                <small>{isCitizen ? 'Citizen Account' : 'City Administrator'}</small>
              </div>
            </div>

            <button className="icon-button" title="Sign out securely" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Pages Area */}
        <div className="page-wrap">
          {/* ========================================================
              CITIZEN PORTAL TABS (10 TABS)
              ======================================================== */}

          {/* 1. CITIZEN DASHBOARD / HOME */}
          {page === 'citizen-dashboard' && isCitizen && (
            <CitizenDashboard
              complaints={complaints}
              services={services}
              announcements={announcements}
              stats={stats}
              onNavigate={setPage}
              onInspect={c => setModal({ type: 'details', complaint: c })}
            />
          )}

          {/* 2. REPORT A PROBLEM / LODGE COMPLAINT */}
          {page === 'lodge' && isCitizen && (
            <LodgeComplaintView
              session={session}
              departments={departments}
              onSuccess={newId => {
                showToast(`Complaint registered successfully: ${newId}`);
                setPage('my-complaints');
              }}
              onSaveDraft={draftId => {
                showToast(`Draft saved: ${draftId}`);
                setPage('manage-complaints');
              }}
              setComplaints={setComplaints}
            />
          )}

          {/* 3. MY COMPLAINTS / TRACK COMPLAINTS */}
          {page === 'my-complaints' && isCitizen && (
            <MyComplaintsView
              complaints={filteredComplaints}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              onInspect={c => setModal({ type: 'details', complaint: c })}
              onPrintTicket={c => setModal({ type: 'ticket', complaint: c })}
              onReopen={c => setModal({ type: 'reopen', complaint: c })}
              onNavigate={setPage}
            />
          )}

          {/* 4. MANAGE MY COMPLAINTS (EDIT, WITHDRAW, DRAFTS) */}
          {page === 'manage-complaints' && isCitizen && (
            <ManageComplaintsView
              complaints={complaints.filter(c => c.email.toLowerCase() === session.email.toLowerCase())}
              onEdit={c => setModal({ type: 'edit-citizen', complaint: c })}
              onWithdraw={c => setModal({ type: 'withdraw', complaint: c })}
              onDeleteDraft={async c => {
                try {
                  await apiRequest(`/complaints/${c.id}`, { method: 'DELETE' });
                } catch {}
                setComplaints(prev => prev.filter(x => x.id !== c.id));
                showToast(`Draft ${c.id} deleted`);
              }}
              onInspect={c => setModal({ type: 'details', complaint: c })}
            />
          )}

          {/* 5. MUNICIPAL SERVICES / SERVICE REQUESTS */}
          {page === 'services' && isCitizen && (
            <CitizenServicesView
              session={session}
              services={services}
              setServices={setServices}
              showToast={showToast}
            />
          )}

          {/* 6. CITY UPDATES & PUBLIC NOTICES */}
          {page === 'notices' && (
            <PublicNoticesView
              announcements={announcements}
              showToast={showToast}
              onInspect={a => setModal({ type: 'notice-detail', announcement: a })}
            />
          )}

          {/* 7. FEEDBACK AND RATINGS */}
          {page === 'feedback' && isCitizen && (
            <CitizenFeedbackView
              session={session}
              complaints={complaints.filter(c => c.email.toLowerCase() === session.email.toLowerCase() && c.status === 'Resolved')}
              services={services.filter(s => s.status === 'Completed')}
              feedbackList={feedbackList}
              setFeedbackList={setFeedbackList}
              showToast={showToast}
            />
          )}

          {/* 8. NOTIFICATIONS */}
          {page === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              setNotifications={setNotifications}
              showToast={showToast}
            />
          )}

          {/* 9. MY PROFILE & ACCOUNT SETTINGS */}
          {page === 'profile' && isCitizen && (
            <CitizenProfileView
              session={session}
              showToast={showToast}
            />
          )}

          {/* 10. CIVIC SQL EXPLORER (DQL READ-ONLY FOR CITIZENS) */}
          {page === 'sql' && (
            <SQLStudioView
              isCitizen={isCitizen}
              sqlQuery={sqlQuery}
              setSqlQuery={setSqlQuery}
              onRun={handleRunSQL}
              result={sqlResult}
              error={sqlError}
              schemaTables={schemaTables}
              showToast={showToast}
            />
          )}

          {/* ========================================================
              MUNICIPAL AUTHORITY PORTAL TABS (12 TABS)
              ======================================================== */}

          {/* 1. AUTHORITY DASHBOARD */}
          {page === 'dashboard' && !isCitizen && (
            <AuthorityDashboard
              complaints={complaints}
              stats={stats}
              departments={departments}
              workOrders={workOrders}
              onNavigate={setPage}
              onInspect={c => setModal({ type: 'details', complaint: c })}
              exportCSV={exportCSV}
            />
          )}

          {/* 2. COMPLAINT MANAGEMENT (OFFICIAL REGISTER) */}
          {page === 'complaints' && !isCitizen && (
            <AuthorityComplaintManagement
              complaints={filteredComplaints}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              onInspect={c => setModal({ type: 'details', complaint: c })}
              onTriage={c => setModal({ type: 'triage', complaint: c })}
              onCreateWorkOrder={c => setModal({ type: 'create-wo', complaint: c })}
              exportCSV={exportCSV}
            />
          )}

          {/* 3. DEPARTMENT MANAGEMENT */}
          {page === 'departments' && !isCitizen && (
            <DepartmentManagementView
              departments={departments}
              setDepartments={setDepartments}
              complaints={complaints}
              showToast={showToast}
              onTransfer={c => setModal({ type: 'transfer', complaint: c })}
            />
          )}

          {/* 4. STAFF AND WORK ORDERS */}
          {page === 'work-orders' && !isCitizen && (
            <WorkOrdersAndStaffView
              workOrders={workOrders}
              setWorkOrders={setWorkOrders}
              staff={staff}
              setStaff={setStaff}
              departments={departments}
              complaints={complaints}
              showToast={showToast}
              onUpdateWO={wo => setModal({ type: 'edit-wo', workOrder: wo })}
            />
          )}

          {/* 5. INFRASTRUCTURE & ASSET MANAGEMENT */}
          {page === 'assets' && !isCitizen && (
            <AssetManagementView
              assets={assets}
              setAssets={setAssets}
              showToast={showToast}
              onInspectAsset={a => setModal({ type: 'asset-detail', asset: a })}
            />
          )}

          {/* 6. SERVICE REQUEST MANAGEMENT */}
          {page === 'service-mgmt' && !isCitizen && (
            <AuthorityServiceRequestsView
              services={services}
              setServices={setServices}
              staff={staff}
              showToast={showToast}
            />
          )}

          {/* 7. ANNOUNCEMENTS AND PUBLIC NOTICES MANAGEMENT */}
          {page === 'announcements-mgmt' && !isCitizen && (
            <AnnouncementsManagementView
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              departments={departments}
              showToast={showToast}
            />
          )}

          {/* 8. BUDGET AND EXPENDITURE */}
          {page === 'budgets' && !isCitizen && (
            <BudgetExpenditureView
              budgets={budgets}
              setBudgets={setBudgets}
              expenditures={expenditures}
              setExpenditures={setExpenditures}
              workOrders={workOrders}
              departments={departments}
              showToast={showToast}
            />
          )}

          {/* 9. REPORTS AND ANALYTICS */}
          {page === 'reports' && !isCitizen && (
            <ReportsAnalyticsView
              complaints={complaints}
              departments={departments}
              budgets={budgets}
              exportCSV={exportCSV}
              showToast={showToast}
            />
          )}

          {/* 10. CITIZEN FEEDBACK & GRIEVANCES */}
          {page === 'grievances' && !isCitizen && (
            <CitizenGrievancesView
              feedbackList={feedbackList}
              setFeedbackList={setFeedbackList}
              showToast={showToast}
            />
          )}

          {/* 11. USER AND ACCESS MANAGEMENT */}


          {/* 12. DATABASE ADMINISTRATION AND AUDIT LOGS (SQL STUDIO) */}
          {page === 'audit-sql' && !isCitizen && (
            <DatabaseAdminAndAuditView
              auditLogs={auditLogs}
              schemaTables={schemaTables}
              sqlQuery={sqlQuery}
              setSqlQuery={setSqlQuery}
              onRun={handleRunSQL}
              result={sqlResult}
              error={sqlError}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* MODAL DIALOGS */}
      {modal?.type === 'details' && (
        <DetailsModal
          complaint={modal.complaint}
          isAuthority={!isCitizen}
          onClose={() => setModal(null)}
          onTriage={c => setModal({ type: 'triage', complaint: c })}
          onOpenSQL={() => {
            setSqlQuery(`SELECT * FROM city_complaints WHERE reference_code = '${modal.complaint.id}';`);
            setPage(isCitizen ? 'sql' : 'audit-sql');
            setModal(null);
          }}
          onReopen={c => setModal({ type: 'reopen', complaint: c })}
          onPrintTicket={c => setModal({ type: 'ticket', complaint: c })}
        />
      )}

      {modal?.type === 'triage' && (
        <AuthorityTriageModal
          complaint={modal.complaint}
          departments={departments}
          staff={staff}
          onClose={() => setModal(null)}
          onSave={async updated => {
            try {
              await apiRequest(`/complaints/${modal.complaint.id}`, {
                method: 'PUT',
                body: JSON.stringify(updated)
              });
            } catch {}
            setComplaints(prev => prev.map(c => c.id === modal.complaint.id ? { ...c, ...updated, updatedAt: new Date().toISOString() } : c));
            setModal(null);
            showToast(`Complaint ${modal.complaint.id} updated`);
          }}
        />
      )}

      {modal?.type === 'create-wo' && (
        <CreateWorkOrderModal
          complaint={modal.complaint}
          staff={staff}
          departments={departments}
          onClose={() => setModal(null)}
          onCreate={async wo => {
            try {
              const res = await apiRequest('/work-orders', {
                method: 'POST',
                body: JSON.stringify(wo)
              });
              wo.order_code = res.id;
            } catch {
              wo.order_code = `WO-2026-${Date.now().toString().slice(-4)}`;
            }
            setWorkOrders(prev => [wo, ...prev]);
            setComplaints(prev => prev.map(c => c.id === wo.complaint_ref ? { ...c, status: 'In Progress', assignedTo: wo.assigned_worker } : c));
            setModal(null);
            showToast(`Work order ${wo.order_code} generated successfully`);
          }}
        />
      )}

      {modal?.type === 'reopen' && (
        <ReopenComplaintModal
          complaint={modal.complaint}
          onClose={() => setModal(null)}
          onSubmit={async reason => {
            const patch = {
              status: 'Reopened',
              reopenReason: reason,
              auditAction: `Citizen reopened case: ${reason}`
            };
            try {
              await apiRequest(`/complaints/${modal.complaint.id}`, {
                method: 'PUT',
                body: JSON.stringify(patch)
              });
            } catch {}
            setComplaints(prev => prev.map(c => c.id === modal.complaint.id ? { ...c, ...patch, reopenedCount: c.reopenedCount + 1 } : c));
            setModal(null);
            showToast('Complaint reopened for municipal re-investigation');
          }}
        />
      )}

      {modal?.type === 'withdraw' && (
        <WithdrawComplaintModal
          complaint={modal.complaint}
          onClose={() => setModal(null)}
          onSubmit={async reason => {
            const patch = {
              status: 'Withdrawn',
              withdrawalReason: reason,
              auditAction: `Citizen withdrew complaint: ${reason}`
            };
            try {
              await apiRequest(`/complaints/${modal.complaint.id}`, {
                method: 'PUT',
                body: JSON.stringify(patch)
              });
            } catch {}
            setComplaints(prev => prev.map(c => c.id === modal.complaint.id ? { ...c, ...patch } : c));
            setModal(null);
            showToast('Complaint withdrawn successfully');
          }}
        />
      )}

      {modal?.type === 'ticket' && (
        <TicketReceiptModal
          complaint={modal.complaint}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'edit-citizen' && (
        <EditComplaintCitizenModal
          complaint={modal.complaint}
          onClose={() => setModal(null)}
          onSave={async patch => {
            try {
              await apiRequest(`/complaints/${modal.complaint.id}`, {
                method: 'PUT',
                body: JSON.stringify(patch)
              });
            } catch {}
            setComplaints(prev => prev.map(c => c.id === modal.complaint.id ? { ...c, ...patch } : c));
            setModal(null);
            showToast('Complaint record updated');
          }}
        />
      )}

      {modal?.type === 'edit-wo' && (
        <UpdateWorkOrderModal
          workOrder={modal.workOrder}
          onClose={() => setModal(null)}
          onSave={async updated => {
            try {
              await apiRequest(`/work-orders/${modal.workOrder.order_code}`, {
                method: 'PUT',
                body: JSON.stringify(updated)
              });
            } catch {}
            setWorkOrders(prev => prev.map(w => w.order_code === modal.workOrder.order_code ? { ...w, ...updated } : w));
            if (updated.status === 'Completed' && modal.workOrder.complaint_ref) {
              setComplaints(prev => prev.map(c => c.id === modal.workOrder.complaint_ref ? { ...c, status: 'Resolved' } : c));
            }
            setModal(null);
            showToast(`Work order ${modal.workOrder.order_code} progress updated!`);
          }}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} color="var(--primary)" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

// ---------------- THEME SWITCH COMPONENT ----------------
function ThemeToggleSwitch({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <div className="theme-toggle-switch" title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}>
      <div className="theme-switch-track" onClick={onToggle}>
        <div className="theme-track-icon sun">
          <Sun size={12} />
        </div>
        <div className="theme-track-icon moon">
          <Moon size={12} />
        </div>
        <div className="theme-switch-thumb">
          {isDark ? <Moon size={12} /> : <Sun size={12} />}
        </div>
      </div>
      <span className="theme-switch-label">{isDark ? 'DARK' : 'LIGHT'}</span>
    </div>
  );
}

// ---------------- TAB HELP & INTERACTION GUIDE COMPONENT ----------------
function TabHelpSection({ badge, title, icon: Icon, desc, tags = [], steps = [], tip }) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultSteps = [
    { title: 'Locate & Filter Records', desc: 'Use the quick search box and category/status dropdown filters to instantly find records.' },
    { title: 'Inspect Details & Timeline', desc: 'Click on any record or action button to review full history, evidence photos, or status.' },
    { title: 'Take Immediate Action', desc: 'Submit new entries, update progress milestones, approve requests, or download audit receipts.' }
  ];

  const resolvedSteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="tab-help-box">
      <div className="tab-help-header" onClick={() => setIsOpen(prev => !prev)}>
        <div className="tab-help-header-left">
          <div className="tab-help-icon-badge">
            {Icon ? <Icon size={16} /> : <HelpCircle size={16} />}
          </div>
          <div className="tab-help-title-wrap">
            <b>
              {title}
              {badge && <span className="tab-pill-badge" style={{ marginLeft: 6, fontSize: 10 }}>{badge}</span>}
            </b>
            <small>Need assistance? Click to view page purpose and step-by-step interaction instructions.</small>
          </div>
        </div>
        <button
          type="button"
          className="tab-help-toggle-btn"
          onClick={e => { e.stopPropagation(); setIsOpen(prev => !prev); }}
        >
          <HelpCircle size={13} />
          {isOpen ? 'Hide Guide ▴' : 'How to Use This Page ▾'}
        </button>
      </div>

      {isOpen && (
        <div className="tab-help-body">
          <div className="tab-help-purpose">
            <b>📌 Page Purpose:</b> {desc}
          </div>

          <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
            🛠️ How to interact with this page:
          </div>
          <div className="tab-help-steps-grid">
            {resolvedSteps.map((st, i) => (
              <div key={i} className="tab-help-step-card">
                <span className="tab-help-step-num">{i + 1}</span>
                <div className="tab-help-step-content">
                  <b>{st.title}</b>
                  <p>{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="tab-help-footer">
            <span>
              💡 <b>Pro Tip:</b> {tip || 'Live database records update in real time with an official municipal audit trail.'}
            </span>
            {tags && tags.length > 0 && (
              <div className="tab-help-tags">
                {tags.map((t, idx) => (
                  <span key={idx} className="tab-help-tag-pill">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TabIntroBanner = TabHelpSection;

// ---------------- MODERN TOGGLE SWITCH (PILL COMPONENT) ----------------
function ToggleSwitch({ checked, onChange, label, subtext, isDanger = false, id }) {
  return (
    <div
      className="ui-toggle-switch"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      id={id}
    >
      <div className={`ui-toggle-track ${checked ? (isDanger ? 'danger-active' : 'active') : ''}`}>
        <div className="ui-toggle-thumb" />
      </div>
      {(label || subtext) && (
        <div className="ui-toggle-label">
          {label && <span className="ui-toggle-title">{label}</span>}
          {subtext && <span className="ui-toggle-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 1. CITIZEN DASHBOARD / HOME COMPONENT
// ==========================================================================
function CitizenDashboard({ complaints, services, announcements, stats, onNavigate, onInspect }) {
  const myComplaints = complaints.filter(c => !c.isDraft);
  const myServices = services.slice(0, 3);
  const activeAnnouncements = announcements.filter(a => a.status === 'Published').slice(0, 3);

  return (
    <div>
      <TabIntroBanner
        badge="Citizen Civic Portal · Live Overview"
        title="Municipal Services & Grievance Dashboard"
        icon={Sparkles}
        desc="What this tab is for: Your central resident portal for monitoring everyday civic services. Track submitted complaint counts, view planned water shutdowns and road repairs, and access quick shortcuts to lodge new complaints or request municipal services."
        tags={['🏙️ City Status: Active', '⚡ Live SLA Tracking', '🔔 Direct Department Routing']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Sparkles size={13} /> CITIZEN CIVIC PORTAL · HOME</div>
          <h1>Civic Service Dashboard</h1>
          <p>Quick overview of your active complaints, scheduled municipal appointments, and real-time public notices.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => onNavigate('lodge')}>
            <FilePlus2 size={15} /> Report a Problem
          </button>
          <button className="btn btn-light" onClick={() => onNavigate('services')}>
            <Building2 size={15} /> Request Civic Service
          </button>
        </div>
      </div>

      {/* Stat KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-complaints')}>
          <div className="stat-icon open">
            <ClipboardList size={20} />
          </div>
          <div>
            <div className="stat-label">TOTAL SUBMITTED</div>
            <div className="stat-value">{stats.total}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Track all submitted grievances</small>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-complaints')}>
          <div className="stat-icon assigned">
            <Clock3 size={20} />
          </div>
          <div>
            <div className="stat-label">UNDER REVIEW / PENDING</div>
            <div className="stat-value">{stats.open}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Assigned to triage officers</small>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-complaints')}>
          <div className="stat-icon in-progress">
            <Wrench size={20} />
          </div>
          <div>
            <div className="stat-label">WORK IN PROGRESS</div>
            <div className="stat-value">{stats.inProgress}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Field crews actively deploying</small>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-complaints')}>
          <div className="stat-icon resolved">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-label">RESOLVED & VERIFIED</div>
            <div className="stat-value">{stats.resolved}</div>
            <small style={{ color: '#10b981', fontSize: 10 }}>Resolved with before/after photos</small>
          </div>
        </div>
      </div>

      {/* City Announcements & Active Disruptions Banner */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <b style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--accent-amber)" /> City Announcements & Active Disruptions
          </b>
          <button className="btn btn-light btn-small" onClick={() => onNavigate('notices')}>
            View All Public Notices <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {activeAnnouncements.map(a => (
            <div key={a.announcement_id} className={`card notice-card ${a.priority.toLowerCase()}`} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className={`priority-chip ${a.priority.toLowerCase()}`}>{a.priority} Priority</span>
                <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Valid till {a.expiry_date}</small>
              </div>
              <h4 style={{ margin: '4px 0 6px', fontSize: 13, fontWeight: 700 }}>{a.title}</h4>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                {a.description}
              </p>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>
                <MapPin size={12} /> {a.affected_area}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Grid: Recent Complaints & Service Appointments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Recent Complaints */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <b style={{ fontSize: 13 }}>Recently Updated Grievances</b>
            <button className="btn btn-light btn-small" onClick={() => onNavigate('my-complaints')}>
              View Register
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myComplaints.slice(0, 4).map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => onInspect(c)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>{c.id}</code>
                    <span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span>
                  </div>
                  <b style={{ fontSize: 12, display: 'block', marginTop: 3 }}>{c.title}</b>
                  <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>{c.area} · {formatDate(c.createdAt)}</small>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <b style={{ fontSize: 13 }}>Upcoming Service Appointments</b>
            <button className="btn btn-light btn-small" onClick={() => onNavigate('services')}>
              Book Service
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myServices.map(s => (
              <div
                key={s.reference_code}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <code style={{ fontSize: 10, color: 'var(--accent-purple)', fontWeight: 700 }}>{s.reference_code}</code>
                  <span className={`status-chip ${s.status.toLowerCase()}`}>{s.status}</span>
                </div>
                <b style={{ fontSize: 12 }}>{s.service_type}</b>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, color: 'var(--text-muted)', fontSize: 10 }}>
                  <span><Calendar size={11} style={{ verticalAlign: 'middle' }} /> {s.preferred_date}</span>
                  <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {s.time_slot}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 2. REPORT A PROBLEM / LODGE COMPLAINT (WITH MAP PICKER & DRAFT)
// ==========================================================================
function LodgeComplaintView({ session, departments, onSuccess, onSaveDraft, setComplaints }) {
  const [category, setCategory] = useState('Roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [safetyRisk, setSafetyRisk] = useState(false);
  const [department, setDepartment] = useState('Roads & Infrastructure');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = React.useRef(null);

  // Auto assign department based on category
  const handleCategoryChange = cat => {
    setCategory(cat);
    const config = CATEGORY_CONFIG.find(c => c.id === cat);
    if (config) {
      setDepartment(config.dept);
    } else {
      if (cat === 'Roads') setDepartment('Roads & Infrastructure');
      else if (cat === 'Garbage' || cat === 'Sanitation') setDepartment('Sanitation & Waste');
      else if (cat === 'Streetlights') setDepartment('Electrical & Streetlights');
      else if (cat === 'Water') setDepartment('Water Supply & Quality');
      else if (cat === 'Drainage') setDepartment('Drainage & Sewerage');
      else if (cat === 'Public Parks') setDepartment('Public Parks & Greenery');
    }
  };

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotoUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleLodge(isDraft = false) {
    if (!isDraft) {
      if (!category) {
        alert('Validation Error: Please select an Issue Category before lodging a complaint.');
        return;
      }
      if (!title.trim()) {
        alert('Validation Error: Complaint Title / Short Summary is required.');
        return;
      }
      if (!description.trim()) {
        alert('Validation Error: Detailed Problem Description is required.');
        return;
      }
      if (!area) {
        alert('Mandatory Information Required: You must select the Locality / Ward where the issue is located, otherwise your complaint cannot be taken by municipal authorities.');
        return;
      }
      if (!address.trim()) {
        alert('Mandatory Information Required: Please enter the Exact Street Address where the issue is situated.');
        return;
      }
    }

    const payload = {
      citizen: session.name,
      email: session.email,
      phone: session.phone || '9876543210',
      category,
      title,
      description,
      area: area || 'Central Zone',
      address,
      landmark,
      latitude: 18.5204,
      longitude: 73.8567,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      priority,
      severity: priority,
      safetyRisk,
      department,
      isDraft,
      expectedResolutionDate: new Date(Date.now() + 48 * 3600000).toISOString().slice(0, 10)
    };

    let generatedId = `CMP-2026-${Date.now().toString().slice(-6)}`;
    try {
      const res = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.id) generatedId = res.id;
    } catch {}

    const fullComplaint = {
      ...payload,
      id: generatedId,
      status: isDraft ? 'Draft' : 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ action: isDraft ? 'Saved draft' : 'Complaint registered', by: session.name, at: new Date().toISOString() }]
    };

    setComplaints(prev => [fullComplaint, ...prev]);

    if (isDraft) {
      onSaveDraft(generatedId);
    } else {
      onSuccess(generatedId);
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <TabIntroBanner
        badge="Citizen Civic Initiative · Lodge Complaint"
        title="Report a Civic Problem in Your Locality"
        icon={FilePlus2}
        desc="Report everyday municipal problems like broken roads, uncollected garbage, water leaks, or non-functional streetlights in your neighborhood. Your complaint is automatically routed to the responsible municipal department with an official resolution SLA."
        steps={[
          { title: 'Select Category & Details', desc: 'Pick the problem category, provide a title, and give an accurate description of the issue.' },
          { title: 'Locality & Street Address', desc: 'Select your municipal ward and exact street address so field inspection crews can locate it.' },
          { title: 'Upload Photo & Submit', desc: 'Attach an optional photograph from your device to help municipal engineers assess urgency.' }
        ]}
        tags={['⚡ 48-Hour SLA Guarantee', '📍 Auto Ward Routing', '🔒 Official Audit Trail']}
      />

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={e => { e.preventDefault(); handleLodge(false); }}>
          {/* Step 1: Category Selector (Clean text buttons without emojis) */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              Step 1: Select Issue Category *
            </label>
            <div className="category-picker-grid">
              {CATEGORY_CONFIG.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-select-card ${category === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span className="category-card-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Title & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label>Complaint Title / Short Summary *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole causing hazard near school gate"
              />
            </div>
            <div className="form-group">
              <label>Severity Level</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Step 2b: Description */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Detailed Problem Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the exact location, duration of the issue, and how it impacts residents..."
            />
          </div>

          {/* Step 3: Location Details (Mandatory Ward & Street Address) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label>City Zone / Locality Ward *</label>
              <select value={area} onChange={e => setArea(e.target.value)} required>
                <option value="">-- Select Locality / Ward (Mandatory) * --</option>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Responsible Department (Auto-Allocated)</label>
              <input
                type="text"
                readOnly
                value={department}
                style={{ background: 'var(--bg-surface-alt)', fontWeight: 600, color: 'var(--primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label>Exact Street Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 14 MG Road, Near Municipal School Gate 2"
              />
            </div>
            <div className="form-group">
              <label>Prominent Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Post Office"
              />
            </div>
          </div>

          {/* Step 4: Supporting Photo Evidence (Real file upload only, no sample photo chips) */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              Step 4: Supporting Photographic Evidence (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {photoUrl ? (
              <div className="photo-preview-card">
                <img src={photoUrl} alt="Evidence Preview" />
                <div style={{ flex: 1 }}>
                  <b style={{ display: 'block', fontSize: 12, color: 'var(--text-primary)' }}>Photo Evidence Attached</b>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>This image will be sent to the assigned municipal field team.</small>
                </div>
                <button
                  type="button"
                  className="btn btn-small"
                  style={{ color: '#e11d48', borderColor: '#e11d48' }}
                  onClick={() => setPhotoUrl('')}
                >
                  <Trash2 size={13} /> Remove Photo
                </button>
              </div>
            ) : (
              <div>
                <div className="photo-uploader-box" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={26} color="var(--primary)" />
                  <div>
                    <b style={{ display: 'block', fontSize: 13 }}>Click to Upload Photo from Device</b>
                    <small style={{ color: 'var(--text-muted)' }}>Supports JPG, PNG from your phone camera or computer</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Modern Safety Risk Toggle Switch */}
          <div style={{ marginBottom: 22, padding: '14px 16px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <ToggleSwitch
              checked={safetyRisk}
              onChange={setSafetyRisk}
              label="Immediate Public Safety Hazard"
              subtext="Toggle ON for exposed electrical wires, collapsed road sinkholes, or active chemical leaks to trigger Emergency SLA"
              isDanger={true}
              id="safety-risk-toggle"
            />
          </div>

          {/* Expected SLA Notice */}
          <div style={{ padding: '12px 16px', background: 'var(--primary-subtle)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock3 size={16} color="var(--primary)" />
            <span>
              Expected Municipal SLA Response Time: <b>{safetyRisk ? '24 Hours (Urgent Hazard)' : '48 Hours (Standard SLA)'}</b> from submission timestamp.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => handleLodge(true)}
            >
              <Save size={15} /> Save as Draft
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '11px 24px', fontSize: 13, fontWeight: 700 }}>
              <Send size={15} /> Submit Official Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// 3. MY COMPLAINTS / TRACK COMPLAINTS (WITH 5-STAGE TIMELINE TRACKER)
// ==========================================================================
function MyComplaintsView({
  complaints,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  layoutMode,
  setLayoutMode,
  onInspect,
  onPrintTicket,
  onReopen,
  onNavigate
}) {
  return (
    <div>
      <TabIntroBanner
        badge="Grievance Tracker & Resolution"
        title="My Registered Complaints & Live Progress"
        icon={ClipboardList}
        desc="What this tab is for: Monitor the live progress of all complaints you have submitted. Follow each complaint through the 5-stage timeline (Submitted → Under Review → Assigned → In Progress → Resolved), inspect official officer notes, view before/after resolution evidence, or print official acknowledgement slips."
        tags={['📊 5-Stage Lifecycle', '⏱️ Timeline Tracking', '🧾 Printable Receipts']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><ClipboardList size={13} /> CITIZEN TRACKER · GRIEVANCE REGISTER</div>
          <h1>My Lodged Complaints</h1>
          <p>Monitor official resolution timelines, assigned teams, and municipal verification updates.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => onNavigate('lodge')}>
            <FilePlus2 size={15} /> Lodge New Complaint
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="filter-bar" style={{ marginBottom: 18 }}>
        <div className="search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by Complaint ID, title, zone or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Reopened">Reopened</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Sleek Segmented Switch (Table vs Cards) */}
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn ${layoutMode === 'table' ? 'active' : ''}`}
            onClick={() => setLayoutMode('table')}
          >
            <Table size={13} /> Table View
          </button>
          <button
            type="button"
            className={`segmented-btn ${layoutMode === 'card' ? 'active' : ''}`}
            onClick={() => setLayoutMode('card')}
          >
            <LayoutGrid size={13} /> Cards View
          </button>
        </div>
      </div>

      {/* Table Layout */}
      {layoutMode === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint Ref</th>
                <th>Category</th>
                <th>Title & Location</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No complaints match your search filters.
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id}>
                    <td>
                      <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 11 }}>{c.id}</b>
                      {c.safetyRisk && <span style={{ marginLeft: 4, color: '#e11d48', fontSize: 10 }}>⚠️ Risk</span>}
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <b>{c.title}</b>
                      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{c.area} · {c.address}</small>
                    </td>
                    <td>{c.department}</td>
                    <td>
                      <span className={`priority-chip ${c.priority.toLowerCase()}`}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span>
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="icon-button" title="View Timeline & Details" onClick={() => onInspect(c)}>
                          <Eye size={14} />
                        </button>
                        <button className="icon-button" title="Print Acknowledgement Receipt" onClick={() => onPrintTicket(c)}>
                          <Printer size={14} />
                        </button>
                        {c.status === 'Resolved' && (
                          <button className="icon-button" title="Reopen if persistent" onClick={() => onReopen(c)}>
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {complaints.map(c => (
            <div key={c.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span>
                <span className={`priority-chip ${c.priority.toLowerCase()}`}>{c.priority} Priority</span>
              </div>

              <div>
                <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 11 }}>{c.id}</b>
                <h3 style={{ margin: '4px 0 6px', fontSize: 14 }}>{c.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: 44, overflow: 'hidden' }}>
                  {c.description}
                </p>
              </div>

              {/* 5-Stage Stepper Preview */}
              <div className="timeline-stepper" style={{ margin: '4px 0 10px' }}>
                {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((st, idx) => {
                  const stages = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
                  const curIdx = c.status === 'Resolved' ? 4 : c.status === 'In Progress' ? 3 : c.status === 'Assigned' ? 2 : 1;
                  const isDone = idx <= curIdx;
                  return (
                    <div key={st} className={`stepper-stage ${isDone ? 'completed' : ''}`}>
                      <div className="stepper-circle">{isDone ? <Check size={12} /> : idx + 1}</div>
                      <span className="stepper-label" style={{ fontSize: 9 }}>{st}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>{c.area} · {formatDate(c.createdAt)}</small>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-light btn-small" onClick={() => onPrintTicket(c)}>
                    <Printer size={12} /> Ticket
                  </button>
                  <button className="btn btn-primary btn-small" onClick={() => onInspect(c)}>
                    <Eye size={12} /> Inspect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 4. MANAGE MY COMPLAINTS (EDIT, WITHDRAW, DRAFT MANAGEMENT)
// ==========================================================================
function ManageComplaintsView({ complaints, onEdit, onWithdraw, onDeleteDraft, onInspect }) {
  const eligibleForEdit = complaints.filter(c => ['Open', 'Submitted', 'Draft'].includes(c.status));
  const activeHistory = complaints.filter(c => !['Draft'].includes(c.status));

  return (
    <div>
      <TabIntroBanner
        badge="Citizen Autonomy · Manage Grievances"
        title="Manage Your Submissions & Drafts"
        icon={Edit3}
        desc="What this tab is for: Modify complaint details (title, description, address) before official municipal verification, withdraw reports if the problem has already been solved on-site (soft-deleted with full municipal audit history intact), or permanently delete unfinished drafts."
        tags={['✏️ Edit Before Triage', '🛑 Official Soft-Withdrawal', '🗑️ Delete Drafts']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Edit3 size={13} /> CITIZEN AUTONOMY · MANAGE GRIEVANCES</div>
          <h1>Manage Your Submissions & Drafts</h1>
          <p>
            Citizens can edit details or add photographs while complaints are under initial review, withdraw unresolved reports,
            or permanently remove unsubmitted drafts. Official history is preserved for municipal auditing.
          </p>
        </div>
      </div>

      {/* Eligible complaints for editing */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Edit size={16} color="var(--primary)" /> Editable Submissions & Saved Drafts ({eligibleForEdit.length})
        </h3>

        {eligibleForEdit.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            No editable complaints or drafts found. All other complaints have progressed to official municipal assignment.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {eligibleForEdit.map(c => (
              <div key={c.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <code style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>{c.id}</code>
                  <span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span>
                </div>

                <b style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{c.title}</b>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                  {c.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  <button className="btn btn-light btn-small" onClick={() => onInspect(c)}>
                    <Eye size={12} /> View
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {c.isDraft ? (
                      <button className="btn btn-small" style={{ color: '#e11d48', borderColor: '#e11d48' }} onClick={() => onDeleteDraft(c)}>
                        <Trash2 size={12} /> Delete Draft
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-light btn-small" onClick={() => onEdit(c)}>
                          <Edit size={12} /> Edit Details
                        </button>
                        <button className="btn btn-small" style={{ color: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => onWithdraw(c)}>
                          Withdraw
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Audit Trail */}
      <div>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>Citizen Submission & Cancellation Ledger</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Locality</th>
                <th>Status</th>
                <th>Submission Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activeHistory.map(c => (
                <tr key={c.id}>
                  <td><code style={{ fontSize: 11, color: 'var(--primary)' }}>{c.id}</code></td>
                  <td><b>{c.title}</b></td>
                  <td>{c.category}</td>
                  <td>{c.area}</td>
                  <td><span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span></td>
                  <td>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 5. MUNICIPAL SERVICES / SERVICE REQUESTS VIEW
// ==========================================================================
function CitizenServicesView({ session, services, setServices, showToast }) {
  const [serviceType, setServiceType] = useState('Bulk Waste Collection');
  const [address, setAddress] = useState('Flat 402, Green Meadows Apartment, Lake View Road');
  const [locality, setLocality] = useState('North Zone');
  const [landmark, setLandmark] = useState('Near Community Park');
  const [preferredDate, setPreferredDate] = useState(() => new Date(Date.now() + 24 * 3600000 * 3).toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('Morning (08:00 - 12:00)');
  const [notes, setNotes] = useState('');

  const SERVICE_CATALOG = [
    { title: 'Bulk Waste Collection', desc: 'Furniture, scrap metals, renovation debris removal' },
    { title: 'Water Tanker Delivery', desc: 'Potable water supply tanker for residential societies' },
    { title: 'Missed Garbage Pickup', desc: 'Scheduled collection vehicle missed address' },
    { title: 'Streetlight Maintenance', desc: 'Individual pole inspection and replacement' },
    { title: 'Tree Pruning & Park Care', desc: 'Overhanging branches and public park cleanup' },
    { title: 'Drainage Desilting', desc: 'Residential gutter cleaning and stormwater clearing' }
  ];

  async function handleBookService(e) {
    e.preventDefault();
    const payload = {
      citizen_name: session.name,
      citizen_email: session.email,
      phone: '9876543210',
      service_type: serviceType,
      address,
      locality,
      landmark,
      preferred_date: preferredDate,
      time_slot: timeSlot,
      notes
    };

    let generatedCode = `SR-2026-${Date.now().toString().slice(-4)}`;
    try {
      const res = await apiRequest('/services', { method: 'POST', body: JSON.stringify(payload) });
      if (res.id) generatedCode = res.id;
    } catch {}

    const newRequest = {
      ...payload,
      reference_code: generatedCode,
      status: 'Pending',
      assigned_staff: 'Unassigned',
      created_at: new Date().toISOString()
    };

    setServices(prev => [newRequest, ...prev]);
    showToast(`Service request booked: ${generatedCode}`);
    setNotes('');
  }

  return (
    <div>
      <TabIntroBanner
        badge="Doorstep Municipal Utilities"
        title="Book Planned Municipal Services"
        icon={Building2}
        desc="What this tab is for: Book scheduled civic services directly to your residence — such as bulk-waste collection, drinking water tankers during shortages, missed garbage pickup, or tree trimming. Pick an available date and preferred time slot."
        tags={['📅 Scheduled Appointments', '🚚 Doorstep Delivery', '🔖 Trackable Request Code']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Building2 size={13} /> PLANNED MUNICIPAL SERVICES</div>
          <h1>Civic Service Bookings</h1>
          <p>Schedule planned city utility services including bulk waste removal, water tankers, and park pruning.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Booking Form */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Book a Municipal Civic Service</h3>

          <form onSubmit={handleBookService}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Service Type *</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
                {SERVICE_CATALOG.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Preferred Time Slot *</label>
                <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                  <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                  <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                  <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label>Service Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Locality Zone</label>
                <select value={locality} onChange={e => setLocality(e.target.value)}>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Special Instructions / Details</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Volume of waste, quantity in liters, or specific access instructions..."
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              <Calendar size={15} /> Confirm Service Slot Booking
            </button>
          </form>
        </div>

        {/* Existing Service Requests */}
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>My Service Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {services.map(s => (
              <div key={s.reference_code} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <code style={{ fontSize: 11, color: 'var(--accent-purple)', fontWeight: 700 }}>{s.reference_code}</code>
                  <span className={`status-chip ${s.status.toLowerCase()}`}>{s.status}</span>
                </div>
                <b style={{ fontSize: 13, display: 'block' }}>{s.service_type}</b>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, marginBottom: 8 }}>
                  {s.address} · {s.locality}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span>Slot: {s.preferred_date} ({s.time_slot})</span>
                  <span>Team: <b>{s.assigned_staff || 'Triage Assigned'}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 6. PUBLIC NOTICES VIEW
// ==========================================================================
function PublicNoticesView({ announcements, showToast, onInspect }) {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? announcements
    : announcements.filter(a => a.category === filter);

  return (
    <div>
      <TabIntroBanner
        badge="Public Dispatches & City Advisories"
        title="City Announcements & Infrastructure Notices"
        icon={Bell}
        desc="What this tab is for: Stay informed on scheduled water supply shutdowns, road diversions, electrical repair notices, and city-wide sanitation campaigns. Filter notices by topic or check affected zones."
        tags={['📢 Official City Broadcasts', '🚧 Road Closures', '💧 Water Interruption Alerts']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Bell size={13} /> PUBLIC DISPATCHES · CIVIC NOTICES</div>
          <h1>City Updates & Public Notices</h1>
          <p>Official municipal bulletins, planned utility shutdowns, road repairs, and sanitation schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => showToast('Subscribed to immediate SMS and Email alerts')}>
          <Mail size={15} /> Subscribe to City Alerts
        </button>
      </div>

      {/* Categories Bar - Sleek Segmented Switch */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="segmented-control">
          {['All', 'Water Shutdown', 'Road Closure', 'Sanitation Drive', 'Power Outage'].map(cat => (
            <button
              key={cat}
              type="button"
              className={`segmented-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(a => (
          <div key={a.announcement_id} className={`card notice-card ${a.priority.toLowerCase()}`} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className={`priority-chip ${a.priority.toLowerCase()}`}>{a.priority} Priority</span>
              <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Valid: {a.start_date} to {a.expiry_date}</small>
            </div>

            <h3 style={{ margin: '4px 0 8px', fontSize: 14 }}>{a.title}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
              {a.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                <MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {a.affected_area}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>By: {a.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// 7. CITIZEN FEEDBACK & RATINGS VIEW
// ==========================================================================
function CitizenFeedbackView({ session, complaints, services, feedbackList, setFeedbackList, showToast }) {
  const [selectedCase, setSelectedCase] = useState(complaints[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [isResolved, setIsResolved] = useState(true);
  const [comments, setComments] = useState('');
  const [dissatisfaction, setDissatisfaction] = useState('');

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    const payload = {
      reference_type: 'Complaint',
      reference_id: selectedCase || 'CMP-2026-1003',
      citizen_name: session.name,
      citizen_email: session.email,
      rating,
      comments,
      is_fully_resolved: isResolved ? 1 : 0,
      dissatisfaction_reason: isResolved ? null : dissatisfaction,
      official_response: null,
      escalated: isResolved ? 0 : 1
    };

    try {
      await apiRequest('/feedback', { method: 'POST', body: JSON.stringify(payload) });
    } catch {}

    setFeedbackList(prev => [payload, ...prev]);
    showToast('Feedback submitted to Municipal Evaluation Board');
    setComments('');
    setDissatisfaction('');
  }

  return (
    <div>
      <TabIntroBanner
        badge="Service Quality Evaluation"
        title="Citizen Feedback & Service Ratings"
        icon={Star}
        desc="What this tab is for: Evaluate whether municipal work solved the issue to your satisfaction. Rate response speed, technician conduct, and quality of repairs. If an issue was marked resolved prematurely, flag it here for official review and grievance escalation."
        tags={['⭐ 1-5 Star Ratings', '🔍 Ground Reality Check', '🚨 Grievance Escalation']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Star size={13} /> SERVICE QUALITY EVALUATION</div>
          <h1>Feedback and Service Ratings</h1>
          <p>Rate the efficiency of municipal field teams and report unresolved issues for executive escalation.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Submit Review */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Rate a Resolved Municipal Complaint</h3>

          <form onSubmit={handleSubmitFeedback}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Select Resolved Complaint</label>
              <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
                {complaints.length ? complaints.map(c => (
                  <option key={c.id} value={c.id}>{c.id} · {c.title}</option>
                )) : <option value="CMP-2026-1003">CMP-2026-1003 · Streetlight pole SL-18</option>}
              </select>
            </div>

            {/* Star Rating Selection */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Service Quality Rating (1 to 5 Stars)</label>
              <div className="star-rating-box" style={{ marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    <Star size={24} fill={star <= rating ? '#f59e0b' : 'none'} />
                  </button>
                ))}
                <span style={{ marginLeft: 10, fontWeight: 700, fontSize: 13, color: '#f59e0b' }}>
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Fully Resolved Choice Cards (No unstyled plain white box radio buttons) */}
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Was the problem completely resolved on the ground? *</label>
              <div className="choice-cards-grid">
                <div
                  className={`status-choice-card ${isResolved ? 'selected-positive' : ''}`}
                  onClick={() => setIsResolved(true)}
                >
                  <CheckCircle2 size={22} color={isResolved ? '#10b981' : 'var(--text-muted)'} />
                  <div>
                    <b style={{ display: 'block', fontSize: 13, color: isResolved ? '#10b981' : 'var(--text-primary)' }}>
                      Yes, Fully Resolved
                    </b>
                    <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Work was completed satisfactorily</small>
                  </div>
                </div>

                <div
                  className={`status-choice-card ${!isResolved ? 'selected-negative' : ''}`}
                  onClick={() => setIsResolved(false)}
                >
                  <AlertTriangle size={22} color={!isResolved ? '#e11d48' : 'var(--text-muted)'} />
                  <div>
                    <b style={{ display: 'block', fontSize: 13, color: !isResolved ? '#e11d48' : 'var(--text-primary)' }}>
                      No, Issue Persists (Escalate)
                    </b>
                    <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Work incomplete or problem returned</small>
                  </div>
                </div>
              </div>
            </div>

            {!isResolved && (
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ color: '#e11d48' }}>Describe Incomplete or Unsatisfactory Resolution *</label>
                <textarea
                  required
                  rows={2}
                  value={dissatisfaction}
                  onChange={e => setDissatisfaction(e.target.value)}
                  placeholder="Explain why the resolution was incomplete..."
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Citizen Comments & Commendations</label>
              <textarea
                rows={3}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Share your experience regarding worker conduct, speed, and quality of work..."
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              <Send size={15} /> Submit Service Quality Review
            </button>
          </form>
        </div>

        {/* Feedback History */}
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Your Submitted Feedback History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedbackList.map((fb, idx) => (
              <div key={idx} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <code style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>{fb.reference_id}</code>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={12} fill={s <= fb.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '6px 0' }}>
                  "{fb.comments || 'No comment provided'}"
                </p>
                {fb.official_response && (
                  <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--primary-subtle)', borderRadius: 6, fontSize: 10 }}>
                    <b style={{ color: 'var(--primary)' }}>Official Authority Response:</b> {fb.official_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 8. NOTIFICATIONS VIEW
// ==========================================================================
function NotificationsView({ notifications, setNotifications, showToast }) {
  async function markRead(id) {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {}
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
  }

  async function clearAll() {
    try {
      await apiRequest('/notifications/clear', { method: 'DELETE' });
    } catch {}
    setNotifications([]);
    showToast('Notifications cleared');
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <TabIntroBanner
        badge="Real-Time Telemetry & Alerts"
        title="My Civic Notifications & Activity Feed"
        icon={Bell}
        desc="What this tab is for: Your real-time municipal alert center. Receive instant alerts when triage officers review your reports, field technicians are dispatched, status changes occur, or city-wide emergency advisories are published."
        tags={['🔔 Real-Time Push', '⚡ Instant Status Updates', '📩 Ward Bulletins']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Bell size={13} /> REAL-TIME ALERTS & TELEMETRY</div>
          <h1>System & Service Notifications</h1>
          <p>Real-time notifications on status changes, field work order assignments, and city advisories.</p>
        </div>
        {notifications.length > 0 && (
          <button className="btn btn-light" onClick={clearAll}>
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
            You're all caught up! No unread notifications.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.notification_id}
              className={`notification-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => markRead(n.notification_id)}
            >
              <div className="notification-dot" style={{ opacity: n.is_read ? 0.2 : 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 12 }}>{n.title}</b>
                  <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>{n.created_at}</small>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {n.message}
                </p>
                {n.reference_id && (
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginTop: 4, display: 'inline-block' }}>
                    Reference: {n.reference_id}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// 9. CITIZEN PROFILE & SETTINGS
// ==========================================================================
function CitizenProfileView({ session, showToast }) {
  const [name, setName] = useState(session.name);
  const [phone, setPhone] = useState('9876543210');
  const [address, setAddress] = useState('Flat 402, Green Meadows Apartment, Lake View Road');
  const [locality, setLocality] = useState('North Zone');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(true);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <TabIntroBanner
        badge="Resident Identity & Preferences"
        title="My Citizen Profile & Settings"
        icon={User}
        desc="What this tab is for: Manage your verified resident details, phone number, saved locality ward, and communication preferences. Strict role-based security ensures citizen accounts cannot elevate themselves to Municipal Authority."
        tags={['👤 Verified Resident', '🔒 Permission Isolation', '⚙️ Channel Toggles']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><User size={13} /> CITIZEN IDENTITY & CREDENTIALS</div>
          <h1>My Profile & Account Settings</h1>
          <p>Manage your verified contact details, saved residential address, and communication preferences.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, marginBottom: 16 }}>Resident Details</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Registered Email Address</label>
            <input type="email" readOnly value={session.email} style={{ background: 'var(--bg-surface-alt)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label>Verified Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Preferred Locality Ward</label>
            <select value={locality} onChange={e => setLocality(e.target.value)}>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 18 }}>
          <label>Residential Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <b style={{ display: 'block', fontSize: 13, marginBottom: 12 }}>Notification Channels & Alerts</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ToggleSwitch
              checked={notifyEmail}
              onChange={setNotifyEmail}
              label="Email Dispatch & Status Updates"
              subtext="Receive automatic email alerts whenever an officer updates your grievance or schedules an appointment"
            />
            <ToggleSwitch
              checked={notifySMS}
              onChange={setNotifySMS}
              label="SMS Critical Alerts & Disruptions"
              subtext="Receive instant SMS advisories for water shutdown schedules and urgent public notices in your zone"
            />
          </div>
        </div>

        {/* Security Notice: Strict Role Isolation */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 10, color: 'var(--text-muted)', marginBottom: 18 }}>
          <Lock size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />
          Account Role: <b>Verified Resident (Citizen)</b>. Role elevation to Municipal Authority requires internal executive credential provisioning.
        </div>

        <button className="btn btn-primary" onClick={() => showToast('Profile preferences updated')}>
          <Save size={15} /> Save Changes
        </button>
      </div>
    </div>
  );
}

// ==========================================================================
// 10. AUTHORITY OPERATIONS COMMAND (DASHBOARD)
// ==========================================================================
function AuthorityDashboard({ complaints, stats, departments, workOrders, onNavigate, onInspect, exportCSV }) {
  return (
    <div>
      <TabIntroBanner
        badge="City-Wide Operations & Analytics"
        title="Municipal Operations Command & Executive KPIs"
        icon={Gauge}
        desc="What this tab is for: Real-time municipal operations command for executive directors and triage managers. Monitor city-wide grievance intake, resolution velocity, departmental SLA adherence, active field work orders, and high-priority public safety hazards."
        tags={['📊 City-Wide Overview', '⚡ Live SLA Adherence', '🚨 Emergency Incident Alerts']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Gauge size={13} /> MUNICIPAL OPERATIONS · LIVE TELEMETRY</div>
          <h1>Municipal Operations Command</h1>
          <p>City-wide operational overview of citizen grievances, department SLA compliance, and emergency response.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-light" onClick={() => exportCSV('city-complaints-registry.csv', complaints)}>
            <ArrowDownToLine size={15} /> Export Registry
          </button>
          <button className="btn btn-purple" onClick={() => onNavigate('audit-sql')}>
            <Terminal size={15} /> Open SQL Studio
          </button>
        </div>
      </div>

      {/* City KPIs */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('complaints')}>
          <div className="stat-icon open"><ClipboardList size={20} /></div>
          <div>
            <div className="stat-label">TOTAL GRIEVANCES</div>
            <div className="stat-value">{stats.total}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>All logged municipal cases</small>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('complaints')}>
          <div className="stat-icon assigned"><Clock3 size={20} /></div>
          <div>
            <div className="stat-label">UNRESOLVED QUEUE</div>
            <div className="stat-value">{stats.open + stats.inProgress}</div>
            <small style={{ color: 'var(--accent-amber)', fontSize: 10 }}>Requires triage or work order</small>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('work-orders')}>
          <div className="stat-icon in-progress"><Wrench size={20} /></div>
          <div>
            <div className="stat-label">ACTIVE WORK ORDERS</div>
            <div className="stat-value">{workOrders.filter(w => w.status !== 'Completed').length}</div>
            <small style={{ color: 'var(--primary)', fontSize: 10 }}>Field teams deployed</small>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('complaints')}>
          <div className="stat-icon resolved"><CheckCircle2 size={20} /></div>
          <div>
            <div className="stat-label">RESOLVED & VERIFIED</div>
            <div className="stat-value">{stats.resolved}</div>
            <small style={{ color: '#10b981', fontSize: 10 }}>
              {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 100}% SLA Clearance
            </small>
          </div>
        </div>
      </div>

      {/* Critical Incidents Warning Banner */}
      {stats.critical > 0 && (
        <div className="safety-risk-box" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} />
          <span>ALERT: {stats.critical} Safety-Critical Incident(s) active on city grid. Immediate department dispatch required.</span>
        </div>
      )}

      {/* Department Workload Ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <b style={{ fontSize: 13 }}>Department Workload & SLA Compliance</b>
            <button className="btn btn-light btn-small" onClick={() => onNavigate('departments')}>
              Manage Departments
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Head Officer</th>
                <th>Active Cases</th>
                <th>SLA Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.slice(0, 5).map(d => (
                <tr key={d.name}>
                  <td><b>{d.name}</b></td>
                  <td>{d.head_officer}</td>
                  <td><span className="nav-count">{d.active_cases}</span></td>
                  <td>{d.sla_hours}h</td>
                  <td><span className="status-chip active">{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Triage Feed */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <b style={{ fontSize: 13 }}>Recent Grievance Submissions</b>
            <button className="btn btn-light btn-small" onClick={() => onNavigate('complaints')}>
              Full Register
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {complaints.slice(0, 4).map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => onInspect(c)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ fontSize: 10, color: 'var(--primary)' }}>{c.id}</code>
                    <span className={`priority-chip ${c.priority.toLowerCase()}`}>{c.priority}</span>
                  </div>
                  <b style={{ fontSize: 12, display: 'block', marginTop: 3 }}>{c.title}</b>
                  <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>{c.area} · {c.department}</small>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 11. AUTHORITY COMPLAINT MANAGEMENT VIEW
// ==========================================================================
function AuthorityComplaintManagement({
  complaints,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  onInspect,
  onTriage,
  onCreateWorkOrder,
  exportCSV
}) {
  return (
    <div>
      <TabIntroBanner
        badge="Official Grievance Triage & Allocation"
        title="City-Wide Complaint Management & Work Allocation"
        icon={ClipboardList}
        desc="What this tab is for: The central operational desk for municipal officials. Review all citizen complaints across wards, verify photographic evidence, classify severity level, allocate to responsible departments, issue field work orders, and record official resolutions."
        tags={['📋 Master Jurisdiction Registry', '⚖️ Verification & Triage', '🛠️ Issue Work Orders']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><ClipboardList size={13} /> OFFICIAL GRIEVANCE REGISTER · DML/DQL</div>
          <h1>City-Wide Complaint Management</h1>
          <p>Inspect citizen reports, verify evidence, classify severity, and allocate municipal field work orders.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-light" onClick={() => exportCSV('city-complaints-registry.csv', complaints)}>
            <ArrowDownToLine size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 18 }}>
        <div className="search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by Complaint ID, citizen, title, or locality..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Reopened">Reopened</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Citizen Reference</th>
              <th>Category</th>
              <th>Title & Address</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned Worker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td><b style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 11 }}>{c.id}</b></td>
                <td>
                  <b>{c.citizen}</b>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>{c.email}</small>
                </td>
                <td>{c.category}</td>
                <td>
                  <b>{c.title}</b>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>{c.area} · {c.address}</small>
                </td>
                <td>{c.department}</td>
                <td><span className={`priority-chip ${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                <td><span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span></td>
                <td>{c.assignedTo || 'Unassigned'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-light btn-small" onClick={() => onInspect(c)}>
                      <Eye size={12} /> Inspect
                    </button>
                    <button className="btn btn-primary btn-small" onClick={() => onTriage(c)}>
                      <ShieldCheck size={12} /> Triage
                    </button>
                    <button className="btn btn-purple btn-small" title="Create Work Order" onClick={() => onCreateWorkOrder(c)}>
                      <Wrench size={12} /> Work Order
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================================
// 12. DEPARTMENT MANAGEMENT VIEW
// ==========================================================================
function DepartmentManagementView({ departments, setDepartments, complaints, showToast, onTransfer }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [head, setHead] = useState('');
  const [email, setEmail] = useState('');
  const [sla, setSla] = useState(48);

  async function handleCreateDept(e) {
    e.preventDefault();
    const payload = {
      name,
      description: `Municipal department for ${name}`,
      head_officer: head,
      contact_email: email,
      phone: '020-25501009',
      sla_hours: Number(sla),
      status: 'Active'
    };

    try {
      await apiRequest('/departments', { method: 'POST', body: JSON.stringify(payload) });
    } catch {}

    setDepartments(prev => [...prev, { ...payload, department_id: prev.length + 1, active_cases: 0 }]);
    showToast(`Department ${name} registered`);
    setShowAdd(false);
    setName('');
    setHead('');
    setEmail('');
  }

  return (
    <div>
      <TabIntroBanner
        badge="Municipal Operations Configuration"
        title="Municipal Departments & SLA Turnaround Targets"
        icon={Building2}
        desc="What this tab is for: Configure municipal divisions (Roads, Water, Sanitation, Drainage, Streetlights), set official SLA turnaround targets in hours, assign department heads, and toggle operational status. Transfer grievances between departments when jurisdictional re-allocation is required."
        tags={['🏢 6 Municipal Divisions', '⏱️ SLA Hours Config', '⚡ Active/Inactive Switch']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Building2 size={13} /> MUNICIPAL ADMINISTRATION · DIVISIONS</div>
          <h1>Department Management & Triage</h1>
          <p>Organize municipal departments, service categories, SLA turnaround targets, and transfer cases.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={15} /> Add New Department
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Register New Municipal Department</h3>
          <form onSubmit={handleCreateDept} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label>Department Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Public Health" />
            </div>
            <div className="form-group">
              <label>Head Officer *</label>
              <input type="text" required value={head} onChange={e => setHead(e.target.value)} placeholder="Officer Name" />
            </div>
            <div className="form-group">
              <label>Official Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="dept@smartcity.gov" />
            </div>
            <div className="form-group">
              <label>SLA Target (Hours)</label>
              <input type="number" required value={sla} onChange={e => setSla(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Department</button>
              <button type="button" className="btn btn-light" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {departments.map(d => (
          <div key={d.name} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <ToggleSwitch
                checked={d.status === 'Active'}
                onChange={() => {
                  const next = d.status === 'Active' ? 'Inactive' : 'Active';
                  setDepartments(prev => prev.map(item => item.name === d.name ? { ...item, status: next } : item));
                  showToast(`${d.name} operational status: ${next}`);
                }}
                label={d.status === 'Active' ? 'Active Division' : 'Inactive'}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>SLA: <b>{d.sla_hours}h Target</b></span>
            </div>

            <h3 style={{ margin: '4px 0 6px', fontSize: 14 }}>{d.name}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
              {d.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><small style={{ color: 'var(--text-muted)' }}>Department Head:</small> <b>{d.head_officer}</b></div>
              <div><small style={{ color: 'var(--text-muted)' }}>Email:</small> {d.contact_email}</div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="nav-count">{d.active_cases} Active Grievances</span>
                <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>96% SLA Adherence</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// 13. WORK ORDERS & STAFF MANAGEMENT VIEW
// ==========================================================================
function WorkOrdersAndStaffView({ workOrders, setWorkOrders, staff, setStaff, departments, complaints, showToast, onUpdateWO }) {
  const [tab, setTab] = useState('orders'); // 'orders' or 'staff'
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Field Technician');
  const [staffDept, setStaffDept] = useState('Roads & Infrastructure');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffStatus, setStaffStatus] = useState('Active');

  async function handleCreateStaff(e) {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      alert('Please enter staff name and official email address.');
      return;
    }
    const newStaff = {
      name: staffName.trim(),
      role: staffRole,
      department: staffDept,
      phone: staffPhone.trim() || '9876543210',
      email: staffEmail.trim().toLowerCase(),
      status: staffStatus,
      assigned_cases: 0
    };
    try {
      await apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify(newStaff)
      });
    } catch {}
    setStaff(prev => [newStaff, ...prev]);
    showToast(`Staff member ${staffName} registered successfully`);
    setShowAddStaff(false);
    setStaffName('');
    setStaffPhone('');
    setStaffEmail('');
  }

  return (
    <div>
      <TabIntroBanner
        badge="Field Workforce & Execution"
        title="Municipal Staff & Field Work Orders"
        icon={Wrench}
        desc="Translates verified citizen reports into actionable engineering field work orders. Assign field technicians and repair crews, set completion deadlines, record materials consumed, log cumulative labour hours, and maintain the municipal employee directory."
        steps={[
          { title: 'Track Active Work Orders', desc: 'Monitor pending and in-progress civic tasks assigned to departmental engineering crews.' },
          { title: 'Log Progress & Materials', desc: 'Click "Update Progress" to record labour hours spent, equipment deployed, and complete tasks.' },
          { title: 'Manage Staff Directory', desc: 'Switch to Staff Directory to recruit and register new field technicians or decommission existing staff.' }
        ]}
        tags={['🔨 Distinct Work Order Schema', '👷 Field Technician Roster', '📦 Materials & Labour Hours']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Wrench size={13} /> FIELD WORKFORCE & TASK EXECUTION</div>
          <h1>Staff & Municipal Work Orders</h1>
          <p>
            Convert verified grievances into actionable work orders, assign field workers, log materials used,
            and monitor completion evidence photos.
          </p>
        </div>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            <Wrench size={14} /> Work Orders ({workOrders.length})
          </button>
          <button
            type="button"
            className={`segmented-btn ${tab === 'staff' ? 'active' : ''}`}
            onClick={() => setTab('staff')}
          >
            <Users size={14} /> Staff Directory ({staff.length})
          </button>
        </div>
      </div>

      {tab === 'orders' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Code</th>
                <th>Linked Complaint</th>
                <th>Task Title</th>
                <th>Department</th>
                <th>Assigned Worker / Team</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Labour Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(wo => (
                <tr key={wo.order_code}>
                  <td><b style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: 11 }}>{wo.order_code}</b></td>
                  <td><code>{wo.complaint_ref || 'Scheduled Service'}</code></td>
                  <td>
                    <b>{wo.title}</b>
                    {wo.materials_used && <small style={{ display: 'block', color: 'var(--text-muted)' }}>Materials: {wo.materials_used}</small>}
                  </td>
                  <td>{wo.department}</td>
                  <td><b>{wo.assigned_worker}</b></td>
                  <td><span className={`priority-chip ${wo.priority.toLowerCase()}`}>{wo.priority}</span></td>
                  <td><span className={`status-chip ${wo.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{wo.status}</span></td>
                  <td>{wo.labour_hours || 0} hrs</td>
                  <td>
                    <button type="button" className="btn btn-light btn-small" onClick={() => onUpdateWO(wo)}>
                      <Edit size={12} /> Update Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Staff Directory with Add and Delete capabilities */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <b style={{ fontSize: 13, color: 'var(--text-primary)' }}>Municipal Staff & Field Technicians</b>
              <small style={{ display: 'block', color: 'var(--text-muted)' }}>Total {staff.length} registered personnel available for dispatch</small>
            </div>
            <button type="button" className="btn btn-primary btn-small" onClick={() => setShowAddStaff(!showAddStaff)}>
              <Plus size={13} /> {showAddStaff ? 'Cancel Form' : 'Add New Staff Member'}
            </button>
          </div>

          {showAddStaff && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, marginBottom: 12 }}>Register New Staff Member</h3>
              <form onSubmit={handleCreateStaff}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      placeholder="e.g. Ramesh Varma"
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation / Role *</label>
                    <select value={staffRole} onChange={e => setStaffRole(e.target.value)}>
                      <option value="Field Technician">Field Technician</option>
                      <option value="Electrical Lineman">Electrical Lineman</option>
                      <option value="Sanitation Supervisor">Sanitation Supervisor</option>
                      <option value="Water Pipeline Inspector">Water Pipeline Inspector</option>
                      <option value="Road Works Foreman">Road Works Foreman</option>
                      <option value="Horticulture Specialist">Horticulture Specialist</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <select value={staffDept} onChange={e => setStaffDept(e.target.value)}>
                      {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div className="form-group">
                    <label>Official Email *</label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={e => setStaffEmail(e.target.value)}
                      placeholder="staff.name@smartcity.gov"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={staffPhone}
                      onChange={e => setStaffPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Status</label>
                    <select value={staffStatus} onChange={e => setStaffStatus(e.target.value)}>
                      <option value="Active">Active / On Duty</option>
                      <option value="Available">Available</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-light" onClick={() => setShowAddStaff(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save to Directory</button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {staff.map(sm => (
              <div key={sm.email} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className={`status-chip ${sm.status.toLowerCase()}`}>{sm.status}</span>
                  <span style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700 }}>{sm.role}</span>
                </div>
                <h3 style={{ margin: '4px 0 2px', fontSize: 14 }}>{sm.name}</h3>
                <small style={{ color: 'var(--text-muted)' }}>{sm.department}</small>
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 10, paddingTop: 8, fontSize: 11 }}>
                  <div>Email: {sm.email}</div>
                  <div>Phone: {sm.phone}</div>
                  <div style={{ marginTop: 6, color: 'var(--primary)', fontWeight: 600 }}>Active Cases: {sm.assigned_cases}</div>
                </div>
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to remove ${sm.name} from the active staff directory?`)) {
                        try {
                          await apiRequest(`/staff/${encodeURIComponent(sm.email)}`, { method: 'DELETE' });
                        } catch {}
                        setStaff(prev => prev.filter(s => s.email !== sm.email));
                        showToast(`Staff member ${sm.name} removed from directory`);
                      }
                    }}
                  >
                    <Trash2 size={12} /> Remove Staff
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 14. INFRASTRUCTURE & ASSET MANAGEMENT VIEW
// ==========================================================================
function AssetManagementView({ assets, setAssets, showToast, onInspectAsset }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showRegister, setShowRegister] = useState(false);
  const [inspectingAsset, setInspectingAsset] = useState(null);

  // New Asset Form State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Streetlights');
  const [newZone, setNewZone] = useState('Central Zone');
  const [newAddr, setNewAddr] = useState('');
  const [newHealth, setNewHealth] = useState(90);

  // Log Inspection Modal State
  const [inspHealth, setInspHealth] = useState(85);
  const [inspCondition, setInspCondition] = useState('Good');
  const [inspStatus, setInspStatus] = useState('Operational');
  const [inspNotes, setInspNotes] = useState('');

  const filteredAssets = assets.filter(a => {
    const matchesSearch = !search ||
      a.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_id?.toLowerCase().includes(search.toLowerCase()) ||
      a.location_address?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const optimalCount = assets.filter(a => Number(a.health_score) >= 80).length;
  const warningCount = assets.filter(a => Number(a.health_score) >= 50 && Number(a.health_score) < 80).length;
  const criticalCount = assets.filter(a => Number(a.health_score) < 50).length;

  async function handleRegisterAsset(e) {
    e.preventDefault();
    if (!newId.trim() || !newName.trim() || !newAddr.trim()) {
      alert('Please fill out all mandatory fields: Asset ID, Asset Name, and Address.');
      return;
    }
    const newAsset = {
      asset_id: newId.trim().toUpperCase(),
      asset_name: newName.trim(),
      category: newCat,
      zone: newZone,
      location_address: newAddr.trim(),
      installation_date: new Date().toISOString().slice(0, 10),
      condition: newHealth > 80 ? 'Good' : newHealth > 50 ? 'Fair' : 'Poor',
      health_score: Number(newHealth) || 90,
      status: 'Operational',
      last_inspection: new Date().toISOString().slice(0, 10),
      failure_count: 0
    };
    try {
      await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(newAsset)
      });
    } catch {}
    setAssets(prev => [newAsset, ...prev]);
    showToast(`Asset ${newAsset.asset_id} registered into city inventory!`);
    setShowRegister(false);
    setNewId('');
    setNewName('');
    setNewAddr('');
    setNewHealth(90);
  }

  function openInspection(a) {
    setInspectingAsset(a);
    setInspHealth(a.health_score || 85);
    setInspCondition(a.condition || 'Good');
    setInspStatus(a.status || 'Operational');
    setInspNotes('');
  }

  async function handleSaveInspection(e) {
    e.preventDefault();
    if (!inspectingAsset) return;
    const patch = {
      health_score: Number(inspHealth),
      condition: inspCondition,
      status: inspStatus,
      last_inspection: new Date().toISOString().slice(0, 10)
    };
    try {
      await apiRequest(`/assets/${inspectingAsset.asset_id}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      });
    } catch {}
    setAssets(prev => prev.map(a => a.asset_id === inspectingAsset.asset_id ? { ...a, ...patch } : a));
    showToast(`Safety inspection logged for ${inspectingAsset.asset_id}!`);
    setInspectingAsset(null);
  }

  return (
    <div>
      <TabIntroBanner
        badge="Physical City Infrastructure Ledger"
        title="Infrastructure & Capital Assets Management"
        icon={HardDrive}
        desc="Why this tab exists: Municipal corporations cannot wait for citizens to suffer or complain before maintaining public property. This ledger tracks all city physical assets (transformers, arterial roads, water pipelines, streetlights, storm drains). Municipal engineers track condition health scores (0–100), log routine safety inspections, and trigger preventative repair orders before public failures occur."
        steps={[
          { title: 'Monitor Asset Health Ratings', desc: 'Inspect live condition ratings (0–100) across transformers, water pipelines, roads, and streetlights.' },
          { title: 'Log Preventative Safety Inspections', desc: 'Click "Log Safety Inspection" on any asset to record field test readings, condition status, and inspection dates.' },
          { title: 'Register New Public Works Assets', desc: 'Click "+ Register City Asset" to add new municipal infrastructure assets into the official city inventory.' }
        ]}
        tags={['🛣️ Physical Assets Ledger', '🩺 0-100 Condition Scores', '🔧 Preventative Maintenance']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><HardDrive size={13} /> PUBLIC INFRASTRUCTURE REGISTRY</div>
          <h1>Infrastructure & Asset Management</h1>
          <p>
            Proactive physical asset ledger. Track condition health ratings, log safety inspections, and schedule preventative maintenance.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowRegister(!showRegister)}>
          <Plus size={15} /> {showRegister ? 'Cancel Registration' : 'Register New City Asset'}
        </button>
      </div>

      {/* High-level Condition KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Total Registered Assets</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>{assets.length}</div>
          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>Tracked Municipal Infrastructure</span>
        </div>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #10b981' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Optimal Condition (&gt;80%)</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#10b981' }}>{optimalCount}</div>
          <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>Healthy &amp; Operational</span>
        </div>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #f59e0b' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Inspection Due (50–79%)</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>{warningCount}</div>
          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>Routine Audit Required</span>
        </div>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #e11d48' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Critical / Defective (&lt;50%)</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#e11d48' }}>{criticalCount}</div>
          <span style={{ fontSize: 10, color: '#e11d48', fontWeight: 600 }}>Emergency Repair Urgent</span>
        </div>
      </div>

      {/* Register Asset Form */}
      {showRegister && (
        <div className="card" style={{ padding: 22, marginBottom: 22, border: '1.5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, margin: 0 }}>Register New Public Works Asset</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adds record into `city_assets` table</span>
          </div>
          <form onSubmit={handleRegisterAsset}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label>Asset Identification Code *</label>
                <input
                  type="text"
                  required
                  value={newId}
                  onChange={e => setNewId(e.target.value)}
                  placeholder="e.g. TR-2026-09"
                />
              </div>
              <div className="form-group">
                <label>Asset Name / Description *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. 500kVA Distribution Transformer"
                />
              </div>
              <div className="form-group">
                <label>Asset Category *</label>
                <select value={newCat} onChange={e => setNewCat(e.target.value)}>
                  <option value="Streetlights">Streetlights &amp; Lighting</option>
                  <option value="Water Supply">Water Supply &amp; Pipelines</option>
                  <option value="Roads">Roads &amp; Flyovers</option>
                  <option value="Drainage">Drainage &amp; Culverts</option>
                  <option value="Transformers">Electrical Transformers</option>
                  <option value="Sanitation">Waste Compactors &amp; Bins</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label>Zone / Ward *</label>
                <select value={newZone} onChange={e => setNewZone(e.target.value)}>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Exact Geographic Address / Landmark *</label>
                <input
                  type="text"
                  required
                  value={newAddr}
                  onChange={e => setNewAddr(e.target.value)}
                  placeholder="e.g. Sector 4 Junction, Opposite Market Gate"
                />
              </div>
              <div className="form-group">
                <label>Initial Health Score (0–100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newHealth}
                  onChange={e => setNewHealth(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-light" onClick={() => setShowRegister(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save to City Assets Registry</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="filter-bar" style={{ marginBottom: 18 }}>
        <div className="search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by Asset ID, asset name, or location address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Asset Categories</option>
          <option value="Streetlights">Streetlights</option>
          <option value="Water Supply">Water Supply</option>
          <option value="Roads">Roads &amp; Bridges</option>
          <option value="Drainage">Drainage</option>
          <option value="Transformers">Transformers</option>
          <option value="Sanitation">Sanitation</option>
        </select>
      </div>

      {/* Asset Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filteredAssets.map(a => {
          const score = Number(a.health_score) || 80;
          const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#e11d48';

          return (
            <div key={a.asset_id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <code style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>{a.asset_id}</code>
                <span className={`status-chip ${a.status?.toLowerCase().replace(/[\s/]+/g, '-')}`}>{a.status}</span>
              </div>

              <h3 style={{ margin: '4px 0 2px', fontSize: 14 }}>{a.asset_name}</h3>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>{a.location_address}</small>

              {/* Health Score Meter */}
              <div style={{ background: 'var(--bg-surface-alt)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Condition Health Rating</span>
                  <b style={{ color: scoreColor }}>{score} / 100 ({a.condition || 'Operational'})</b>
                </div>
                <div className="budget-bar-track">
                  <div
                    className="budget-bar-fill"
                    style={{
                      width: `${score}%`,
                      background: scoreColor
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginBottom: 12 }}>
                <span>Zone: <b style={{ color: 'var(--text-primary)' }}>{a.zone}</b></span>
                <span>Last Inspected: <b>{a.last_inspection || 'Recent'}</b></span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-light btn-small"
                  onClick={() => openInspection(a)}
                >
                  <Eye size={12} /> Log Safety Inspection
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Inspection Modal */}
      {inspectingAsset && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>PREVENTATIVE SAFETY INSPECTION</div>
                <h3 style={{ margin: 0 }}>Inspect Asset: {inspectingAsset.asset_id}</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setInspectingAsset(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveInspection} className="modal-body">
              <div style={{ background: 'var(--bg-surface-alt)', padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Asset:</span>
                  <b>{inspectingAsset.asset_name}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <span>{inspectingAsset.location_address}</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Updated Health Score (0–100): <b>{inspHealth}%</b></label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={inspHealth}
                  onChange={e => setInspHealth(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group">
                  <label>Physical Condition *</label>
                  <select value={inspCondition} onChange={e => setInspCondition(e.target.value)}>
                    <option value="Good">Good (No defects detected)</option>
                    <option value="Fair">Fair (Minor wear &amp; tear)</option>
                    <option value="Poor">Poor (Degraded, needs service)</option>
                    <option value="Critical">Critical (Failure imminent)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Operational Status *</label>
                  <select value={inspStatus} onChange={e => setInspStatus(e.target.value)}>
                    <option value="Operational">Operational</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Field Engineer Inspection Notes</label>
                <textarea
                  rows={3}
                  value={inspNotes}
                  onChange={e => setInspNotes(e.target.value)}
                  placeholder="Record structural readings, voltage measurements, corrosion level, or required repairs..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-light" onClick={() => setInspectingAsset(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Inspection Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 15. AUTHORITY SERVICE REQUEST MANAGEMENT VIEW
// ==========================================================================
function AuthorityServiceRequestsView({ services, setServices, staff, showToast }) {
  async function handleUpdateStatus(code, newStatus) {
    try {
      await apiRequest(`/services/${code}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
    } catch {}
    setServices(prev => prev.map(s => s.reference_code === code ? { ...s, status: newStatus } : s));
    showToast(`Service request ${code} updated to ${newStatus}`);
  }

  return (
    <div>
      <TabIntroBanner
        badge="Civic Services Dispatch Desk"
        title="Service Request Management & Dispatch"
        icon={Truck}
        desc="What this tab is for: Review citizen bookings for scheduled doorstep services (potable water tankers, bulk waste clearing, missed garbage retrieval, and tree pruning). Check crew and vehicle availability, approve or reschedule bookings, and dispatch field technicians."
        tags={['🚚 Fleet & Crew Dispatch', '📅 Calendar Booking Approvals', '📦 Service Completion Tracking']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Truck size={13} /> CIVIC SERVICES DISPATCH DESK</div>
          <h1>Service Request Management</h1>
          <p>Review citizen bookings for bulk waste, water tankers, and tree care. Allocate trucks and track execution.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Citizen Details</th>
              <th>Service Type</th>
              <th>Address & Locality</th>
              <th>Preferred Slot</th>
              <th>Status</th>
              <th>Assigned Crew</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.reference_code}>
                <td><b style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{s.reference_code}</b></td>
                <td>
                  <b>{s.citizen_name}</b>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>{s.phone}</small>
                </td>
                <td><b>{s.service_type}</b></td>
                <td>{s.address} ({s.locality})</td>
                <td>{s.preferred_date} · {s.time_slot}</td>
                <td><span className={`status-chip ${s.status.toLowerCase()}`}>{s.status}</span></td>
                <td>{s.assigned_staff || 'Unassigned'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {s.status === 'Pending' && (
                      <button className="btn btn-primary btn-small" onClick={() => handleUpdateStatus(s.reference_code, 'Scheduled')}>
                        Approve & Slot
                      </button>
                    )}
                    {s.status === 'Scheduled' && (
                      <button className="btn btn-purple btn-small" onClick={() => handleUpdateStatus(s.reference_code, 'Completed')}>
                        Mark Completed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================================
// 16. ANNOUNCEMENTS MANAGEMENT VIEW (AUTHORITY)
// ==========================================================================
function AnnouncementsManagementView({ announcements, setAnnouncements, departments, showToast }) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Water Shutdown');
  const [department, setDepartment] = useState('Water Supply & Quality');
  const [area, setArea] = useState('Central Zone (Wards 3 & 4)');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');

  async function handlePublish(e) {
    e.preventDefault();
    const payload = {
      title,
      category,
      department,
      affected_area: area,
      description,
      start_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 24 * 3600000 * 3).toISOString().slice(0, 10),
      status: 'Published',
      priority
    };

    try {
      await apiRequest('/announcements', { method: 'POST', body: JSON.stringify(payload) });
    } catch {}

    setAnnouncements(prev => [payload, ...prev]);
    showToast('Public advisory notice published successfully');
    setShowCreate(false);
    setTitle('');
    setDescription('');
  }

  return (
    <div>
      <TabIntroBanner
        badge="Official Communications Bureau"
        title="Public Notices & Announcements Publishing Desk"
        icon={Sparkles}
        desc="What this tab is for: Publish official municipal advisories directly to the Citizen Portal. Set affected zones, validity dates, urgency priority, and draft/published statuses for planned utility interruptions and road construction."
        tags={['📢 Citizen Broadcaster', '📍 Zone-Targeted Alerts', '📝 Draft & Publish Workflow']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Sparkles size={13} /> OFFICIAL COMMUNICATIONS BUREAU</div>
          <h1>Public Notices & Announcements Desk</h1>
          <p>Publish planned water shutdowns, road closures, and maintenance notices directly to citizen portals.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={15} /> Draft Announcement
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Draft New Public Notice</h3>
          <form onSubmit={handlePublish}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label>Notice Headline *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 12-Hour Water Supply Interruption in Ward 4" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Water Shutdown">Water Shutdown</option>
                  <option value="Road Closure">Road Closure</option>
                  <option value="Sanitation Drive">Sanitation Drive</option>
                  <option value="Power Outage">Power Outage</option>
                  <option value="Public Notice">Public Notice</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label>Affected Locality / Wards *</label>
                <input type="text" required value={area} onChange={e => setArea(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Detailed Advisory Information *</label>
              <textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-light" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Publish to Public Board</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
        {announcements.map(a => (
          <div key={a.announcement_id || a.title} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className={`priority-chip ${a.priority.toLowerCase()}`}>{a.priority} Priority</span>
              <span className="status-chip active">{a.status}</span>
            </div>
            <h3 style={{ margin: '4px 0 6px', fontSize: 14 }}>{a.title}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
              {a.description}
            </p>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
              Affected: <b>{a.affected_area}</b> · Valid till: {a.expiry_date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// 17. BUDGET AND EXPENDITURE VIEW (AUTHORITY)
// ==========================================================================
function BudgetExpenditureView({ budgets, setBudgets, expenditures, setExpenditures, workOrders, departments, showToast }) {
  const [showExpense, setShowExpense] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  // Expense form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [dept, setDept] = useState('Roads & Infrastructure');
  const [woRef, setWoRef] = useState('');

  // Top-Up Budget form state
  const [topUpDept, setTopUpDept] = useState('Roads & Infrastructure');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpReason, setTopUpReason] = useState('');

  // Calculate high level fiscal metrics
  const totalAllocated = budgets.reduce((acc, b) => acc + (Number(b.allocated_amount) || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spent_amount) || 0), 0);
  const totalRemaining = budgets.reduce((acc, b) => acc + (Number(b.remaining_amount) || 0), 0);
  const utilizationPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  async function handleRecordExpense(e) {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid expense amount in Rupees.');
      return;
    }

    const payload = {
      budget_id: 1,
      work_order_ref: woRef || 'WO-2026-03',
      description: desc,
      amount: numAmount,
      department: dept,
      authorized_by: 'Standing Finance Committee',
      invoice_ref: `INV-${Date.now().toString().slice(-4)}`
    };

    try {
      await apiRequest('/expenditures', { method: 'POST', body: JSON.stringify(payload) });
    } catch {}

    setExpenditures(prev => [payload, ...prev]);
    // Deduct from department budget
    setBudgets(prev => prev.map(b => b.department === dept ? { ...b, spent_amount: b.spent_amount + numAmount, remaining_amount: b.remaining_amount - numAmount } : b));
    showToast(`Expenditure ₹${numAmount.toLocaleString()} recorded against ${dept}`);
    setShowExpense(false);
    setDesc('');
    setAmount('');
    setWoRef('');
  }

  async function handleTopUpBudget(e) {
    e.preventDefault();
    const numAmount = Number(topUpAmount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid budget amount in Rupees.');
      return;
    }

    setBudgets(prev => prev.map(b => b.department === topUpDept ? {
      ...b,
      allocated_amount: b.allocated_amount + numAmount,
      remaining_amount: b.remaining_amount + numAmount
    } : b));

    showToast(`Additional budget of ₹${(numAmount / 100000).toFixed(2)} Lakhs allocated to ${topUpDept}`);
    setShowTopUp(false);
    setTopUpAmount('');
    setTopUpReason('');
  }

  return (
    <div>
      <TabHelpSection
        badge="Municipal Fiscal Governance & Appropriations"
        title="Budget Allocation & Expenditure Tracking"
        icon={BarChart3}
        desc="Why this tab exists: As Municipal Commissioner and city executive, you oversee approved annual fiscal budgets across all municipal divisions (Roads, Solid Waste, Water, Electrical). Every civic repair work order—such as patching road potholes or replacing burnt luminaires—requires material and labour expenditure paid from public funds. This tab provides real-time oversight of fund utilization, ensures expenditures are properly linked to authorized work orders, prevents departmental budget deficits, and maintains a transparent audit ledger."
        steps={[
          { title: 'Monitor Department Fund Utilization', desc: 'Check live utilization progress bars for each division to ensure funds are not overspent.' },
          { title: 'Record Work Order Expense', desc: 'Click "Record Work Order Expense" to book materials, contractor equipment, or labour costs against a specific work order code.' },
          { title: 'Top-Up Department Budget', desc: 'Grant additional appropriations or budget increases to departments tackling major emergency repairs.' }
        ]}
        tags={['💰 FY 2026-27 Appropriations', '🧾 Work Order Expense Linking', '📊 Real-Time Utilization']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><BarChart3 size={13} /> MUNICIPAL FISCAL AUDITING · FINANCIAL YEAR 2026-27</div>
          <h1>Budget Allocation & Expenditure Tracking</h1>
          <p>
            Monitor approved departmental appropriations, record work order expenditures, and audit municipal treasury spending.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-light" onClick={() => { setShowTopUp(!showTopUp); setShowExpense(false); }}>
            <Plus size={15} /> {showTopUp ? 'Cancel' : 'Top-Up Department Budget'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setShowExpense(!showExpense); setShowTopUp(false); }}>
            <Plus size={15} /> {showExpense ? 'Cancel' : 'Record Work Order Expense'}
          </button>
        </div>
      </div>

      {/* High-level Fiscal KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Total Approved City Budget</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
            ₹{(totalAllocated / 10000000).toFixed(2)} Cr
          </div>
          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>FY 2026–27 Total Municipal Outlay</span>
        </div>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #f59e0b' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Total Spent To Date</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>
            ₹{(totalSpent / 10000000).toFixed(2)} Cr
          </div>
          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>Authorized Work Order Expenses</span>
        </div>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #10b981' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Remaining Treasury Reserves</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#10b981' }}>
            ₹{(totalRemaining / 10000000).toFixed(2)} Cr
          </div>
          <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>Unallocated Liquid Balance</span>
        </div>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--accent-purple)' }}>
          <small style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>Overall Fiscal Utilization</small>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: 'var(--accent-purple)' }}>
            {utilizationPct}%
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>Average Department Burn Rate</span>
        </div>
      </div>

      {/* Record Expense Form */}
      {showExpense && (
        <div className="card" style={{ padding: 22, marginBottom: 22, border: '1.5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, margin: 0 }}>Record Expense Against Work Order</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deducts expenditure from department budget line</span>
          </div>
          <form onSubmit={handleRecordExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label>Department *</label>
              <select value={dept} onChange={e => setDept(e.target.value)}>
                {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Linked Work Order Code</label>
              <input type="text" value={woRef} onChange={e => setWoRef(e.target.value)} placeholder="e.g. WO-2026-03" />
            </div>
            <div className="form-group">
              <label>Expenditure Description *</label>
              <input type="text" required value={desc} onChange={e => setDesc(e.target.value)} placeholder="Materials, machinery rental, contractor fees" />
            </div>
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 45000" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Expenditure</button>
              <button type="button" className="btn btn-light" onClick={() => setShowExpense(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Top-Up Budget Form */}
      {showTopUp && (
        <div className="card" style={{ padding: 22, marginBottom: 22, border: '1.5px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, margin: 0 }}>Top-Up Department Budget Appropriation</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Standing Finance Committee fiscal adjustment</span>
          </div>
          <form onSubmit={handleTopUpBudget} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 14 }}>
            <div className="form-group">
              <label>Target Department *</label>
              <select value={topUpDept} onChange={e => setTopUpDept(e.target.value)}>
                {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Additional Funds (₹) *</label>
              <input
                type="number"
                required
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
                placeholder="e.g. 500000"
              />
            </div>
            <div className="form-group">
              <label>Appropriation Resolution / Justification</label>
              <input
                type="text"
                value={topUpReason}
                onChange={e => setTopUpReason(e.target.value)}
                placeholder="e.g. Monsoon emergency road repair allocation"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Authorize Top-Up</button>
              <button type="button" className="btn btn-light" onClick={() => setShowTopUp(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Allocation Progress Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {budgets.map(b => {
          const pct = Math.round((b.spent_amount / b.allocated_amount) * 100);
          const isWarning = pct >= 80;

          return (
            <div key={b.budget_id || b.department} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="eyebrow" style={{ margin: 0 }}>{b.financial_year}</span>
                <span className={`status-chip ${isWarning ? 'withdrawn' : 'active'}`}>
                  {isWarning ? 'Near Budget Cap' : b.status}
                </span>
              </div>
              <h3 style={{ margin: '4px 0 2px', fontSize: 14 }}>{b.department}</h3>
              <small style={{ color: 'var(--text-muted)' }}>{b.project_name}</small>

              <div style={{ margin: '14px 0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span>Spent: <b>₹{(b.spent_amount / 100000).toFixed(2)} Lakh</b></span>
                  <span>Allocated: <b>₹{(b.allocated_amount / 100000).toFixed(2)} Lakh</b></span>
                </div>
                <div className="budget-bar-track">
                  <div
                    className="budget-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct > 85 ? '#e11d48' : pct > 70 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                <span>Remaining: <b style={{ color: '#10b981' }}>₹{(b.remaining_amount / 100000).toFixed(2)} Lakh</b></span>
                <span>{pct}% Utilized</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recorded Expenditure Ledger */}
      <div>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>Authorized Expenditure Ledger</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Work Order</th>
                <th>Description</th>
                <th>Department</th>
                <th>Authorized By</th>
                <th>Amount (₹)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.map((ex, i) => (
                <tr key={i}>
                  <td><code style={{ fontSize: 11, color: 'var(--accent-purple)' }}>{ex.invoice_ref}</code></td>
                  <td><b>{ex.work_order_ref || 'Direct Allocation'}</b></td>
                  <td>{ex.description}</td>
                  <td>{ex.department}</td>
                  <td>{ex.authorized_by}</td>
                  <td><b style={{ color: '#10b981' }}>₹{Number(ex.amount).toLocaleString()}</b></td>
                  <td>{ex.created_at || 'Recent'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 18. REPORTS & ANALYTICS VIEW (AUTHORITY)
// ==========================================================================
function ReportsAnalyticsView({ complaints, departments, budgets, exportCSV, showToast }) {
  const avgResolutionHours = 28;
  const overduePercentage = 4.2;

  return (
    <div>
      <TabIntroBanner
        badge="Executive Decision Support & Advanced DQL"
        title="Municipal Performance Reports & Analytics"
        icon={BarChart3}
        desc="What this tab is for: Analyze city-wide performance metrics, recurring incident hotspots across wards, department turnaround speed, and budget vs expenditure comparisons. Export data to CSV or generate print-ready executive summaries for city council meetings."
        tags={['📈 Analytical DQL Aggregates', '⚡ Average Resolution Velocity', '🖨️ Executive Print & CSV Export']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><BarChart3 size={13} /> EXECUTIVE DECISION SUPPORT · ADVANCED DQL</div>
          <h1>Municipal Performance Reports & Analytics</h1>
          <p>Aggregated telemetry on grievance resolution velocity, recurring locality hotspots, and department benchmarking.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-light" onClick={() => window.print()}>
            <Printer size={15} /> Print Executive Summary
          </button>
          <button className="btn btn-primary" onClick={() => exportCSV('municipal-analytics-report.csv', complaints)}>
            <Download size={15} /> Export Analytical Report
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon assigned"><Clock3 size={20} /></div>
          <div>
            <div className="stat-label">AVG RESOLUTION TIME</div>
            <div className="stat-value">{avgResolutionHours} hrs</div>
            <small style={{ color: '#10b981', fontSize: 10 }}>Well below municipal 48h SLA</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon open"><AlertCircle size={20} /></div>
          <div>
            <div className="stat-label">OVERDUE INCIDENTS</div>
            <div className="stat-value">{overduePercentage}%</div>
            <small style={{ color: '#10b981', fontSize: 10 }}>95.8% on-time resolution rate</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resolved"><CheckCircle2 size={20} /></div>
          <div>
            <div className="stat-label">FIRST-TIME FIX RATE</div>
            <div className="stat-value">91.4%</div>
            <small style={{ color: 'var(--primary)', fontSize: 10 }}>Verified with post-work photos</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon in-progress"><Users size={20} /></div>
          <div>
            <div className="stat-label">CITIZEN SATISFACTION</div>
            <div className="stat-value">4.6 / 5.0</div>
            <small style={{ color: '#f59e0b', fontSize: 10 }}>Based on verified civic ratings</small>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, marginBottom: 14 }}>Departmental Workload & Resolution Benchmarks</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Head Officer</th>
              <th>Total Handled</th>
              <th>SLA Commitment</th>
              <th>Avg Clearance Time</th>
              <th>Compliance Score</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.name}>
                <td><b>{d.name}</b></td>
                <td>{d.head_officer}</td>
                <td><span className="nav-count">{d.active_cases + 12}</span></td>
                <td>{d.sla_hours} Hours</td>
                <td>{Math.round(d.sla_hours * 0.65)} Hours</td>
                <td>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>96.5% Compliant</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================================
// 19. CITIZEN GRIEVANCES & FEEDBACK ESCALATION (AUTHORITY)
// ==========================================================================
function CitizenGrievancesView({ feedbackList, setFeedbackList, showToast }) {
  const [responseModal, setResponseModal] = useState(null);
  const [responseText, setResponseText] = useState('');

  async function handleSendResponse() {
    if (!responseText) return;
    try {
      await apiRequest(`/feedback/${responseModal.feedback_id || 1}`, {
        method: 'PUT',
        body: JSON.stringify({ official_response: responseText, escalated: 0 })
      });
    } catch {}

    setFeedbackList(prev => prev.map(f => f.reference_id === responseModal.reference_id ? { ...f, official_response: responseText } : f));
    showToast('Official response dispatched to citizen');
    setResponseModal(null);
    setResponseText('');
  }

  return (
    <div>
      <TabIntroBanner
        badge="Citizen Satisfaction & Grievance Escalations"
        title="Citizen Feedback, Disputes & Appeals Desk"
        icon={Star}
        desc="What this tab is for: Review post-resolution citizen satisfaction ratings and investigate disputes. When a citizen marks a resolution incomplete or files an appeal, authority officers can inspect ground reality, record official municipal responses, and escalate cases."
        tags={['⭐ Citizen Rating Audit', '🚨 Dispute Investigation', '📝 Official Response Log']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Star size={13} /> CITIZEN SATISFACTION & GRIEVANCE ESCALATIONS</div>
          <h1>Citizen Feedback & Appeals Review</h1>
          <p>Audit post-resolution ratings, evaluate dissatisfaction appeals, and record official municipal decisions.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Citizen</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Citizen Comments</th>
              <th>Official Authority Response</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((fb, i) => (
              <tr key={i}>
                <td><code style={{ fontSize: 11, color: 'var(--primary)' }}>{fb.reference_id}</code></td>
                <td>
                  <b>{fb.citizen_name}</b>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>{fb.citizen_email}</small>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} fill={s <= fb.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                </td>
                <td>
                  {fb.is_fully_resolved ? (
                    <span className="status-chip active">Fully Resolved</span>
                  ) : (
                    <span className="status-chip" style={{ background: 'rgba(225, 29, 72, 0.2)', color: '#f43f5e' }}>Appealed</span>
                  )}
                </td>
                <td>
                  <p style={{ fontSize: 11, maxWidth: 280, margin: 0 }}>{fb.comments}</p>
                  {fb.dissatisfaction_reason && (
                    <small style={{ color: '#e11d48', display: 'block', marginTop: 3 }}>
                      Issue: {fb.dissatisfaction_reason}
                    </small>
                  )}
                </td>
                <td>{fb.official_response ? <span style={{ color: '#10b981', fontSize: 11 }}>{fb.official_response}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Awaiting Review</span>}</td>
                <td>
                  <button className="btn btn-light btn-small" onClick={() => setResponseModal(fb)}>
                    <Edit size={12} /> Respond
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {responseModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Official Response to {responseModal.citizen_name}</h3>
              <button className="icon-button" onClick={() => setResponseModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Citizen reported: "{responseModal.comments}"
              </p>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Official Municipal Response / Action Taken *</label>
                <textarea rows={3} value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Type official response..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-light" onClick={() => setResponseModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSendResponse}>Send Response</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 20. USER AND ACCESS MANAGEMENT VIEW (AUTHORITY)
// ==========================================================================
function UserAccessManagementView({ users, setUsers, departments, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('authority');
  const [dept, setDept] = useState('Roads & Infrastructure');

  async function handleCreateUser(e) {
    e.preventDefault();
    const payload = {
      name,
      email,
      role,
      department: dept,
      status: 'Active'
    };

    try {
      await apiRequest('/users', { method: 'POST', body: JSON.stringify(payload) });
    } catch {}

    setUsers(prev => [payload, ...prev]);
    showToast(`Account created for ${name}`);
    setShowAdd(false);
    setName('');
    setEmail('');
  }

  async function toggleStatus(u) {
    const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await apiRequest(`/users/${u.user_id || 1}/status`, { method: 'PUT', body: JSON.stringify({ status: nextStatus }) });
    } catch {}
    setUsers(prev => prev.map(x => x.email === u.email ? { ...x, status: nextStatus } : x));
    showToast(`Account ${u.email} status set to ${nextStatus}`);
  }

  return (
    <div>
      <TabIntroBanner
        badge="Security & Access Control"
        title="User Directory & Role-Based Permissions"
        icon={Users}
        desc="What this tab is for: Manage accounts and operational privileges across citizens, department triage officers, and field technicians. Safely toggle accounts between Active and Suspended status to enforce municipal security protocols."
        tags={['🔐 Role Isolation', '⚡ Live Account Toggle', '👥 Citizen & Staff Directory']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Users size={13} /> SECURITY & ACCESS CONTROL</div>
          <h1>User and Role-Based Access Control</h1>
          <p>Manage credentials and role permissions for residents, department officers, field technicians, and finance administrators.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={15} /> Create Staff Account
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Create Municipal Staff Account</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label>Staff Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
            </div>
            <div className="form-group">
              <label>Staff Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@smartcity.gov" />
            </div>
            <div className="form-group">
              <label>System Role *</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="authority">Department Officer</option>
                <option value="staff">Field Worker</option>
                <option value="admin">Executive Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)}>
                {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Account</button>
              <button type="button" className="btn btn-light" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Department</th>
              <th>Account Status</th>
              <th>Status Switch</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td><b>{u.name}</b></td>
                <td>{u.email}</td>
                <td><span className="priority-chip low">{u.role}</span></td>
                <td>{u.department || 'Citizen Directory'}</td>
                <td><span className={`status-chip ${u.status === 'Active' ? 'active' : 'danger'}`}>{u.status}</span></td>
                <td>
                  <ToggleSwitch
                    checked={u.status === 'Active'}
                    onChange={() => toggleStatus(u)}
                    label={u.status}
                    isDanger={u.status !== 'Active'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================================
// 21. DATABASE ADMIN & AUDIT LOGS (SQL STUDIO)
// ==========================================================================
function DatabaseAdminAndAuditView({ auditLogs, schemaTables, sqlQuery, setSqlQuery, onRun, result, error, showToast }) {
  const [tab, setTab] = useState('studio'); // 'studio' or 'audit' or 'schema'

  const SQL_PRESETS = [
    { label: 'DQL: Unresolved Complaints View', sql: 'SELECT * FROM unresolved_complaints_view;' },
    { label: 'DQL: Department Performance Join', sql: 'SELECT * FROM department_performance_view;' },
    { label: 'DQL: Budget Utilization View', sql: 'SELECT * FROM budget_overview_view;' },
    { label: 'DDL: Create Disposable Test Table', sql: 'CREATE TABLE IF NOT EXISTS test_disposable (\n  id INTEGER PRIMARY KEY,\n  metric_name TEXT,\n  value REAL\n);' },
    { label: 'DML: Insert Test Record', sql: "INSERT INTO test_disposable (metric_name, value) VALUES ('Sample IoT Pressure', 4.5);" },
    { label: 'DDL: Drop Disposable Table', sql: 'DROP TABLE IF EXISTS test_disposable;' }
  ];

  return (
    <div>
      <TabIntroBanner
        badge="Enterprise Relational Engine · DDL, DML, DQL"
        title="Database Administration & SQL Studio"
        icon={Terminal}
        desc="What this tab is for: Execute live database statements (DDL schema definitions, DML transactions, and DQL analytics), inspect database tables and views, and trace the tamper-proof system audit log of every insert, update, and status change."
        tags={['🗄️ 17 Relational Tables', '⚡ DDL / DML / DQL Live', '📜 Tamper-Proof Audit Trail']}
      />

      <div className="page-heading">
        <div>
          <div className="eyebrow"><Terminal size={13} /> ENTERPRISE RELATIONAL ENGINE · DDL, DML, DQL</div>
          <h1>Database Administration & SQL Studio</h1>
          <p>
            Execute live DDL schema migrations, perform transactional DML updates, inspect database master schema,
            and audit all historical transitions.
          </p>
        </div>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn ${tab === 'studio' ? 'active' : ''}`}
            onClick={() => setTab('studio')}
          >
            <Terminal size={14} /> SQL Studio
          </button>
          <button
            type="button"
            className={`segmented-btn ${tab === 'audit' ? 'active' : ''}`}
            onClick={() => setTab('audit')}
          >
            <Clock size={14} /> Audit Trail ({auditLogs.length})
          </button>
          <button
            type="button"
            className={`segmented-btn ${tab === 'schema' ? 'active' : ''}`}
            onClick={() => setTab('schema')}
          >
            <Database size={14} /> Schema Inspector
          </button>
        </div>
      </div>

      {tab === 'studio' && (
        <div className="sql-studio-grid">
          {/* Query Editor Box */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <b style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={16} color="var(--primary)" /> SQL Query Editor
              </b>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  onChange={e => {
                    const found = SQL_PRESETS.find(p => p.label === e.target.value);
                    if (found) setSqlQuery(found.sql);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Load SQL Preset...</option>
                  {SQL_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                </select>
                <button className="btn btn-primary" onClick={onRun}>
                  <Play size={13} /> Run SQL
                </button>
              </div>
            </div>

            <textarea
              className="sql-editor"
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              rows={8}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 12, borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', resize: 'vertical' }}
            />

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid #e11d48', borderRadius: 8, color: '#f43f5e', fontSize: 11 }}>
                <b>Execution Error:</b> {error}
              </div>
            )}

            {result && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 11 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{result.message}</span>
                  <small style={{ color: 'var(--text-muted)' }}>Latency: {result.executionTimeMs}ms</small>
                </div>

                {result.columns && result.columns.length > 0 && (
                  <div style={{ overflowX: 'auto', maxHeight: 320 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          {result.columns.map(c => <th key={c}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((r, ri) => (
                          <tr key={ri}>
                            {r.map((v, vi) => (
                              <td key={vi}>{v === null ? <i style={{ color: 'var(--text-muted)' }}>NULL</i> : String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Database Schema Summary Card */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Relational Tables & Views</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
              {schemaTables.map(t => (
                <div
                  key={t.name}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSqlQuery(`SELECT * FROM ${t.name} LIMIT 20;`)}
                >
                  <div>
                    <b style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{t.name}</b>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: 9 }}>
                      {t.columns ? `${t.columns.length} columns` : ''}
                    </small>
                  </div>
                  <span className="nav-count">{t.rowCount || 0} rows</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Entity</th>
                <th>Record ID</th>
                <th>Action</th>
                <th>User</th>
                <th>Role</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(l => (
                <tr key={l.log_id || l.timestamp}>
                  <td><small>{l.timestamp}</small></td>
                  <td><b>{l.entity_type}</b></td>
                  <td><code>{l.entity_id}</code></td>
                  <td><span className="priority-chip low">{l.action}</span></td>
                  <td><b>{l.changed_by}</b></td>
                  <td>{l.role}</td>
                  <td>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'schema' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {schemaTables.map(t => (
            <div key={t.name} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <b style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary)' }}>{t.name}</b>
                <span className="nav-tag-sql">{t.type}</span>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Total records: {t.rowCount}</small>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(t.columns || []).map(c => (
                  <span key={typeof c === 'string' ? c : c.name} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', background: 'var(--bg-surface-alt)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                    {typeof c === 'string' ? c : c.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 22. SQL STUDIO VIEW (FOR CITIZENS - READ-ONLY TRANSPARENCY)
// ==========================================================================
function SQLStudioView({ isCitizen, sqlQuery, setSqlQuery, onRun, result, error, schemaTables, showToast }) {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><Terminal size={13} /> CIVIC DATA TRANSPARENCY · DQL READ ACCESS</div>
          <h1>Civic SQL Explorer</h1>
          <p>
            Citizens have transparent read-only access (DQL SELECT) to public complaint volumes,
            infrastructure health scores, and city department resolution performance.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onRun}>
          <Play size={14} /> Execute Query
        </button>
      </div>

      <div className="citizen-dql-banner">
        <Info size={18} color="var(--primary)" />
        <div>
          <b>Public Civic Transparency:</b> You may run read-only SQL statements (<code>SELECT</code>) across all municipal tables. Administrative DDL and DML operations require authorized staff credentials.
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Enter SQL SELECT Statement</label>
          <textarea
            rows={5}
            value={sqlQuery}
            onChange={e => setSqlQuery(e.target.value)}
            style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 12, borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid #e11d48', borderRadius: 8, color: '#f43f5e', fontSize: 11, marginBottom: 14 }}>
            <b>Access Denied / Error:</b> {error}
          </div>
        )}

        {result && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginBottom: 8 }}>
              <span>{result.message}</span>
              <small style={{ color: 'var(--text-muted)' }}>Latency: {result.executionTimeMs}ms</small>
            </div>

            {result.columns && result.columns.length > 0 && (
              <div style={{ overflowX: 'auto', maxHeight: 360 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {result.columns.map(c => <th key={c}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((v, vi) => <td key={vi}>{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// MODAL COMPONENTS (TRIAGE, WORK ORDERS, REOPEN, WITHDRAW, TICKET)
// ==========================================================================

function DetailsModal({ complaint: c, isAuthority, onClose, onTriage, onOpenSQL, onReopen, onPrintTicket }) {
  if (!c) return null;

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">DATABASE RECORD · {c.id}</div>
            <h2>{c.title}</h2>
            <p>Submitted on {formatDate(c.createdAt)} · Expected SLA: {c.expectedResolutionDate || '48h'}</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`priority-chip ${c.priority.toLowerCase()}`}>{c.priority} Priority</span>
            <span className={`status-chip ${c.status.toLowerCase().replace(/[\s/]+/g, '-')}`}>{c.status}</span>
            {c.safetyRisk && <span style={{ color: '#e11d48', fontSize: 11, fontWeight: 700 }}>⚠️ Public Safety Risk</span>}
          </div>

          {/* 5-Stage Stepper */}
          <div className="timeline-stepper">
            {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((st, idx) => {
              const curIdx = c.status === 'Resolved' ? 4 : c.status === 'In Progress' ? 3 : c.status === 'Assigned' ? 2 : 1;
              const isDone = idx <= curIdx;
              return (
                <div key={st} className={`stepper-stage ${isDone ? 'completed' : ''}`}>
                  <div className="stepper-circle">{isDone ? <Check size={12} /> : idx + 1}</div>
                  <span className="stepper-label">{st}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Category</small><b style={{ display: 'block', fontSize: 12 }}>{c.category}</b></div>
            <div><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Department</small><b style={{ display: 'block', fontSize: 12 }}>{c.department}</b></div>
            <div><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Reporting Citizen</small><b style={{ display: 'block', fontSize: 12 }}>{c.citizen} ({c.email})</b></div>
            <div><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Assigned Team</small><b style={{ display: 'block', fontSize: 12 }}>{c.assignedTo || 'Unassigned'}</b></div>
            <div style={{ gridColumn: '1 / -1' }}><small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Location</small><b style={{ display: 'block', fontSize: 12 }}>{c.area} · {c.address}</b></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Original Description</small>
              <p style={{ marginTop: 2, fontSize: 12, lineHeight: 1.6, background: 'var(--bg-surface-alt)', padding: '10px 12px', borderRadius: 8 }}>
                {c.description}
              </p>
            </div>
            {c.photoUrl && (
              <div style={{ gridColumn: '1 / -1' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: 10 }}>Citizen's Incident Photograph</small>
                <img src={c.photoUrl} alt="Complaint Evidence" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginTop: 4 }} />
              </div>
            )}
            {c.resolution && (
              <div style={{ gridColumn: '1 / -1' }}>
                <small style={{ color: 'var(--primary)', fontSize: 10, fontWeight: 700 }}>Official Municipal Resolution</small>
                <p style={{ marginTop: 2, fontSize: 12, lineHeight: 1.6, background: 'var(--primary-subtle)', padding: '10px 12px', borderRadius: 8, color: 'var(--text-primary)' }}>
                  {c.resolution}
                </p>
                {c.resolutionPhoto && (
                  <img src={c.resolutionPhoto} alt="Resolution Evidence" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                )}
              </div>
            )}
          </div>

          {/* Activity History */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            <b style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Activity History Timeline</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(c.history || []).map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <b>{h.action}</b>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: 9 }}>{h.by} · {formatDate(h.at)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-light btn-small" onClick={() => onPrintTicket(c)}>
                <Printer size={13} /> Acknowledgement Ticket
              </button>
              <button className="btn btn-purple btn-small" onClick={onOpenSQL}>
                <Terminal size={13} /> Query in SQL Studio
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAuthority ? (
                <button className="btn btn-primary" onClick={() => onTriage(c)}>
                  <ShieldCheck size={14} /> Action / Triage Case
                </button>
              ) : (
                c.status === 'Resolved' && (
                  <button className="btn btn-light" onClick={() => onReopen(c)}>
                    <RotateCcw size={14} /> Reopen Grievance
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthorityTriageModal({ complaint: c, departments, staff, onClose, onSave }) {
  const [status, setStatus] = useState(c.status);
  const [priority, setPriority] = useState(c.priority);
  const [department, setDepartment] = useState(c.department);
  const [assignedTo, setAssignedTo] = useState(c.assignedTo || 'Unassigned');
  const [resolution, setResolution] = useState(c.resolution || '');

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">OFFICIAL MUNICIPAL ACTION</div>
            <h2>Triage & Resolve {c.id}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Open">Open (Under Review)</option>
              <option value="Assigned">Assigned to Department</option>
              <option value="In Progress">In Progress (Work Order Active)</option>
              <option value="Resolved">Resolved (Work Completed)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label>Reassign Department</label>
              <select value={department} onChange={e => setDepartment(e.target.value)}>
                {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority Classification</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Assigned Officer / Crew</label>
            <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="e.g. Sanitation Rapid Crew 2" />
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Official Resolution Notes (Visible to Citizen)</label>
            <textarea
              rows={3}
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="Describe repairs undertaken, materials replaced, and field inspection outcome..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave({ status, priority, department, assignedTo, resolution })}>
              Commit Triage Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateWorkOrderModal({ complaint: c, staff, departments, onClose, onCreate }) {
  const [title, setTitle] = useState(`Repair task for ${c.title}`);
  const [assignedWorker, setAssignedWorker] = useState('Rajesh Field Tech');
  const [priority, setPriority] = useState(c.priority);
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 24 * 3600000 * 2).toISOString().slice(0, 10));
  const [materials, setMaterials] = useState('');

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">FIELD WORKFORCE DISPATCH</div>
            <h2>Generate Municipal Work Order</h2>
            <p>Linked to Complaint: {c.id}</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Work Order Title *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label>Assigned Field Tech / Crew *</label>
              <input type="text" required value={assignedWorker} onChange={e => setAssignedWorker(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Completion Deadline *</label>
              <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Estimated Materials Requisition</label>
            <textarea rows={2} value={materials} onChange={e => setMaterials(e.target.value)} placeholder="e.g. 5 bags asphalt bitumen, 1x 60W LED fixture" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => onCreate({
                complaint_ref: c.id,
                title,
                department: c.department,
                assigned_worker: assignedWorker,
                priority,
                deadline,
                materials_used: materials,
                status: 'Assigned',
                labour_hours: 0
              })}
            >
              Issue Work Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReopenComplaintModal({ complaint: c, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>Reopen Complaint {c.id}</h3>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
            If the issue was not fully rectified on the ground, state the reason. The case will be re-assigned to municipal field supervisors.
          </p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Reason for Reopening *</label>
            <textarea rows={3} required value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why the problem persists..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => reason && onSubmit(reason)}>Reopen Case</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WithdrawComplaintModal({ complaint: c, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>Withdraw Complaint {c.id}</h3>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Withdrawing will preserve official audit history but cancel further municipal dispatch.
          </p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Withdrawal Reason</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Issue resolved by community, duplicate report" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSubmit(reason || 'Withdrawn by reporting citizen')}>Confirm Withdrawal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketReceiptModal({ complaint: c, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">OFFICIAL MUNICIPAL RECEIPT</div>
            <h2>Acknowledgement Ticket</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ border: '2px dashed var(--border-medium)', borderRadius: 10, padding: 20, background: 'var(--bg-surface-alt)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <strong style={{ fontSize: 16, color: 'var(--primary)' }}>URBANOS MUNICIPALITY</strong>
              <code style={{ fontSize: 13, fontWeight: 800 }}>{c.id}</code>
            </div>
            <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><b>Citizen:</b> {c.citizen}</div>
              <div><b>Category:</b> {c.category} · {c.department}</div>
              <div><b>Title:</b> {c.title}</div>
              <div><b>Address:</b> {c.area} ({c.address})</div>
              <div><b>Registered On:</b> {formatDate(c.createdAt)}</div>
              <div><b>Expected Resolution SLA:</b> 48 Hours</div>
              <div><b>Status:</b> <span className={`status-chip ${c.status.toLowerCase()}`}>{c.status}</span></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={14} /> Print Receipt Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditComplaintCitizenModal({ complaint: c, onClose, onSave }) {
  const [title, setTitle] = useState(c.title);
  const [description, setDescription] = useState(c.description);
  const [address, setAddress] = useState(c.address);
  const [landmark, setLandmark] = useState(c.landmark || '');

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>Edit Complaint {c.id}</h3>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Landmark</label>
            <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave({ title, description, address, landmark })}>
              Save Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateWorkOrderModal({ workOrder: wo, onClose, onSave }) {
  const [status, setStatus] = useState(wo.status || 'Assigned');
  const [labourHours, setLabourHours] = useState(wo.labour_hours || 0);
  const [materialsUsed, setMaterialsUsed] = useState(wo.materials_used || '');
  const [completionNotes, setCompletionNotes] = useState(wo.completion_notes || '');
  const [delayReason, setDelayReason] = useState(wo.delay_reason || '');

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>FIELD WORK ORDER UPDATE</div>
            <h3 style={{ margin: 0 }}>Progress Update: {wo.order_code}</h3>
          </div>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg-surface-alt)', padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Work Task:</span>
              <b>{wo.title}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Team / Worker:</span>
              <b>{wo.assigned_worker}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <span>{wo.department}</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Current Status *</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Assigned">Assigned (Scheduled for dispatch)</option>
              <option value="In Progress">In Progress (Field crew working on site)</option>
              <option value="On Hold">On Hold (Awaiting equipment / materials)</option>
              <option value="Completed">Completed (Work executed and verified)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="form-group">
              <label>Logged Labour Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={labourHours}
                onChange={e => setLabourHours(e.target.value)}
                placeholder="e.g. 3.5"
              />
            </div>
            <div className="form-group">
              <label>Task Priority</label>
              <input type="text" readOnly value={wo.priority} style={{ background: 'var(--bg-surface-alt)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Materials & Machinery Consumed</label>
            <input
              type="text"
              value={materialsUsed}
              onChange={e => setMaterialsUsed(e.target.value)}
              placeholder="e.g. 6 Bags Cold Mix Bitumen, Road Roller Compactor"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Field Completion / Progress Notes *</label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={e => setCompletionNotes(e.target.value)}
              placeholder="Describe work completed on-site, test results, or next steps..."
            />
          </div>

          {status === 'On Hold' && (
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ color: '#f59e0b' }}>Delay / Hold Reason</label>
              <input
                type="text"
                value={delayReason}
                onChange={e => setDelayReason(e.target.value)}
                placeholder="e.g. Awaiting spare high-voltage luminaire clamp"
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSave({
                status,
                labour_hours: Number(labourHours) || 0,
                materials_used: materialsUsed,
                completion_notes: completionNotes,
                delay_reason: delayReason || null
              })}
            >
              Save Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// LOGIN SCREEN COMPONENT (ROLE SWITCHER & THEME TOGGLE)
// ==========================================================================
function LoginScreen({ theme, onToggleTheme, onLogin }) {
  const [role, setRole] = useState('citizen');
  const [email, setEmail] = useState('citizen@demo.local');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await onLogin(role, role === 'authority' ? 'admin@demo.local' : email, password);
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    }
  }

  return (
    <div className="login-page">
      <div className="login-side">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-icon">U</div>
          <div>
            <strong>UrbanOS</strong>
            <small>SMART CITY PLATFORM</small>
          </div>
        </div>

        <div className="login-side-content">
          <div className="login-kicker">
            <Sparkles size={12} /> ENTERPRISE MUNICIPAL PLATFORM
          </div>
          <h1>
            A Connected City Starts With <em>Every Incident Resolved.</em>
          </h1>
          <p>
            An integrated operating portal for residents, municipal authorities, smart utilities, intelligent mobility,
            and complete DDL, DML, and DQL database control with tamper-proof grievance integrity.
          </p>

          <div className="login-feature-item">
            <div className="login-feature-icon">
              <ClipboardList size={18} />
            </div>
            <div>
              <b style={{ display: 'block', fontSize: 12 }}>Citizen Grievances & Service Delivery</b>
              <small style={{ color: '#94a3b8', fontSize: 10 }}>10 Citizen Tabs: Geolocation reporting, 5-stage tracking, service bookings.</small>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="login-feature-icon">
              <Terminal size={18} />
            </div>
            <div>
              <b style={{ display: 'block', fontSize: 12 }}>DDL, DML & DQL Database Studio</b>
              <small style={{ color: '#94a3b8', fontSize: 10 }}>12 Authority Tabs: Work orders, department triage, budgets, audit trail.</small>
            </div>
          </div>
        </div>

        <div style={{ color: '#64748b', fontSize: 9 }}>
          © 2026 UrbanOS · Smart City Management & Municipal Administration
        </div>
      </div>

      <div className="login-main">
        <div className="login-topbar-actions">
          <ThemeToggleSwitch theme={theme} onToggle={onToggleTheme} />
        </div>

        <form className="login-card" onSubmit={submit}>
          <div className="eyebrow">PORTAL AUTHENTICATION</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, margin: '4px 0 6px' }}>
            Sign in to UrbanOS
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 20 }}>
            Choose your role to access your dedicated workspace.
          </p>

          <div className="role-switcher">
            <div
              className={`role-card ${role === 'citizen' ? 'active' : ''}`}
              onClick={() => {
                setRole('citizen');
                setEmail('citizen@demo.local');
              }}
            >
              <Users size={18} color="var(--primary)" />
              <div>
                <b>Citizen Portal</b>
                <small style={{ display: 'block' }}>10 Public Tabs & DQL</small>
              </div>
            </div>

            <div
              className={`role-card ${role === 'authority' ? 'active' : ''}`}
              onClick={() => {
                setRole('authority');
                setEmail('admin@demo.local');
              }}
            >
              <Building2 size={18} color="var(--accent-purple)" />
              <div>
                <b>Municipal Authority</b>
                <small style={{ display: 'block' }}>12 Operations Tabs & SQL</small>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>{role === 'citizen' ? 'Email Address' : 'Authority Username'}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-surface-alt)', borderRadius: 8, fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>
            <ShieldCheck size={13} style={{ verticalAlign: 'middle', marginRight: 5, color: '#10b981' }} />
            Demo password is pre-filled: <b>demo123</b>
          </div>

          {error && <div style={{ color: '#e11d48', fontSize: 11, marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" style={{ padding: '11px 16px' }}>
            Enter {role === 'citizen' ? 'Citizen Portal' : 'Municipal Command'} <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
