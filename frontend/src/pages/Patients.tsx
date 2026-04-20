import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Stethoscope, Bed, Phone, Calendar, ArrowRight, X, User, IndianRupee, Printer, Download, Banknote, Smartphone, CreditCard } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientBills, setPatientBills] = useState<any[]>([]);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  // Multi-step Registration State
  const [regStep, setRegStep] = useState(1);
  const [formData, setFormData] = useState<any>({ gender: 'M' });
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const fetchData = async () => {
    try {
      const [pRes, dRes, rRes, depRes] = await Promise.all([
        api.get('/hospital/patients/'),
        api.get('/hospital/doctors/'),
        api.get('/hospital/rooms/?unoccupied=true'),
        api.get('/hospital/departments/')
      ]);
      setPatients(pRes.data?.results || pRes.data || []);
      setDoctors(dRes.data?.results || dRes.data || []);
      setRooms(rRes.data?.results || rRes.data || []);
      setDepartments(depRes.data?.results || depRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!formData.name || !formData.contact_number || !formData.age) return toast.error('Fill required fields');
      setRegStep(2);
    } else if (regStep === 2) {
      setRegStep(3);
    } else if (regStep === 3) {
      handleCompleteRegistration();
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      const res = await api.post('/hospital/patients/', formData);
      const newPatient = res.data;
      if (formData.assigned_room) {
        await api.patch(`/hospital/rooms/${formData.assigned_room}/`, { is_occupied: true });
      }
      toast.success('Registration & Payment Successful!');
      setShowModal(false);
      setFormData({ gender: 'M' });
      setRegStep(1);
      setSelectedPatient(newPatient);
      setShowSlipModal(true); // Open printing slip!
      fetchData();
    } catch { toast.error('Error completing registration'); }
  };

  const fetchPatientHistory = async (patient: any) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
    try {
      const res = await api.get(`/billing/invoices/?patient_id=${patient.id}`);
      setPatientBills(res.data?.results || res.data || []);
    } catch { toast.error('Failed to load history'); }
  };

  const printHTML = () => {
    window.print();
  };

  const downloadPDF = async (patientNameOverride?: string) => {
    const input = document.getElementById('print-slip');
    if (!input) return;
    
    const oldTransform = input.style.transform;
    input.style.transform = 'none'; // reset scale for clear canvas

    try {
      const toastId = toast.loading('Generating HD PDF...');
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = patientNameOverride || selectedPatient?.name || 'Slip';
      pdf.save(`Prescription_${fileName.replace(/ /g, '_')}.pdf`);
      
      toast.dismiss(toastId);
      toast.success('PDF Saved Successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      input.style.transform = oldTransform;
    }
  };

  const triggerSlipAction = (p: any, action: 'VIEW' | 'PRINT' | 'PDF') => {
    setSelectedPatient(p);
    setShowSlipModal(true);
    if (action === 'PRINT') {
      setTimeout(printHTML, 300);
    } else if (action === 'PDF') {
      setTimeout(() => downloadPDF(p.name), 300);
    }
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Filtering Logic
  const filteredDoctors = doctors.filter(d => !selectedDept || d.department.toString() === selectedDept);
  const filteredRooms = rooms.filter(r => !selectedFloor || r.floor.toString() === selectedFloor);
  
  const selectedDoctor = doctors.find(d => d.id.toString() === formData.assigned_doctor?.toString());
  const fee = selectedDoctor ? Number(selectedDoctor.consultation_fee) : 0;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Hide standard UI when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-slip, #print-slip * { visibility: visible; }
          #print-slip { position: absolute; left: 0; top: 0; width: 100%; height: 100vh; padding: 0 !important; margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; background: white !important;}
        }
      `}</style>
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.5rem', borderRadius: '12px', color: 'white' }}
            >
              <UserPlus size={28} />
            </motion.div>
            <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(90deg, #f59e0b, #d97706)' }}>Patient Registry</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Register patients, assign rooms, pay consultancy fees.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ gender: 'M' }); setRegStep(1); setShowModal(true); }} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <UserPlus size={18} /> Register Patient
        </button>
      </motion.div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" className="input" placeholder="Search registered patients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.5rem', width: '100%' }} />
      </div>

      {loading ? <div>Loading patients...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          <AnimatePresence>
            {filteredPatients.map(p => (
              <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', borderTop: '4px solid #f59e0b' }} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontWeight: 800 }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{p.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{p.age} Yrs • {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                    <button className="btn btn-ghost" onClick={() => triggerSlipAction(p, 'VIEW')} style={{ padding: '0.4rem', fontSize: '0.7rem', color: '#6366f1' }}>
                       👁️ View Slip
                    </button>
                    <button className="btn btn-ghost" onClick={() => triggerSlipAction(p, 'PDF')} style={{ padding: '0.4rem', fontSize: '0.7rem', color: '#10b981' }}>
                      <Download size={12} /> PDF
                    </button>
                    <button className="btn btn-ghost" onClick={() => triggerSlipAction(p, 'PRINT')} style={{ padding: '0.4rem', fontSize: '0.7rem', color: '#3b82f6' }}>
                      <Printer size={12} /> Print
                    </button>
                    <button className="btn btn-ghost" onClick={() => fetchPatientHistory(p)} style={{ padding: '0.4rem', fontSize: '0.7rem', color: '#f59e0b' }}>
                      History <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}><Phone size={16} color="var(--text-muted)" /> {p.contact_number}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}><Calendar size={16} color="var(--text-muted)" /> Admitted {new Date(p.admission_date).toLocaleDateString()}</div>
                  {p.ailment && <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '8px', marginTop: '0.25rem' }}>Diag: {p.ailment}</div>}
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: p.assigned_doctor_name ? '#0ea5e9' : 'var(--text-muted)' }}>
                      <Stethoscope size={14} /> {p.assigned_doctor_name || 'No Doctor'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: p.assigned_room_number ? '#10b981' : 'var(--text-muted)' }}>
                      <Bed size={14} /> {p.assigned_room_number ? `Room ${p.assigned_room_number}` : 'Unassigned'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modern Multi-Step Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: '600px', padding: '2rem', zIndex: 101, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Advance Registration</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {[1,2,3].map(step => (
                  <div key={step} style={{ flex: 1, height: '6px', borderRadius: '3px', background: regStep >= step ? '#f59e0b' : 'var(--border)' }} />
                ))}
              </div>

              <form onSubmit={handleNextStep} style={{ display: 'grid', gap: '1.25rem' }}>
                
                {regStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Step 1: Patient Identity</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="label">Full Name</label><input required autoFocus className="input" placeholder="Patient Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                      <div><label className="label">Contact Number</label><input required className="input" placeholder="Phone" value={formData.contact_number || ''} onChange={e => setFormData({...formData, contact_number: e.target.value})} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div><label className="label">Age</label><input required type="number" className="input" placeholder="Age" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} /></div>
                      <div>
                        <label className="label">Gender</label>
                        <select required className="input select" value={formData.gender || 'M'} onChange={e => setFormData({...formData, gender: e.target.value})}>
                          <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <label className="label">Ailment / Diagnosis</label>
                      <input className="input" placeholder="e.g. Viral Fever" value={formData.ailment || ''} onChange={e => setFormData({...formData, ailment: e.target.value})} />
                    </div>
                  </motion.div>
                )}

                {regStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Step 2: Department & Room</h3>
                    
                    {/* Nested Doctor Selection */}
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Stethoscope size={16}/> Select Doctor</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="label" style={{ fontSize: '0.75rem' }}>1. Filter by Department</label>
                          <select className="input select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                            <option value="">-- All Departments --</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label" style={{ fontSize: '0.75rem' }}>2. Available Doctor</label>
                          <select required className="input select" value={formData.assigned_doctor || ''} onChange={e => setFormData({...formData, assigned_doctor: Number(e.target.value) || undefined})}>
                            <option value="">-- Select Doctor --</option>
                            {filteredDoctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} (Fee: ₹{d.consultation_fee})</option>)}
                          </select>
                        </div>
                      </div>
                      {selectedDoctor && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                          Consultation Fee: ₹{selectedDoctor.consultation_fee}
                        </div>
                      )}
                    </div>

                    {/* Nested Room Selection */}
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Bed size={16}/> Select Room</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="label" style={{ fontSize: '0.75rem' }}>1. Filter by Floor</label>
                          <select className="input select" value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)}>
                            <option value="">-- All Floors --</option>
                            {[...Array(10)].map((_,i) => <option key={i+1} value={i+1}>Floor {i+1}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label" style={{ fontSize: '0.75rem' }}>2. Available Room</label>
                          <select className="input select" value={formData.assigned_room || ''} onChange={e => setFormData({...formData, assigned_room: Number(e.target.value) || undefined})}>
                            <option value="">-- Optional: Select Room --</option>
                            {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.room_number} ({r.room_type})</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {regStep === 3 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '50%', marginBottom: '1rem' }}>
                      <IndianRupee size={48} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Complete Registration Payment</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Doctor Consultancy Fee: <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{fee}</span></p>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1.5rem 0' }}>
                      {[
                        { id: 'CASH', icon: Banknote, label: 'Cash' },
                        { id: 'UPI', icon: Smartphone, label: 'UPI' },
                        { id: 'CARD', icon: CreditCard, label: 'Card' }
                      ].map(method => (
                         <button type="button" key={method.id} onClick={() => setPaymentMethod(method.id)}
                            style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
                                     border: paymentMethod === method.id ? '2px solid #f59e0b' : '2px solid var(--border)',
                                     background: paymentMethod === method.id ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                     color: paymentMethod === method.id ? '#f59e0b' : 'var(--text-muted)',
                                     borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            <method.icon size={18} /> {method.label}
                         </button>
                      ))}
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px' }}>
                          {/* Use standard generated URI format for UPI payments directly rendering QR */}
                          <QRCodeSVG value={`upi://pay?pa=nitinhospital@upi&pn=Nitin%20Hospital&am=${fee}&cu=INR`} size={150} level={"H"} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Scan with any UPI App</span>
                      </div>
                    )}
                  </motion.div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {regStep > 1 && <button type="button" className="btn btn-secondary" onClick={() => setRegStep(regStep - 1)}>Back</button>}
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    {regStep === 1 ? 'Select Doctor & Room' : regStep === 2 ? `Pay ₹${fee}` : 'Confirm Payment & Print Slip'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* A4 Printable Prescription Slip */}
      <AnimatePresence>
        {showSlipModal && selectedPatient && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.85)' }}>
             {/* FIXED TOOLBAR */}
             <div style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem', justifyContent: 'center', alignItems: 'center', zIndex: 201, background: '#111827', color: 'white', borderBottom: '1px solid #374151' }}>
                <span style={{ marginRight: 'auto', fontWeight: 800, fontSize: '1.25rem' }}>Print Preview</span>
                <button className="btn btn-secondary" onClick={() => {
                    const slip = document.getElementById('print-slip');
                    if (slip) slip.style.transform = slip.style.transform === 'scale(1)' ? 'scale(0.6)' : 'scale(1)';
                }} style={{ background: '#374151', color: 'white', border: 'none' }}>🔍 Toggle Zoom</button>
                <button className="btn btn-primary" onClick={printHTML} style={{ background: '#3b82f6', color: 'white', border: 'none' }}><Printer size={18}/> Print</button>
                <button className="btn btn-primary" onClick={downloadPDF} style={{ background: '#10b981', color: 'white', border: 'none' }}><Download size={18}/> Save PDF</button>
                <button className="btn btn-secondary" onClick={() => setShowSlipModal(false)} style={{ background: '#ef4444', color: 'white', border: 'none' }}><X size={18}/> Close</button>
             </div>
             
             {/* SCROLLABLE CANVAS */}
             <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem' }} onClick={() => setShowSlipModal(false)}>
               {/* THE MATCHING A4 SLIP WRAPPER */}
               <div onClick={(e) => e.stopPropagation()} style={{ transformOrigin: 'top center', transition: 'transform 0.3s', transform: 'scale(0.6)', paddingBottom: '3rem' }} id="print-slip">
                 <div ref={slipRef} style={{ background: 'white', width: '210mm', height: '297mm', padding: '20mm', borderRadius: '12px', color: 'black', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' }}>
                    <div style={{ textAlign: 'center', borderBottom: '3px solid #111', paddingBottom: '10mm', marginBottom: '10mm' }}>
                       <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>Nitin Hospital</h1>
                       <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#444' }}>Specialty Care & Medical Center • 24/7 Emergency</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15mm', fontSize: '16px' }}>
                       <div style={{ width: '45%' }}>
                          <h3 style={{ textTransform: 'uppercase', color: '#555', fontSize: '12px', letterSpacing: '1px', marginBottom: '4px' }}>Consulting Doctor</h3>
                          <p style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Dr. {selectedPatient.assigned_doctor_name || 'N/A'}</p>
                       </div>
                       <div style={{ width: '45%', textAlign: 'right' }}>
                          <h3 style={{ textTransform: 'uppercase', color: '#555', fontSize: '12px', letterSpacing: '1px', marginBottom: '4px' }}>Patient Details</h3>
                          <p style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{selectedPatient.name}</p>
                          <p style={{ margin: '4px 0 0', color: '#444' }}>Age: {selectedPatient.age} | Sex: {selectedPatient.gender} | ID: {selectedPatient.id}</p>
                          <p style={{ margin: '4px 0 0', color: '#444' }}>Date: {new Date(selectedPatient.admission_date).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#222', marginBottom: '10mm' }}>Rx</div>

                    {/* Blank ruled space for doctor */}
                    <div style={{ flex: 1, minHeight: '120mm', borderLeft: '2px solid #ddd', paddingLeft: '10mm' }}>
                    </div>

                    <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '10mm', fontSize: '12px', color: '#666' }}>
                       <div>Contact: +91 99999 99999</div>
                       <div>Valid for 7 days</div>
                       <div>Signature: ______________________</div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryModal && selectedPatient && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowHistoryModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '2rem', zIndex: 101, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedPatient.name}'s History</h2>
                <button onClick={() => setShowHistoryModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>
              {patientBills.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No bills found for this patient.</p> : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {patientBills.map(bill => (
                    <div key={bill.id} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.25rem' }}>
                        <span>{bill.invoice_number}</span>
                        <span style={{ color: '#10b981' }}>₹{Number(bill.total).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(bill.created_at).toLocaleString()} • {bill.payment_method}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
