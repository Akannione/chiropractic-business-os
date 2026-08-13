import mongoose, { InferSchemaType } from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    inquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', default: null },
    patient_name: { type: String, default: '', trim: true },
    action: { type: String, required: true, trim: true },
    detail: { type: String, default: '', trim: true },
    created_at: { type: Date, required: true, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const publicRet = ret as Record<string, unknown> & { _id?: { toString(): string } };
        publicRet.id = publicRet._id?.toString() || '';
        delete publicRet._id;
        return publicRet;
      },
    },
  },
);

// The activity feed reads newest first, and per-inquiry history filters by id.
activitySchema.index({ created_at: -1 });
activitySchema.index({ inquiry_id: 1, created_at: -1 });

export type ActivityShape = InferSchemaType<typeof activitySchema>;
export const Activity = mongoose.model('Activity', activitySchema);
