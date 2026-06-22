import { PayOS } from '@payos/node';

const clientId = process.env.PAYOS_CLIENT_ID || 'your_payos_client_id';
const apiKey = process.env.PAYOS_API_KEY || 'your_payos_api_key';
const checksumKey = process.env.PAYOS_CHECKSUM_KEY || 'your_payos_checksum_key';

if (
  clientId === 'your_payos_client_id' ||
  apiKey === 'your_payos_api_key' ||
  checksumKey === 'your_payos_checksum_key'
) {
  console.warn(
    '⚠️  [PayOS Service] Chưa cấu hình đầy đủ Client ID, API Key hoặc Checksum Key trong file .env. Vui lòng lấy thông tin tại https://my.payos.vn và điền vào để thanh toán VietQR hoạt động!'
  );
}

export const payos = new PayOS({ clientId, apiKey, checksumKey });
export default payos;
