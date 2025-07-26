// qrService.ts

export async function verifyQrCode(profileUrl: string): Promise<any> {
  // This should ONLY verify the QR code and return profile info
  // It should NOT create any cards automatically
  const response = await fetch('http://localhost:3000/api/qr/verify-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileUrl })
  });
  return response.json();
} 