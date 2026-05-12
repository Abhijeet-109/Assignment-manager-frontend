// src/components/assignment/CreateAssignmentForm.jsx
import { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';
import { getSubjects } from '../../services/assignmentService';

const empty = { title: '', description: '', subject: '', dueDate: '', maxMarks: '', fileUrl: '', targetDivisions: ['All'] };

// Normalize initial data from API for form use
const normalizeInitial = (initial) => {
    if (!initial) return empty;
    return {
        title: initial.title || '',
        description: initial.description || '',
        // subject may be an object { _id, name } or a raw string ID
        subject: initial.subject?._id || initial.subject || '',
        // dueDate from API is ISO string → convert to YYYY-MM-DD for <input type="date">
        dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
        maxMarks: initial.maxMarks ?? initial.totalMarks ?? '',
        fileUrl: initial.fileUrl || '',
        targetDivisions: initial.targetDivisions?.length ? initial.targetDivisions : ['All'],
    };
};

const CreateAssignmentForm = ({ onSubmit, onCancel, initial = null }) => {
    const [form, setForm] = useState(() => normalizeInitial(initial));
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Re-normalize if initial changes (e.g. switching between edit targets)
    useEffect(() => {
        setForm(normalizeInitial(initial));
        setError('');
    }, [initial]);

    useEffect(() => {
        getSubjects()
            .then(d => setSubjects(d.data || d.subjects || []))
            .catch(() => setSubjects([]));
    }, []);

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const [fileObj, setFileObj] = useState(null);   // <------------------Real file handling -----------------

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileObj(file);               
            setForm(f => ({ ...f, fileUrl: file.name })); 
        }
    };

    const submit = async () => {
        if (!form.title || !form.dueDate || !form.maxMarks) {
            setError('Title, Due Date and Total Marks are required.');
            return;
        }
        if (!form.subject) {
            setError('Please select a subject.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await onSubmit(form, fileObj);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save assignment.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500';
    const labelCls = 'block text-sm font-medium mb-1';

    return (
        <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Title */}
            <div>
                <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Title *</label>
                <input name="title" value={form.title} onChange={handle}
                    className={inputCls}
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="e.g. Database Normalization" />
            </div>

            {/* Subject */}
            <div>
                <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Subject *</label>
                <select name="subject" value={form.subject} onChange={handle}
                    className={inputCls}
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="">— Select Subject —</option>
                    {subjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                </select>
            </div>

            {/* Division */}
            <div>
                <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Assign to Division *</label>
                <div className="flex gap-2 flex-wrap mt-1">
                    {['All', 'A', 'B', 'C'].map(div => {
                        const selected = form.targetDivisions?.includes(div);
                        return (
                            <button key={div} type="button"
                                onClick={() => {
                                    if (div === 'All') {
                                        setForm(f => ({ ...f, targetDivisions: ['All'] }));
                                    } else {
                                        setForm(f => {
                                            const curr = f.targetDivisions.filter(d => d !== 'All');
                                            const next = curr.includes(div) ? curr.filter(d => d !== div) : [...curr, div];
                                            return { ...f, targetDivisions: next.length ? next : ['All'] };
                                        });
                                    }
                                }}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selected ? 'bg-[#1E2A5E] text-white border-[#1E2A5E]' : 'border-gray-300 text-gray-600 hover:border-[#1E2A5E]'}`}>
                                {div === 'All' ? '🌐 All' : `Div ${div}`}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Description *</label>
                <textarea name="description" value={form.description} onChange={handle} rows={3}
                    className={inputCls}
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Assignment instructions..." />
            </div>

            {/* File URL */}
            <div>
                <label className={labelCls} style={{ color: 'var(--text-primary)' }}>
                    Assignment File
                    <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(URL or upload)</span>
                </label>
                <div className="flex gap-2">
                    <input name="fileUrl" value={form.fileUrl} onChange={handle}
                        className={inputCls}
                        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        placeholder="https://drive.google.com/..." />
                    <button type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 px-3 py-2 rounded-lg border text-sm hover:bg-gray-100 transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        title="Upload from device">
                        📎
                    </button>
                    <input ref={fileInputRef} type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileChange}
                        className="hidden" />
                </div>
            </div>

            {/* Due Date + Marks */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Due Date *</label>
                    <input name="dueDate" type="date" value={form.dueDate} onChange={handle}
                        className={inputCls}
                        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className={labelCls} style={{ color: 'var(--text-primary)' }}>Total Marks *</label>
                    <input name="maxMarks" type="number" value={form.maxMarks} onChange={handle}
                        className={inputCls}
                        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        placeholder="100" />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button variant="primary" onClick={submit} loading={loading}>
                    {initial ? 'Update' : 'Create'}
                </Button>
            </div>
        </div>
    );
};

export default CreateAssignmentForm;
