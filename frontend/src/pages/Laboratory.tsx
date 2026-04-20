import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Plus, Save, XCircle, DollarSign, Activity, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Laboratory() {
  const [tests, setTests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resultText, setResultText] = useState('');
  const [formData, setFormData] = useState({ 
    patient_name: '', test_name: '', referred_by: '', 
    category: 'PATHOLOGY', priority: 'ROUTINE', cost: '' 
  });

  useEffect(() => {
    fetchTests();
    fetchDoctors();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await api.get('/hospital/lab-tests/');
      setTests(res.data?.results || res.data || []);
    } catch (e) {
      toast.error('Failed to load lab tests');
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/hospital/doctors/');
      setDoctors(res.data?.results || res.data || []);
    } catch (e) { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hospital/lab-tests/', formData);
      toast.success('Test ordered successfully!');
      setIsModalOpen(false);
      setFormData({ patient_name: '', test_name: '', referred_by: '', category: 'PATHOLOGY', priority: 'ROUTINE', cost: '' });
      fetchTests();
    } catch (e) {
      toast.error('Error ordering test');
    }
  };

  const saveResult = async (id: number) => {
    try {
      await api.patch(`/hospital/lab-tests/${id}/`, { result: resultText, status: 'COMPLETED' });
      toast.success('Result saved successfully');
      setEditingId(null);
      fetchTests();
    } catch (e) {
      toast.error('Failed to save result');
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'STAT') return '#ef4444';
    if (priority === 'URGENT') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical color="#8b5cf6" /> Laboratory Diagnostics
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Advanced pathological & radiological tracking.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)}
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={20} /> Order New Test
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {tests.map((test) => (
            <motion.div key={test.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden',
                      boxShadow: test.priority === 'STAT' && test.status !== 'COMPLETED' ? '0 0 15px rgba(239,68,68,0.2)' : 'none' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: test.status === 'COMPLETED' ? '#10b981' : getPriorityColor(test.priority) }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{test.test_name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{test.category}</span>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: `${getPriorityColor(test.priority)}22`, color: getPriorityColor(test.priority), fontWeight: 700, borderRadius: '4px' }}>{test.priority}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient: <strong>{test.patient_name}</strong></div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Ref: Dr. {test.referred_by_name || 'Walk-in'}</div>
                  <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 600 }}>₹{test.cost}</div>
                </div>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: test.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: test.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
                  {test.status}
                </div>
              </div>

              {test.status === 'COMPLETED' ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <strong>Final Report:</strong><br/>
                  <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{test.result || 'No details provided.'}</span>
                </div>
              ) : (
                editingId === test.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea 
                      placeholder="Enter Clinical Results Here..."
                      value={resultText}
                      onChange={e => setResultText(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => saveResult(test.id)} style={{ flex: 1, padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}><Save size={16}/> Save Results</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setEditingId(test.id); setResultText(test.result || ''); }} style={{ width: '100%', padding: '0.75rem', border: '1px dashed #8b5cf6', background: 'transparent', color: '#8b5cf6', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}><Activity size={16}/> Proceed With Diagnosis</button>
                )
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FlaskConical color="#8b5cf6"/> Order Advanced Lab Test</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient Name</label>
                    <input required type="text" value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Referred By</label>
                    <select value={formData.referred_by} onChange={e => setFormData({...formData, referred_by: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}>
                      <option value="">Walk-in</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Test Name / Description</label>
                  <input required type="text" placeholder="e.g. CBC, MRI Brain" value={formData.test_name} onChange={e => setFormData({...formData, test_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Category</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}>
                      <option value="PATHOLOGY">Pathology (Blood/Urine)</option>
                      <option value="RADIOLOGY">Radiology (X-Ray/MRI/CT)</option>
                      <option value="CARDIOLOGY">Cardiology (ECG/Echo)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Priority <AlertCircle size={14} style={{ display: 'inline', color: '#ef4444' }} /></label>
                    <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}>
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent (4hr TAT)</option>
                      <option value="STAT">STAT (Immediate Emergency)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Billing Cost (₹)</label>
                  <input required type="number" min="0" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                </div>
                
                <button type="submit" style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Submit Advanced Request</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
