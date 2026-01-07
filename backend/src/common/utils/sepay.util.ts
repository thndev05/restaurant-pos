/**
 * SePay QR Code Generator Utility
 * Generates QR code URL for bank transfer payments
 *
 * Documentation: https://my.sepay.vn/userguide/create-qr-code
 */

/**
 * Generate SePay QR Code URL for bank transfer
 *
 * @param accountNumber - Bank account number
 * @param bankName - Bank name (e.g., "TPBank", "Vietcombank")
 * @param amount - Transfer amount
 * @param content - Transfer content (should include transaction ID)
 * @returns QR code image URL
 *
 * @example
 * const qrUrl = generateSepayQrCode(
 *   "00002084815",
 *   "TPBank",
 *   100000,
 *   "Thanh toan don hang TX1234567890"
 * );
 * // Returns: https://qr.sepay.vn/img?acc=00002084815&bank=TPBank&amount=100000&des=Thanh%20toan%20don%20hang%20TX1234567890
 */
export function generateSepayQrCode(
  accountNumber: string,
  bankName: string,
  amount: number,
  content: string,
): string {
  const baseUrl = 'https://qr.sepay.vn/img';
  const params = new URLSearchParams({
    acc: accountNumber,
    bank: bankName,
    amount: amount.toString(),
    des: content,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get bank transfer information for payment
 *
 * @param transactionId - Unique transaction ID
 * @param amount - Payment amount
 * @returns Bank transfer details
 */
export function getBankTransferInfo(transactionId: string, amount: number) {
  const accountNumber = process.env.SEPAY_BANK_ACCOUNT || '';
  const bankName = process.env.SEPAY_BANK_NAME || '';
  const accountHolder = process.env.SEPAY_ACCOUNT_HOLDER || '';

  // Generate transfer content with transaction ID
  const content = `Thanh toan ${transactionId}`;

  // Convert USD to VND by multiplying by 1000 (minimum VND transfer is 1000)
  const amountInVND = Math.round(amount * 1000);

  // Generate QR code URL
  const qrCodeUrl = generateSepayQrCode(
    accountNumber,
    bankName,
    amountInVND,
    content,
  );

  return {
    accountNumber,
    bankName,
    accountHolder,
    amount, // Original amount in USD
    amountInVND, // Amount in VND (amount * 1000)
    content,
    transactionId,
    qrCodeUrl,
  };
}
