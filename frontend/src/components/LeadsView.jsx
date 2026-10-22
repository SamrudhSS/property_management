import React, { useState } from 'react';
import { 
  Users, UserPlus, Phone, MessageSquare, Search, Filter, 
  MapPin, IndianRupee, Sparkles, Edit2, Trash2, Calendar, 
  CheckCircle, ArrowUpRight 
} from 'lucide-react';

export default function LeadsView({ 
  leads, 
  onAddLead, 
  onEditLead, 
  onDeleteLead, 
  onMatchProperties,
  onStatusChange 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = leads.filter((l) => {
    if (typeFilter && l.client_type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (statusFilter && l.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const combined = `${l.id} ${l.name} ${l.phone} ${l.preferred_bhk} ${l.preferred_locations} ${l.notes}`.toLowerCase();
      if (!combined.includes(term)) return false;
    }
    return true;
  });

  const formatBudget = (min, max, type) => {
    const isRent = type === 'Tenant';
    const fmt = (v) => {
      if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
      if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
      return `₹${v.toLocaleString('en-IN')}`;
    };

    if (min > 0 && max > 0) {
      return `${fmt(min)} - ${fmt(max)}${isRent ? ' / mo' : ''}`;
    } else if (max > 0) {
      return `Up to ${fmt(max)}${isRent ? ' / mo' : ''}`;
    }
    return 'Flexible Budget';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Visit Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dropped':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client name, phone, locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clients (Tenants & Buyers)</option>
            <option value="Tenant">Prospective Tenants (Rent)</option>
            <option value="Buyer">Prospective Buyers (Sale)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            <option value="New">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Visit Scheduled">Visit Scheduled</option>
            <option value="Closed">Closed (Converted)</option>
            <option value="Dropped">Dropped</option>
          </select>

          {/* Add Client Button */}
          <button
            onClick={onAddLead}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm ml-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Client / Lead</span>
          </button>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filtered.length}</strong> of {leads.length} CRM clients</span>
      </div>

      {/* Leads Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No CRM leads found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add prospective buyers and tenants to track their preferences and find matching flats!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lead) => (
            <div 
              key={lead.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Body */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      lead.client_type === 'Tenant'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {lead.client_type.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {lead.preferred_bhk}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-md border focus:outline-none transition cursor-pointer ${getStatusColor(lead.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Visit Scheduled">Visit Scheduled</option>
                    <option value="Closed">Closed</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>

                {/* Client Name & Phone */}
                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition">
                  {lead.name}
                </h3>

                {lead.phone && (
                  <div className="flex items-center space-x-2 mt-1">
                    <a
                      href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </a>
                  </div>
                )}

                {/* Preferences Box */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Budget Range:</span>
                    <strong className="text-slate-800 font-bold">
                      {formatBudget(lead.min_budget, lead.max_budget, lead.client_type)}
                    </strong>
                  </div>

                  {lead.preferred_locations && (
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 shrink-0 mr-2">Target Localities:</span>
                      <span className="text-slate-700 font-medium text-right truncate">
                        {lead.preferred_locations}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Move-in / Timeline:</span>
                    <span className="text-slate-700 font-medium">
                      {lead.move_in_date || 'Immediate'}
                    </span>
                  </div>

                  {lead.furnishing && lead.furnishing !== 'Any' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Furnishing:</span>
                      <span className="text-slate-700 font-medium">{lead.furnishing}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {lead.notes && (
                  <p className="mt-3 text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100/50">
                    "{lead.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {lead.id} • {lead.date_added}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onMatchProperties(lead)}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition shadow-sm"
                    title="Find Matching Flats for this Lead"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Match Flats</span>
                  </button>
                  <button
                    onClick={() => onEditLead(lead)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                    title="Edit Client"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Delete from Excel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
