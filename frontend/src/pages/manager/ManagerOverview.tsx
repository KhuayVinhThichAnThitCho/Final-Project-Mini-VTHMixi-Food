import React, { useEffect, useState } from 'react';
import { Store, User, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ManagerOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/manager/stats') as any;
      setStats(statsRes.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu Overview:', error);
    }
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64 text-[#BF3A20] font-mono font-bold tracking-widest uppercase text-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#BF3A20] mr-3"></div>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display italic font-bold text-[#5C1A0A]">Tổng Quan Khu Vực</h2>
        <div className="divider-saigon mt-2 max-w-xs"></div>
        <p className="text-[#9E6E4A] font-body mt-3">Các chỉ số hoạt động quan trọng trong khu vực quản lý của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Nhà Hàng" 
          value={stats.restaurantsCount} 
          icon={<Store size={24} strokeWidth={1.5} />} 
          color="primary" 
          trend={stats.restaurantsTrend || "+0%"}
        />
        <StatCard 
          title="Người Dùng" 
          value={stats.usersCount} 
          icon={<User size={24} strokeWidth={1.5} />} 
          color="secondary" 
          trend={stats.usersTrend || "+0%"}
        />
        <StatCard 
          title="Đơn Hàng" 
          value={stats.ordersCount} 
          icon={<CheckCircle size={24} strokeWidth={1.5} />} 
          color="success" 
          trend={stats.ordersTrend || "+0%"}
        />
        <StatCard 
          title="Doanh Thu Ước Tính" 
          value={`${(stats.revenueTotal || 0).toLocaleString('vi-VN')}đ`} 
          icon={<DollarSign size={24} strokeWidth={1.5} />} 
          color="warning" 
          trend={stats.revenueTrend || "+0%"}
        />
      </div>
      
      {/* Sales Chart */}
      <div className="bg-[#FEFCF9] rounded-xl shadow-card border border-[#E8D8C6] p-6 mt-8">
        <div className="flex items-center mb-6">
          <TrendingUp className="text-[#BF3A20] mr-3" size={24} />
          <h3 className="text-xl font-display font-bold text-[#2C1A0E]">Biểu Đồ Doanh Số (7 Ngày Qua)</h3>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.salesData || []}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BF3A20" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#BF3A20" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D8C6" vertical={false} />
              <XAxis dataKey="name" stroke="#9E6E4A" tick={{ fill: '#7A5235', fontSize: 12, fontFamily: 'monospace' }} />
              <YAxis 
                stroke="#9E6E4A" 
                tick={{ fill: '#7A5235', fontSize: 12, fontFamily: 'monospace' }} 
                tickFormatter={(value: number) => `${(value / 1000).toLocaleString()}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1008', border: '1px solid #BF3A20', borderRadius: '8px', color: '#E9C46A' }}
                itemStyle={{ color: '#E9C46A', fontWeight: 'bold' }}
                labelStyle={{ color: '#D0B89A', marginBottom: '5px' }}
                formatter={(value: any) => [`${Number(value || 0).toLocaleString('vi-VN')}đ`, 'Doanh Thu']}
              />
              <Area type="monotone" dataKey="sales" stroke="#BF3A20" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string | number, icon: React.ReactNode, color: 'primary' | 'secondary' | 'success' | 'warning', trend: string }) => {
  const isPositive = !trend.startsWith('-');
  const trendClass = isPositive 
    ? 'bg-green-50 border-green-200 text-green-600' 
    : 'bg-red-50 border-red-200 text-red-600';

  const colorStyles = {
    primary: { bg: 'bg-[#FAE4E0]', text: 'text-[#BF3A20]' },
    secondary: { bg: 'bg-[#FAF0D2]', text: 'text-[#8C5F00]' },
    success: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]' },
    warning: { bg: 'bg-[#fef0d9]', text: 'text-[#d84315]' },
  };
  
  const style = colorStyles[color];

  return (
    <div className="bg-[#FEFCF9] p-6 rounded-xl shadow-card border border-[#E8D8C6] relative overflow-hidden group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 transition-transform group-hover:scale-150 ${style.bg}`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-lg ${style.bg} ${style.text}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${trendClass}`}>
          {trend}
        </span>
      </div>
      
      <div className="relative z-10">
        <p className="text-[11px] font-body font-bold tracking-widest uppercase text-[#9E6E4A]">{title}</p>
        <p className="text-3xl font-bold font-mono mt-1 text-[#2C1A0E]">{value}</p>
      </div>
    </div>
  );
};

export default ManagerOverview;
