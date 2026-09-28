import React, { useState, useEffect } from 'react';
import {
  BookOpen, Upload, Search, Trash2, FileText, CheckCircle2,
  Clock, AlertCircle, Layers, Eye, X, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Policy');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Chunks viewer modal
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [chunksModalOpen, setChunksModalOpen] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments(categoryFilter);
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [categoryFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);
      formData.append('version', 'v1.0');

      await api.uploadDocument(formData);
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      fetchDocs();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this company knowledge document and all its pgvector chunks?')) return;
    try {
      await api.deleteDocument(id);
      fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewChunks = async (doc: any) => {
    try {
      const detail = await api.getDocumentDetail(doc.id);
      setSelectedDoc(detail);
      setChunksModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              RAG Knowledge Base
            </span>
            <span className="text-xs text-slate-400 font-mono">PaddleOCR + pgvector Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Knowledge Base & Document Repository</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest and index company warranty policies, refund guidelines, troubleshooting manuals, and FAQs for grounded AI answering.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 transition-all shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Filter by Category:</span>
          {['', 'Policy', 'Billing', 'Troubleshooting', 'Shipping', 'Support', 'Manual'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat || 'All Documents'}
            </button>
          ))}
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Total: {documents.length} Indexed Documents
        </span>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-400">
                  {doc.category}
                </span>
                <Badge variant={doc.processing_status === 'INDEXED' ? 'success' : 'warning'}>
                  {doc.processing_status}
                </Badge>
              </div>

              <h3 className="font-semibold text-white text-sm line-clamp-1">{doc.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {doc.description || 'Enterprise procedural documentation for support agents.'}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">Version</span>
                  <span className="text-slate-300 font-semibold">{doc.version}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pages</span>
                  <span className="text-slate-300 font-semibold">{doc.page_count}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Chunks</span>
                  <span className="text-emerald-400 font-bold">{doc.chunk_count}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Type</span>
                  <span className="text-slate-300 uppercase">{doc.file_type}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => handleViewChunks(doc)}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Chunks</span>
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                Upload & Ingest Document
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Return Policy 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                >
                  <option value="Policy">Policy</option>
                  <option value="Billing">Billing</option>
                  <option value="Troubleshooting">Troubleshooting</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Support">Support</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief synopsis of document scope..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">File (PDF, TXT, DOCX, Image) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {uploading ? 'Processing OCR & Chunks...' : 'Ingest & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chunks Viewer Modal */}
      {chunksModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedDoc.title} — Semantic Chunks</h3>
                <p className="text-xs text-slate-400">Total: {selectedDoc.chunk_count} vector chunks generated</p>
              </div>
              <button
                onClick={() => setChunksModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
              {(selectedDoc.chunks || []).map((ch: any) => (
                <div key={ch.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-indigo-400">
                    <span>Chunk #{ch.chunk_index + 1}</span>
                    <span>Page {ch.page_number}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">{ch.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
