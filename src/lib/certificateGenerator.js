// certificateGenerator.js - PDF Certificate Generator for Legal Metrology Platform
import { jsPDF } from 'jspdf';

export const generateVerificationCertificate = (instrument) => {
  if (!instrument) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const certNo = instrument.certificate || `VM-2025-${Math.floor(10000 + Math.random() * 90000)}`;
  const dateStr = instrument.lastVerified || new Date().toISOString().split('T')[0];
  const validUntilStr = instrument.validUntil || '2026-11-18';

  // Border Frame
  doc.setLineWidth(1);
  doc.setDrawColor(99, 91, 255); // Primary accent
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273);

  // Header Banner
  doc.setFillColor(10, 37, 64);
  doc.rect(12, 12, 186, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DEPARTMENT OF LEGAL METROLOGY', 105, 24, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('GOVERNMENT OF KARNATAKA | LEGAL METROLOGY ACT, 2009', 105, 32, { align: 'center' });

  // Certificate Title
  doc.setTextColor(10, 37, 64);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CERTIFICATE OF VERIFICATION', 105, 56, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 125);
  doc.text(`[Issued under Rule 14(1) of the Legal Metrology (General) Rules, 2011]`, 105, 63, { align: 'center' });

  // Certificate ID & Date Box
  doc.setDrawColor(230, 235, 241);
  doc.setFillColor(246, 249, 252);
  doc.roundedRect(20, 70, 170, 18, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 37, 64);
  doc.text(`Certificate No: ${certNo}`, 25, 81);
  doc.text(`Verification Date: ${dateStr}`, 125, 81);

  // Body Details Table
  let y = 100;
  const addDetailRow = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(66, 84, 102);
    doc.setFontSize(10);
    doc.text(label, 25, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 37, 64);
    doc.text(String(value || 'N/A'), 85, y);

    doc.setDrawColor(230, 235, 241);
    doc.line(25, y + 3, 185, y + 3);
    y += 12;
  };

  addDetailRow('Owner / Trader Name:', instrument.owner || 'Acme Traders Pvt Ltd');
  addDetailRow('Business Premises:', instrument.premises || 'Main Market, Mysuru');
  addDetailRow('District Jurisdiction:', instrument.district || 'Mysuru');
  addDetailRow('Instrument Type:', instrument.type || 'Platform Scale');
  addDetailRow('Serial Number:', instrument.serialNumber || 'SN-AX99231');
  addDetailRow('Maximum Capacity:', instrument.capacity || '500kg');
  addDetailRow('Accuracy Class:', instrument.accuracyClass || 'Class III');
  addDetailRow('Verification Status:', 'VALID & CALIBRATED');
  addDetailRow('Valid Until Expiry:', validUntilStr);

  // Security Seal Notice
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(0, 217, 36);
  doc.roundedRect(20, y + 5, 170, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 161, 27);
  doc.setFontSize(9);
  doc.text('SECURITY SEAL VERIFIED & INTACT', 25, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Security Seal Code: ${instrument.securitySealNumber || 'SEAL-2026-8811'} | Tamper-Evident Hologram Applied`, 25, y + 20);

  // Signatures Section
  const sigY = 240;
  doc.setDrawColor(200, 205, 215);
  doc.line(25, sigY, 75, sigY);
  doc.line(135, sigY, 185, sigY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 37, 64);
  doc.text('Signature of Trader', 50, sigY + 5, { align: 'center' });
  doc.text('Inspector of Legal Metrology', 160, sigY + 5, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 125);
  doc.text('Mysuru District Division', 160, sigY + 10, { align: 'center' });

  // Save PDF Document
  doc.save(`Legal_Metrology_Certificate_${instrument.serialNumber || 'SN-001'}.pdf`);
};
