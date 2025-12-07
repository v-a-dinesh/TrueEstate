import React from 'react';
import { LayoutDashboard, FileText, Package, DollarSign, ChevronDown } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-[240px] h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo/Brand Section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded transform rotate-45"></div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Vault</div>
            <div className="text-xs text-gray-600">DINESH V A</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {/* Dashboard - Active */}
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>

          {/* Nexus */}
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FileText className="w-5 h-5" />
            <span>Nexus</span>
          </a>

          {/* Intake */}
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Package className="w-5 h-5" />
            <span>Intake</span>
          </a>

          {/* Services - Expandable */}
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <DollarSign className="w-5 h-5" />
              <span>Services</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </button>
            
            {/* Submenu */}
            <div className="ml-8 space-y-1">
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span>Pre-active</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span>Active</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span>Blocked</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span>Closed</span>
              </a>
            </div>
          </div>

          {/* Invoices - Expandable */}
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5" />
              <span>Invoices</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </button>
            
            {/* Submenu */}
            <div className="ml-8 space-y-1">
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span>Proforma Invoices</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span>Final Invoices</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
