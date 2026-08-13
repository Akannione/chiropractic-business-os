import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';
import {
  APPOINTMENT_STATUSES,
  FOLLOW_UP_OUTCOMES,
  OFFER_TYPES,
  PATIENT_TYPES,
  SOURCES,
  STATUSES,
} from '../config/constants.js';

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    service_needed: { type: String, required: true, trim: true },
    source: { type: String, required: true, enum: SOURCES },
    status: { type: String, required: true, enum: STATUSES },
    estimated_value: { type: Number, required: true, default: 0, min: 0 },
    notes: { type: String, default: '', trim: true },
    next_follow_up_date: { type: Date, default: null },
    appointment_status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'Not Scheduled',
    },
    patient_type: {
      type: String,
      enum: PATIENT_TYPES,
      default: 'New Patient',
    },
    appointment_request: { type: String, default: '', trim: true },
    offer_type: { type: String, enum: OFFER_TYPES, default: 'None' },
    last_visit_date: { type: Date, default: null },
    expected_visit_frequency_days: { type: Number, default: null, min: 1 },
    assigned_follow_up_owner: { type: String, default: '', trim: true },
    follow_up_outcome: {
      type: String,
      enum: FOLLOW_UP_OUTCOMES,
      default: 'Not Contacted',
    },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const publicRet = ret as Record<string, unknown> & { _id?: { toString(): string } };
        publicRet.id = publicRet._id?.toString() || '';
        delete publicRet._id;
        return publicRet;
      },
    },
  },
);

/**
 * Without these every read is a collection scan. Measured at 20,000 records, a
 * single lookup by email examined all 20,000 documents to return one.
 *
 * Email and phone are not unique here on purpose. Duplicate prevention lives in
 * importService, and existing collections may already contain duplicates that a
 * unique index would reject at startup. Promoting these to unique needs a
 * de-duplication pass first.
 */
inquirySchema.index({ email: 1 });
inquirySchema.index({ phone: 1 });

// Default listing and CSV export sort.
inquirySchema.index({ created_at: -1, _id: -1 });

// Follow-up KPIs, the daily reminder queries, and the dashboard workflow.
inquirySchema.index({ status: 1, next_follow_up_date: 1 });

// Reactivation eligibility: not Lost, not a Dead Lead, and has visit history.
inquirySchema.index({ status: 1, patient_type: 1, last_visit_date: 1 });

inquirySchema.pre('save', function setUpdatedAt(next) {
  this.updated_at = new Date();
  next();
});

export type InquiryShape = InferSchemaType<typeof inquirySchema>;
export type InquiryDocument = HydratedDocument<InquiryShape>;

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
