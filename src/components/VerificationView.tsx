import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, QrCode, Upload, Search, CheckCircle2, AlertCircle, FileText, Camera } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';

export default function VerificationView() {
  const [mode, setMode] = useState<'verify' | 'register'>('verify');
  const [isScanning, setIsScanning] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = () => {
    // Simulate verification
    setVerificationResult({
      status: 'success',
      id: 'GG_THLX_00001',
      name: 'Luxury Watch - Thalexa Edition',
      owner: '0x742d...f44e',
      registeredAt: '2026-01-15',
      ipfsHash: 'QmXoyp...789',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Toggle */}
      <div className="flex p-1 bg-surface rounded-2xl w-fit mx-auto border border-border">
        <button
          onClick={() => setMode('verify')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            mode === 'verify' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
          )}
        >
          Verify Product
        </button>
        <button
          onClick={() => setMode('register')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            mode === 'register' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
          )}
        >
          Register New
        </button>
      </div>

      {mode === 'verify' ? (
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2.5rem] text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Instant Verification</h2>
            <p className="text-gray-400 mb-8">Scan a Thalexa QR code or enter a Product ID to verify authenticity on-chain.</p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Enter Product ID (e.g. GG_THLX_00001)"
                  className="w-full pl-12 pr-4 py-4 input-field"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
              <button 
                onClick={handleVerify}
                className="btn-primary px-8 py-4 flex items-center justify-center gap-2"
              >
                Verify
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">OR</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <button 
              onClick={() => setIsScanning(true)}
              className="mt-8 flex items-center gap-3 mx-auto px-6 py-3 glass rounded-2xl hover:border-primary transition-all text-primary font-bold"
            >
              <Camera size={20} />
              Open QR Scanner
            </button>
          </div>

          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 rounded-3xl border-secondary/30 bg-secondary/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-secondary">Authenticity Verified</h3>
                      <p className="text-sm text-gray-400">Product ID: {verificationResult.id}</p>
                    </div>
                    <div className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold rounded-full">
                      ON-CHAIN PROOF
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Product Name</p>
                      <p className="font-medium">{verificationResult.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Current Owner</p>
                      <p className="font-mono text-sm">{verificationResult.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Registration Date</p>
                      <p className="font-medium">{verificationResult.registeredAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">IPFS Metadata</p>
                      <a href="#" className="text-primary text-sm flex items-center gap-1 hover:underline">
                        View on IPFS <FileText size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="glass p-8 rounded-[2.5rem]">
          <h2 className="text-2xl font-display font-bold mb-6">Register New Product</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Product Name</label>
                <input type="text" placeholder="e.g. Luxury Watch" className="w-full input-field" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Manufacturer</label>
                <input type="text" placeholder="e.g. Thalexa Labs" className="w-full input-field" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Description</label>
              <textarea rows={3} placeholder="Enter product details..." className="w-full input-field resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Product Image / Proof</label>
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500 mt-1">Max size: 10MB (Stored on IPFS)</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-3">
              <AlertCircle className="text-primary shrink-0" size={20} />
              <p className="text-xs text-primary leading-relaxed">
                Registering a product requires a small gas fee in SUI. This will create an immutable record on the Sui blockchain and generate a unique QR code for verification.
              </p>
            </div>

            <button type="submit" className="w-full btn-primary py-4 text-lg">
              Register on Blockchain
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
