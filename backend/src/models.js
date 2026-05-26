import mongoose from 'mongoose';

/* ── USER ─────────────────────────────────────────────────────────────────── */
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  userType:  { type: String, enum: ['consumer', 'producer', 'investor'], default: 'consumer' },
  city:      { type: String, default: '' },
  phone:     { type: String, default: '' },
  avatar:    { type: String, default: '' },
}, { timestamps: true });

/* ── PRODUCER ─────────────────────────────────────────────────────────────── */
const producerSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  type:         { type: String, enum: ['Solar','Wind','Biogas','Hydro'], required: true },
  location:     { type: String, required: true },
  capacity:     { type: Number, required: true },
  capacityUnit: { type: String, default: 'kW' },
  available:    { type: Number, required: true },
  price:        { type: Number, required: true },
  rating:       { type: Number, default: 4.0 },
  verified:     { type: Boolean, default: false },
  description:  { type: String, default: '' },
  ownerName:    { type: String, default: '' },
  email:        { type: String, default: '' },
  phone:        { type: String, default: '' },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:       { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  adminNote:    { type: String, default: '' },
}, { timestamps: true });

/* ── TRADE ────────────────────────────────────────────────────────────────── */
const tradeSchema = new mongoose.Schema({
  tradeId:      { type: String, unique: true },
  producerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Producer' },
  producerName: String,
  consumer:     String,
  amount:       Number,
  unit:         { type: String, default: 'kWh' },
  pricePerUnit: Number,
  totalValue:   Number,
  status:       { type: String, enum: ['pending','completed','cancelled'], default: 'pending' },
  type:         String,
  co2Offset:    Number,
}, { timestamps: true });

/* ── BUY REQUEST ──────────────────────────────────────────────────────────── */
const buyRequestSchema = new mongoose.Schema({
  reqId:       { type: String, unique: true },
  producerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Producer' },
  producerName:String,
  energyType:  String,
  buyerName:   String,
  buyerEmail:  String,
  buyerPhone:  { type: String, default: '' },
  buyerType:   { type: String, default: 'Home' },
  buyerCity:   { type: String, default: '' },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount:      Number,
  duration:    { type: String, default: 'Monthly' },
  pricePerUnit:Number,
  totalEstimate:Number,
  message:     { type: String, default: '' },
  status:      { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
}, { timestamps: true });

/* ── CONNECTION ───────────────────────────────────────────────────────────── */
const connectionSchema = new mongoose.Schema({
  connId: { type: String, unique: true },
  role:   { type: String, enum: ['consumer','producer','investor'], required: true },
  name:   { type: String, required: true },
  email:  { type: String, required: true },
  phone:  { type: String, default: '' },
  city:   { type: String, default: '' },
  company:{ type: String, default: '' },
  message:{ type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','contacted','resolved'], default: 'pending' },
}, { timestamps: true });

/* ── COMMUNITY MEMBER ─────────────────────────────────────────────────────── */
const communityMemberSchema = new mongoose.Schema({
  communityId:  { type: Number, required: true },
  communityName:{ type: String },
  name:         { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, default: '' },
  city:         { type: String, default: '' },
  reason:       { type: String, default: '' },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

/* ── SUPPORT QUERY ────────────────────────────────────────────────────────── */
const supportSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  category: { type: String, enum: ['Trading','Payment','Technical','Account','Other'], default: 'Other' },
  subject:  { type: String, required: true },
  message:  { type: String, required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:   { type: String, enum: ['open','in-progress','resolved'], default: 'open' },
  adminReply:{ type: String, default: '' },
}, { timestamps: true });

export const User            = mongoose.model('User', userSchema);
export const Producer        = mongoose.model('Producer', producerSchema);
export const Trade           = mongoose.model('Trade', tradeSchema);
export const BuyRequest      = mongoose.model('BuyRequest', buyRequestSchema);
export const Connection      = mongoose.model('Connection', connectionSchema);
export const CommunityMember = mongoose.model('CommunityMember', communityMemberSchema);
export const SupportQuery    = mongoose.model('SupportQuery', supportSchema);
