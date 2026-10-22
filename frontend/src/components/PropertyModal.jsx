import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';

export default function PropertyModal({ isOpen, onClose, onSave, initialData }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    listing_type: 'Rent',
    bhk: '2 BHK',
    building_name: '',
    location_area: '',
    furnishing: 'Semi-Furnished',
    rent_price: '',
    deposit: '',
    features: '',
    contact_numbers: '',
    agency: 'IRA PROPERTY',
    status: 'Available'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        listing_type: initialData.listing_type || 'Rent',
        bhk: initialData.bhk || '2 BHK',
        building_name: initialData.building_name || '',
        location_area: initialData.location_area || '',
        furnishing: initialData.furnishing || 'Semi-Furnished',
        rent_price: initialData.rent_price || '',
        deposit: initialData.deposit || '',
        features: initialData.features || '',
        contact_numbers: initialData.contact_numbers || '',
        agency: initialData.agency || 'IRA PROPERTY',
        status: initialData.status || 'Available'
      });
    } else {
      setFormData({
        listing_type: 'Rent',
        bhk: '2 BHK',
        building_name: '',
        location_area: '',
        furnishing: 'Semi-Furnished',
        rent_price: '',
        deposit: '',
        features: '',
        contact_numbers: '',
        agency: 'IRA PROPERTY',
        status: 'Available'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      rent_price: parseFloat(formData.rent_price) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">
              {isEdit ? `Edit Property (${initialData.id})` : 'Add New Property to Excel'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Listing Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Type *</label>
              <select
                value={formData.listing_type}
                onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Rent">Rent</option>
                <option value="Sale">Sale / Outright</option>
              </select>
            </div>

            {/* BHK Configuration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Configuration (BHK) *</label>
              <select
                value={formData.bhk}
                onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1 RK">1 RK</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="Commercial">Commercial / Shop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Building Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Building / Complex Name</label>
              <input
                type="text"
                placeholder="e.g. Hill Crest"
                value={formData.building_name}
                onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Location Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Area *</label>
              <input
                type="text"
                required
                placeholder="e.g. Thane West"
                value={formData.location_area}
                onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price / Rent */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {formData.listing_type === 'Rent' ? 'Monthly Rent (₹) *' : 'Sale Price (₹) *'}
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 30000"
                value={formData.rent_price}
                onChange={(e) => setFormData({ ...formData, rent_price: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Deposit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit / Terms</label>
              <input
                type="text"
                placeholder="e.g. 6 Months Rent or ₹1,80,000"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Furnishing */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing Status</label>
              <select
                value={formData.furnishing}
                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Available">Available</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Rented">Rented</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Features / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Features & Amenities</label>
            <input
              type="text"
              placeholder="e.g. Modular Kitchen, Sofa Bed Available, Ready to Move"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact Numbers */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Numbers</label>
              <input
                type="text"
                placeholder="e.g. 9167464416, 9324375688"
                value={formData.contact_numbers}
                onChange={(e) => setFormData({ ...formData, contact_numbers: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Agency / Broker Name</label>
              <input
                type="text"
                placeholder="e.g. IRA PROPERTY"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Add to Excel'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
