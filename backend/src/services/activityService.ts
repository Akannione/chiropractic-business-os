import { Activity } from '../models/Activity.js';

type ActivityInput = {
  inquiryId?: string;
  patientName?: string;
  action: string;
  detail?: string;
};

export async function logActivity(input: ActivityInput) {
  await Activity.create({
    inquiry_id: input.inquiryId || null,
    patient_name: input.patientName || '',
    action: input.action,
    detail: input.detail || '',
    created_at: new Date(),
  });
}

export async function listActivities(limit = 40) {
  const activities = await Activity.find().sort({ created_at: -1, _id: -1 }).limit(limit).lean();
  return activities.map((activity) => ({
    ...activity,
    id: String(activity._id),
    _id: undefined,
  }));
}
