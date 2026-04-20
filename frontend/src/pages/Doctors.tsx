import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Plus, Search, Building2, Phone, Mail, Clock, CreditCard, X, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';

interface Department {
  id: number;
  name: string;
  description: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: number;
  department_name: string;
  contact_number: string;
  email: string;
  consultation_fee: string;
  opd_timings: string;
  is_active: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | 'all'>('all');
  
  // Modal states
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Doctor>>({ is_active: true });
  const [deptFormData, setDeptFormData] = useState<Partial<Department>>({});

  const fetchData = async () => {
    try {
      const [docsRes, deptsRes] = await Promise.all([
        api.get('/hospital/doctors/'),
        api.get('/hospital/departments/')
      ]);
      setDoctors(docsRes.data?.results || docsRes.data || []);
      setDepartments(deptsRes.data?.results || deptsRes.data || []);
    } catch (error) {
      console.error('Error fetching hospital data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/hospital/doctors/${formData.id}/`, formData);
      } else {
        await api.post('/hospital/doctors/', formData);
      }
      setShowDoctorModal(false);
      setFormData({ is_active: true });
      fetchData();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hospital/departments/', deptFormData);
      setShowDeptModal(false);
      setDeptFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      try {
        await api.delete(`/hospital/doctors/${id}/`);
        fetchData();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || doc.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  if (loading) return <div className="flex items-center justify-center h-full">Loading doctors...</div>;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', padding: '0.5rem', borderRadius: '12px', color: 'white' }}
            >
              <Stethoscope size={28} />
            </motion.div>
            <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(90deg, #0ea5e9, #2563eb)' }}>Hospital Doctors</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage medical staff, departments, and OPD schedules</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowDeptModal(true)} style={{ gap: '0.5rem' }}>
            <Building2 size={18} /> New Department
          </button>
          <button className="btn btn-primary" onClick={() => { setFormData({ is_active: true }); setShowDoctorModal(true); }} style={{ gap: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>
            <Plus size={18} /> Add Doctor
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.75rem' }}
          />
        </div>
        <select 
          className="input" 
          style={{ width: '250px' }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Doctors Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}
      >
        <AnimatePresence>
          {filteredDoctors.map((doc) => (
            <motion.div
              key={doc.id}
              variants={item}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.2)' }}
              className="card"
              style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', borderTop: '4px solid #0ea5e9' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: 50, height: 50, borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0284c7', fontWeight: 800, fontSize: '1.25rem'
                  }}>
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Dr. {doc.name}</h3>
                    <p style={{ color: '#0284c7', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{doc.specialization}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setFormData(doc); setShowDoctorModal(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteDoctor(doc.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Building2 size={16} color="var(--text-muted)" /> 
                  <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {doc.department_name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} color="var(--text-muted)" /> {doc.opd_timings || 'Not Specified'}
                </div>
                {doc.contact_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Phone size={16} color="var(--text-muted)" /> {doc.contact_number}
                  </div>
                )}
                {doc.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Mail size={16} color="var(--text-muted)" /> {doc.email}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <CreditCard size={16} color="#10b981" /> 
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{doc.consultation_fee}</span> <span style={{ fontSize: '0.75rem' }}>Consultation</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showDoctorModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowDoctorModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card" style={{ position: 'relative', width: '100%', maxWidth: '600px', padding: '2rem', zIndex: 101 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formData.id ? 'Edit Doctor' : 'Onboard Doctor'}</h2>
                <button onClick={() => setShowDoctorModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSaveDoctor} style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Full Name</label>
                    <input required type="text" className="input" placeholder="e.g. Rahul Sharma" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Specialization</label>
                    <input required type="text" className="input" placeholder="e.g. Cardiologist" value={formData.specialization || ''} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Department</label>
                    <select required className="input" value={formData.department || ''} onChange={e => setFormData({...formData, department: Number(e.target.value)})}>
                      <option value="">Select Department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Consultation Fee (₹)</label>
                    <input required type="number" className="input" value={formData.consultation_fee || ''} onChange={e => setFormData({...formData, consultation_fee: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Phone Number</label>
                    <input type="text" className="input" value={formData.contact_number || ''} onChange={e => setFormData({...formData, contact_number: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" className="input" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="label">OPD Timings</label>
                  <input type="text" className="input" placeholder="e.g. Mon-Fri 10AM - 2PM" value={formData.opd_timings || ''} onChange={e => setFormData({...formData, opd_timings: e.target.value})} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>Save Doctor Info</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Department Modal */}
      <AnimatePresence>
        {showDeptModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowDeptModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card" style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '2rem', zIndex: 101 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create Department</h2>
                <button onClick={() => setShowDeptModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveDept} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label className="label">Department Name</label>
                  <input required type="text" className="input" placeholder="e.g. Neurology" value={deptFormData.name || ''} onChange={e => setDeptFormData({...deptFormData, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={deptFormData.description || ''} onChange={e => setDeptFormData({...deptFormData, description: e.target.value})} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowDeptModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
