import React, { useState } from 'react';
import { Coordinates } from '../types';
import { WhatsAppIcon, MailIcon, ShareIcon } from './Icons';

interface ShareButtonsProps {
  coords: Coordinates | null;
  locationDescription?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ coords, locationDescription }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  if (!coords) return null;

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
  
  // Romanian text content
  let shareText = `Mă aflu aici:\nLat: ${coords.latitude.toFixed(6)}\nLong: ${coords.longitude.toFixed(6)}`;

  if (coords.stereo70) {
    shareText += `\n\nStereo 70 (RO):\nN: ${coords.stereo70.y.toFixed(2)} m\nE: ${coords.stereo70.x.toFixed(2)} m`;
  }

  shareText += `\n\n${locationDescription ? `Context: ${locationDescription}\n\n` : ''}Vezi pe hartă: ${mapLink}`;
  
  const shareSubject = "Locația mea curentă";

  // Encoding for URLs
  const encodedText = encodeURIComponent(shareText);
  const encodedSubject = encodeURIComponent(shareSubject);
  // Re-encode text specifically for body
  const encodedBody = encodeURIComponent(shareText);

  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareSubject,
          text: shareText,
          url: mapLink // Providing the URL separately often helps generate better previews
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
    setIsEmailModalOpen(false);
  };

  // Check if native sharing is available (mostly mobile)
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex gap-3 justify-center z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {canNativeShare ? (
           <button
           onClick={handleNativeShare}
           className="flex-1 max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-indigo-200"
         >
           <ShareIcon className="w-5 h-5" />
           <span>Distribuie Locația</span>
         </button>
        ) : (
          <>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 max-w-[180px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-green-200"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
            
            <button
              onClick={handleEmailClick}
              className="flex-1 max-w-[180px] bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-slate-300"
            >
              <MailIcon className="w-5 h-5" />
              <span>Email</span>
            </button>
          </>
        )}
      </div>

      {/* Email Prompt Modal (Romanian) */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEmailModalOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative z-10 animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Trimite prin Email</h3>
            <p className="text-sm text-slate-500 mb-4">Introdu adresa de email a destinatarului.</p>
            
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="destinatar@exemplu.com"
              autoFocus
              className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendEmail();
              }}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSendEmail}
                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                Trimite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButtons;