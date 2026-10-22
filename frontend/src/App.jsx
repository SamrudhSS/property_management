import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PropertiesView from './components/PropertiesView';
import PropertyModal from './components/PropertyModal';
import LeadsView from './components/LeadsView';
import LeadModal from './components/LeadModal';
import WhatsAppIngestView from './components/WhatsAppIngestView';
import SmartMatcherView from './components/SmartMatcherView';
import MatchModal from './components/MatchModal';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState(null);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchModalData, setMatchModalData] = useState({
    targetType: 'lead',
    targetItem: null,
    matches: []
  });

  const refreshAll = async () => {
    try {
      const [propsData, leadsData, dbInfo] = await Promise.all([
        api.getProperties(),
        api.getLeads(),
        api.getDbInfo()
      ]);
      setProperties(propsData || []);
      setLeads(leadsData || []);
      setStats(dbInfo || {});
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Property Handlers
  const handleSaveProperty = async (data) => {
    try {
      if (editingProp?.id) {
        await api.updateProperty(editingProp.id, data);
      } else {
        await api.createProperty(data);
      }
      setPropModalOpen(false);
      setEditingProp(null);
      refreshAll();
    } catch (err) {
      alert('Error saving property: ' + err.message);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm(`Delete property ${id} from Excel database?`)) {
      try {
        await api.deleteProperty(id);
        refreshAll();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleStatusChangeProperty = async (id, status) => {
    try {
      await api.updateProperty(id, { status });
      refreshAll();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleMatchLeadsForProperty = async (prop) => {
    try {
      const matches = await api.getPropertyMatches(prop.id);
      setMatchModalData({
        targetType: 'property',
        targetItem: prop,
        matches: matches || []
      });
      setMatchModalOpen(true);
    } catch (err) {
      alert('Failed to calculate matches: ' + err.message);
    }
  };

  // Lead Handlers
  const handleSaveLead = async (data) => {
    try {
      if (editingLead?.id) {
        await api.updateLead(editingLead.id, data);
      } else {
        await api.createLead(data);
      }
      setLeadModalOpen(false);
      setEditingLead(null);
      refreshAll();
    } catch (err) {
      alert('Error saving lead: ' + err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm(`Delete client ${id} from Excel CRM?`)) {
      try {
        await api.deleteLead(id);
        refreshAll();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleStatusChangeLead = async (id, status) => {
    try {
      await api.updateLead(id, { status });
      refreshAll();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleMatchPropertiesForLead = async (lead) => {
    try {
      const matches = await api.getLeadMatches(lead.id);
      setMatchModalData({
        targetType: 'lead',
        targetItem: lead,
        matches: matches || []
      });
      setMatchModalOpen(true);
    } catch (err) {
      alert('Failed to calculate matches: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onRefresh={refreshAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Connecting to Excel database...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'properties' && (
              <PropertiesView
                properties={properties}
                onAddProperty={() => {
                  setEditingProp(null);
                  setPropModalOpen(true);
                }}
                onEditProperty={(prop) => {
                  setEditingProp(prop);
                  setPropModalOpen(true);
                }}
                onDeleteProperty={handleDeleteProperty}
                onMatchLeads={handleMatchLeadsForProperty}
                onStatusChange={handleStatusChangeProperty}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsView
                leads={leads}
                onAddLead={() => {
                  setEditingLead(null);
                  setLeadModalOpen(true);
                }}
                onEditLead={(lead) => {
                  setEditingLead(lead);
                  setLeadModalOpen(true);
                }}
                onDeleteLead={handleDeleteLead}
                onMatchProperties={handleMatchPropertiesForLead}
                onStatusChange={handleStatusChangeLead}
              />
            )}

            {activeTab === 'ingestion' && (
              <WhatsAppIngestView
                onIngestionSuccess={refreshAll}
              />
            )}

            {activeTab === 'matcher' && (
              <SmartMatcherView
                leads={leads}
                properties={properties}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        IRA Property Management & CRM System • Powered by Excel Database (`real_estate_database.xlsx`) & WhatsApp Ingestion Engine
      </footer>

      {/* Modals */}
      <PropertyModal
        isOpen={propModalOpen}
        onClose={() => {
          setPropModalOpen(false);
          setEditingProp(null);
        }}
        onSave={handleSaveProperty}
        initialData={editingProp}
      />

      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => {
          setLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        initialData={editingLead}
      />

      <MatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        targetType={matchModalData.targetType}
        targetItem={matchModalData.targetItem}
        matches={matchModalData.matches}
      />

    </div>
  );
}
