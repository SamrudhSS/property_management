import React from 'react';
import { Building2, Users, MessageSquareCode, Target, FileSpreadsheet, Download, RefreshCw, FolderOpen } from 'lucide-react';
import { api } from '../api';

export default function Navbar({ activeTab, setActiveTab, stats, onRefresh }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Agency Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-slate-950 font-bold shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wide text-white">IRA REAL ESTATE</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Excel Database
                </span>
              </div>
              <p className="text-xs text-slate-400">Property Management & WhatsApp CRM</p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Properties: </span>
              <span className="font-bold text-white">{stats.total_properties ?? 0}</span>
              <span className="text-emerald-400 ml-1">({stats.available_properties ?? 0} Avail)</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">CRM Leads: </span>
              <span className="font-bold text-white">{stats.total_leads ?? 0}</span>
              <span className="text-blue-400 ml-1">({stats.active_leads ?? 0} Active)</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={api.downloadExcelUrl}
              download="real_estate_database.xlsx"
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
              title="Download real_estate_database.xlsx"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
              <Download className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800 pt-1">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'properties'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Properties Inventory</span>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
              {stats.total_properties ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'leads'
                ? 'bg-slate-800 text-blue-400 border-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clients CRM</span>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
              {stats.active_leads ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'ingestion'
                ? 'bg-slate-800 text-purple-400 border-purple-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>WhatsApp Ingestion Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('matcher')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'matcher'
                ? 'bg-slate-800 text-amber-400 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Smart Matcher</span>
          </button>
        </div>

      </div>
    </header>
  );
}
