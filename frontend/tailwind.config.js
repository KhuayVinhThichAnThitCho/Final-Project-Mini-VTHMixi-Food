/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bảng màu thiết kế chuẩn hóa "Hiện đại × Sài Gòn thập niên 90"
        primary: {
          50:  '#FEF5F3',
          100: '#FAE4E0',
          200: '#F2B8AE',
          300: '#EA9080',
          400: '#E06B52',
          500: '#D44B2F',   // Hover CTA màu sáng hơn
          600: '#BF3A20',   // Main CTA Đỏ gạch ngói Bưu điện Sài Gòn
          700: '#9E2F18',
          800: '#7D2410',   // Active click màu sẫm
          900: '#5C1A0A',
        },
        secondary: {
          50:  '#FEFBF0',
          100: '#FAF0D2',   // Background badge nhạt màu vàng mỡ gà
          200: '#F3DC9E',
          300: '#E9C46A',   // Highlight nổi bật tông vàng rơm
          400: '#DBA832',
          500: '#C98F0A',   // Accent chính vàng ố của các tấm biển hiệu cũ
          600: '#AD7800',
          700: '#8C5F00',
          800: '#6B4800',
          900: '#4A3200',
        },
        neutral: {
          50:  '#FAF7F3',   // Background page (tông kem nhạt dịu mát)
          100: '#F5EFE6',   // Surface alt (nền phụ cho input chìm)
          200: '#E8D8C6',   // Border nhẹ tông đất sét
          300: '#D0B89A',
          400: '#B8906E',
          500: '#9E6E4A',   // Text secondary (chữ phụ nâu sáng)
          600: '#7A5235',
          700: '#5C3A22',   // Text body (chữ nội dung chính)
          800: '#3D2314',
          900: '#2C1A0E',   // Text tiêu đề (chữ tiêu đề lớn màu hạt cafe rang)
          950: '#1A1008',
        },
        // Off-white thay cho trắng tinh khiết
        white: '#FEFCF9',   // Background card/surface chính
      },
      fontFamily: {
        // Font Serif dùng cho tiêu đề lớn nghệ thuật phong cách tờ báo năm 90
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // Font Heading tiêu đề thường dùng trong card
        heading: ['"Lora"', 'Georgia', 'serif'],
        // Font Body sans-serif hiện đại tăng khả năng hiển thị
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        // Font Mono chuyên biệt cho giá cả, số liệu thống kê và mã số
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        // Shadow tông nâu ấm áp hoài cổ thay vì xám đen công nghiệp
        'saigon-sm': '0 1px 3px rgba(44, 26, 14, 0.08), 0 1px 2px rgba(44, 26, 14, 0.06)',
        'saigon-md': '0 4px 6px rgba(44, 26, 14, 0.07), 0 2px 4px rgba(44, 26, 14, 0.05)',
        'saigon-lg': '0 10px 15px rgba(44, 26, 14, 0.08), 0 4px 6px rgba(44, 26, 14, 0.05)',
        'saigon-xl': '0 20px 25px rgba(44, 26, 14, 0.1), 0 8px 10px rgba(44, 26, 14, 0.06)',
        'saigon-card': '0 2px 8px rgba(44, 26, 14, 0.08), 0 0 0 1px rgba(44, 26, 14, 0.04)',
        'saigon-card-hover': '0 8px 24px rgba(44, 26, 14, 0.12), 0 0 0 1px rgba(44, 26, 14, 0.06)',
        // Shadow dạng phẳng nổi khối (Flat Retro shadow)
        'retro-sm': '2px 2px 0px 0px #2C1A0E',
        'retro': '4px 4px 0px 0px #2C1A0E',
        'retro-lg': '8px 8px 0px 0px #2C1A0E',
      },
      backgroundImage: {
        // Hoa văn hạt tròn li ti cho các dải phân cách trang trí
        'grid-pattern': "radial-gradient(#2C1A0E 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
