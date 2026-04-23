import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueryHistory',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  }
);

feedbackSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
