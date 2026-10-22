import React, { useState, useEffect } from 'react';
import { 
  MessageSquareCode, Upload, FolderSync, CheckCircle2, 
  AlertCircle, Sparkles, FileText, ArrowRight, Table, 
  Send, RefreshCw, FolderOpen, Copy, Eye
} from 'lucide-react';
import { api } from '../api';

const SAMPLE_TEXT = `🟩 AVAILABLE 2 BHK FLAT FOR RENT 

📍 Location: Hill Crest, Thane West

✅ Semi-Furnished Flat
   - Modular Kitchen
   - Sofa Bed Available
   - Ready to Move

💰 Rent: 30,000/- per month  
💵 Deposit: 6 Months Rent

 Call for Visit: 
📞 9167464416  
📞 9324375688

 *IRA PROPERTY`;

export default function WhatsAppIngestView({ onIngestionSuccess }) {
  const [pasteText, setPasteText] = useState('');
  const [previewItems, setPreviewItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [watcherStatus, setWatcherStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchWatcherStatus = async () => {
    try {
      const data = await api.getWatcherStatus();
      setWatcherStatus(data);
    } catch (err) {
      console.error('Failed to get watcher status', err);
    }
  };

  useEffect(() => {
    fetchWatcherStatus();
    const interval = setInterval(fetchWatcherStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePreview = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setResultMsg(null);
    try {
      const data = await api.previewWhatsAppText(pasteText);
      setPreviewItems(data.items || []);
      if (data.items.length === 0) {
        setResultMsg({ type: 'warning', text: 'No real estate listings detected in the pasted text.' });
      }
    } catch (err) {
      setResultMsg({ type: 'error', text: 'Failed to parse text: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCommitPasted = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setResultMsg(null);
    try {
      const data = await api.ingestWhatsAppText(pasteText);
      setResultMsg({ 
        type: 'success', 
        text: `Successfully added ${data.properties_added} property listing(s) into Excel database!` 
      });
      setPasteText('');
      setPreviewItems(null);
      if (onIngestionSuccess) onIngestionSuccess();
    } catch (err) {
      setResultMsg({ type: 'error', text: 'Failed to ingest: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setLoading(true);
    setResultMsg(null);
    try {
      const data = await api.uploadWhatsAppFile(file);
      setResultMsg({
        type: 'success',
        text: `Processed '${file.name}': Scanned ${data.total_messages_scanned} messages, extracted & saved ${data.properties_added} property listing(s) to Excel!`
      });
      setSelectedFile(null);
      if (onIngestionSuccess) onIngestionSuccess();
      fetchWatcherStatus();
    } catch (err) {
      setResultMsg({ type: 'error', text: 'Upload failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleScanWatcher = async () => {
    setLoading(true);
    setResultMsg(null);
    try {
      const data = await api.triggerFolderScan();
      setResultMsg({
        type: 'success',
        text: `Folder scan completed: Scanned ${data.files_scanned} file(s), added ${data.properties_added} listing(s) to Excel!`
      });
      fetchWatcherStatus();
      if (onIngestionSuccess) onIngestionSuccess();
    } catch (err) {
      setResultMsg({ type: 'error', text: 'Folder scan failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-purple-500/30 rounded-xl">
            <MessageSquareCode className="w-6 h-6 text-purple-300" />
          </div>
          <h2 className="text-xl font-bold">WhatsApp Ingestion & Parser Engine</h2>
        </div>
        <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
          Parse property availability messages from WhatsApp chats, group archives (.zip exports), 
          or watched folders. The engine automatically extracts BHK, location, rent, deposit, 
          amenities, and contact numbers directly into your <strong>Excel database</strong>.
        </p>
      </div>

      {/* Alert Notification */}
      {resultMsg && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
          resultMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : resultMsg.type === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {resultMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{resultMsg.text}</span>
        </div>
      )}

      {/* Two-Column Workflows: Direct Paste vs File / Folder Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Direct Text Paste (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Paste WhatsApp Message</h3>
              <p className="text-xs text-slate-500">Paste single or multiple messages from WhatsApp Web or phone</p>
            </div>
            <button
              onClick={() => setPasteText(SAMPLE_TEXT)}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition"
            >
              Insert Sample
            </button>
          </div>

          <textarea
            rows={8}
            placeholder="Paste raw WhatsApp message here (e.g. 🟩 AVAILABLE 2 BHK FLAT FOR RENT...)"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none transition leading-relaxed"
          />

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              disabled={loading || !pasteText.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Fields</span>
            </button>

            <button
              onClick={handleCommitPasted}
              disabled={loading || !pasteText.trim()}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-sm ml-auto disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Save to Excel Database</span>
            </button>
          </div>

          {/* Live Preview Table */}
          {previewItems && previewItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Extracted Fields Preview ({previewItems.length} listing found):</span>
              </div>
              <div className="space-y-3">
                {previewItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.bhk} in {item.building_name || 'Society'} ({item.location_area || 'Area'})</span>
                      <span className="font-bold text-emerald-700">₹{item.rent_price?.toLocaleString('en-IN')} / mo</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div><strong className="text-slate-500">Deposit:</strong> {item.deposit || 'N/A'}</div>
                      <div><strong className="text-slate-500">Furnishing:</strong> {item.furnishing}</div>
                      <div><strong className="text-slate-500">Contacts:</strong> {item.contact_numbers || 'N/A'}</div>
                      <div><strong className="text-slate-500">Agency:</strong> {item.agency || 'N/A'}</div>
                    </div>
                    {item.features && (
                      <div className="text-[11px] text-slate-500">
                        <strong className="text-slate-600">Features:</strong> {item.features}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: File Upload & Watched Folder (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upload .zip or .txt Chat Export */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upload WhatsApp Chat Export</h3>
              <p className="text-xs text-slate-500">Upload exported .zip archive or .txt / .md chat file</p>
            </div>

            <label className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group">
              <Upload className="w-8 h-8 text-purple-500 group-hover:scale-110 transition mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Click to browse or drop .zip / .txt
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                WhatsApp exports containing multiple messages supported
              </span>
              <input
                type="file"
                accept=".zip,.txt,.md"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>

          {/* Automated Folder Watcher Hub */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Automated Folder Watcher</h3>
                <p className="text-xs text-slate-500">Monitors directory for dropped message files</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Active</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-mono break-all text-slate-700">
                  {watcherStatus?.watch_folder || 'input_messages/'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <span>Pending files: <strong className="text-slate-800">{watcherStatus?.pending_files?.length || 0}</strong></span>
                <span>Archived processed: <strong className="text-slate-800">{watcherStatus?.total_archived_files || 0}</strong></span>
              </div>
            </div>

            <button
              onClick={handleScanWatcher}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Scan Folder Now</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
