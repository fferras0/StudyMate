import React, { useState } from 'react';
import { User } from '../types';
import { Users, Trash2, Ban, CheckCircle, LogOut, Search, Shield, Activity } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  onUpdateUsers: (updatedUsers: User[]) => void;
  onLogout: () => void;
  isRTL: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, 
  allUsers, 
  onUpdateUsers, 
  onLogout,
  isRTL 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = allUsers.filter(u => 
    !u.isGuest && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (e: React.MouseEvent, userId: string) => {
    // Stop propagation to prevent any parent click handlers
    e.stopPropagation();
    e.preventDefault();

    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      const updated = allUsers.filter(u => u.id !== userId);
      onUpdateUsers(updated);
    }
  };

  const handleToggleStatus = (userId: string) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        return { ...u, isDisabled: !u.isDisabled };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const t = {
    title: isRTL ? 'لوحة تحكم المسؤول' : 'Admin Dashboard',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    activeUsers: isRTL ? 'نشطون' : 'Active',
    disabledUsers: isRTL ? 'محظورون' : 'Disabled',
    search: isRTL ? 'بحث عن مستخدم...' : 'Search users...',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    joined: isRTL ? 'تاريخ الانضمام' : 'Joined',
    status: isRTL ? 'الحالة' : 'Status',
    actions: isRTL ? 'إجراءات' : 'Actions',
    active: isRTL ? 'نشط' : 'Active',
    disabled: isRTL ? 'معطل' : 'Disabled',
    delete: isRTL ? 'حذف' : 'Delete',
    toggle: isRTL ? 'تغيير الحالة' : 'Toggle Status',
    logout: isRTL ? 'تسجيل خروج' : 'Logout'
  };

  const stats = {
    total: allUsers.filter(u => !u.isGuest).length,
    active: allUsers.filter(u => !u.isGuest && !u.isDisabled).length,
    disabled: allUsers.filter(u => !u.isGuest && u.isDisabled).length
  };

  return (
    <div className={`min-h-screen bg-slate-100 p-6 ${isRTL ? 'font-[Noto_Sans_Arabic]' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
               <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
              <p className="text-slate-500 text-sm">Welcome back, {currentUser.name}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors font-bold"
          >
            <LogOut size={20} />
            {t.logout}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-medium mb-1">{t.totalUsers}</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
               <Users size={28} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-medium mb-1">{t.activeUsers}</p>
              <h3 className="text-3xl font-bold text-emerald-600">{stats.active}</h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
               <CheckCircle size={28} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-medium mb-1">{t.disabledUsers}</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.disabled}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-xl text-red-600">
               <Ban size={28} />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Activity size={20} className="text-indigo-500" />
               {t.totalUsers}
             </h2>
             <div className="relative w-full md:w-auto">
                <Search className={`absolute top-3 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
                <input 
                  type="text" 
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-80 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.name}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.email}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.joined}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.status}</th>
                  <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        {user.name}
                        {user.isAdmin && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">ADMIN</span>}
                      </td>
                      <td className="p-4 text-slate-600">{user.email}</td>
                      <td className="p-4 text-slate-500">{new Date(user.joinedAt || Date.now()).toLocaleDateString()}</td>
                      <td className="p-4">
                        {user.isDisabled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t.disabled}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t.active}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${user.isDisabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                            title={t.toggle}
                            disabled={user.isAdmin} 
                          >
                            {user.isDisabled ? <CheckCircle size={18} /> : <Ban size={18} />}
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, user.id)}
                            className={`p-2 rounded-lg transition-colors ${user.isAdmin ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                            title={t.delete}
                            disabled={user.isAdmin} 
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;