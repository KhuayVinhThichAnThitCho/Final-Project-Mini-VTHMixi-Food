import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Coffee, MapPin, Search, ShoppingBag } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  const [address] = useState('Chợ Bến Thành, Quận 1, Sài Gòn');

  return (
    <QueryClientProvider client={queryClient}>
      {/* Phủ lớp giấy nhám texture-paper toàn trang */}
      <div className="texture-paper min-h-screen flex flex-col font-sans selection:bg-saigon-primary selection:text-saigon-neutral-surface">
        
        {/* ==========================================
            1. THANH ĐIỀU HƯỚNG (NAVBAR RETRO)
           ========================================== */}
        <header className="sticky top-0 bg-saigon-neutral-surface border-b-2 border-saigon-neutral-text z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            {/* Logo phong cách biển vẽ tay xưa */}
            <div className="flex items-center gap-2">
              <span className="bg-saigon-primary text-saigon-neutral-surface text-xl font-serif font-black px-3 py-1 border-2 border-saigon-neutral-text rotate-[-2deg] shadow-retro-sm">
                GRABFOOD
              </span>
              <span className="font-serif italic font-bold text-saigon-secondary text-lg">
                Mini
              </span>
            </div>

            {/* Địa chỉ giao hàng hiện tại */}
            <div className="flex items-center gap-2 text-sm bg-saigon-neutral-bg border border-saigon-neutral-border px-3 py-1 rounded-sm">
              <MapPin size={16} className="text-saigon-primary" />
              <span className="font-medium text-saigon-neutral-text">{address}</span>
            </div>

            {/* Các nút chức năng góc phải */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-saigon-neutral-bg rounded-full transition-colors">
                <ShoppingBag size={22} className="text-saigon-neutral-text" />
                <span className="absolute -top-1 -right-1 bg-saigon-primary text-saigon-neutral-surface text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full border border-saigon-neutral-text">
                  3
                </span>
              </button>
              
              <button className="btn-retro text-sm py-1 px-3">
                Đăng Nhập
              </button>
            </div>
          </div>
        </header>

        {/* ==========================================
            2. PHẦN BANNER GIỚI THIỆU CHÍNH (HERO)
           ========================================== */}
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
          <section className="card-retro bg-saigon-neutral-surface mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-saigon-primary">
              CƠM DẺO THỊT THƠM, GIAO BẰNG XE ĐẠP PHƯỢNG HOÀNG!
            </h1>
            <p className="text-saigon-neutral-subText font-medium max-w-xl mx-auto mb-6">
              Nền tảng đặt thức ăn đa nhà hàng đưa bạn tìm lại hương vị Sài Gòn nguyên bản. Những xe hủ tiếu gõ, ly cà phê sữa đá pha phin thơm lừng góc phố.
            </p>

            {/* Ô tìm kiếm món ăn hoài cổ */}
            <div className="flex max-w-md mx-auto border-2 border-saigon-neutral-text shadow-retro bg-saigon-neutral-bg focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-retro-sm transition-all">
              <input 
                type="text" 
                placeholder="Tìm món ăn, quán xá, hẻm nhỏ Sài Gòn..."
                className="w-full bg-transparent px-4 py-2 text-sm text-saigon-neutral-text placeholder:text-saigon-neutral-subText/60 focus:outline-none"
              />
              <button className="bg-saigon-primary text-saigon-neutral-surface px-4 flex items-center justify-center border-l-2 border-saigon-neutral-text hover:bg-saigon-primary/95 transition-colors">
                <Search size={18} />
              </button>
            </div>
          </section>

          {/* ==========================================
              3. DANH SÁCH MÓN ĂN GỢI Ý (GRID)
             ========================================== */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Coffee className="text-saigon-primary" />
                Món Ngon Đầu Ngõ Sài Gòn
              </h2>
              <span className="text-xs font-mono font-bold bg-[#E9C46A]/30 text-saigon-secondary border border-saigon-secondary/50 px-2 py-0.5 rounded">
                CẬP NHẬT MỖI NGÀY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Món ăn 1 */}
              <div className="card-retro flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
                <div>
                  <div className="h-40 bg-[#E3DAC9] mb-4 border border-saigon-neutral-text overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-saigon-neutral-subText/40 font-mono text-xs">
                      [Ảnh Hủ Tiếu Gõ Sài Gòn]
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Hủ Tiếu Gõ Chợ Bàn Cờ</h3>
                  <p className="text-xs text-saigon-neutral-subText mb-2">Thơm lừng mùi hẹ nước, thịt nạc mỏng dính chuẩn phố xưa.</p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-dashed border-saigon-neutral-border pt-3">
                  <span className="price-text text-lg font-bold text-saigon-primary">
                    35.000 đ
                  </span>
                  <button className="btn-retro py-1 px-3 text-xs bg-saigon-secondary-light">
                    Đặt Món
                  </button>
                </div>
              </div>

              {/* Món ăn 2 */}
              <div className="card-retro flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
                <div>
                  <div className="h-40 bg-[#E3DAC9] mb-4 border border-saigon-neutral-text overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-saigon-neutral-subText/40 font-mono text-xs">
                      [Ảnh Cà Phê Sữa Đá]
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Cà Phê Sữa Đá Vợt Quận 11</h3>
                  <p className="text-xs text-saigon-neutral-subText mb-2">Cà phê pha bằng siêu đất nung thơm nồng, thêm sữa đặc ngọt lịm.</p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-dashed border-saigon-neutral-border pt-3">
                  <span className="price-text text-lg font-bold text-saigon-primary">
                    18.000 đ
                  </span>
                  <button className="btn-retro py-1 px-3 text-xs bg-saigon-secondary-light">
                    Đặt Món
                  </button>
                </div>
              </div>

              {/* Món ăn 3 */}
              <div className="card-retro flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
                <div>
                  <div className="h-40 bg-[#E3DAC9] mb-4 border border-saigon-neutral-text overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-saigon-neutral-subText/40 font-mono text-xs">
                      [Ảnh Bột Chiên Trứng]
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Bột Chiên Trứng Đu Đủ Bào</h3>
                  <p className="text-xs text-saigon-neutral-subText mb-2">Bột chiên giòn rụm bên ngoài dẻo bên trong ăn kèm đu đủ giòn giòn.</p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-dashed border-saigon-neutral-border pt-3">
                  <span className="price-text text-lg font-bold text-saigon-primary">
                    25.000 đ
                  </span>
                  <button className="btn-retro py-1 px-3 text-xs bg-saigon-secondary-light">
                    Đặt Món
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ==========================================
            4. PHẦN CHÂN TRANG (FOOTER RETRO)
           ========================================== */}
        <footer className="bg-saigon-neutral-surface border-t-2 border-saigon-neutral-text py-6 mt-12 text-center text-xs text-saigon-neutral-subText">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-serif italic font-bold text-sm text-saigon-primary mb-2">GrabFood Mini © 1990 - 2026</p>
            <p className="mb-1">Lấy cảm hứng từ văn hóa vỉa hè Sài Gòn độc đáo và nét sống động qua thời gian.</p>
            <p className="font-mono text-[10px] text-saigon-neutral-subText/60">Version 1.0.0-classic (TypeScript + React + Tailwind)</p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
