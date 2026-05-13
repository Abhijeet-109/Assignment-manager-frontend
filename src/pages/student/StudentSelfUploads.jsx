import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

// ─── constants ────────────────────────────────────────────────────────────────
const FILE_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'pptx', 'csv', 'png', 'jpg', 'jpeg', 'zip', 'txt', 'other'];

const TYPE_COLOR = {
    pdf: { bg: '#FEE2E2', text: '#EF4444' },
    doc: { bg: '#DBEAFE', text: '#3B82F6' },
    docx: { bg: '#DBEAFE', text: '#3B82F6' },
    xls: { bg: '#D1FAE5', text: '#059669' },
    xlsx: { bg: '#D1FAE5', text: '#059669' },
    csv: { bg: '#D1FAE5', text: '#059669' },
    pptx: { bg: '#FFE4E6', text: '#F43F5E' },
    png: { bg: '#E0E7FF', text: '#6366F1' },
    jpg: { bg: '#E0E7FF', text: '#6366F1' },
    jpeg: { bg: '#E0E7FF', text: '#6366F1' },
    zip: { bg: '#FEF3C7', text: '#F59E0B' },
    txt: { bg: '#F3F4F6', text: '#6B7280' },
};
const typeColor = (ft) => TYPE_COLOR[ft] || { bg: '#F3F4F6', text: '#6B7280' };

const EMPTY_LINK = { title: '', description: '', fileUrl: '', fileName: '', fileType: 'pdf', tags: '' };
const EMPTY_FILE = { title: '', description: '', tags: '' };

