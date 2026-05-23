/**
 * Định dạng số tiền sang chuỗi hiển thị tiền tệ Việt Nam Đồng (VND)
 * Ví dụ: 35000 => "35.000 đ"
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
    .format(price)
    .replace('₫', 'đ'); // Thay thế ký hiệu ₫ thuần bằng chữ đ thân thiện hơn
};

export default formatPrice;
