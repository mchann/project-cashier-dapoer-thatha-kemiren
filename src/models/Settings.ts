import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISettings extends Document {
  receipt: {
    storeName: string;
    address: string;
    phone: string;
    footerMessage: string;
    wifiInfo: string;
  };
  reservation: {
    whatsappNumber: string;
  };
  landingPage: {
    heroImage: string;
    aboutImage: string;
    aboutText: string;
    loginImage: string;
  };
  pos: {
    cancellationPin: string;
  };
}

const settingsSchema = new Schema<ISettings>(
  {
    receipt: {
      storeName: { type: String, default: 'DAPOER THATHA' },
      address: { type: String, default: 'Desa Kemiren, Glagah, Banyuwangi' },
      phone: { type: String, default: '0812-3456-7890' },
      footerMessage: { type: String, default: 'TERIMA KASIH\nAtas kunjungan Anda' },
      wifiInfo: { type: String, default: 'Wifi: dapoerthatha | Pass: kemiren123' },
    },
    reservation: {
      whatsappNumber: { type: String, default: '081234567890' },
    },
    landingPage: {
      heroImage: { type: String, default: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop' },
      aboutImage: { type: String, default: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfeffe?q=80&w=1200&auto=format&fit=crop' },
      aboutText: { type: String, default: 'Dapoer Thatha menyajikan hidangan otentik khas Banyuwangi dengan sentuhan resep tradisional yang diwariskan turun-temurun. Kami percaya bahwa setiap porsi makanan membawa cerita dari dapur kami ke meja Anda.' },
      loginImage: { type: String, default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop' },
    },
    pos: {
      cancellationPin: { type: String, default: '1234' },
    },
  },
  { timestamps: true, strict: false }
);

// Hapus cache model saat mode development agar schema update terbaca
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Settings;
}

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);
