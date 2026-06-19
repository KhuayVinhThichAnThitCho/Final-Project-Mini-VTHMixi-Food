import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface Report {
  id: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  managerNote?: string;
  createdAt: string;
}

const ManagerReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [actionModal, setActionModal] = useState<{isOpen: boolean, reportId: string, action: 'resolved' | 'rejected'}>({
    isOpen: false,
    reportId: '',
    action: 'resolved'
  });
  const [managerNote, setManagerNote] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/reports') as any;
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      await api.patch(`/manager/reports/${actionModal.reportId}/resolve`, {
        action: actionModal.action,
        managerNote: managerNote
      });
      fetchReports();
      setActionModal({ ...actionModal, isOpen: false });
      setManagerNote('');
    } catch (error) {
      console.error('Failed to resolve report:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display italic font-bold text-[#5C1A0A]">Báo Cáo Vi Phạm</h2>
        <div className="divider-saigon mt-2 max-w-xs"></div>
        <p className="text-[#9E6E4A] font-body mt-3">Quản lý và giải quyết các báo cáo từ người dùng/vendor.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#BF3A20] border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-[#FEFCF9] rounded-xl shadow-card border border-[#E8D8C6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF0D2] border-b-2 border-[#E8D8C6]">
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Người Báo Cáo</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Loại / Mục tiêu</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Lý do</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs">Trạng thái</th>
                  <th className="p-4 font-mono font-bold text-[#8C5F00] uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-[#E8D8C6] hover:bg-[#FAF7F3] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#2C1A0E]">{report.reporter.name}</p>
                      <p className="text-xs text-[#9E6E4A]">{report.reporter.email}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(report.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-[#E8D8C6] text-[#5C1A0A] uppercase">
                        {report.targetType}
                      </span>
                      <p className="text-xs font-mono text-[#9E6E4A] mt-2" title={report.targetId}>
                        ID: {report.targetId.substring(0, 8)}...
                      </p>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-sm text-[#7A5235]">{report.reason}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          report.status === 'rejected' ? 'bg-gray-200 text-gray-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                        {report.managerNote && (
                          <span className="text-[10px] text-[#BF3A20] italic max-w-[150px] truncate" title={report.managerNote}>
                            Ghi chú: {report.managerNote}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {report.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setActionModal({ isOpen: true, action: 'resolved', reportId: report.id })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Xử lý hợp lệ"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => setActionModal({ isOpen: true, action: 'rejected', reportId: report.id })}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Bỏ qua (Báo cáo sai)"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#9E6E4A]">Không có báo cáo nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Resolve */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FEFCF9] rounded-xl shadow-2xl max-w-md w-full border-2 border-saigon-neutral-text overflow-hidden scale-in">
            <div className={`p-4 border-b-2 border-saigon-neutral-text ${actionModal.action === 'resolved' ? 'bg-[#e8f5e9]' : 'bg-[#f5f5f5]'}`}>
              <div className="flex items-center gap-3">
                <ShieldAlert className={actionModal.action === 'resolved' ? 'text-green-700' : 'text-gray-600'} size={24} />
                <h3 className={`font-display font-bold text-lg ${actionModal.action === 'resolved' ? 'text-green-900' : 'text-gray-800'}`}>
                  {actionModal.action === 'resolved' ? 'Chấp Thuận Báo Cáo' : 'Bỏ Qua Báo Cáo'}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#7A5235] font-body mb-4">
                {actionModal.action === 'resolved' 
                  ? 'Báo cáo này là hợp lệ. Vui lòng ghi lại hướng giải quyết (ví dụ: đã ẩn comment, đã nhắc nhở).' 
                  : 'Báo cáo này không hợp lệ hoặc không vi phạm nội quy.'}
              </p>
              
              <textarea
                className="w-full p-3 border-2 border-[#E8D8C6] rounded-lg focus:outline-none focus:border-[#BF3A20] bg-white font-body mb-4"
                rows={3}
                placeholder="Ghi chú của quản lý..."
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                  className="px-4 py-2 font-mono font-bold text-[#7A5235] border-2 border-[#E8D8C6] rounded-lg hover:bg-[#E8D8C6]/30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 font-mono font-bold text-[#FEFCF9] rounded-lg shadow-retro-sm transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none border-2 border-saigon-neutral-text ${
                    actionModal.action === 'resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReports;
