import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ambulance, Plus, Navigation, Phone, Car, MapPin, XCircle, CheckCircle, Wind, Zap, Beaker, Clock } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AmbulanceTransport() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<number | null>(null);

  const [vehicleData, setVehicleData] = useState({ 
    vehicle_number: '', driver_name: '', contact_number: '', email: '', 
    vehicle_type: 'BLS', has_o2: false, has_defibrillator: false, has_ventilator: false 
  });
  const [dispatchData, setDispatchData] = useState({ 
    patient_name: '', pickup_location: '', drop_location: '', estimated_eta: '' 
  });

  useEffect(() => {
    fetchVehicles();
    fetchDispatches();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/hospital/ambulance-vehicles/');
      setVehicles(res.data?.results || res.data || []);
    } catch (e) { toast.error('Failed to load vehicles'); }
  };

  const fetchDispatches = async () => {
    try {
      const res = await api.get('/hospital/ambulance-dispatch/');
      setDispatches(res.data?.results || res.data || []);
    } catch (e) { toast.error('Failed to load dispatches'); }
  };

  const submitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hospital/ambulance-vehicles/', vehicleData);
      toast.success('Advanced Ambulance Registered');
      setIsVehicleModalOpen(false);
      setVehicleData({ vehicle_number: '', driver_name: '', contact_number: '', email: '', vehicle_type: 'BLS', has_o2: false, has_defibrillator: false, has_ventilator: false });
      fetchVehicles();
    } catch (e) { toast.error('Error registering vehicle'); }
  };

  const submitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmbulance) return toast.error('Select an ambulance first');
    try {
      await api.post('/hospital/ambulance-dispatch/', { ...dispatchData, ambulance: selectedAmbulance });
      await api.patch(`/hospital/ambulance-vehicles/${selectedAmbulance}/`, { status: 'DISPATCHED' });
      toast.success('Ambulance Dispatched! En route.');
      setIsDispatchModalOpen(false);
      setDispatchData({ patient_name: '', pickup_location: '', drop_location: '', estimated_eta: '' });
      setSelectedAmbulance(null);
      fetchVehicles();
      fetchDispatches();
    } catch (e) { toast.error('Dispatch failed'); }
  };

  const completeDispatch = async (dispatchId: number, ambulanceId: number) => {
    try {
      await api.patch(`/hospital/ambulance-dispatch/${dispatchId}/`, { is_completed: true });
      await api.patch(`/hospital/ambulance-vehicles/${ambulanceId}/`, { status: 'AVAILABLE' });
      toast.success('Mission Complete. Vehicle returned to base.');
      fetchVehicles();
      fetchDispatches();
    } catch (e) { toast.error('Failed to mark complete'); }
  };

  const getTypeColor = (type: string) => {
    if (type === 'ALS') return '#f43f5e'; // Red for Advanced ICU
    if (type === 'BLS') return '#0ea5e9'; // Blue for Basic
    return '#10b981'; // Green for Patient Transport
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ambulance color="#f59e0b" /> Emergency Transport
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Advanced Fleet Command & Hardware Tracker</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsVehicleModalOpen(true)}
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
          <Car size={20} /> Register New Vehicle
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left Side: Fleet List */}
        <div style={{ flex: 1, minWidth: '350px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Car size={18} color="#0ea5e9"/> Advanced Fleet Roster</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {vehicles.map(v => (
                <motion.div key={v.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: getTypeColor(v.vehicle_type) }} />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{v.vehicle_number}</h3>
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: `${getTypeColor(v.vehicle_type)}22`, color: getTypeColor(v.vehicle_type), borderRadius: '4px', fontWeight: 800 }}>{v.vehicle_type}</span>
                    </div>
                    
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Driver: {v.driver_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}><Phone size={12}/> {v.contact_number}</div>
                    
                    {/* Hardware Payload Indicators */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: v.has_o2 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: v.has_o2 ? '#10b981' : 'var(--text-muted)' }}><Beaker size={12}/> O2</div>
                      <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: v.has_defibrillator ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', color: v.has_defibrillator ? '#ef4444' : 'var(--text-muted)' }}><Zap size={12}/> Defib</div>
                      <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: v.has_ventilator ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.05)', color: v.has_ventilator ? '#0ea5e9' : 'var(--text-muted)' }}><Wind size={12}/> Vent</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: v.status === 'AVAILABLE' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: v.status === 'AVAILABLE' ? '#10b981' : '#f59e0b' }}>{v.status}</span>
                    {v.status === 'AVAILABLE' && (
                      <button onClick={() => { setSelectedAmbulance(v.id); setIsDispatchModalOpen(true); }} style={{ padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}><Navigation size={14}/> Dispatch</button>
                    )}
                  </div>
                </motion.div>
              ))}
              {vehicles.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>No vehicles registered yet.</div>}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Active Dispatches */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Navigation size={18} color="#f59e0b"/> Live Dispatch Command</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {dispatches.filter(d => !d.is_completed).map(d => (
                <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', padding: '1.5rem', borderRadius: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ padding: '0.25rem 0.5rem', background: '#f59e0b', color: 'white', fontSize: '0.75rem', fontWeight: 800, borderRadius: '4px', display: 'inline-block' }}>EN ROUTE: {d.ambulance_number}</div>
                      {d.estimated_eta && (
                        <div style={{ padding: '0.25rem 0.5rem', border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> ETA: {d.estimated_eta}</div>
                      )}
                    </div>
                  </div>
                  <h3 style={{ margin: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Target: {d.patient_name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#0ea5e9', fontSize: '0.9rem' }}><MapPin size={16} style={{ marginTop: '2px' }}/> <div><strong>Pickup:</strong> {d.pickup_location}</div></div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#10b981', fontSize: '0.9rem' }}><MapPin size={16} style={{ marginTop: '2px' }}/> <div><strong>Drop:</strong> {d.drop_location}</div></div>
                  </div>
                  <button onClick={() => completeDispatch(d.id, d.ambulance)} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><CheckCircle size={18} color="#10b981"/> Mark Mission Complete</button>
                </motion.div>
              ))}
              {dispatches.filter(d => !d.is_completed).length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>No active dispatches.</div>}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isVehicleModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVehicleModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <button onClick={() => setIsVehicleModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus color="#0ea5e9"/> Register Advanced Vehicle</h2>
              <form onSubmit={submitVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Vehicle Type Class</label>
                    <select required value={vehicleData.vehicle_type} onChange={e => setVehicleData({...vehicleData, vehicle_type: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}>
                      <option value="BLS">Basic Life Support (BLS)</option>
                      <option value="ALS">Advanced Life Support / ICU (ALS)</option>
                      <option value="PTS">Patient Transport Van (PTS)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Vehicle Number / Plates</label>
                    <input required type="text" placeholder="e.g. UP32-AMB-1002" value={vehicleData.vehicle_number} onChange={e => setVehicleData({...vehicleData, vehicle_number: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Driver Full Name</label>
                    <input required type="text" placeholder="Driver Name" value={vehicleData.driver_name} onChange={e => setVehicleData({...vehicleData, driver_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Contact Number</label>
                    <input required type="text" placeholder="Mobile" value={vehicleData.contact_number} onChange={e => setVehicleData({...vehicleData, contact_number: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Hardware Loadout Tracker</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, minWidth: '150px' }}>
                      <input type="checkbox" checked={vehicleData.has_o2} onChange={e => setVehicleData({...vehicleData, has_o2: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                      <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Beaker size={16} color="#10b981"/> Oxygen Cyl.</span>
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, minWidth: '150px' }}>
                      <input type="checkbox" checked={vehicleData.has_defibrillator} onChange={e => setVehicleData({...vehicleData, has_defibrillator: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#ef4444' }} />
                      <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} color="#ef4444"/> Defibrillator</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, minWidth: '150px' }}>
                      <input type="checkbox" checked={vehicleData.has_ventilator} onChange={e => setVehicleData({...vehicleData, has_ventilator: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }} />
                      <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wind size={16} color="#0ea5e9"/> Mobile Vent.</span>
                    </label>

                  </div>
                </div>

                <button type="submit" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' }}>Lock In Regsitry Payload</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {isDispatchModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDispatchModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <button onClick={() => setIsDispatchModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Navigation color="#f59e0b"/> Transmit Mission</h2>
              <form onSubmit={submitDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Target Patient / Incident Info</label>
                    <input required type="text" placeholder="Patient Info" value={dispatchData.patient_name} onChange={e => setDispatchData({...dispatchData, patient_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Est. Arrival (ETA)</label>
                    <input type="text" placeholder="e.g. 15 Mins" value={dispatchData.estimated_eta} onChange={e => setDispatchData({...dispatchData, estimated_eta: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pickup Coordinates</label>
                  <textarea required placeholder="Exact Location" value={dispatchData.pickup_location} onChange={e => setDispatchData({...dispatchData, pickup_location: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', minHeight: '60px', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Drop-off Base</label>
                  <textarea required placeholder="Destination Facility" value={dispatchData.drop_location} onChange={e => setDispatchData({...dispatchData, drop_location: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', minHeight: '60px', resize: 'vertical' }} />
                </div>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' }}>Confirm & Dispatch Code 3</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
