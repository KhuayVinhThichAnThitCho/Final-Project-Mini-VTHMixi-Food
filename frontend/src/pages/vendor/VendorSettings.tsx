import React, { useState } from 'react';
import { Save, Camera, Clock, MapPin, Store } from 'lucide-react';

export const VendorSettings: React.FC = () => {
  const [shopName, setShopName] = useState('Tiệm Hủ Tiếu Sài Gòn 1980');
  const [shopAddress, setShopAddress] = useState('123 Đường Bùi Viện, Quận 1, TP. HCM');
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-4 border-saigon-neutral-text pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-saigon-neutral-text">Cài Đặt Quán</h1>
          <p className="text-sm font-mono text-saigon-neutral-subText mt-1">Cấu hình thông tin và hoạt động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Status */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] text-center flex flex-col items-center p-8 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4F1EA] border-b-4 border-l-4 border-saigon-neutral-text transform translate-x-4 -translate-y-4 rotate-45 z-0"></div>
            
            <div className="relative mb-6 z-10">
              <div className="w-36 h-36 rounded-none border-4 border-saigon-neutral-text bg-[#F4F1EA] flex items-center justify-center shadow-[4px_4px_0_0_rgba(30,25,21,1)]">
                <Store size={64} className="text-[#BF3A20] opacity-80" />
              </div>
              <button className="absolute -bottom-3 -right-3 w-12 h-12 bg-saigon-primary border-4 border-saigon-neutral-text flex items-center justify-center shadow-[2px_2px_0_0_rgba(30,25,21,1)] hover:bg-[#D44B2F] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_rgba(30,25,21,1)] transition-all cursor-pointer active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                <Camera size={20} className="text-white" />
              </button>
            </div>
            
            <h2 className="font-black text-2xl mb-1 text-saigon-neutral-text uppercase">{shopName}</h2>
            <p className="text-sm font-mono font-bold text-saigon-neutral-subText mb-6">#VND-8492</p>

            <div className="w-full flex items-center justify-between p-4 border-4 border-dashed border-saigon-neutral-text bg-[#F4F1EA]">
              <span className="font-mono text-sm font-black uppercase">Trạng Thái:</span>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-2 font-mono text-sm font-black uppercase border-4 shadow-[2px_2px_0_0_rgba(30,25,21,1)] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none ${isOpen ? 'bg-emerald-500 text-white border-emerald-900' : 'bg-neutral-400 text-neutral-800 border-neutral-800'}`}
              >
                {isOpen ? 'Mở Cửa' : 'Đóng Cửa'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[#FEFCF9] border-4 border-saigon-neutral-text shadow-[8px_8px_0_0_rgba(30,25,21,1)] p-0">
            <h3 className="text-2xl font-black uppercase border-b-4 border-saigon-neutral-text p-6 bg-[#F4F1EA] flex items-center gap-3">
              <Store size={24} className="text-saigon-primary"/> Thông Tin Cơ Bản
            </h3>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-mono font-black uppercase text-saigon-neutral-text mb-2">
                  Tên Quán
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-[#FEFCF9] border-4 border-saigon-neutral-text focus:border-saigon-primary rounded-none px-4 py-3 font-serif font-bold text-lg text-neutral-900 focus:outline-none transition-all shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.05)]"
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-black uppercase text-saigon-neutral-text mb-2 flex items-center gap-2">
                  <MapPin size={16}/> Địa Chỉ
                </label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full bg-[#FEFCF9] border-4 border-saigon-neutral-text focus:border-saigon-primary rounded-none px-4 py-3 font-serif font-bold text-lg text-neutral-900 focus:outline-none transition-all shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.05)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-mono font-black uppercase text-saigon-neutral-text mb-2 flex items-center gap-2">
                    <Clock size={16}/> Giờ Mở Cửa
                  </label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full bg-[#FEFCF9] border-4 border-saigon-neutral-text focus:border-saigon-primary rounded-none px-4 py-3 font-mono font-bold text-lg text-neutral-900 focus:outline-none transition-all shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.05)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono font-black uppercase text-saigon-neutral-text mb-2 flex items-center gap-2">
                    <Clock size={16}/> Giờ Đóng Cửa
                  </label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full bg-[#FEFCF9] border-4 border-saigon-neutral-text focus:border-saigon-primary rounded-none px-4 py-3 font-mono font-bold text-lg text-neutral-900 focus:outline-none transition-all shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.05)]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t-4 border-saigon-neutral-text bg-[#F4F1EA] flex justify-end">
              <button className="flex items-center gap-2 bg-[#BF3A20] text-white px-8 py-3 font-mono font-black uppercase tracking-widest text-lg border-4 border-[#8A2512] shadow-[4px_4px_0_0_rgba(138,37,18,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#A32D15]">
                <Save size={20} /> Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VendorSettings;
