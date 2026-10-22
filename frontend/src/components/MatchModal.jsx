import React, { useState } from 'react';
import { 
  X, Target, Sparkles, CheckCircle, MessageSquare, Copy, 
  ExternalLink, ArrowRight, Building2, User 
} from 'lucide-react';

export default function MatchModal({ isOpen, onClose, targetType, targetItem, matches }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen || !targetItem) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 70) return 'bg-blue-500 text-white';
    if (score >= 50) return 'bg-amber-500 text-white';
    return 'bg-slate-400 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Smart Match Engine & WhatsApp Pitch Generator
              </h3>
              <p className="text-xs text-slate-400">
                {targetType === 'lead' 
                  ? `Showing top matching properties for client: ${targetItem.name}`
                  : `Showing interested prospective leads for: ${targetItem.building_name || targetItem.bhk}`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Target Summary Banner */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 shrink-0">
          {targetType === 'lead' ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{targetItem.name}</span>
                <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                  {targetItem.client_type} ({targetItem.preferred_bhk})
                </span>
                <span className="text-slate-500">📍 {targetItem.preferred_locations || 'Any Area'}</span>
              </div>
              <div className="text-slate-700 font-bold">
                Budget: ₹{targetItem.min_budget?.toLocaleString('en-IN')} - ₹{targetItem.max_budget?.toLocaleString('en-IN')}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  {targetItem.building_name ? `${targetItem.building_name} (${targetItem.bhk})` : targetItem.bhk}
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  For {targetItem.listing_type}
                </span>
                <span className="text-slate-500">📍 {targetItem.location_area}</span>
              </div>
              <div className="text-slate-700 font-bold">
                ₹{targetItem.rent_price?.toLocaleString('en-IN')}{targetItem.listing_type === 'Rent' ? '/mo' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Matches List */}
        <div className="p-6 overflow-y-auto space-y-5">
          {matches.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">No matching records found with high compatibility score.</p>
              <p className="text-xs text-slate-400 mt-1">Try widening the budget range or location preference in the CRM.</p>
            </div>
          ) : (
            matches.map((item, idx) => {
              const leadObj = item.lead;
              const propObj = item.property;
              const phoneClean = (leadObj.phone || propObj.contact_numbers || '').replace(/\D/g, '');
              const waUrl = `https://wa.me/91${phoneClean}?text=${encodeURIComponent(item.whatsapp_pitch)}`;

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition space-y-4"
                >
                  {/* Top Match Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${getScoreColor(item.score)}`}>
                        {item.score}% MATCH
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        {targetType === 'lead' 
                          ? `${propObj.bhk} in ${propObj.building_name || 'Complex'}, ${propObj.location_area}`
                          : `${leadObj.name} (${leadObj.preferred_bhk} - Budget: ₹${leadObj.max_budget?.toLocaleString('en-IN')})`
                        }
                      </h4>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700">
                      ₹{propObj.rent_price?.toLocaleString('en-IN')}{propObj.listing_type === 'Rent' ? '/mo' : ''}
                    </span>
                  </div>

                  {/* Match Criteria Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.match_reasons.map((reason, rIdx) => (
                      <span 
                        key={rIdx}
                        className="inline-flex items-center space-x-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span>{reason}</span>
                      </span>
                    ))}
                  </div>

                  {/* WhatsApp Pitch Preview Box */}
                  <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-emerald-900 text-[11px] flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Formatted WhatsApp Client Pitch</span>
                      </span>
                      <button
                        onClick={() => handleCopy(item.whatsapp_pitch, idx)}
                        className="flex items-center space-x-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-100/70 hover:bg-emerald-100 px-2 py-0.5 rounded transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedIdx === idx ? 'Copied!' : 'Copy Pitch'}</span>
                      </button>
                    </div>
                    <pre className="font-sans whitespace-pre-wrap text-slate-700 text-[11px] leading-relaxed bg-white/70 p-2.5 rounded-lg border border-emerald-100/60">
                      {item.whatsapp_pitch}
                    </pre>

                    {/* WhatsApp Action Button */}
                    <div className="mt-2.5 flex justify-end">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send via WhatsApp</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
