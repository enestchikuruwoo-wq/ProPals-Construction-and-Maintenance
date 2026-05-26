import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  Search, 
  Receipt, 
  ArrowLeft,
  Briefcase, 
  PlusCircle,
  Eye,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Send,
  Building,
  DollarSign
} from 'lucide-react';
import PropertyPalsLogo from './PropertyPalsLogo';

// Rates imported/replicated from Estimator
const STANDARD_SERVICES = [
  { key: 'tiling', label: 'Tiling Services', rate: 250, unit: 'm²' },
  { key: 'painting', label: 'Painting Services', rate: 85, unit: 'm²' },
  { key: 'plumbing', label: 'Plumbing Works', rate: 1200, unit: 'fixture' },
  { key: 'electrical', label: 'Electrical Works', rate: 450, unit: 'point' },
  { key: 'brickwork', label: 'Brickwork Services', rate: 650, unit: 'm²' },
  { key: 'plastering', label: 'Plastering Works', rate: 120, unit: 'm²' },
  { key: 'roofing', label: 'Roofing Services', rate: 850, unit: 'm²' },
  { key: 'ceiling', label: 'Ceiling Installation', rate: 180, unit: 'm²' }
];

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface BillingDocument {
  id?: string;
  type: 'quote' | 'invoice';
  number: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'accepted' | 'declined' | 'overdue';
  items: LineItem[];
  discount: number; // percentage
  tax: number; // percentage, default 15 for SA VAT
  bankDetails: string;
  notes: string;
  createdAt?: any;
}

