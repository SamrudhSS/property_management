import React, { useState } from 'react';
import { 
  Building2, MapPin, Phone, MessageSquare, Plus, Search, 
  Filter, Tag, Key, UserCheck, Edit2, Trash2, CheckCircle2, 
  ExternalLink, Sparkles 
} from 'lucide-react';

export default function PropertiesView({ 
  properties, 
  onAddProperty, 
  onEditProperty, 
  onDeleteProperty, 
  onMatchLeads,
  onStatusChange 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [bhkFilter, setBhkFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = properties.filter((p) => {
    if (typeFilter && p.listing_type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (bhkFilter && !p.bhk.toLowerCase().includes(bhkFilter.toLowerCase())) return false;
    if (statusFilter && p.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const combined = `${p.id} ${p.building_name} ${p.location_area} ${p.bhk} ${p.features} ${p.contact_numbers} ${p.agency}`.toLowerCase();
      if (!combined.includes(term)) return false;
    }
    return true;
  });

  const formatPrice = (val, type) => {
    if (!val || val === 0) return 'Price On Request';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}${type === 'Rent' ? ' / mo' : ''}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search society, area, BHK, broker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Types (Rent & Sale)</option>
            <option value="Rent">For Rent</option>
            <option value="Sale">For Sale</option>
          </select>

          {/* BHK Filter */}
          <select
            value={bhkFilter}
            onChange={(e) => setBhkFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Configurations</option>
            <option value="1 RK">1 RK</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="4 BHK">4+ BHK</option>
            <option value="Commercial">Commercial</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Under Negotiation">Under Negotiation</option>
            <option value="Rented">Rented</option>
            <option value="Sold">Sold</option>
          </select>

          {/* Add Property Button */}
          <button
            onClick={onAddProperty}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filtered.length}</strong> of {properties.length} properties in Excel</span>
      </div>

      {/* Properties Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No properties found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters, or ingest new listings directly from WhatsApp!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prop) => {
            const phoneList = prop.contact_numbers 
              ? prop.contact_numbers.split(',').map((p) => p.trim()).filter(Boolean)
              : [];
            
            return (
              <div 
                key={prop.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        prop.listing_type === 'Rent'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        FOR {prop.listing_type.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {prop.bhk}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={prop.status}
                      onChange={(e) => onStatusChange(prop.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border focus:outline-none transition cursor-pointer ${
                        prop.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : prop.status === 'Under Negotiation'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Under Negotiation">Under Negotiation</option>
                      <option value="Rented">Rented</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  {/* Title & Location */}
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition">
                    {prop.building_name ? `${prop.building_name}` : `${prop.bhk} Flat`}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1 shrink-0" />
                    <span className="truncate">{prop.location_area || 'Location specified in notes'}</span>
                  </div>

                  {/* Price & Deposit */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">
                        {prop.listing_type === 'Rent' ? 'Monthly Rent' : 'Sale Price'}
                      </div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {formatPrice(prop.rent_price, prop.listing_type)}
                      </div>
                    </div>
                    {prop.deposit && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Security Deposit</div>
                        <div className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                          {prop.deposit}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Furnishing & Features */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-medium">{prop.furnishing}</span>
                    </div>

                    {prop.features && (
                      <p className="text-slate-500 text-xs line-clamp-2 bg-slate-50/50 p-2 rounded border border-slate-100">
                        ✨ {prop.features}
                      </p>
                    )}
                  </div>

                  {/* Contacts */}
                  {phoneList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-medium">Contact:</span>
                        <div className="flex items-center space-x-2">
                          {phoneList.map((num, i) => (
                            <div key={i} className="flex items-center space-x-1">
                              <a
                                href={`https://wa.me/91${num}`}
                                target="_blank"
                                rel="noreferrer"
                                title={`WhatsApp ${num}`}
                                className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{num}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                      {prop.agency && (
                        <div className="text-[10px] text-slate-400 mt-1 text-right">
                          Agency: <strong className="text-slate-600">{prop.agency}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {prop.id} • {prop.date_added}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onMatchLeads(prop)}
                      className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded transition shadow-sm"
                      title="Find Prospective Tenants/Buyers"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find Leads</span>
                    </button>
                    <button
                      onClick={() => onEditProperty(prop)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                      title="Edit Property"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProperty(prop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Delete from Excel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
