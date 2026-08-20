import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { Expense } from '@/models/Expense';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['owner', 'admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    
    // Support filtering by month/year or just get all recent
    const url = new URL(req.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    let query: any = { isDeleted: { $ne: true } };
    let expenses;
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
      expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
    } else {
      expenses = await Expense.find({ isDeleted: { $ne: true } }).sort({ date: -1 }).limit(100);
    }
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Fetch Expenses Error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['owner', 'admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();
    
    if (!body.title || !body.amount) {
      return NextResponse.json({ error: 'Title and amount are required' }, { status: 400 });
    }

    const expense = await Expense.create({
      title: body.title,
      amount: Number(body.amount),
      quantity: body.quantity ? Number(body.quantity) : 1,
      unit: body.unit || 'pcs',
      category: body.category || 'operasional',
      notes: body.notes || '',
      date: body.date ? new Date(body.date) : new Date()
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Create Expense Error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