export default function BillingView({ leads }: any) {
  const [documents, setDocuments] = useState<BillingDocument[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'quotes' | 'invoices'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [docType, setDocType] = useState<'quote' | 'invoice'>('quote');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<BillingDocument['status']>('draft');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'General contracting labor', quantity: 1, rate: 350 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(15); // standard 15% VAT
  const [bankDetails, setBankDetails] = useState('PropertyPals Construction (Pty) Ltd\nBank: FNB (First National Bank)\nAccount: 62908765432\nBranch Code: 250655\nReference: [Quote/Invoice Number]');
  const [notes, setNotes] = useState('Thank you for requesting custom service from PropertyPals. Work will begin upon formal signature and standard deposit approval.');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Firestore real-time snapshots
  useEffect(() => {
    const billingQuery = query(collection(db, 'billing'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(billingQuery, (snapshot) => {
      const billingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BillingDocument));
      setDocuments(billingData);
    }, (error) => {
      console.error("Firestore Billing subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Generate Document Number when type shifts
  useEffect(() => {
    if (editingId) return; // Don't auto-generate when editing an existing bill
    const prefix = docType === 'invoice' ? 'INV' : 'QT';
    const year = new Date().getFullYear();
    const count = documents.filter(d => d.type === docType).length + 1;
    const paddedCount = String(count).padStart(3, '0');
    setDocNumber(`${prefix}-${year}-${paddedCount}`);
  }, [docType, documents, isCreating, editingId]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: '', 
      quantity: 1, 
      rate: 0 
    }]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        if (field === 'quantity') {
          return { ...item, quantity: parseFloat(value) || 0 };
        }
        if (field === 'rate') {
          return { ...item, rate: parseFloat(value) || 0 };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleImportStandardRate = (service: typeof STANDARD_SERVICES[0]) => {
    setLineItems([...lineItems, {
      id: Math.random().toString(36).substr(2, 9),
      description: `${service.label} (per ${service.unit})`,
      quantity: 10, // default placeholder qty
      rate: service.rate
    }]);
  };

  const handleImportLead = (lead: any) => {
    setClientName(lead.name || '');
    setClientEmail(lead.email || '');
    setClientPhone(lead.phone || '');
    setClientAddress(lead.address || '');
    setNotes(`Project pricing customized for inquiry: "${lead.message || lead.service || ''}".`);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const totalAmount = taxableAmount + taxAmount;

  const handleSaveDocument = async () => {
    if (!clientName.trim() || !docNumber.trim()) {
      alert('Please fill at least Client Name and Document Number');
      return;
    }

    const docData: BillingDocument = {
      type: docType,
      number: docNumber,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      issueDate,
      dueDate,
      status,
      items: lineItems,
      discount,
      tax,
      bankDetails,
      notes,
    };

    try {
      if (editingId) {
        // Update existing document
        await updateDoc(doc(db, 'billing', editingId), {
          ...docData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'billing'), {
          ...docData,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save billing statement:", err);
      alert("Error saving document to database. Please check Firestore permissions.");
    }
  };

  const handleEditDocument = (doc: BillingDocument) => {
    setEditingId(doc.id || null);
    setDocType(doc.type);
    setDocNumber(doc.number);
    setClientName(doc.clientName);
    setClientEmail(doc.clientEmail);
    setClientPhone(doc.clientPhone);
    setClientAddress(doc.clientAddress);
    setIssueDate(doc.issueDate);
    setDueDate(doc.dueDate);
    setStatus(doc.status);
    setLineItems(doc.items);
    setDiscount(doc.discount);
    setTax(doc.tax);
    setBankDetails(doc.bankDetails);
    setNotes(doc.notes);
    setIsCreating(true);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'billing', id));
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setIsCreating(false);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setDiscount(0);
    setTax(15);
    setLineItems([{ id: '1', description: 'General contracting labor', quantity: 1, rate: 350 }]);
    setNotes('Thank you for requesting custom service from PropertyPals. Work will begin upon formal signature and standard deposit approval.');
  };

  // PDF Generation with Vector Branding using jsPDF
  const handleDownloadPDF = (docItem: BillingDocument) => {
    // Standard a4 canvas is roughly 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isInv = docItem.type === 'invoice';
    const primaryColor = [15, 23, 42];  // Slate 900
    const accentColor = [249, 115, 22];  // Orange 500

    // 1. Draw top brand bar (solid primary and accent details)
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 210, 15, 'F');
    pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.rect(0, 15, 210, 2, 'F');

    // 2. Add Brand Logo emblem (Vector Rounded Rect + Typography)
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(15, 25, 12, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text("PP", 19, 32);

    // Brand Title
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("PROPALS CONSTRUCTION", 30, 31);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text("AUTHORIZED PIETERMARITZBURG SPECIALISTS", 30, 35);

    // 3. Document Category Right Side Title
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(isInv ? "INVOICE" : "QUOTE", 195, 32, { align: 'right' });

    // Technical line separating header
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(15, 42, 195, 42);

    // 4. Contractor Details Box (Left) vs Document Info Metadata (Right)
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text("PREPARED BY:", 15, 49);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text([
      "PropertyPals Pietermaritzburg Contractors",
      "Email: admin@propals.co.za",
      "Tel: +27 33 555 1234",
      "Address: 12 Chief Albert Luthuli St,",
      "Pietermaritzburg, KwaZulu-Natal, 3201"
    ], 15, 53);

    // Metadata Right
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${isInv ? 'INVOICE' : 'QUOTE'} STATS:`, 130, 49);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text([
      `Number: ${docItem.number}`,
      `Date of Issue: ${docItem.issueDate}`,
      `Date Due: ${docItem.dueDate}`,
      `Status: ${docItem.status.toUpperCase()}`,
      `Region: South Africa (ZAR)`
    ], 130, 53);

    // 5. Bill To Section Frame
    pdf.setFillColor(248, 250, 252); // soft slate 50
    pdf.rect(15, 78, 180, 24, 'F');
    pdf.setDrawColor(241, 245, 249);
    pdf.rect(15, 78, 180, 24, 'S');

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text("CLIENT BILLING DETAILS:", 19, 83);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text([
      `Business/Client: ${docItem.clientName}`,
      `Email Address: ${docItem.clientEmail || 'N/A'}`,
      `Phone Number: ${docItem.clientPhone || 'N/A'}`,
      `Physical Address: ${docItem.clientAddress || 'Not Provided'}`
    ], 19, 87);

    // 6. Items Table Headers
    const tableTop = 110;
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(15, tableTop, 180, 7.5, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("Line Item & Service Description", 18, tableTop + 5);
    pdf.text("Quantity", 115, tableTop + 5, { align: 'right' });
    pdf.text("Unit Rate", 145, tableTop + 5, { align: 'right' });
    pdf.text("Total ZAR", 192, tableTop + 5, { align: 'right' });

    // Alternating rows loop
    let currentY = tableTop + 7.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);

    docItem.items.forEach((item, index) => {
      // Background shading for alternation
      if (index % 2 === 0) {
        pdf.setFillColor(255, 255, 255);
      } else {
        pdf.setFillColor(248, 250, 252);
      }
      pdf.rect(15, currentY, 180, 8, 'F');
      pdf.setDrawColor(241, 245, 249);
      pdf.line(15, currentY + 8, 195, currentY + 8);

      pdf.setTextColor(15, 23, 42);
      pdf.text(item.description, 18, currentY + 5.5);
      
      pdf.setTextColor(71, 85, 105);
      pdf.text(String(item.quantity), 115, currentY + 5.5, { align: 'right' });
      pdf.text(`R ${item.rate.toLocaleString()}`, 145, currentY + 5.5, { align: 'right' });
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      const itemTot = item.quantity * item.rate;
      pdf.text(`R ${itemTot.toLocaleString()}`, 192, currentY + 5.5, { align: 'right' });
      pdf.setFont('helvetica', 'normal');

      currentY += 8;
    });

    // 7. Summary Totals Aligned to Right
    const summarySub = docItem.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
    const summaryDisc = (summarySub * docItem.discount) / 100;
    const summaryTaxable = summarySub - summaryDisc;
    const summaryTax = (summaryTaxable * docItem.tax) / 100;
    const summaryGrand = summaryTaxable + summaryTax;

    currentY += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);

    // Subtotal
    pdf.text("Subtotal Labour & Materials:", 145, currentY, { align: 'right' });
    pdf.text(`R ${summarySub.toLocaleString()}`, 192, currentY, { align: 'right' });
    currentY += 5;

    // Discount
    if (docItem.discount > 0) {
      pdf.text(`Discount (${docItem.discount}%):`, 145, currentY, { align: 'right' });
      pdf.text(`- R ${summaryDisc.toLocaleString()}`, 192, currentY, { align: 'right' });
      currentY += 5;
    }

    // VAT
    pdf.text(`VAT (${docItem.tax}%):`, 145, currentY, { align: 'right' });
    pdf.text(`R ${summaryTax.toLocaleString()}`, 192, currentY, { align: 'right' });
    currentY += 6;

    // Boxed Total Cost
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(110, currentY, 85, 8.5, 'F');
    pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.rect(110, currentY, 1.5, 8.5, 'F'); // decorative orange marker
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Grand Total (inc VAT):", 115, currentY + 5.5);
    pdf.text(`R ${summaryGrand.toLocaleString()}`, 192, currentY + 5.5, { align: 'right' });

    // 8. Bank Details and Terms & Notes at Bottom
    let bottomY = currentY + 16;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, bottomY, 195, bottomY);
    bottomY += 6;

    // Notes Box Left
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text("IMPORTANT CORRESPONDENCE & TERMS:", 15, bottomY);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    const splitNotes = pdf.splitTextToSize(docItem.notes, 85);
    pdf.text(splitNotes, 15, bottomY + 5);

    // Bank Details Box Right
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text("OFFICIAL PAYMENT GATEWAY INFO:", 110, bottomY);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(7.5);
    const splitBank = pdf.splitTextToSize(docItem.bankDetails, 80);
    pdf.text(splitBank, 110, bottomY + 5);

    // 9. Centered Vector Footnote and page border
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text("This is an authorized corporate quote or tax invoice prepared digitally by PropertyPals South Africa.", 105, 280, { align: 'center' });
    pdf.text("Thank you for choosing PropertyPals – Pietermaritzburg's Elite Builders.", 105, 283, { align: 'center' });

    // Save and Trigger prompt
    pdf.save(`${docItem.type}_${docItem.number}.pdf`);
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const typeMatch = 
      activeTab === 'all' || 
      (activeTab === 'quotes' && doc.type === 'quote') ||
      (activeTab === 'invoices' && doc.type === 'invoice');

    const searchStr = `${doc.clientName} ${doc.number} ${doc.clientEmail}`.toLowerCase();
    const searchMatch = searchQuery.trim() === '' || searchStr.includes(searchQuery.toLowerCase());

    return typeMatch && searchMatch;
  });

  // Calculate Metrics
  const invoiceEarnings = documents
    .filter(d => d.type === 'invoice' && d.status === 'paid')
    .reduce((sum, d) => {
      const sub = d.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
      const disc = (sub * d.discount) / 100;
      const taxAmt = ((sub - disc) * d.tax) / 100;
      return sum + (sub - disc + taxAmt);
    }, 0);

  const outstandingInvoices = documents
    .filter(d => d.type === 'invoice' && d.status !== 'paid')
    .reduce((sum, d) => {
      const sub = d.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
      const disc = (sub * d.discount) / 100;
      const taxAmt = ((sub - disc) * d.tax) / 100;
      return sum + (sub - disc + taxAmt);
    }, 0);

  const activeQuotesVal = documents
    .filter(d => d.type === 'quote' && d.status === 'draft')
    .reduce((sum, d) => {
      const sub = d.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
      const disc = (sub * d.discount) / 100;
      const taxAmt = ((sub - disc) * d.tax) / 100;
      return sum + (sub - disc + taxAmt);
    }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-primary-900 tracking-tight mb-2 leading-none">Billing Console</h1>
          <p className="text-slate-500 font-medium">Create expert Quotes & Invoices, export high-precision PDFs, and monitor client contracts.</p>
        </div>
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-accent-orange hover:bg-orange-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-accent-orange/20 flex items-center gap-2"
          >
            <Plus size={14} className="stroke-[3]" /> Generate Statement
          </button>
        ) : (
          <button
            onClick={resetForm}
            className="bg-white border border-slate-100 hover:bg-slate-50 text-slate-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
          >
            <ArrowLeft size={14} className="stroke-[3]" /> Back to Ledger
          </button>
        )}
      </div>

      {!isCreating ? (
        <>
          {/* Billing Overview Stats Panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-primary-900">
                <DollarSign size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Paid (ZAR)</p>
              <p className="text-4xl font-display font-extrabold text-green-600 mt-2">R {invoiceEarnings.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1">From settled invoices</span>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-primary-900">
                <Clock size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outstanding (ZAR)</p>
              <p className="text-4xl font-display font-extrabold text-red-500 mt-2">R {outstandingInvoices.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1">Pending contractor payment</span>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-primary-900">
                <FileText size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Quotes Value</p>
              <p className="text-4xl font-display font-extrabold text-accent-blue mt-2">R {activeQuotesVal.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1">Work statements awaiting approval</span>
            </div>

            <div className="bg-primary-900 text-white p-8 rounded-2xl shadow-xl shadow-primary-900/10 flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">Professional VAT Setup</p>
                <p className="text-sm font-bold opacity-80 mt-1">15% South African Revenue custom standard calculation enabled by default.</p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-white/50">
                <CheckCircle2 size={12} className="text-green-500" /> Vector PDFs Supported
              </div>
            </div>
          </div>

          {/* Documents Lists toolbar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Type Category Filter */}
              <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'all' 
                      ? 'bg-white text-primary-900 shadow-sm font-black border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  All Ledger
                </button>
                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'quotes' 
                      ? 'bg-white text-primary-900 shadow-sm font-black border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Quotes Only
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'invoices' 
                      ? 'bg-white text-primary-900 shadow-sm font-black border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Invoices Only
                </button>
              </div>

              {/* Central Searchbar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Search statements by client or doc number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statement Info</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Org</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Dates</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount ZAR</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.map((docItem) => {
                  const docSub = docItem.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
                  const docDisc = (docSub * docItem.discount) / 100;
                  const docTax = ((docSub - docDisc) * docItem.tax) / 100;
                  const docGrand = docSub - docDisc + docTax;

                  return (
                    <tr key={docItem.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-primary-900 uppercase tracking-tight text-sm flex items-center gap-2">
                          <Receipt size={14} className="text-slate-400" />
                          {docItem.number}
                        </p>
                        <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1.5 ${
                          docItem.type === 'invoice' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {docItem.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-primary-900 uppercase tracking-tight text-sm">{docItem.clientName}</p>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">{docItem.clientEmail || 'No Email'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-500 uppercase">Issued: {docItem.issueDate}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Due: {docItem.dueDate}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-primary-900 text-sm tracking-tight">R {docGrand.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">Includes {docItem.tax}% VAT</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full ${
                          docItem.status === 'paid' || docItem.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : docItem.status === 'overdue' || docItem.status === 'declined'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {docItem.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDownloadPDF(docItem)}
                            className="bg-slate-50 hover:bg-slate-100 text-primary-900 p-2.5 rounded-lg border border-slate-100 transition-all flex items-center justify-center"
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => handleEditDocument(docItem)}
                            className="bg-slate-50 hover:bg-slate-100 text-primary-900 p-2.5 rounded-lg border border-slate-100 transition-all"
                            title="Edit Document"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(docItem.id!)}
                            className="p-2.5 text-slate-300 hover:text-red-500 transition-all"
                            title="Delete Document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredDocs.length === 0 && (
              <div className="py-24 text-center bg-white">
                <Receipt size={48} className="mx-auto text-slate-200 mb-6" />
                <h4 className="text-lg font-black text-primary-900 uppercase tracking-tight">No Statements Found</h4>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Create custom invoices and quotes to handle your clients' balances.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Form Creation View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Editor Side */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-8">
              <div className="border-b border-slate-50 pb-6 flex justify-between items-center">
                <h3 className="text-md font-black uppercase tracking-tight text-primary-900">
                  {editingId ? 'Edit statement parameters' : 'New Billing parameters'}
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setDocType('quote'); setStatus('draft'); }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      docType === 'quote' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDocType('invoice'); setStatus('draft'); }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      docType === 'invoice' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Invoice
                  </button>
                </div>
              </div>

              {/* Quick Customer Import from active leads */}
              {leads.length > 0 && (
                <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100/60">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-900 mb-3 flex items-center gap-1.5">
                    <User size={13} className="text-accent-orange" />
                    Quick Customer Import
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed mb-4">
                    Instantly load client credentials from any form inquiry to save typing time:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
                    {leads.slice(0, 10).map((l: any) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleImportLead(l)}
                        className="bg-white hover:bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-primary-900 uppercase tracking-tight transition-all"
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">DOCUMENT NUMBER</label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-accent-orange outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">DOCUMENT STATUS</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-xs font-black text-primary-900 uppercase tracking-tight outline-none focus:ring-2 focus:ring-accent-orange cursor-pointer"
                  >
                    {docType === 'invoice' ? (
                      <>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </>
                    ) : (
                      <>
                        <option value="draft">Draft (Awaiting Proposal)</option>
                        <option value="sent">Proposal Sent</option>
                        <option value="accepted">Accepted (Formalized)</option>
                        <option value="declined">Declined</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">CLIENT / ORGANIZATION NAME</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe & Partners"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">CLIENT EMAIL</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="email"
                      placeholder="e.g. jdoe@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">CLIENT PHONE</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      placeholder="e.g. +27 76 543 2109"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">CLIENT RESIDENCE ADDRESS</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      placeholder="e.g. 52 Mayor's Walk, PMB"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">DATE OF ISSUE</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">DUE DATE</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all"
                  />
                </div>
              </div>

              {/* Standard service rate Quick Add */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-900 mb-3 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-primary-900" />
                  Quick Load Standard Services
                </h4>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed mb-4 font-bold">
                  Click on any contractor rate to instantly insert a pre-valued service item:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {STANDARD_SERVICES.map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleImportStandardRate(s)}
                      className="bg-white hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-lg text-left transition-all text-[9px] font-black text-primary-900 uppercase tracking-tight flex flex-col justify-between"
                    >
                      <span className="truncate">{s.label}</span>
                      <span className="text-accent-orange mt-1">R {s.rate}/{s.unit}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-black text-primary-900 uppercase tracking-widest">Client Service details</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-accent-orange hover:text-orange-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 transition-all"
                  >
                    <PlusCircle size={14} /> Add item
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, idx) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <div className="flex-grow w-full">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Description / task</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="e.g. Master Bedroom High Quality Tiling"
                          className="w-full bg-white border border-slate-200/60 px-3 py-2.5 rounded-lg text-xs font-bold focus:ring-1 focus:ring-accent-orange outline-none"
                        />
                      </div>

                      <div className="w-24 shrink-0">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Qty</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                          className="w-full bg-white border border-slate-200/60 px-3 py-2.5 rounded-lg text-xs font-bold focus:ring-1 focus:ring-accent-orange outline-none text-right"
                        />
                      </div>

                      <div className="w-32 shrink-0">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Rate (R)</label>
                        <input
                          type="number"
                          required
                          value={item.rate}
                          onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                          className="w-full bg-white border border-slate-200/60 px-3 py-2.5 rounded-lg text-xs font-bold focus:ring-1 focus:ring-accent-orange outline-none text-right"
                        />
                      </div>

                      <div className="w-28 shrink-0 text-right pr-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Sum ZAR</p>
                        <p className="text-xs font-black text-primary-900 py-2.5">
                          R {(item.quantity * item.rate).toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="p-2.5 text-slate-300 hover:text-red-500 disabled:opacity-20 transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjustments: Discount & Tax */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200/60 px-4 py-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-accent-orange outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">VAT calculation (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={tax}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200/60 px-4 py-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-accent-orange outline-none"
                  />
                </div>
              </div>

              {/* Payment Info & Terms editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">BANK PAYMENT TERMS / INSTRUCTIONS</label>
                  <textarea
                    rows={4}
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-accent-orange outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-primary-900 uppercase tracking-widest block mb-2">TERMS & NOTES</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-accent-orange outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit & Generate Trigger Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  className="flex-1 bg-primary-900 hover:bg-slate-800 text-white py-4 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={14} className="stroke-[3]" /> Save statement to data
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF({
                    type: docType,
                    number: docNumber,
                    clientName,
                    clientEmail,
                    clientPhone,
                    clientAddress,
                    issueDate,
                    dueDate,
                    status,
                    items: lineItems,
                    discount,
                    tax,
                    bankDetails,
                    notes
                  })}
                  className="flex-1 bg-accent-orange hover:bg-orange-600 text-white py-4 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-orange/10"
                >
                  <Download size={14} className="stroke-[3]" /> Export vector PDF
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Dynamic Layout Sheet Preview Side */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="sticky top-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-900 flex items-center gap-1.5 ml-2">
                <Eye size={13} className="text-accent-blue" strokeWidth={3} />
                Real-time printable sheet preview
              </h4>
              
              <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-slate-100 max-w-[100vw] overflow-x-auto">
                <div className="min-w-[600px] space-y-10">
                  {/* Branding Header Area */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PropertyPalsLogo size={32} showText={false} />
                        <h4 className="text-sm font-black text-primary-900 tracking-tight uppercase">PropertyPals Building Solutions</h4>
                      </div>
                      <p className="text-[8px] text-slate-400 font-black tracking-widest uppercase">Elite KwaZulu-Natal Specialists</p>
                    </div>

                    <div className="text-right">
                      <h2 className="text-3xl font-display font-bold text-primary-900 tracking-tight uppercase">
                        {docType === 'invoice' ? 'INVOICE' : 'QUOTE'}
                      </h2>
                      <p className="text-xs font-black text-accent-orange tracking-tight mt-1">NO. {docNumber || 'NOT GENERATED'}</p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Contractor metadata vs Document metadata */}
                  <div className="grid grid-cols-2 gap-6 text-[10px]">
                    <div className="space-y-1 text-slate-500 font-bold leading-normal">
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary-900 mb-1">Company Details</p>
                       <p className="text-primary-900">PropertyPals Contractors PMB</p>
                      <p>Email: <a href="mailto:admin@propals.co.za" className="text-accent-blue hover:underline break-all">admin@propals.co.za</a></p>
                      <p>Tel: +27 33 555 1234</p>
                      <p>12 Albert Luthuli St, PMB, 3201</p>
                    </div>

                    <div className="space-y-1 text-slate-500 font-bold leading-normal">
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary-900 mb-1">Statement Stats</p>
                      <p>Issue Date: <span className="text-primary-900">{issueDate}</span></p>
                      <p>Due Date: <span className="text-primary-900">{dueDate}</span></p>
                      <p>Status: <span className="text-primary-900 lowercase italic">{status}</span></p>
                      <p>Local Currency: <span className="text-primary-900">ZAR (R)</span></p>
                    </div>
                  </div>

                  {/* Client Details Card */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-[10px]">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-900 mb-2">Recipient Client</p>
                    <div className="space-y-1.5 text-slate-500 font-bold">
                      <p className="text-xs text-primary-900 font-black">{clientName || 'Unspecified Client Company Name'}</p>
                      {clientEmail && <p>Email: <a href={`mailto:${clientEmail}`} className="text-accent-blue hover:underline break-all">{clientEmail}</a></p>}
                      {clientPhone && <p>Phone: {clientPhone}</p>}
                      {clientAddress && <p>Physical Location: {clientAddress}</p>}
                    </div>
                  </div>

                  {/* Line Items Sheet Table */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest p-3 rounded-lg">
                      <div className="col-span-6 pl-1">Description / Task Detail</div>
                      <div className="col-span-2 text-right">Quantity</div>
                      <div className="col-span-2 text-right">Rate</div>
                      <div className="col-span-2 text-right pr-1">Total (R)</div>
                    </div>

                    <div className="divide-y divide-slate-100 text-[10px]">
                      {lineItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 py-3 font-semibold text-slate-600">
                          <div className="col-span-6 pl-1 font-bold text-primary-900">{item.description || 'Custom contractor labor'}</div>
                          <div className="col-span-2 text-right text-slate-400 font-black">{item.quantity}</div>
                          <div className="col-span-2 text-right">R {item.rate.toLocaleString()}</div>
                          <div className="col-span-2 text-right pr-1 font-black text-primary-900">
                            R {(item.quantity * item.rate).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Adjustments Summary bottom alignment */}
                  <div className="flex justify-between items-start text-[10px]">
                    <div className="w-1/2 pr-6">
                      {notes && (
                        <div className="bg-slate-50 border border-slate-100/60 p-4 rounded-xl text-[9px] text-slate-400 font-bold italic leading-relaxed">
                          "{notes}"
                        </div>
                      )}
                    </div>

                    <div className="w-1/2 space-y-2 text-slate-500 font-bold text-right pl-6">
                      <div className="flex justify-between">
                        <span>Materials & Labor:</span>
                        <span className="text-primary-900">R {subtotal.toLocaleString()}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-indigo-700">
                          <span>Discount ({discount}%):</span>
                          <span>- R {discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Added VAT ({tax}%):</span>
                        <span className="text-primary-900">R {taxAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center text-primary-900 font-black text-base pt-1">
                        <span className="text-[10px] uppercase font-black tracking-wider">Total balance:</span>
                        <span className="text-xl font-display font-bold tracking-tight text-accent-orange">
                          R {totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footnote instruction */}
                  <div className="border-t border-slate-100 pt-6 text-[8px] font-bold text-slate-400 flex justify-between">
                    <span>Invoice generated automatically by PropertyPals South Africa</span>
                    <span>VAT REG: 4290-7762-9599</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
