import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';
import { SOURCES, STATUSES } from '../config/constants.js';

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

inquirySchema.pre('save', function setUpdatedAt(next) {
  this.updated_at = new Date();
  next();
});

export type InquiryShape = InferSchemaType<typeof inquirySchema>;
export type InquiryDocument = HydratedDocument<InquiryShape>;

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
