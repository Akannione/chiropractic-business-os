import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { toCsv } from '../utils/csv.js';
import { formatDate } from '../utils/date.js';

export async function exportInquiriesCsv(_req: Request, res: Response) {
  const inquiries = await Inquiry.find().sort({ created_at: -1 }).lean();
  const rows = inquiries.map((inquiry) => ({
    ...inquiry,
    next_follow_up_date: formatDate(inquiry.next_follow_up_date),
  }));
  res.header('Content-Type', 'text/csv');
  res.attachment(`patient_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(toCsv(rows));
}
