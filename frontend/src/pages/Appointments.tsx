import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, CalendarDays, Search, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ patient_name: '', contact_number: '', doctor: '', appointment_date: '', appointment_time: '' });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/hospital/appointments/');
      setAppointments(res.data?.results || res.data || []);
    } catch (e) {
      toast.error('Failed to load appointments');
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
      await api.post('/hospital/appointments/', formData);
      toast.success('Appointment booked successfully!');
      setIsModalOpen(false);
      setFormData({ patient_name: '', contact_number: '', doctor: '', appointment_date: '', appointment_time: '' });
      fetchAppointments();
    } catch (e) {
      toast.error('Error booking appointment');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/hospital/appointments/${id}/`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar color="#f43f5e" /> OPD Appointments
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Schedule and manage outpatient consultations</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)}
          style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={20} /> Book Appointment
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {appointments.map((apt) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: apt.status === 'COMPLETED' ? '#10b981' : apt.status === 'CANCELLED' ? '#ef4444' : '#f59e0b' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{apt.patient_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <User size={14} /> Dr. {apt.doctor_name || 'Unknown'}
                  </div>
                </div>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: apt.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : apt.status === 'CANCELLED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: apt.status === 'COMPLETED' ? '#10b981' : apt.status === 'CANCELLED' ? '#ef4444' : '#f59e0b' }}>
                  {apt.status}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '8px', flex: 1 }}>
                  <CalendarDays size={16} color="#f43f5e" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{apt.appointment_date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '8px', flex: 1 }}>
                  <Clock size={16} color="#0ea5e9" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{apt.appointment_time}</span>
                </div>
              </div>

              {apt.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => updateStatus(apt.id, 'COMPLETED')} style={{ flex: 1, padding: '0.5rem', border: '1px solid #10b981', background: 'transparent', color: '#10b981', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16}/> Complete</button>
                  <button onClick={() => updateStatus(apt.id, 'CANCELLED')} style={{ flex: 1, padding: '0.5rem', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}><XCircle size={16}/> Cancel</button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar color="#f43f5e"/> New Appointment</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient Name</label>
                  <input required type="text" value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact Number</label>
                  <input required type="text" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Assign Doctor</label>
                  <select required value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}>
                    <option value="">Select Doctor...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date</label>
                    <input required type="date" value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Time</label>
                    <input required type="time" value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                </div>
                <button type="submit" style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Confirm Appointment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
