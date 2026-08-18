'use client';

import React, { useState, useEffect } from 'react';
import { StaffModal, StaffData } from '@/components/admin/StaffModal';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);

  // Notifikasi
  const [notifMessage, setNotifMessage] = useState<string>('');

  const showNotification = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => setNotifMessage(''), 5000);
  };

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/staff');
      if (!res.ok) throw new Error('Gagal mengambil data staff');
      const data = await res.json();
      setStaffList(data);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffData) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (data: StaffData) => {
    try {
      setErrorMsg('');
      const url = data._id ? `/api/admin/staff/${data._id}` : '/api/admin/staff';
      const method = data._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Terjadi kesalahan');
      }

      showNotification(`Staff berhasil ${data._id ? 'diperbarui' : 'ditambahkan'}!`);
      setIsModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun staff ini secara permanen?')) return;

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Gagal menghapus');
      }
      showNotification('Akun staff berhasil dihapus!');
      fetchStaff();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#4B3832] tracking-tight">Kelola Staff</h1>
          <p className="text-[#6F4E37] mt-2 text-lg">Pusat manajemen akses akun kasir Anda.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Staff
        </button>
      </div>

      {notifMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm animate-in slide-in-from-top-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          <span className="font-semibold">{notifMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-[#FFFDF7] rounded-[2rem] shadow-xl border border-[#DCC7AA]/40 overflow-hidden flex-1 flex flex-col relative">
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#DCC7AA] border-t-[#4B3832] rounded-full animate-spin"></div>
          </div>
        ) : staffList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="w-24 h-24 bg-[#F5E6CA] rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[#6F4E37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-[#4B3832] mb-2">Belum Ada Staff</h3>
            <p className="text-[#6F4E37] max-w-sm mb-8">Anda belum mendaftarkan akun staff kasir manapun. Mulai tambahkan staff pertama Anda!</p>
            <button
              onClick={handleOpenAdd}
              className="bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] px-8 py-3 rounded-full font-bold shadow-md transition-colors"
            >
              Tambah Staff
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5E6CA]/50 border-b border-[#DCC7AA]/50">
                                    <th className="py-5 px-8 font-bold text-[#4B3832]">Username Login</th>
                  <th className="py-5 px-8 font-bold text-[#4B3832]">Status</th>
                  <th className="py-5 px-8 font-bold text-[#4B3832] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff._id} className="border-b border-[#DCC7AA]/30 hover:bg-[#F5E6CA]/20 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="font-bold text-[#4B3832]">{staff.username}</div>
                    </td>
                    <td className="py-5 px-8">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-2 text-[#6F4E37] hover:text-[#4B3832] hover:bg-[#F5E6CA] rounded-xl transition-colors"
                          title="Edit Staff"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id!)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus Staff"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        initialData={editingStaff}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
      />
    </div>
  );
}
