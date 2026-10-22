import { randomBytes } from 'node:crypto';
import FeeRecord from '../models/FeeRecord.js';
import Student from '../models/Student.js';

const feeTypes = ['academic', 'hostel', 'library', 'bus'];
const categoryNames = { academic: 'Academic fee', hostel: 'Hostel fee', library: 'Library fee', bus: 'Bus fee' };

async function markOverdue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await FeeRecord.updateMany({ status: 'Pending', dueDate: { $lt: today } }, { $set: { status: 'Overdue' } });
}

export async function listFees(req, res) {
  await markOverdue();
  const filter = {};
  if (feeTypes.includes(req.query.category)) filter.category = req.query.category;
  if (['Pending', 'Paid', 'Overdue'].includes(req.query.status)) filter.status = req.query.status;
  const search = String(req.query.search || '').trim().slice(0, 80);
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const students = await Student.find({ $or: [{ fullName: new RegExp(escaped, 'i') }, { studentId: new RegExp(escaped, 'i') }] }).select('_id').limit(100);
    filter.$or = [{ receiptNumber: new RegExp(escaped, 'i') }, { student: { $in: students.map(({ _id }) => _id) } }];
  }
  const fees = await FeeRecord.find(filter).populate('student', 'fullName studentId course').sort({ dueDate: 1, createdAt: -1 }).limit(500);
  res.json({ fees });
}

export async function feeSummary(req, res) {
  await markOverdue();
  const [grouped, accountCount] = await Promise.all([
    FeeRecord.aggregate([{ $group: { _id: { category: '$category', status: '$status' }, amount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    FeeRecord.countDocuments()
  ]);
  const byCategory = Object.fromEntries(feeTypes.map((category) => [category, { id: category, name: categoryNames[category], collected: 0, pending: 0, overdue: 0, totalAccounts: 0 }]));
  let collected = 0;
  let pending = 0;
  let overdue = 0;
  let overdueAccounts = 0;
  for (const row of grouped) {
    const category = byCategory[row._id.category];
    if (!category) continue;
    category.totalAccounts += row.count;
    if (row._id.status === 'Paid') { category.collected += row.amount; collected += row.amount; }
    if (row._id.status === 'Pending') { category.pending += row.amount; pending += row.amount; }
    if (row._id.status === 'Overdue') { category.overdue += row.amount; overdue += row.amount; overdueAccounts += row.count; }
  }
  const billed = collected + pending + overdue;
  res.json({ summary: { totals: { collected, pending, overdueAmount: overdue, overdueAccounts, totalAccounts: accountCount, collectionRate: billed ? Math.round(collected / billed * 100) : 0 }, categories: Object.values(byCategory) } });
}

export async function createFee(req, res) {
  const student = await Student.findById(req.body.student).select('_id');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  const receiptNumber = `F-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${suffix}`;
  const fee = await FeeRecord.create({ ...req.body, receiptNumber, createdBy: req.user.id });
  res.status(201).json({ fee: await fee.populate('student', 'fullName studentId course') });
}

export async function updateFeeStatus(req, res) {
  const record = await FeeRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Fee record not found' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = req.body.status === 'Pending' && record.dueDate < today ? 'Overdue' : req.body.status;
  const fee = await FeeRecord.findByIdAndUpdate(req.params.id, { status, paidAt: status === 'Paid' ? new Date() : null }, { new: true, runValidators: true }).populate('student', 'fullName studentId course');
  res.json({ fee });
}
