import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
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
    
    const url = new URL(req.url);
    const startStr = url.searchParams.get('startDate');
    const endStr = url.searchParams.get('endDate');

    // Default to current month if no dates provided
    let startDate: Date;
    let endDate: Date;

    if (startStr && endStr) {
      startDate = new Date(startStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const dateQuery = { $gte: startDate, $lte: endDate };

    // Fetch Transactions
    const transactions = await Transaction.find({
      createdAt: dateQuery,
      paymentStatus: 'paid'
    }).sort({ createdAt: -1 });

    // Fetch Expenses
    const expenses = await Expense.find({
      date: dateQuery,
      isDeleted: { $ne: true }
    }).sort({ date: -1 });

    // Calculate Totals
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpense;

    return NextResponse.json({
      startDate,
      endDate,
      summary: {
        totalTransactions: transactions.length,
        totalRevenue,
        totalExpense,
        netProfit
      },
      transactions,
      expenses
    });
  } catch (error) {
    console.error('Fetch Reports Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
