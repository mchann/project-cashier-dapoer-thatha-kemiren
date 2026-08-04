// src/components/pos/OrderCart.tsx
'use client';

import React from 'react';
import { OrderItem, Partner } from '@/types/pos';
import { TravelPartnerSelector } from './TravelPartnerSelector';

interface OrderCartProps {
  orderType: 'dine_in' | 'takeaway';
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  paymentMode: 'pay_now' | 'save_faktur';
  dpAmount: number;
  guideCommission: number;
  partners: Partner[];
  isPartnerOrder: boolean;
  selectedPartnerId: string;
  onChangeOrderType: (type: 'dine_in' | 'takeaway') => void;
  onUpdateTableNumber: (val: string) => void;
  onUpdateCustomerName: (val: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onChangePaymentMode: (mode: 'pay_now' | 'save_faktur') => void;
  onTogglePartner: (checked: boolean) => void;
  onSelectPartner: (partnerId: string, partnerName: string) => void;
  onChangeCommission: (commission: number) => void;
  onSaveFakturGantung: () => void;
  onPayNow: () => void;
  onOpenVoidModal: () => void;
  onClearCart: () => void;
}

export function OrderCart({
  orderType,
  tableNumber,
  customerName,
  items,
  paymentMode,
  dpAmount,
  guideCommission,
  partners,
  isPartnerOrder,
  selectedPartnerId,
  onChangeOrderType,
  onUpdateTableNumber,
  onUpdateCustomerName,
  onUpdateQuantity,
  onRemoveItem,
  onChangePaymentMode,
  onTogglePartner,
  onSelectPartner,
  onChangeCommission,
  onSaveFakturGantung,
  onPayNow,
  onOpenVoidModal,
  onClearCart,
}: OrderCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <aside 
      aria-label="Keranjang Pesanan Kasir" 
      className="bg-[#fffbeb] border-4 border-[#d6d3d1] rounded-2xl shadow-xl flex flex-col h-full overflow-hidden"
    >
      {/* Header Panel Keranjang - Tema Coklat Espresso & Kuning Emas Soft */}
      <div className="bg-[#451a03] text-white px-5 py-4 border-b-2 border-[#d97706] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fcd34d] inline-block" />
          <h2 className="text-xl font-black tracking-wide text-[#fefce8]">
            KERANJANG PESANAN
          </h2>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-xs font-bold text-[#fde047] hover:text-white px-2.5 py-1 rounded bg-[#78350f] border border-[#d97706] cursor-pointer transition-colors"
          >
            Kosongkan
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Pilihan Tipe Pesanan (Dine-In vs Takeaway/Bungkus) */}
        <div className="bg-[#fefce8] p-2 rounded-xl border-2 border-[#e7e5e4] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeOrderType('dine_in')}
            className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-sm border-2 cursor-pointer transition-colors ${
              orderType === 'dine_in'
                ? 'bg-[#78350f] text-white border-[#451a03] shadow-sm'
                : 'bg-white text-[#57300a] border-[#d6d3d1] hover:bg-[#fef9c3]'
            }`}
          >
            🍽️ Dine-In (Meja)
          </button>
          <button
            type="button"
            onClick={() => onChangeOrderType('takeaway')}
            className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-sm border-2 cursor-pointer transition-colors ${
              orderType === 'takeaway'
                ? 'bg-[#b45309] text-white border-[#78350f] shadow-sm'
                : 'bg-white text-[#57300a] border-[#d6d3d1] hover:bg-[#fef9c3]'
            }`}
          >
            🛍️ Takeaway (Bungkus)
          </button>
        </div>

