import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = ({ sessionId }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg flex flex-col items-center">
      <QRCodeCanvas value={sessionId} size={200} />
      <p className="mt-2 text-gray-600">Scan this QR Code</p>
    </div>
  );
};

export default QRCodeGenerator;