// ─── component ────────────────────────────────────────────────────────────────
const StudentSelfUploads = () => {
    const [uploads, setUploads] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState('link');   // 'link' | 'file'
    const [linkForm, setLinkForm] = useState(EMPTY_LINK);
    const [fileForm, setFileForm] = useState(EMPTY_FILE);
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    // Filter / sort state
    const [sortBy, setSortBy] = useState('date');   // 'date' | 'type' | 'name'
    const [filterType, setFilterType] = useState('all');
    const [searchQ, setSearchQ] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => { fetchUploads(); }, []);

    // Re-filter whenever uploads or filter state changes
    useEffect(() => {
        let list = [...uploads];

        // search
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            list = list.filter(u =>
                u.title.toLowerCase().includes(q) ||
                u.description?.toLowerCase().includes(q) ||
                u.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        // type filter
        if (filterType !== 'all') {
            if (filterType === 'image') {
                list = list.filter(u => ['png', 'jpg', 'jpeg'].includes(u.file?.fileType));
            } else if (filterType === 'doc') {
                list = list.filter(u => ['doc', 'docx', 'pdf', 'txt'].includes(u.file?.fileType));
            } else if (filterType === 'sheet') {
                list = list.filter(u => ['xls', 'xlsx', 'csv'].includes(u.file?.fileType));
            } else {
                list = list.filter(u => u.file?.fileType === filterType);
            }
        }

        // sort
        list.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'type') return (a.file?.fileType || '').localeCompare(b.file?.fileType || '');
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            return 0;
        });

        setFiltered(list);
    }, [uploads, searchQ, filterType, sortBy]);

    const fetchUploads = () => {
        setLoading(true);
        api.get('/self-uploads')
            .then(res => setUploads(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const openModal = () => {
        setLinkForm(EMPTY_LINK);
        setFileForm(EMPTY_FILE);
        setSelectedFile(null);
        setError('');
        setMode('link');
        setShowModal(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFileForm(p => ({ ...p, title: p.title || nameWithoutExt }));
    };

    const handleLinkSubmit = async () => {
        if (!linkForm.title.trim()) return setError('Title is required.');
        if (!linkForm.fileUrl.trim()) return setError('File URL is required.');
        if (!linkForm.fileName.trim()) return setError('File name is required.');
        setSubmitting(true); setError('');
        try {
            await api.post('/self-uploads', {
                title: linkForm.title.trim(),
                description: linkForm.description.trim(),
                file: { fileUrl: linkForm.fileUrl.trim(), fileName: linkForm.fileName.trim(), fileType: linkForm.fileType },
                tags: linkForm.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            setShowModal(false);
            fetchUploads();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save.');
        } finally { setSubmitting(false); }
    };

    const handleFileSubmit = async () => {
        if (!selectedFile) return setError('Please select a file.');
        if (!fileForm.title.trim()) return setError('Title is required.');
        setSubmitting(true); setError('');
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('title', fileForm.title.trim());
        fd.append('description', fileForm.description.trim());
        fd.append('tags', fileForm.tags);
        try {
            await api.post('/self-uploads/file', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setShowModal(false);
            fetchUploads();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/self-uploads/${id}`);
            setUploads(prev => prev.filter(u => u._id !== id));
        } catch (err) { console.error(err); }
        finally { setDeleteId(null); }
    };

    if (loading) return <Loading />;

    // ── shared input style ──
    const inp = {
        className: 'w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1E2A5E]',
        style: { backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' },
    };

    // ── tab pill style ──
    const tabPill = (m) => ({
        className: `flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === m ? 'bg-[#1E2A5E] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`,
    });

    // ── shared label ──
    const Label = ({ children }) => (
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
            {children}
        </label>
    );

    return (
        <div className="space-y-4">

            {/* ── Header card ── */}
            <div className="rounded-xl p-4 border-l-4 border-[#1E2A5E] flex items-center justify-between shadow-sm"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                <div>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>📁 My Self Uploads</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Personal file tracker — local uploads &amp; Drive links
                    </p>
                </div>
                <button onClick={openModal}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1E2A5E] hover:opacity-90 transition">
                    + Add Upload
                </button>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: uploads.length, color: 'var(--stat-blue-text)', bg: 'var(--stat-blue-bg)' },
                    { label: 'PDFs', value: uploads.filter(u => u.file?.fileType === 'pdf').length, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Images', value: uploads.filter(u => ['png', 'jpg', 'jpeg'].includes(u.file?.fileType)).length, color: '#6366F1', bg: '#E0E7FF' },
                    { label: 'Others', value: uploads.filter(u => !['pdf', 'png', 'jpg', 'jpeg'].includes(u.file?.fileType)).length, color: '#F59E0B', bg: '#FEF3C7' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter / Sort bar ── */}
            <div className="rounded-xl p-3 flex flex-wrap gap-3 items-center shadow-sm"
                style={{ backgroundColor: 'var(--bg-card)' }}>

                {/* Search */}
                <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="🔍 Search title, tag..."
                    className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />

                {/* Type filter */}
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Docs</option>
                    <option value="sheet">Sheets</option>
                    <option value="image">Images</option>
                    <option value="zip">ZIP</option>
                </select>

                {/* Sort */}
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="date">Sort: Latest</option>
                    <option value="name">Sort: Name A–Z</option>
                    <option value="type">Sort: Type</option>
                </select>

                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {filtered.length} of {uploads.length} files
                </span>
            </div>

            {/* ── Cards grid ── */}
            {filtered.length === 0 ? (
                <div className="rounded-xl p-12 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <p className="text-3xl mb-2">📂</p>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>No uploads found</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {uploads.length === 0 ? 'Click "+ Add Upload" to save your first file' : 'Try adjusting your filters'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(upload => {
                        const { bg, text } = typeColor(upload.file?.fileType);
                        return (
                            <div key={upload._id}
                                className="rounded-xl p-4 shadow-sm flex flex-col gap-2 border hover:shadow-md transition-shadow"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                                {/* Top row: badge + delete */}
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                                        style={{ backgroundColor: bg, color: text }}>
                                        {upload.file?.fileType || '?'}
                                    </span>
                                    <button
                                        onClick={() => setDeleteId(upload._id)}
                                        className="text-xs px-2 py-1 rounded font-medium transition-colors"
                                        style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FECACA'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}>
                                        🗑 Delete
                                    </button>
                                </div>

                                {/* Title */}
                                <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                                    {upload.title}
                                </p>

                                {/* Description */}
                                {upload.description && (
                                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                        {upload.description}
                                    </p>
                                )}

                                {/* Tags */}
                                {upload.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {upload.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-full text-xs"
                                                style={{ backgroundColor: 'var(--stat-blue-bg)', color: 'var(--stat-blue-text)' }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer: link + date */}
                                <div className="mt-auto pt-2 flex items-center justify-between border-t"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <a href={upload.file?.fileUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-xs underline truncate max-w-[70%]"
                                        style={{ color: 'var(--stat-blue-text)' }}>
                                        🔗 {upload.file?.fileName}
                                    </a>
                                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                                        {new Date(upload.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Add Upload Modal ── */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="📁 Add New Upload">
                <div className="space-y-3">

                    {/* Mode tabs — fixed equal-width, no hover-white bug */}
                    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-page)' }}>
                        <button {...tabPill('link')} onClick={() => { setMode('link'); setError(''); }}>
                            🔗 Drive Link
                        </button>
                        <button {...tabPill('file')} onClick={() => { setMode('file'); setError(''); }}>
                            📎 Local File
                        </button>
                    </div>

                    {/* ── DRIVE LINK FORM ── */}
                    {mode === 'link' && (
                        <>
                            <div>
                                <Label>Title <span className="text-red-500">*</span></Label>
                                <input {...inp} value={linkForm.title} placeholder="e.g. OS Notes Chapter 3"
                                    onChange={e => setLinkForm(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <textarea {...inp} value={linkForm.description} rows={2} placeholder="Optional note"
                                    className={inp.className + ' resize-none'}
                                    onChange={e => setLinkForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div>
                                <Label>File URL <span className="text-red-500">*</span></Label>
                                <input {...inp} value={linkForm.fileUrl} placeholder="https://drive.google.com/..."
                                    onChange={e => setLinkForm(p => ({ ...p, fileUrl: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>File Name <span className="text-red-500">*</span></Label>
                                    <input {...inp} value={linkForm.fileName} placeholder="notes.pdf"
                                        onChange={e => setLinkForm(p => ({ ...p, fileName: e.target.value }))} />
                                </div>
                                <div>
                                    <Label>File Type</Label>
                                    <select {...inp} value={linkForm.fileType}
                                        onChange={e => setLinkForm(p => ({ ...p, fileType: e.target.value }))}>
                                        {FILE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <Label>Tags <span className="font-normal">(comma-separated)</span></Label>
                                <input {...inp} value={linkForm.tags} placeholder="e.g. react, notes, exam"
                                    onChange={e => setLinkForm(p => ({ ...p, tags: e.target.value }))} />
                            </div>
                        </>
                    )}

                    {/* ── LOCAL FILE FORM ── */}
                    {mode === 'file' && (
                        <>
                            <div
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
                                style={{ borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#1E2A5E'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                onClick={() => fileInputRef.current?.click()}>
                                {selectedFile ? (
                                    <>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            📎 {selectedFile.name}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {(selectedFile.size / 1024).toFixed(1)} KB — click to change
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl mb-1">📂</p>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Click to select file</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP — max 15MB
                                        </p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.pptx,.png,.jpg,.jpeg,.zip,.txt"
                                    className="hidden" onChange={handleFileSelect} />
                            </div>
                            <div>
                                <Label>Title <span className="text-red-500">*</span></Label>
                                <input {...inp} value={fileForm.title} placeholder="Auto-filled from file name"
                                    onChange={e => setFileForm(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <textarea {...inp} value={fileForm.description} rows={2} placeholder="Optional note"
                                    className={inp.className + ' resize-none'}
                                    onChange={e => setFileForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Tags <span className="font-normal">(comma-separated)</span></Label>
                                <input {...inp} value={fileForm.tags} placeholder="e.g. react, notes, exam"
                                    onChange={e => setFileForm(p => ({ ...p, tags: e.target.value }))} />
                            </div>
                        </>
                    )}

                    {/* Error */}
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-1">
                        <button onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm rounded-lg border font-medium"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            Cancel
                        </button>
                        <button
                            onClick={mode === 'link' ? handleLinkSubmit : handleFileSubmit}
                            disabled={submitting}
                            className="px-4 py-2 text-sm rounded-lg font-semibold text-white bg-[#1E2A5E] hover:opacity-90 transition disabled:opacity-50">
                            {submitting ? 'Saving...' : 'Save Upload'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Delete confirm ── */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="⚠️ Confirm Delete">
                <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                    Are you sure? This cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeleteId(null)}
                        className="px-4 py-2 text-sm rounded-lg border font-medium"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        Cancel
                    </button>
                    <button onClick={() => handleDelete(deleteId)}
                        className="px-4 py-2 text-sm rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition">
                        Yes, Delete
                    </button>
                </div>
            </Modal>

        </div>
    );
};

export default StudentSelfUploads;