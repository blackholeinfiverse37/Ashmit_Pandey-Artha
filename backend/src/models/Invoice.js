import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  customerGSTIN: {
    type: String,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    // Optional - for B2B transactions
  },
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  items: [{
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 18, // Default GST rate
    },
    hsnCode: String, // HSN/SAC code for GST
  }],
  
  // Alias for backward compatibility
  lines: {
    type: [{
      description: String,
      quantity: Number,
      unitPrice: String,
      amount: String,
      taxRate: Number,
      hsnCode: String,
    }],
    default: function() {
      return this.items;
    }
  },
  subtotal: {
    type: String,
    required: true,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  taxAmount: {
    type: String,
    default: '0',
  },
  
  // GST breakdown (for India compliance)
  gstBreakdown: {
    cgst: {
      type: String,
      default: '0',
    },
    sgst: {
      type: String,
      default: '0',
    },
    igst: {
      type: String,
      default: '0',
    },
    cess: {
      type: String,
      default: '0',
    },
  },
  
  // Alias for backward compatibility
  totalTax: {
    type: String,
    default: function() {
      return this.taxAmount;
    }
  },
  totalAmount: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: String,
    default: '0',
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  payments: [{
    amount: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    reference: String,
    journalEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry',
    },
    notes: String,
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual for amount due
invoiceSchema.virtual('amountDue').get(function() {
  const total = parseFloat(this.totalAmount) || 0;
  const paid = parseFloat(this.amountPaid) || 0;
  return (total - paid).toFixed(2);
});

// Update status based on payments
invoiceSchema.pre('save', function(next) {
  const total = parseFloat(this.totalAmount) || 0;
  const paid = parseFloat(this.amountPaid) || 0;
  
  if (this.status !== 'cancelled') {
    if (paid >= total && total > 0) {
      this.status = 'paid';
    } else if (paid > 0) {
      this.status = 'partial';
    } else if (this.status === 'sent' && new Date() > this.dueDate) {
      this.status = 'overdue';
    }
  }
  
  next();
});

// Ensure virtual fields are serialized
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

export default mongoose.model('Invoice', invoiceSchema);