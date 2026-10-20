import Result from '../models/Result.js';

export async function listResults(req, res) {
  const filter = req.query.student ? { student: req.query.student } : {};
  const results = await Result.find(filter).populate('student', 'fullName studentId course').sort({ createdAt: -1 });
  res.json({ results });
}

export async function createResult(req, res) {
  if (req.body.marks > req.body.maxMarks) return res.status(400).json({ message: 'Marks cannot exceed maximum marks' });
  const result = await Result.create(req.body);
  res.status(201).json({ result: await result.populate('student', 'fullName studentId') });
}

export async function importResults(req, res) {
  if (req.body.some((item) => item.marks > item.maxMarks)) return res.status(400).json({ message: 'Marks cannot exceed maximum marks' });
  const imported = await Result.insertMany(req.body);
  const results = await Result.find({ _id: { $in: imported.map((item) => item._id) } }).populate('student', 'fullName studentId course').sort({ createdAt: -1 });
  res.status(201).json({ results });
}

export async function deleteResult(req, res) {
  const result = await Result.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ message: 'Result not found' });
  res.status(204).send();
}

