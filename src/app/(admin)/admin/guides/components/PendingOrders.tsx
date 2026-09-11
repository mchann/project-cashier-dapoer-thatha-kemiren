import React from 'react';

export interface PendingOrder {
  _id: string;
  invoiceNumber: string;
  guideName: string;
  customerName: string;
  grandTotal: number;
  createdAt: string;
}

interface Props {
  isLoading: boolean;
  orders: PendingOrder[];
  onProcessReward: (order: PendingOrder) => void;
  formatRupiah: (amount: number) => string;
}

export function PendingOrders({ isLoading, orders, onProcessReward, formatRupiah }: Props) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-black text-[#4B3832] mb-4 flex items-center gap-2">
        <span className="bg-orange-500 w-3 h-3 rounded-full animate-pulse"></span>
        Pesanan Menunggu Reward
      </h2>
      
      {isLoading ? (
        <div className="text-[#8B7355] text-sm">Memuat data...</div>
      ) : orders.length === 0 ? (
        <div className="bg-[#FFFDF7] p-8 rounded-2xl border border-[#DCC7AA]/40 text-center text-[#8B7355]">
          <p className="font-bold">Tidak ada pesanan guide yang menunggu reward.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <div key={order._id} className="bg-[#FFFDF7] p-5 rounded-2xl border-2 border-orange-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Pesanan Guide</p>
                  <h3 className="font-black text-[#4B3832]">{order.guideName || 'Guide (Tanpa Nama)'}</h3>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{order.invoiceNumber}</span>
              </div>
              <div className="text-sm text-[#6F4E37] mb-4">
                <p>Tamu: <span className="font-semibold">{order.customerName}</span></p>
                <p>Total: <span className="font-bold">{formatRupiah(order.grandTotal)}</span></p>
              </div>
              <button
                onClick={() => onProcessReward(order)}
                className="w-full bg-orange-100 hover:bg-orange-500 text-orange-700 hover:text-white py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                Proses Reward
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
