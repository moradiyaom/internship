import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const [menuUrl, setMenuUrl] = useState('http://localhost:3000/menu-view');
  const [customUrl, setCustomUrl] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleUrlChange = (e) => {
    setCustomUrl(e.target.value);
  };

  const handleGenerate = () => {
    if (customUrl.trim()) {
      setMenuUrl(customUrl.trim());
      setShowInput(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('.qr-code-canvas canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'menu-qr-code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadWithLogo = () => {
    const canvas = document.querySelector('.qr-code-canvas canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'menu-qr-code-with-logo.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="qr-generator-page">
      <div className="page-header">
        <h1>QR Code Generator</h1>
        <p>Generate a QR code for customers to scan and view your menu</p>
      </div>

      <div className="qr-generator-content">
        <div className="qr-preview">
          <h2>Preview</h2>
          <div className="qr-code-wrapper">
            <div className="qr-code-canvas">
              <QRCodeCanvas
                value={menuUrl}
                size={250}
                level={"H"}
                includeMargin={true}
                fgColor="#2c3e50"
                bgColor="#ffffff"
              />
            </div>
          </div>
          <p className="qr-url">{menuUrl}</p>
        </div>

        <div className="qr-options">
          <h2>Options</h2>
          
          <div className="option-group">
            <label>QR Code URL:</label>
            <div className="url-display">
              <input
                type="text"
                value={menuUrl}
                readOnly
                className="url-input"
              />
              <button 
                onClick={() => setShowInput(!showInput)}
                className="btn-secondary"
              >
                {showInput ? 'Cancel' : 'Change URL'}
              </button>
            </div>
          </div>

          {showInput && (
            <div className="option-group">
              <label>Enter Custom URL:</label>
              <div className="custom-url-input">
                <input
                  type="text"
                  value={customUrl}
                  onChange={handleUrlChange}
                  placeholder="https://yourrestaurant.com/menu"
                  className="url-input"
                />
                <button 
                  onClick={handleGenerate}
                  className="btn-primary"
                >
                  Generate
                </button>
              </div>
              <p className="hint">
                Tip: Use your public domain URL (e.g., deployed frontend URL) for production
              </p>
            </div>
          )}

          <div className="option-group">
            <label>Download Options:</label>
            <div className="download-buttons">
              <button onClick={downloadQRCode} className="btn-primary">
                Download QR Code
              </button>
              <button onClick={downloadWithLogo} className="btn-secondary">
                Download with Logo
              </button>
            </div>
          </div>

          <div className="info-box">
            <h3>How to use:</h3>
            <ol>
              <li>Download the QR code image</li>
              <li>Print it and place it on tables</li>
              <li>Customers scan it to see your menu</li>
              <li>They can view items without logging in</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

