import React, { useState } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import { useTax } from '../../context/TaxContext';
import { DocumentItem, DocumentType } from '../../types';

export const DocumentsView: React.FC = () => {
  const { documents, uploadDocument, deleteDocument, assessmentYear } = useTax();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('FORM_16');
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Files' },
    { id: 'FORM_16', label: 'Form 16 & Salary' },
    { id: 'PAN_CARD', label: 'Identity (PAN/Aadhaar)' },
    { id: 'INVESTMENT_PROOF', label: '80C & Investments' },
    { id: 'BANK_STATEMENT', label: 'Bank Statements' },
  ];

  const filteredDocs = documents.filter((d) => {
    const matchesCat = selectedCategory === 'ALL' || d.type === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    await uploadDocument({
      name: docName || 'Uploaded_Tax_Doc.pdf',
      type: docType,
      fileSize: '1.4 MB',
      assessmentYear,
    });

    setIsUploading(false);
    setIsUploadModalOpen(false);
    setDocName('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-[11px] font-bold text-teal-300">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Tax Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Document Cloud & Tax Records
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Securely store your Form 16, Bank Statements, 26AS, Capital Gains statements, and previous years' ITR-V acknowledgements.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-[#07383D] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {doc.status}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-sm truncate" title={doc.name}>
                {doc.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Type: {doc.type.replace(/_/g, ' ')} • {doc.fileSize}
              </p>
              <p className="text-[11px] text-slate-400">
                Uploaded: {doc.uploadDate} • AY {doc.assessmentYear}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={doc.fileUrl || '#'}
                download={doc.name}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              <button
                onClick={() => deleteDocument(doc.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900">Upload to Tax Vault</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  <option value="FORM_16">Form 16 (Part A & B)</option>
                  <option value="BANK_STATEMENT">Bank Statement</option>
                  <option value="INVESTMENT_PROOF">Investment Proof (ELSS / PPF / LIC)</option>
                  <option value="CAPITAL_GAINS_STATEMENT">Capital Gains Excel/PDF</option>
                  <option value="RENT_RECEIPT">Rent Receipts / Lease Agreement</option>
                  <option value="HOME_LOAN_CERTIFICATE">Home Loan Interest Certificate</option>
                  <option value="OTHER">Other Compliance Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Form_16_FY2024_25.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50">
                <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drag and drop file here</p>
                <p className="text-[10px] text-slate-400">PDF, Excel, JPG, PNG up to 25MB</p>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                {isUploading ? 'Encrypting & Uploading...' : 'Upload File'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
