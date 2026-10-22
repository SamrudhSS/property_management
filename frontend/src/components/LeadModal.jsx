import React, { useState, useEffect } from 'react';
import { X, Users, Save } from 'lucide-react';

export default function LeadModal({ isOpen, onClose, onSave, initialData }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    client_type: 'Tenant',
    preferred_bhk: '2 BHK',
    preferred_locations: '',
    min_budget: '',
    max_budget: '',
    furnishing: 'Any',
    move_in_date: 'Immediate',
    status: 'New',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        client_type: initialData.client_type || 'Tenant',
        preferred_bhk: initialData.preferred_bhk || '2 BHK',
        preferred_locations: initialData.preferred_locations || '',
        min_budget: initialData.min_budget || '',
        max_budget: initialData.max_budget || '',
        furnishing: initialData.furnishing || 'Any',
        move_in_date: initialData.move_in_date || 'Immediate',
        status: initialData.status || 'New',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        client_type: 'Tenant',
        preferred_bhk: '2 BHK',
        preferred_locations: '',
        min_budget: '',
        max_budget: '',
        furnishing: 'Any',
        move_in_date: 'Immediate',
        status: 'New',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      min_budget: parseFloat(formData.min_budget) || 0,
      max_budget: parseFloat(formData.max_budget) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {isEdit ? `Edit Client (${initialData.id})` : 'Add New Prospective Client (CRM)'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Client Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Type *</label>
              <select
                value={formData.client_type}
                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tenant">Prospective Tenant (Looking for Rent)</option>
                <option value="Buyer">Prospective Buyer (Looking for Sale)</option>
              </select>
            </div>

            {/* Preferred BHK */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Configuration (BHK)</label>
              <input
                type="text"
                placeholder="e.g. 2 BHK or 2 BHK, 3 BHK"
                value={formData.preferred_bhk}
                onChange={(e) => setFormData({ ...formData, preferred_bhk: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Localities / Areas</label>
            <input
              type="text"
              placeholder="e.g. Thane West, Ghodbunder Road, Majiwada"
              value={formData.preferred_locations}
              onChange={(e) => setFormData({ ...formData, preferred_locations: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Min Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Budget (₹)</label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={formData.min_budget}
                onChange={(e) => setFormData({ ...formData, min_budget: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Budget (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 35000"
                value={formData.max_budget}
                onChange={(e) => setFormData({ ...formData, max_budget: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Furnishing */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing</label>
              <select
                value={formData.furnishing}
                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Any">Any</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Move-in Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline</label>
              <input
                type="text"
                placeholder="e.g. Immediate"
                value={formData.move_in_date}
                onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Visit Scheduled">Visit Scheduled</option>
                <option value="Closed">Closed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Broker Remarks / Follow-up Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Looking for flat near metro station, requires covered car parking"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Save to CRM'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
