import 'dotenv/config';   // ← loads .env BEFORE anything else reads process.env
import express        from 'express';
import cors           from 'cors';
import cookieParser   from 'cookie-parser';
import mongoose       from 'mongoose';
import bcrypt         from 'bcryptjs';
import jwt            from 'jsonwebtoken';
import { protect, adminOnly, JWT_SECRET_KEY } from './middleware.js';
import {
  User, Producer, Trade, BuyRequest, 
  Connection, CommunityMember, SupportQuery
} from './models.js';
import {
  sendProducerStatusEmail,
  sendBuyRequestStatusEmail,
  sendSupportReplyEmail,
} from './email.js';
import dns from 'dns';

const app   = express();
const PORT  = process.env.PORT ;
const MONGO_URI    = process.env.MONGO_URI ;
/* Strip trailing slash so CORS never fails due to env var typo */
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

/* ── CORS ────────────────────────────────────────────────────────────────── */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const clean = origin.replace(/\/$/, '');
    if (clean === FRONTEND_URL || FRONTEND_URL === '*') return callback(null, true);
    return callback(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

/* Silence Chrome DevTools probe */
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_q, r) => r.json({}));

/* ── DNS resolution for CORS origin validation ────────────────────────── */
dns.setServers(["1.1.1.1", "8.8.8.8"]);

/* ── MongoDB connection ─────────────────────────────────────────────────── */
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('MongoDB connected →', MONGO_URI);
    await seedDatabase();
  })
  .catch(err => console.error('MongoDB connection failed:', err.message));

/* ── Cookie helper ──────────────────────────────────────────────────────── */
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

/* ══════════════════════════════════════════════════════════════════════════
   AUTH ROUTES
══════════════════════════════════════════════════════════════════════════ */

