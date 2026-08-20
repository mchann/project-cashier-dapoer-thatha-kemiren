import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { GuideVoucher } from '@/models/GuideVoucher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Generate random code (e.g. G-XXXX)
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'G-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const vouchers = await GuideVoucher.find().sort({ createdAt: -1 });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error('Error fetching guide vouchers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guideName, rewardType, amountType, amount } = await req.json();

    if (!guideName || !rewardType || !amountType || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectMongo();

    // Generate unique code
    let code = generateCode();
    let exists = await GuideVoucher.findOne({ code });
    while (exists) {
      code = generateCode();
      exists = await GuideVoucher.findOne({ code });
    }

    const newVoucher = await GuideVoucher.create({
      code,
      guideName,
      rewardType,
      amountType,
      amount,
      status: 'active'
    });

    return NextResponse.json(newVoucher, { status: 201 });
  } catch (error) {
    console.error('Error creating guide voucher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
      }
  
      await connectMongo();
      const deleted = await GuideVoucher.findByIdAndDelete(id);
      
      if (!deleted) {
          return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error('Error deleting guide voucher:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
