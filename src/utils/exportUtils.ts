import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CharterRecommendation, LandedCostBreakdown, FreightForecast } from '../types';

// Extend jsPDF interface to avoid @ts-ignore for lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export function exportCharterMemoPDF(
  recommendation: CharterRecommendation,
  landedCost?: LandedCostBreakdown,
  forecast?: FreightForecast
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as jsPDFWithAutoTable;

  const navyColor: [number, number, number] = [11, 25, 44];
  const blueColor: [number, number, number] = [2, 132, 199];
  const grayColor: [number, number, number] = [100, 116, 139];

  // --- Header Banner ---
  doc.setFillColor(...navyColor);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NAUTICAL AI | VESSEL CHARTERING RECOMMENDATION MEMO', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Intelligent Freight Forecasting Model (IFFM) - Bulk Cargo Procurement', 14, 25);

  // --- Section 1: Metadata Table ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Recommendation Summary', 14, 40);

  const topVessel = recommendation.rankedVessels[0];

  const summaryData = [
    ['Recommendation ID', recommendation.id, 'Date Generated', new Date().toLocaleDateString()],
    ['Target Route', recommendation.routeId, 'Vessel Class', recommendation.vesselClass],
    ['Recommended Charter Type', recommendation.recommendedCharterType, 'Cargo Quantity', `${recommendation.cargoQuantityMT.toLocaleString()} MT`],
    ['Recommended Laycan', `${recommendation.recommendedLaycanWindow.start} to ${recommendation.recommendedLaycanWindow.end}`, 'Optimal Fixture Date', recommendation.recommendedLaycanWindow.optimalFixtureDate],
    ['Expected Freight Rate', `$${recommendation.expectedFreightRateUSDperMT.toFixed(2)} / MT`, 'Total Expected Freight', `$${recommendation.expectedTotalFreightUSD.toLocaleString()}`],
    ['Top Ranked Vessel', topVessel ? topVessel.name : 'N/A', 'RightShip Vetting Score', topVessel ? `${topVessel.vettingScore} / 5.0` : 'N/A'],
    ['Approval Status', recommendation.status, 'Approved By / Notes', recommendation.approvedBy || 'Pending Operations Manager Approval']
  ];

  autoTable(doc, {
    startY: 44,
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 45 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 45 },
      3: { cellWidth: 50 },
    },
  });

  // --- Section 2: Key Rationale ---
  let nextY = doc.lastAutoTable.finalY + 10;
  
  // Page overflow guard
  if (nextY > 250) { doc.addPage(); nextY = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Decision Rationale & Risk Assessment', 14, nextY);

  const rationaleItems = recommendation.rationale.map((r, i) => [`${i + 1}`, r]);
  autoTable(doc, {
    startY: nextY + 4,
    head: [['#', 'Strategic Rationale & Market Intelligence']],
    body: rationaleItems,
    theme: 'striped',
    headStyles: { fillColor: blueColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
    }
  });

  // --- Section 3: Candidate Vessel Ranking Matrix ---
  nextY = doc.lastAutoTable.finalY + 10;
  if (nextY > 230) { doc.addPage(); nextY = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. Ranked Candidate Vessels Evaluation', 14, nextY);

  const vesselRows = recommendation.rankedVessels.slice(0, 5).map(v => [
    v.name,
    v.dwt.toLocaleString(),
    v.builtYear.toString(),
    v.flag,
    `${v.vettingScore}/5.0`,
    `$${v.dailyHireRateUSD.toLocaleString()}/d`,
    v.laycanCompliance,
    `${v.compositeRankScore}/100`
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Vessel Name', 'DWT', 'Year', 'Flag', 'RightShip', 'Daily Hire', 'Laycan ETA', 'Score']],
    body: vesselRows,
    theme: 'grid',
    headStyles: { fillColor: navyColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  // --- Section 4: Sign-off Block ---
  nextY = doc.lastAutoTable.finalY + 14;
  if (nextY > 250) { doc.addPage(); nextY = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('PREPARED BY: Chartering Desk Analyst', 14, nextY);
  doc.text('APPROVED BY: Operations Manager / Head of Procurement', 110, nextY);
  
  doc.line(14, nextY + 12, 80, nextY + 12);
  doc.line(110, nextY + 12, 185, nextY + 12);
  
  doc.setFontSize(7.5);
  doc.text('Signature & Date Stamp', 14, nextY + 16);
  doc.text('Signature & Date Stamp', 110, nextY + 16);

  // --- Global Footer (Applies to all pages) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Confidential - Generated by Nautical AI Decision Support System (IEEE 29148 Compliance) | Page ${i} of ${totalPages}`,
      14,
      288
    );
  }

  doc.save(`Charter_Recommendation_${recommendation.id}.pdf`);
}

export function exportLandedCostExcel(sourcingData: any[], filename: string = 'Nautical_AI_Landed_Cost_Comparison.xlsx') {
  const ws = XLSX.utils.json_to_sheet(sourcingData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Landed Cost Analysis');
  XLSX.writeFile(wb, filename);
}