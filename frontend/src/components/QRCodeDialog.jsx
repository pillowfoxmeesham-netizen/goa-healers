import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { QrCode, Download } from 'lucide-react';
import { toast } from './ui/sonner';

export function QRCodeDialog({ healer }) {
  const [open, setOpen] = useState(false);

  // Generate Google Maps location URL
  const locationURL = `https://www.google.com/maps?q=${healer.lat},${healer.lng}`;

  // Download QR code as image
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-location');
    if (canvas) {
      const svg = canvas.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas2 = document.createElement('canvas');
      const ctx = canvas2.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas2.width = img.width;
        canvas2.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas2.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `${healer.name.replace(/\s/g, '_')}_Location_QR.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        
        toast.success('QR Code downloaded!');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          data-testid={`qr-code-button-${healer.id}`}
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Location QR Code
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{healer.name}</p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg">
            <div id="qr-location" className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={locationURL} 
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground mt-4">
              Scan to open location in Google Maps
            </p>
          </div>
          
          <Button 
            onClick={downloadQRCode} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Use your phone's camera app to scan the QR code
        </div>
      </DialogContent>
    </Dialog>
  );
}
