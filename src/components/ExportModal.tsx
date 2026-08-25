import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
  X,
  Compass,
  Ship,
  Globe
} from 'lucide-react';
import { CharterRecommendation } from '../types';
import { exportCharterMemoPDF, exportLandedCostExcel } from '../utils/exportUtils';
import { compareSourcingOrigins } from '../engine/landedCostEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecommendation?: CharterRecommendation;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeRecommendation,
}) => {
  if (!isOpen) return null;

  const handleExportPDF = () => {
    if (activeRecommendation) {
      exportCharterMemoPDF(activeRecommendation);
    }
  };

  const handleExportExcel = () => {
    const data = compareSourcingOrigins();
    const formatted = data.map(d => ({
      'Origin Name': d.originName,
      'Country': d.originCountry,
      'Load Port': d.loadPort,
      'Discharge Port': d.dischargePort,
      'Transit Days': d.transitDays,
      'FOB Price (USD/MT)': d.fobPriceUSDperMT,
      'Ocean Freight (USD/MT)': d.freightUSDperMT,
      'Total Landed Cost (USD/MT)': d.landedCostUSDperMT,
      'Total Landed Cost (INR/MT)': d.landedCostINRperMT,
    }));
    exportLandedCostExcel(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Export Decision Reports & Briefs</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Generate formal audit-compliant documentation conforming to IEEE 29148 / 830 standards for procurement committees and shipping operations desks.
        </p>

        <div className="space-y-3">
          {/* PDF Charter Memo Option */}
          <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Vessel Chartering Approval Memo</div>
                <div className="text-[10px] text-slate-400">Official Sign-off Memo (.pdf)</div>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Excel Landed Cost Option */}
          <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Multi-Origin Landed Cost Model</div>
                <div className="text-[10px] text-slate-400">Sourcing Matrix & GCV Parity (.xlsx)</div>
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
          Nautical AI • Intelligent Freight Forecasting Model (IFFM v1.0)
        </div>
      </div>
    </div>
  );
};
