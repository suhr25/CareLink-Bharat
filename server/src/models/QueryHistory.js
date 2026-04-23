import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const queryHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: [true, 'Query text is required'],
      trim: true,
      maxlength: 1000,
    },
    language: {
      type: String,
      enum: ['en-IN', 'hi-IN'],
      default: 'en-IN',
    },
    steps: [stepSchema],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

queryHistorySchema.index({ userId: 1, createdAt: -1 });
queryHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // TTL: 90 days

export default mongoose.model('QueryHistory', queryHistorySchema);
