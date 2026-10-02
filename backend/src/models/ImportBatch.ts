import mongoose, { InferSchemaType } from 'mongoose';

export const IMPORT_BATCH_STATUSES = ['processing', 'completed', 'partial', 'failed', 'undone'] as const;

const importBatchSchema = new mongoose.Schema(
  {
    batch_id: { type: String, required: true, unique: true, trim: true },
    total_rows: { type: Number, required: true, min: 0 },
    imported: { type: Number, required: true, default: 0, min: 0 },
    skipped_duplicates: { type: Number, required: true, default: 0, min: 0 },
    failed: { type: Number, required: true, default: 0, min: 0 },
    errors: { type: [String], default: [] },
    status: { type: String, required: true, enum: IMPORT_BATCH_STATUSES, default: 'processing' },
    created_at: { type: Date, required: true, default: Date.now },
    completed_at: { type: Date, default: null },
    undone_at: { type: Date, default: null },
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

importBatchSchema.index({ created_at: -1 });

export type ImportBatchShape = InferSchemaType<typeof importBatchSchema>;
export const ImportBatch = mongoose.model('ImportBatch', importBatchSchema);
