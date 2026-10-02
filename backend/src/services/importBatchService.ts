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

export async function undoImportBatch(batchId: string) {
  const batch = await ImportBatch.findOne({ batch_id: batchId });
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

  if (batch.status === 'processing') {
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
    const blockedModifiedCount = await Inquiry.countDocuments({
      import_batch_id: batchId,
      updated_at: { $gt: completedAt },
    });
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

  const activityResult = await Activity.deleteMany({ import_batch_id: batchId });
  const inquiryResult = await Inquiry.deleteMany({ import_batch_id: batchId });
  await ImportBatch.updateOne(
    { batch_id: batchId },
    { $set: { status: 'undone', undone_at: new Date() } },
  );

  return {
    batchId,
    deletedInquiries: inquiryResult.deletedCount,
    deletedActivities: activityResult.deletedCount,
    alreadyUndone: false,
    blockedModifiedCount: 0,
  };
}
