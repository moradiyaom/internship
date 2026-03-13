import React, { useEffect, useRef, useState } from 'react';
import { toCanvas } from 'qrcode';
import './QRCode.css';

const QRCodePage = () => {
  const canvasRef = useRef(null);
  const [tableNumber, setTableNumber] = useState('1');
  const [qrUrl, setQrUrl] = useState('');

  const generateQR = async () => {
    const origin = window.location.origin;
    const menuUrl = `${origin}/menu/${tableNumber}`;
    setQrUrl(menuUrl);

    if (canvasRef.current) {
      try {
        await toCanvas(canvasRef.current, menuUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('QR generation error:', error);
      }
    }
  };

  useEffect(() => {
    generateQR();
  }, [tableNumber]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `table-${tableNumber}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };


  const testMenu = () => {
    window.open(`${window.location.origin}/menu`, '_blank');
  };


const LOCAL_URL = `${window.location.origin}/menu`;
const RENDER_URL = `https://internship-owhq.onrender.com/menu`; // Webserver



  return (
    <div className="qrcode-page">
      <div className="page-header">
        <h1>📱 Table QR Codes</h1>
        <p>Generate QR code for customers to scan and order directly for specific tables</p>
      </div>

      <div className="qr-input">
        <label>
          Table Number:
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. 5"
            className="table-input"
          />
        </label>
        <button onClick={generateQR} className="btn-generate">Generate QR</button>
      </div>

      <div className="qr-container">
        <div className="qr-wrapper">
          <canvas ref={canvasRef} />
          <div className="qr-info">
            
 <p><strong>Local:</strong> {LOCAL_URL}</p>
  <p><strong>Render:</strong> {RENDER_URL}</p>


            <p><strong>Print & place on table #{tableNumber}</strong></p>
          </div>
        </div>

        <div className="qr-actions">
          <button className="btn-download" onClick={handleDownload}>
            💾 Download PNG
          </button>
 <button className="btn-test" onClick={testMenu}>
            🧪 Test Local Link
          </button>
          <button className="btn-render" onClick={() => window.open(RENDER_URL, '_blank')}>
            🚀 Test Render Link
          </button>

        </div>
      </div>

      <div className="qr-demo">
        <h3>How it works:</h3>
        <ol>
          <li>Enter table number → Generate QR</li>
          <li>Download/print QR code for table</li>
          <li>Customer scans QR → opens clean menu for their table</li>
          <li>Customer orders → auto assigned to table (no login)</li>
          <li>Staff sees order in /orders</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodePage;

