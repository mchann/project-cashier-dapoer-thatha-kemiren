import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  targetRole: 'admin' | 'staff' | 'all';
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['success', 'warning', 'danger', 'info'], 
      default: 'info' 
    },
    targetRole: {
      type: String,
      enum: ['admin', 'staff', 'all'],
      required: true
    },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// TTL Index: Hapus otomatis dokumen setelah 10 hari (864000 detik)
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 864000 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