/* Sign Up */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, userType, city, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      name, email, password: hashed,
      userType: userType || 'consumer',
      city: city || '', phone: phone || '',
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('gh_token', token, COOKIE_OPTS);
    res.status(201).json({
      success: true,
      message: `Welcome to GreenHub, ${name}! 🌱`,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, userType: user.userType, city: user.city },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* Login */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with this email. Please sign up.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('gh_token', token, COOKIE_OPTS);
    res.json({
      success: true,
      message: `Welcome back, ${user.name}! ⚡`,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, userType: user.userType, city: user.city },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* Logout */
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('gh_token', { ...COOKIE_OPTS, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully.' });
});

/* Get current user */
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   PRODUCERS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/producers', async (req, res) => {
  try {
    const { type, sort } = req.query;
    let query = { status: 'approved' };
    if (type && type !== 'All') query.type = type;

    let producers = await Producer.find(query);
    if (sort === 'price_asc')  producers.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') producers.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     producers.sort((a, b) => b.rating - a.rating);

    res.json({ success: true, count: producers.length, data: producers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/producers/:id', async (req, res) => {
  try {
    const p = await Producer.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Producer not found.' });
    res.json({ success: true, data: p });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/producers', async (req, res) => {
  try {
    const { name, type, location, capacity, capacityUnit, available, price, description, ownerName, email, phone, userId } = req.body;
    if (!name || !type || !location || !price || !capacity)
      return res.status(400).json({ success: false, message: 'name, type, location, price and capacity are required.' });

    const p = await Producer.create({
      name, type, location,
      capacity:     parseFloat(capacity),
      capacityUnit: capacityUnit || 'kW',
      available:    parseFloat(available || capacity),
      price:        parseFloat(price),
      description:  description  || '',
      ownerName:    ownerName    || '',
      email:        email        || '',
      phone:        phone        || '',
      userId:       userId       || null,
      status:       'pending',
    });

    res.status(201).json({
      success: true,
      message: `"${name}" registered! Admin will verify your listing within 24 hours and you will receive a confirmation email.`,
      data: p,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   TRADES
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/trades', async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = {};
    if (status) query.status = status;

    let trades = await Trade.find(query).sort({ createdAt: -1 });
    if (limit) trades = trades.slice(0, parseInt(limit));

    res.json({ success: true, count: trades.length, data: trades });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/trades', async (req, res) => {
  try {
    const { producerId, consumer, amount } = req.body;
    if (!producerId || !consumer || !amount)
      return res.status(400).json({ success: false, message: 'producerId, consumer, and amount are required.' });

    const producer = await Producer.findById(producerId);
    if (!producer) return res.status(404).json({ success: false, message: 'Producer not found.' });
    if (parseFloat(amount) > producer.available)
      return res.status(400).json({ success: false, message: `Only ${producer.available} kW is currently available.` });

    const count   = await Trade.countDocuments();
    const tradeId = `T${String(count + 1).padStart(3, '0')}`;
    const t       = await Trade.create({
      tradeId,
      producerId:   producer._id,
      producerName: producer.name,
      consumer,
      amount:       parseFloat(amount),
      pricePerUnit: producer.price,
      totalValue:   parseFloat((producer.price * amount).toFixed(2)),
      status:       'pending',
      type:         producer.type,
      co2Offset:    parseFloat((amount * 0.82).toFixed(2)),
    });

    producer.available -= parseFloat(amount);
    await producer.save();

    /* Auto-complete the trade after 5 seconds */
    setTimeout(async () => { await Trade.findByIdAndUpdate(t._id, { status: 'completed' }); }, 5000);

    res.status(201).json({ success: true, message: 'Trade initiated successfully!', data: t });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   BUY REQUESTS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/buy-requests', async (req, res) => {
  try {
    const requests = await BuyRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/buy-requests', async (req, res) => {
  try {
    const { producerId, buyerName, buyerEmail, buyerPhone, buyerType, buyerCity, amount, duration, message, userId } = req.body;
    if (!producerId || !buyerName || !buyerEmail || !amount)
      return res.status(400).json({ success: false, message: 'producerId, buyerName, buyerEmail and amount are required.' });

    const producer = await Producer.findById(producerId);
    if (!producer) return res.status(404).json({ success: false, message: 'Producer not found.' });

    const count = await BuyRequest.countDocuments();
    const reqId = `BR${String(count + 1).padStart(3, '0')}`;
    const br    = await BuyRequest.create({
      reqId,
      producerId:    producer._id,
      producerName:  producer.name,
      energyType:    producer.type,
      buyerName,
      buyerEmail,
      buyerPhone:    buyerPhone  || '',
      buyerType:     buyerType   || 'Home',
      buyerCity:     buyerCity   || '',
      userId:        userId      || null,
      amount:        parseFloat(amount),
      duration:      duration    || 'Monthly',
      pricePerUnit:  producer.price,
      totalEstimate: parseFloat((producer.price * amount).toFixed(2)),
      message:       message     || '',
    });

    res.status(201).json({
      success: true,
      message: `Buy request sent to ${producer.name}! They will contact you soon.`,
      data: br,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   CONNECTIONS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/connections', async (req, res) => {
  try {
    const connections = await Connection.find().sort({ createdAt: -1 });
    res.json({ success: true, count: connections.length, data: connections });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/connections', async (req, res) => {
  try {
    const { role, name, email, phone, city, company, message, userId } = req.body;
    if (!role || !name || !email)
      return res.status(400).json({ success: false, message: 'role, name and email are required.' });

    const count  = await Connection.countDocuments();
    const connId = `C${String(count + 1).padStart(3, '0')}`;
    const c      = await Connection.create({
      connId, role, name, email,
      phone:   phone   || '',
      city:    city    || '',
      company: company || '',
      message: message || '',
      userId:  userId  || null,
    });

    const msgs = {
      consumer: `Thanks ${name}! We will match you with nearby green energy producers soon.`,
      investor: `Thanks ${name}! Our team will reach out with investment opportunities within 24 hours.`,
      producer: `Thanks ${name}! We will verify your details and connect you with buyers soon.`,
    };

    res.status(201).json({ success: true, message: msgs[role] || 'Registration successful!', data: c });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   COMMUNITIES
══════════════════════════════════════════════════════════════════════════ */

const COMMUNITIES = [
  { id: 1, name: 'Jaipur Solar Network',     type: 'Neighborhood Grid',   region: 'Rajasthan',   energySaved: '12.4 MWh', co2Offset: '10.1 tons', active: true  },
  { id: 2, name: 'Punjab Bio Collective',    type: 'Rural Co-op',         region: 'Punjab',      energySaved: '5.2 MWh',  co2Offset: '4.2 tons',  active: true  },
  { id: 3, name: 'Gujarat Wind Alliance',    type: 'Industrial Cluster',  region: 'Gujarat',     energySaved: '89.3 MWh', co2Offset: '73.1 tons', active: true  },
  { id: 4, name: 'Chennai Green Initiative', type: 'Neighborhood Grid',   region: 'Tamil Nadu',  energySaved: '22.1 MWh', co2Offset: '18.0 tons', active: false },
  { id: 5, name: 'Mumbai Solar Society',     type: 'Residential Complex', region: 'Maharashtra', energySaved: '44.7 MWh', co2Offset: '36.6 tons', active: true  },
  { id: 6, name: 'Bangalore Tech Green',     type: 'Corporate Cluster',   region: 'Karnataka',   energySaved: '67.2 MWh', co2Offset: '55.1 tons', active: true  },
];
const BASE_MEMBERS = { 1: 342, 2: 128, 3: 56, 4: 215, 5: 189, 6: 234 };

app.get('/api/communities', async (req, res) => {
  try {
    const members    = await CommunityMember.aggregate([{ $group: { _id: '$communityId', count: { $sum: 1 } } }]);
    const memberMap  = {};
    members.forEach(m => (memberMap[m._id] = m.count));
    const data = COMMUNITIES.map(c => ({ ...c, members: (memberMap[c.id] || 0) + BASE_MEMBERS[c.id] }));
    res.json({ success: true, count: data.length, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/communities/:id/join', async (req, res) => {
  try {
    const comm = COMMUNITIES.find(c => c.id === parseInt(req.params.id));
    if (!comm) return res.status(404).json({ success: false, message: 'Community not found.' });

    const { name, email, phone, city, reason, userId } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required.' });

    const existing = await CommunityMember.findOne({ communityId: comm.id, email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'You have already joined this community!' });

    const member = await CommunityMember.create({
      communityId:   comm.id,
      communityName: comm.name,
      name, email,
      phone:  phone  || '',
      city:   city   || '',
      reason: reason || '',
      userId: userId || null,
    });

    res.status(201).json({ success: true, message: `Successfully joined ${comm.name}! 🌱`, data: member });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   SUPPORT
══════════════════════════════════════════════════════════════════════════ */

app.post('/api/support', async (req, res) => {
  try {
    const { name, email, category, subject, message, userId } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ success: false, message: 'name, email, subject and message are required.' });

    const count    = await SupportQuery.countDocuments();
    const ticketId = `TICK-${String(count + 1).padStart(4, '0')}`;
    const q        = await SupportQuery.create({
      ticketId, name, email,
      category: category || 'Other',
      subject, message,
      userId: userId || null,
    });

    res.status(201).json({
      success: true,
      message: `Query submitted! Your ticket ID is ${ticketId}. We will reply within 24 hours.`,
      data: q,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/support', protect, adminOnly, async (req, res) => {
  try {
    const queries = await SupportQuery.find().sort({ createdAt: -1 });
    res.json({ success: true, count: queries.length, data: queries });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/support/:id', protect, adminOnly, async (req, res) => {
  try {
    const { adminReply, status } = req.body;
    const existingTicket = await SupportQuery.findById(req.params.id);
    if (!existingTicket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    const q = await SupportQuery.findByIdAndUpdate(req.params.id, req.body, { new: true });

    /* Send email reply to user if admin wrote a reply (non-blocking) */
    if (adminReply && adminReply.trim()) {
      sendSupportReplyEmail(q, adminReply)
        .then(() => console.log(`Support reply email sent to ${q.email}`))
        .catch(() => {});
    }

    res.json({ success: true, data: q });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN — PRODUCERS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/admin/producers', protect, adminOnly, async (req, res) => {
  try {
    const producers = await Producer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: producers.length, data: producers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/admin/producers/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const p = await Producer.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '', verified: status === 'approved' },
      { new: true }
    );

    if (!p) return res.status(404).json({ success: false, message: 'Producer not found.' });

    /* Send status email to the producer (non-blocking — email failure won't affect the response) */
    if (status === 'approved' || status === 'rejected') {
      sendProducerStatusEmail(p, status, adminNote || '')
        .then(() => console.log(`Producer ${status} email sent to ${p.email}`))
        .catch(() => {}); // error already logged inside safeSend
    }

    res.json({ success: true, message: `Producer ${status} successfully!`, data: p });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN — USERS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN — BUY REQUESTS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/admin/buy-requests', protect, adminOnly, async (req, res) => {
  try {
    const requests = await BuyRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/admin/buy-requests/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const br = await BuyRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!br) return res.status(404).json({ success: false, message: 'Buy request not found.' });

    /* Send status email to the buyer (non-blocking) */
    if (status === 'accepted' || status === 'rejected') {
      sendBuyRequestStatusEmail(br, status)
        .then(() => console.log(`Buy request ${status} email sent to ${br.buyerEmail}`))
        .catch(() => {});
    }

    res.json({ success: true, data: br });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN — CONNECTIONS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/admin/connections', protect, adminOnly, async (req, res) => {
  try {
    const conns = await Connection.find().sort({ createdAt: -1 });
    res.json({ success: true, count: conns.length, data: conns });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   STATISTICS
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/stats', async (req, res) => {
  try {
    const [producers, consumers, trades, connections, buyRequests] = await Promise.all([
      Producer.countDocuments({ status: 'approved' }),
      User.countDocuments({ userType: 'consumer' }),
      Trade.find({ status: 'completed' }),
      Connection.countDocuments(),
      BuyRequest.countDocuments(),
    ]);

    const energyTraded = trades.reduce((s, t) => s + t.amount, 0);
    const co2Saved     = trades.reduce((s, t) => s + (t.co2Offset || 0), 0);

    res.json({
      success: true,
      data: {
        totalProducers:    producers + 1284,
        totalConsumers:    consumers + 9472,
        energyTradedToday: Math.round(energyTraded * 1000) + 48300 + Math.floor(Math.random() * 500),
        co2SavedToday:     Math.round(co2Saved * 1000) + 32100 + Math.floor(Math.random() * 100),
        activeTrades:      await Trade.countDocuments({ status: 'pending' }),
        totalTrades:       await Trade.countDocuments(),
        totalConnections:  connections,
        totalBuyRequests:  buyRequests,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   ENERGY MAP
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/energy-map', (_req, res) => {
  const zones = [
    { id:  1, city: 'Jaipur',     state: 'Rajasthan',   lat: 26.9124, lng: 75.7873, generation: 920,  demand: 450,  type: 'Solar'  },
    { id:  2, city: 'Jodhpur',    state: 'Rajasthan',   lat: 26.2389, lng: 73.0243, generation: 810,  demand: 390,  type: 'Solar'  },
    { id:  3, city: 'Ahmedabad',  state: 'Gujarat',     lat: 23.0225, lng: 72.5714, generation: 540,  demand: 780,  type: 'Wind'   },
    { id:  4, city: 'Surat',      state: 'Gujarat',     lat: 21.1702, lng: 72.8311, generation: 320,  demand: 680,  type: 'Wind'   },
    { id:  5, city: 'Mumbai',     state: 'Maharashtra', lat: 19.0760, lng: 72.8777, generation: 280,  demand: 1200, type: 'Solar'  },
    { id:  6, city: 'Pune',       state: 'Maharashtra', lat: 18.5204, lng: 73.8567, generation: 490,  demand: 520,  type: 'Solar'  },
    { id:  7, city: 'Delhi',      state: 'Delhi',       lat: 28.6139, lng: 77.2090, generation: 190,  demand: 1500, type: 'Solar'  },
    { id:  8, city: 'Lucknow',    state: 'UP',          lat: 26.8467, lng: 80.9462, generation: 310,  demand: 480,  type: 'Biogas' },
    { id:  9, city: 'Amritsar',   state: 'Punjab',      lat: 31.6340, lng: 74.8723, generation: 420,  demand: 380,  type: 'Biogas' },
    { id: 10, city: 'Chennai',    state: 'Tamil Nadu',  lat: 13.0827, lng: 80.2707, generation: 860,  demand: 720,  type: 'Wind'   },
    { id: 11, city: 'Coimbatore', state: 'Tamil Nadu',  lat: 11.0168, lng: 76.9558, generation: 780,  demand: 490,  type: 'Wind'   },
    { id: 12, city: 'Bangalore',  state: 'Karnataka',   lat: 12.9716, lng: 77.5946, generation: 640,  demand: 890,  type: 'Solar'  },
    { id: 13, city: 'Hyderabad',  state: 'Telangana',   lat: 17.3850, lng: 78.4867, generation: 570,  demand: 760,  type: 'Solar'  },
    { id: 14, city: 'Bhopal',     state: 'MP',          lat: 23.2599, lng: 77.4126, generation: 390,  demand: 360,  type: 'Solar'  },
    { id: 15, city: 'Kolkata',    state: 'West Bengal', lat: 22.5726, lng: 88.3639, generation: 160,  demand: 980,  type: 'Biogas' },
  ];

  const data = zones.map(z => {
    const g = z.generation + Math.floor(Math.random() * 60 - 30);
    const d = z.demand     + Math.floor(Math.random() * 60 - 30);
    const ratio  = g / d;
    const status = ratio > 1.15 ? 'surplus' : ratio < 0.85 ? 'deficit' : 'balanced';
    return { ...z, generation: g, demand: d, surplus: g - d, ratio: parseFloat(ratio.toFixed(2)), status };
  });

  res.json({ success: true, data });
});

/* ══════════════════════════════════════════════════════════════════════════
   HEALTH CHECK
══════════════════════════════════════════════════════════════════════════ */

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'GreenHub API v3 🌱', timestamp: new Date().toISOString() })
);

/* ══════════════════════════════════════════════════════════════════════════
   DATABASE SEED
══════════════════════════════════════════════════════════════════════════ */

async function seedDatabase() {
  /* Seed admin user */
  const adminExists = await User.findOne({ email: 'admin@greenhub.in' });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'GreenHub Admin', email: 'admin@greenhub.in', password: hashed, role: 'admin', userType: 'producer' });
    console.log('Admin seeded → admin@greenhub.in / admin123');
  }

  /* Seed sample producers */
  const pCount = await Producer.countDocuments();
  if (pCount === 0) {
    await Producer.insertMany([
      { name: 'SunRoof Co.',     type: 'Solar',  location: 'Rajasthan',     capacity: 120,  available: 85,  price: 4.2, rating: 4.8, verified: true,  description: 'Rooftop solar panels across 200+ homes in Jaipur.',        ownerName: 'Ravi Sharma',     email: 'ravi@sunroof.in',    phone: '9876543210', status: 'approved' },
      { name: 'GreenWind Ltd.',  type: 'Wind',   location: 'Gujarat',       capacity: 500,  available: 340, price: 3.8, rating: 4.6, verified: true,  description: 'Offshore wind farm in the Gulf of Kutch.',                 ownerName: 'Meera Patel',     email: 'meera@gwind.in',     phone: '9876543211', status: 'approved' },
      { name: 'BioEnergy Hub',   type: 'Biogas', location: 'Punjab',        capacity: 60,   available: 45,  price: 5.1, rating: 4.3, verified: false, description: 'Agricultural waste biogas plant.',                         ownerName: 'Gurpreet Singh',  email: 'g@bioenergy.in',     phone: '9876543212', status: 'approved' },
      { name: 'TerraWatts',      type: 'Solar',  location: 'Maharashtra',   capacity: 200,  available: 150, price: 4.0, rating: 4.9, verified: true,  description: 'Utility-scale solar farm near Pune.',                      ownerName: 'Suresh Kulkarni', email: 's@terrawatts.in',    phone: '9876543213', status: 'approved' },
      { name: 'AirPower Inc.',   type: 'Wind',   location: 'Tamil Nadu',    capacity: 800,  available: 600, price: 3.5, rating: 4.7, verified: true,  description: 'Onshore wind turbines along the Coromandel Coast.',        ownerName: 'Anita Kumar',     email: 'anita@airpower.in',  phone: '9876543214', status: 'approved' },
      { name: 'Organic Watts',   type: 'Biogas', location: 'Haryana',       capacity: 40,   available: 30,  price: 5.4, rating: 4.1, verified: false, description: 'Community biogas from municipal organic waste.',           ownerName: 'Deepak Yadav',    email: 'd@owatts.in',        phone: '9876543215', status: 'approved' },
      { name: 'HeliosTech',      type: 'Solar',  location: 'Karnataka',     capacity: 350,  available: 280, price: 3.9, rating: 4.7, verified: true,  description: 'Ground-mounted solar arrays at the Bangalore solar park.', ownerName: 'Priya Reddy',     email: 'priya@helios.in',    phone: '9876543216', status: 'approved' },
      { name: 'Cyclone Energy',  type: 'Wind',   location: 'Andhra Pradesh',capacity: 1200, available: 900, price: 3.2, rating: 4.8, verified: true,  description: 'Large-scale wind energy along the Eastern Ghats.',        ownerName: 'Venkat Rao',      email: 'v@cyclone.in',       phone: '9876543217', status: 'approved' },
      { name: 'SkyWatts UP',     type: 'Solar',  location: 'Uttar Pradesh', capacity: 180,  available: 120, price: 4.5, rating: 4.2, verified: false, description: 'Rooftop solar installations in Lucknow and Agra.',        ownerName: 'Rahul Verma',     email: 'rahul@skywatts.in',  phone: '9876543218', status: 'pending'  },
    ]);
    console.log('Sample producers seeded.');
  }

  console.log('Database ready!');
}

/* ── Start server ────────────────────────────────────────────────────────── */
const server = app.listen(PORT, () => {
  console.log(`\nGreenHub Backend v3  →  http://localhost:${PORT}\n`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') { console.error(`Port ${PORT} is already in use.`); process.exit(1); }
  else throw err;
});

export default app;
