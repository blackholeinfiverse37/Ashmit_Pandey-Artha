import mongoose from 'mongoose';
import crypto from 'crypto';

const journalLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true,
  },
  debit: {
    type: String,
    default: '0',
    // Stored as string to preserve precision (use Decimal.js for calculations)
  },
  credit: {
    type: String,
    default: '0',
  },
  description: String,
}, { _id: false });

const journalEntrySchema = new mongoose.Schema({
  entryNumber: {
    type: String,
    required: true,
    unique: true,
    // Format: JE-YYYYMMDD-XXXX
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  lines: {
    type: [journalLineSchema],
    validate: {
      validator: function(lines) {
        return lines && lines.length >= 2;
      },
      message: 'Journal entry must have at least 2 lines',
    },
  },
  reference: {
    type: String,
    // External reference: invoice number, expense ID, etc.
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'voided'],
    default: 'draft',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  postedAt: Date,
  
  // Audit chain fields
  immutable_hash: {
    type: String,
    required: true,
  },
  prev_hash: {
    type: String,
    default: '0',
  },
  
  // Metadata
  tags: [String],
  attachments: [String],
}, {
  timestamps: true,
});

// Generate entry number
journalEntrySchema.pre('save', async function(next) {
  if (this.isNew && !this.entryNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('JournalEntry').countDocuments({
      entryNumber: new RegExp(`^JE-${dateStr}`)
    });
    this.entryNumber = `JE-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Calculate immutable hash
journalEntrySchema.methods.calculateHash = function() {
  const payload = {
    entryNumber: this.entryNumber,
    date: this.date.toISOString(),
    description: this.description,
    lines: this.lines,
    prev_hash: this.prev_hash,
  };
  
  const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
};

export default mongoose.model('JournalEntry', journalEntrySchema);