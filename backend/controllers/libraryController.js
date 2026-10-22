import LibraryBook from '../models/LibraryBook.js';

export async function listBooks(req, res) {
  const filter = {};
  if (req.query.category) filter.category = String(req.query.category).slice(0, 60);
  const search = String(req.query.search || '').trim().slice(0, 80);
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');
    filter.$or = [{ title: pattern }, { author: pattern }, { isbn: pattern }];
  }
  const [books, categories, totals] = await Promise.all([
    LibraryBook.find(filter).sort({ title: 1 }).limit(500),
    LibraryBook.distinct('category'),
    LibraryBook.aggregate([{ $group: { _id: null, titles: { $sum: 1 }, copies: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }])
  ]);
  const summary = totals[0] || { titles: 0, copies: 0, available: 0 };
  res.json({ books, categories: categories.sort(), summary: { titles: summary.titles, copies: summary.copies, available: summary.available, issued: summary.copies - summary.available } });
}

export async function createBook(req, res) {
  const { totalCopies, isbn, ...details } = req.body;
  const book = await LibraryBook.create({ ...details, ...(isbn ? { isbn } : {}), totalCopies, availableCopies: totalCopies, createdBy: req.user.id });
  res.status(201).json({ book });
}

export async function circulateBook(req, res) {
  const { action } = req.body;
  const isIssue = action === 'issue';
  const filter = { _id: req.params.id, ...(isIssue ? { availableCopies: { $gt: 0 } } : { $expr: { $lt: ['$availableCopies', '$totalCopies'] } }) };
  const book = await LibraryBook.findOneAndUpdate(filter, { $inc: { availableCopies: isIssue ? -1 : 1 } }, { new: true, runValidators: true });
  if (!book) {
    const exists = await LibraryBook.exists({ _id: req.params.id });
    if (!exists) return res.status(404).json({ message: 'Book not found' });
    return res.status(409).json({ message: isIssue ? 'No copies are available to issue' : 'All copies are already marked available' });
  }
  res.json({ book });
}
