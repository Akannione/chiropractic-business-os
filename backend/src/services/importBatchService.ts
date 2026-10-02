import mongoose, { type ClientSession } from 'mongoose';
import { Activity } from '../models/Activity.js';
import { ImportBatch } from '../models/ImportBatch.js';
import { Inquiry } from '../models/Inquiry.js';

export async function listImportBatches(limit = 20) {
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit || 20)));
  const batches = await ImportBatch.find()
    .sort({ created_at: -1, _id: -1 })
    .limit(safeLimit)
    .lean();

  return batches.map((batch) => ({
    batchId: batch.batch_id,
    totalRows: batch.total_rows,
    imported: batch.imported,
    skippedDuplicates: batch.skipped_duplicates,
    failed: batch.failed,
    errors: batch.errors,
    status: batch.status,
    createdAt: batch.created_at,
    completedAt: batch.completed_at,
    undoneAt: batch.undone_at,
  }));
}

const PROCESSING_UNDO_GRACE_MS = 15 * 60 * 1000;

type UndoResult = {
  batchId: string;
  deletedInquiries: number;
  deletedActivities: number;
  alreadyUndone: boolean;
  blockedModifiedCount: number;
};

async function runUndoImportBatch(batchId: string, session?: ClientSession): Promise<UndoResult | null> {
  const batchQuery = ImportBatch.findOne({ batch_id: batchId });
  if (session) batchQuery.session(session);
  const batch = await batchQuery;
  if (!batch) return null;

  if (batch.status === 'undone') {
    return {
      batchId,
      deletedInquiries: 0,
      deletedActivities: 0,
      alreadyUndone: true,
      blockedModifiedCount: 0,
    };
  }

  if (
    batch.status === 'processing'
    && Date.now() - batch.created_at.getTime() < PROCESSING_UNDO_GRACE_MS
  ) {
    return {
      batchId,
      deletedInquiries: 0,
      deletedActivities: 0,
      alreadyUndone: false,
      blockedModifiedCount: -1,
    };
  }

  // Never erase an imported record that staff changed after the import
  // completed. That turns "undo import" into a safe recovery action rather
  // than a destructive bulk delete.
  const completedAt = batch.completed_at;
  if (completedAt) {
    const modifiedQuery = Inquiry.countDocuments({
      import_batch_id: batchId,
      updated_at: { $gt: completedAt },
    });
    if (session) modifiedQuery.session(session);
    const blockedModifiedCount = await modifiedQuery;
    if (blockedModifiedCount > 0) {
      return {
        batchId,
        deletedInquiries: 0,
        deletedActivities: 0,
        alreadyUndone: false,
        blockedModifiedCount,
      };
    }
  }

  // In standalone MongoDB this fallback is intentionally retry-safe: inquiries
  // go first, then their import-created activities, and the batch is marked
  // undone last. If a later write fails, retrying the same batch completes the
  // remaining cleanup without touching unrelated records.
  const inquiryResult = await Inquiry.deleteMany(
    { import_batch_id: batchId },
    session ? { session } : {},
  );
  const activityResult = await Activity.deleteMany(
    { import_batch_id: batchId },
    session ? { session } : {},
  );
  await ImportBatch.updateOne(
    { batch_id: batchId },
    { $set: { status: 'undone', undone_at: new Date() } },
    session ? { session } : {},
  );

  return {
    batchId,
    deletedInquiries: inquiryResult.deletedCount,
    deletedActivities: activityResult.deletedCount,
    alreadyUndone: false,
    blockedModifiedCount: 0,
  };
}

function isTransactionUnsupported(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Transaction numbers are only allowed|replica set member|transactions are not supported/i.test(message);
}

export async function undoImportBatch(batchId: string) {
  const session = await mongoose.startSession();
  try {
    let result: UndoResult | null = null;
    await session.withTransaction(async () => {
      result = await runUndoImportBatch(batchId, session);
    });
    return result;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      return runUndoImportBatch(batchId);
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
