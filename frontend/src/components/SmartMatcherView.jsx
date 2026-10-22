import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Building2, User, CheckCircle, MessageSquare, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function SmartMatcherView({ leads, properties }) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [selectedPropId, setSelectedPropId] = useState(properties[0]?.id || '');
  const [matchMode, setMatchMode] = useState('lead_to_props'); // 'lead_to_props' or 'prop_to_leads'
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      if (matchMode === 'lead_to_props' && selectedLeadId) {
        const res = await api.getLeadMatches(selectedLeadId);
        setMatches(res || []);
      } else if (matchMode === 'prop_to_leads' && selectedPropId) {
        const res = await api.getPropertyMatches(selectedPropId);
        setMatches(res || []);
      }
    } catch (err) {
      console.error('Match fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leads.length && !selectedLeadId) setSelectedLeadId(leads[0].id);
    if (properties.length && !selectedPropId) setSelectedPropId(properties[0].id);
  }, [leads, properties]);

  useEffect(() => {
    fetchMatches();
  }, [selectedLeadId, selectedPropId, matchMode]);

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
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold">Automated Matchmaking Engine</h2>
        </div>
        <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
          Instantly connect prospective buyers and tenants with available properties in your Excel database. 
          Generates compatibility scores and customized 1-click WhatsApp pitch messages.
        </p>
      </div>

      {/* Mode Switcher & Selection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Toggle Mode */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setMatchMode('lead_to_props')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
              matchMode === 'lead_to_props'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-blue-500" />
            <span>Find Flats for Client (Tenant / Buyer)</span>
          </button>

          <button
            onClick={() => setMatchMode('prop_to_leads')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
              matchMode === 'prop_to_leads'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Find Interested Clients for a Property</span>
          </button>
        </div>

        {/* Dropdown Select */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {matchMode === 'lead_to_props' ? (
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Prospective Client:</label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.client_type} ({l.preferred_bhk}) | Budget: ₹{l.max_budget?.toLocaleString('en-IN')} | {l.preferred_locations || 'Any'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Available Property:</label>
              <select
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.bhk} in {p.building_name || 'Complex'}, {p.location_area} — ₹{p.rent_price?.toLocaleString('en-IN')}{p.listing_type === 'Rent' ? '/mo' : ''} ({p.listing_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchMatches}
            className="flex items-center space-x-1.5 px-4 py-2 mt-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Found <strong className="text-slate-800">{matches.length}</strong> matching option(s) sorted by compatibility</span>
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-amber-500" />
            <p className="text-xs">Computing compatibility scores from Excel database...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No compatible matches found for this selection.</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting another client or widening requirements.</p>
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
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${getScoreColor(item.score)}`}>
                      {item.score}% COMPATIBLE
                    </span>
                    <h3 className="font-bold text-base text-slate-900">
                      {propObj.bhk} in {propObj.building_name || 'Complex'}, {propObj.location_area}
                    </h3>
                  </div>
                  <div className="text-base font-extrabold text-emerald-700">
                    ₹{propObj.rent_price?.toLocaleString('en-IN')}{propObj.listing_type === 'Rent' ? ' / mo' : ''}
                  </div>
                </div>

                {/* Match criteria breakdown */}
                <div className="flex flex-wrap gap-2">
                  {item.match_reasons.map((reason, rIdx) => (
                    <span 
                      key={rIdx}
                      className="inline-flex items-center space-x-1.5 text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100 font-medium"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{reason}</span>
                    </span>
                  ))}
                </div>

                {/* WhatsApp Pitch */}
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-900 text-xs flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Ready-to-Send WhatsApp Client Pitch</span>
                    </span>
                    <button
                      onClick={() => handleCopy(item.whatsapp_pitch, idx)}
                      className="flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedIdx === idx ? 'Copied!' : 'Copy Pitch'}</span>
                    </button>
                  </div>

                  <pre className="font-sans whitespace-pre-wrap text-slate-700 text-xs leading-relaxed bg-white/70 p-3 rounded-lg border border-emerald-100/60">
                    {item.whatsapp_pitch}
                  </pre>

                  <div className="mt-3 flex justify-end">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send to {leadObj.name} ({leadObj.phone})</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