        {/* Input Nomor Meja & Nama Pelanggan (Kontras Tinggi) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label 
              htmlFor="table-number" 
              className="block text-sm font-extrabold text-[#451a03] mb-1"
            >
              No. Meja
            </label>
            <input
              id="table-number"
              type="text"
              disabled={orderType === 'takeaway'}
              value={orderType === 'takeaway' ? 'TA' : tableNumber}
              onChange={(e) => onUpdateTableNumber(e.target.value)}
              placeholder="Opsional"
              title="Nomor meja opsional. Untuk Takeaway otomatis bernilai TA / Bungkus."
              className={`w-full border-2 rounded-lg px-3 py-2 font-black text-xl text-center ${
                orderType === 'takeaway'
                  ? 'bg-[#fef3c7] border-[#d6d3d1] text-[#78350f] cursor-not-allowed'
                  : 'bg-white border-[#a8a29e] text-[#291404] focus:border-[#d97706]'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label 
              htmlFor="customer-name" 
              className="block text-sm font-extrabold text-[#451a03] mb-1"
            >
              Nama Pelanggan / Tamu
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => onUpdateCustomerName(e.target.value)}
              placeholder={orderType === 'takeaway' ? 'Contoh: Ibu Rina (Bungkus)' : 'Contoh: Pak Budi (Opsional)'}
              className="w-full bg-white border-2 border-[#a8a29e] rounded-lg px-3 py-2 font-bold text-base text-[#291404] focus:border-[#d97706]"
            />
          </div>
        </div>

        {/* Daftar Item Pesanan - Kuning Krim Soft dengan Kartu Putih */}
        <div className="border-2 border-[#d6d3d1] rounded-xl p-3 bg-[#fefce8] min-h-[180px] max-h-[300px] overflow-y-auto custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-[#78350f]">
              <p className="font-bold text-base">Belum ada pesanan.</p>
              <p className="text-xs mt-1 text-[#92400e]">Klik menu di sebelah kiri untuk menambah.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="bg-white border-2 border-[#e7e5e4] rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-base text-[#291404] truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm font-bold text-[#78350f]">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  {/* Kontrol Kuantitas */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.productId, -1)}
                      aria-label={`Kurangi 1 ${item.name}`}
                      className="w-8 h-8 rounded-lg bg-[#fef3c7] hover:bg-[#fde68a] text-[#451a03] font-black text-lg flex items-center justify-center border border-[#d97706] cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-lg text-[#291404]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.productId, 1)}
                      aria-label={`Tambah 1 ${item.name}`}
                      className="w-8 h-8 rounded-lg bg-[#fef3c7] hover:bg-[#fde68a] text-[#451a03] font-black text-lg flex items-center justify-center border border-[#d97706] cursor-pointer transition-colors"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.productId)}
                      aria-label={`Hapus ${item.name} dari keranjang`}
                      className="ml-1 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 rounded border border-red-300 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mitra Agen Travel / Tour Guide */}
        <TravelPartnerSelector
          partners={partners}
          isPartnerOrder={isPartnerOrder}
          selectedPartnerId={selectedPartnerId}
          guideCommission={guideCommission}
          onTogglePartner={onTogglePartner}
          onSelectPartner={onSelectPartner}
          onChangeCommission={onChangeCommission}
        />

        {/* Pemilihan Tipe Pembayaran (Bayar Awal vs Bayar Akhir) */}
        <div className="bg-[#fefce8] p-3 rounded-xl border-2 border-[#e7e5e4]">
          <p className="text-sm font-extrabold text-[#451a03] mb-2">
            Metode Pembayaran:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangePaymentMode('pay_now')}
              className={`py-2.5 px-3 rounded-lg font-bold text-sm border-2 cursor-pointer transition-colors ${
                paymentMode === 'pay_now'
                  ? 'bg-[#78350f] text-white border-[#451a03] shadow-sm'
                  : 'bg-white text-[#57300a] border-[#d6d3d1] hover:bg-[#fef9c3]'
              }`}
            >
              Bayar Awal (Lunas)
            </button>
            <button
              type="button"
              onClick={() => onChangePaymentMode('save_faktur')}
              className={`py-2.5 px-3 rounded-lg font-bold text-sm border-2 cursor-pointer transition-colors ${
                paymentMode === 'save_faktur'
                  ? 'bg-[#d97706] text-white border-[#92400e] shadow-sm'
                  : 'bg-white text-[#57300a] border-[#d6d3d1] hover:bg-[#fef9c3]'
              }`}
            >
              Bayar Akhir (Faktur Gantung)
            </button>
          </div>
        </div>
      </div>

      {/* Footer Perhitungan Total & Tombol Aksi Kasir - Coklat Espresso dengan Aksen Kuning Emas */}
      <div className="p-4 bg-[#451a03] text-white border-t-4 border-[#78350f] space-y-3">
        {/* Rincian Kalkulasi */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-[#fefce8] font-bold">
            <span>Subtotal:</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {dpAmount > 0 && (
            <div className="flex justify-between text-[#fde047] font-extrabold">
              <span>DP Reservasi Dibayar:</span>
              <span>- {formatRupiah(dpAmount)}</span>
            </div>
          )}
          {guideCommission > 0 && (
            <div className="flex justify-between text-[#fcd34d] font-extrabold">
              <span>Komisi Guide (Tunai):</span>
              <span>- {formatRupiah(guideCommission)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#78350f] flex justify-between items-center">
            <span className="text-base font-bold text-[#fefce8]">GRAND TOTAL:</span>
            <span className="text-2xl font-black text-[#fcd34d]">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* Tombol CTA Utama (Kontras Tinggi & Tinggi Minimal 48px) */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {paymentMode === 'save_faktur' ? (
            <button
              type="button"
              disabled={items.length === 0}
              onClick={onSaveFakturGantung}
              className="w-full min-h-[52px] bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-3 rounded-xl border-2 border-[#fcd34d] shadow-md cursor-pointer transition-colors"
            >
              SIMPAN KE FAKTUR GANTUNG
            </button>
          ) : (
            <button
              type="button"
              disabled={items.length === 0}
              onClick={onPayNow}
              className="w-full min-h-[52px] bg-[#78350f] hover:bg-[#451a03] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-3 rounded-xl border-2 border-[#fcd34d] shadow-md cursor-pointer transition-colors"
            >
              BAYAR LUNAS ({formatRupiah(grandTotal)})
            </button>
          )}

          {/* Tombol Otorisasi Keamanan VOID / BATAL */}
          <button
            type="button"
            disabled={items.length === 0 && !tableNumber}
            onClick={onOpenVoidModal}
            className="w-full bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-40 text-white font-extrabold text-sm py-2.5 rounded-lg border-2 border-[#f87171] cursor-pointer transition-colors"
          >
            VOID / BATAL PESANAN (PIN OWNER)
          </button>
        </div>
      </div>
    </aside>
  );
}
