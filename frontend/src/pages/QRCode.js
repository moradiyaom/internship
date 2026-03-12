import React, { useEffect, useRef } from 'react';
import { toCanvas, toSvg } from 'qrcode';
import './QRCode.css';

const QRCodePage = () => {
  const canvasRef = useRef(null);
  const menuUrl = `${window.location.origin}/#/customer-menu`;

  useEffect(() => {
    if (canvasRef.current) {
      toCanvas(canvasRef.current, menuUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [menuUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'restaurant-menu-qr.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="qrcode-page">
      <div className="page-header">
        <h1>📱 QR Code Menu</h1>
        <p>Generate QR code for customers to scan and view menu directly</p>
      </div>

      <div className="qr-container">
        <div className="qr-wrapper">
          <canvas ref={canvasRef} style={{ width: '256px', height: '256px' }} />
          <div className="qr-info">
            <p><strong>Menu URL:</strong> {menuUrl}</p>
            <p><strong>Instructions:</strong> Print this QR code and place on tables. Customers scan to view menu.</p>
          </div>
        </div>

        <div className="qr-actions">
          <button className="btn-download" onClick={handleDownload}>
            💾 Download QR PNG
          </button>
          <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn-test">
            🔗 Test Menu Link\n          </a>
        </div>
      </div>

      <div className="qr-demo">
        <h3>Preview:</h3>
        <p>Customer scans QR → lands on clean menu page (no login required)</p>
      </div>
    </div>
  );
};

export default QRCodePage;

