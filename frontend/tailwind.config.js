/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bảng màu thiết kế "Hiện đại x Sài Gòn thập niên 90"
        saigon: {
          // Đỏ gạch: Màu chủ đạo của mái ngói Bưu điện Thành phố, tường gạch cổ kính
          primary: '#BF3A20',
          // Vàng ố giấy báo cũ: Mang phong cách hoài niệm, bụi bặm của các biển hiệu vẽ tay
          secondary: {
            DEFAULT: '#C98F0A',
            light: '#E9C46A',
          },
          // Tông trung tính cà phê sữa ấm áp: Thay thế cho màu trắng/đen thuần
          neutral: {
            bg: '#FAF7F3',      // Nền chính (Cà phê sữa nhạt)
            surface: '#FEFCF9', // Nền của card, bảng biểu (Sữa đặc pha loãng)
            text: '#2C1A0E',    // Màu chữ chính (Nâu hạt cà phê rang)
            subText: '#5C402B', // Màu chữ phụ (Nâu đất nhạt)
            border: '#E3DAC9',  // Viền đất sét nhạt
          }
        }
      },
      fontFamily: {
        // Font Serif dùng cho Tiêu đề lớn tạo nét sang trọng kiểu Pháp pha lẫn hoài cổ
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        // Font Sans-serif chuẩn cho nội dung thông tin, dễ đọc trên thiết bị di động
        sans: ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
        // Font Mono chuyên biệt cho hiển thị Giá tiền, Mã đơn hàng, Số liệu
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        // Shadow màu nâu ấm đất sét thay vì màu đen xám công nghiệp
        'retro-sm': '2px 2px 0px 0px #2C1A0E',
        'retro': '4px 4px 0px 0px #2C1A0E',
        'retro-lg': '8px 8px 0px 0px #2C1A0E',
        'retro-double': '4px 4px 0px 0px #E3DAC9, 8px 8px 0px 0px #2C1A0E',
      },
      backgroundImage: {
        // Hoa văn sọc giấy báo chéo hoặc lưới nhẹ
        'grid-pattern': "radial-gradient(#2C1A0E 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
