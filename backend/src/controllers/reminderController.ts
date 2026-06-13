import { Request, Response } from 'express';
import { LOST_STATUS } from '../config/constants.js';
import { Inquiry } from '../models/Inquiry.js';
import { sendDailyFollowUpSummary } from '../services/notificationService.js';
import { startOfToday } from '../utils/date.js';

export async function postDailySummary(_req: Request, res: Response) {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [overdue, dueToday, newInquiries] = await Promise.all([
    Inquiry.find({ status: { $ne: LOST_STATUS }, next_follow_up_date: { $lt: today } }).sort({ next_follow_up_date: 1 }).lean(),
    Inquiry.find({ status: { $ne: LOST_STATUS }, next_follow_up_date: { $gte: today, $lt: tomorrow } }).sort({ created_at: -1 }).lean(),
    Inquiry.find({ created_at: { $gte: today } }).sort({ created_at: -1 }).lean(),
  ]);

  const result = await sendDailyFollowUpSummary({ overdue, dueToday, newInquiries });
  res.json({
    ...result,
    overdue: overdue.length,
    dueToday: dueToday.length,
    newInquiries: newInquiries.length,
  });
}
