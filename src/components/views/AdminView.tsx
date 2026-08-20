import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  Search, 
  UserCheck, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const defaultStats = {
    totalUsers: 1302450,
    totalITRsFiled: 1890,
    totalRevenue: 28450000,
    activeNotices: 42,
    pendingReviews: 18,
    caTeamSize: 124,
  };

  const [stats, setStats] = useState(defaultStats);
  const [itrs, setItrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'x-user-id': user?.id || 'admin_user_01' },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            const m = data.stats || data;
            setStats({
              totalUsers: m.totalUsers ?? defaultStats.totalUsers,
              totalITRsFiled: m.totalITRsFiled ?? m.activeFilings ?? defaultStats.totalITRsFiled,
              totalRevenue: m.totalRevenue ?? defaultStats.totalRevenue,
              activeNotices: m.activeNotices ?? m.pendingNotices ?? defaultStats.activeNotices,
              pendingReviews: m.pendingReviews ?? m.openSupportTickets ?? defaultStats.pendingReviews,
              caTeamSize: m.caTeamSize ?? m.activeExperts ?? defaultStats.caTeamSize,
            });
            if (Array.isArray(data.recentITRs)) {
              setItrs(data.recentITRs);
            }
          }
        }
      }

      // Also ensure latest ITRs list
      const itrRes = await fetch('/api/admin/itrs', {
        headers: { 'x-user-id': user?.id || 'admin_user_01' },
      });
      if (itrRes.ok) {
        const itrContentType = itrRes.headers.get('content-type');
        if (itrContentType && itrContentType.includes('application/json')) {
          const itrsData = await itrRes.json();
          if (Array.isArray(itrsData)) {
            setItrs(itrsData);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCA = async (itrId: string, expertName: string) => {
    try {
      await fetch('/api/admin/assign-ca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin_user_01',
        },
        body: JSON.stringify({ itrId, expertName }),
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-[11px] font-bold text-teal-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Governance & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            TaxWithRohit Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Monitor platform-wide ITR throughput, assign returns to Chartered Accountants, manage notice escalations, and review compliance revenue.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Platform Users</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+14% month-over-month</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">ITRs e-Filed</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalITRsFiled.toLocaleString()}</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-0.5">AY 2024-25 & 2025-26</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Compliance Revenue</span>
            <IndianRupee className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(stats.totalRevenue)}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Subscriptions & CA fees</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Pending CA Reviews</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{stats.pendingReviews}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Assigned across {stats.caTeamSize} CAs</p>
        </div>
      </div>

      {/* ITR Assignment Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">ITR Assignment & Review Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assign pending submissions to in-house tax experts.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PAN, ACK, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Ack Number / Form</th>
                <th className="pb-3">Taxpayer PAN</th>
                <th className="pb-3">Gross Income</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned CA</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itrs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 font-bold text-slate-900">
                    <div>{item.acknowledgementNumber || (item.id ? `DRAFT-${item.id.slice(-6)}` : 'DRAFT')}</div>
                    <span className="text-[10px] text-teal-700 font-semibold">{item.itrType} • AY {item.assessmentYear}</span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-700">{item.panNumber}</td>
                  <td className="py-3.5 font-black text-slate-900">{formatINR(item.grossTotalIncome || 1200000)}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium">
                    {item.assignedExpertName || 'Unassigned'}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleAssignCA(item.id, 'CA Rahul Sharma (FCA)')}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg transition-colors shadow-xs"
                    >
                      Assign CA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
