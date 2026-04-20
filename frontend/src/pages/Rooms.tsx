import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Activity, DoorOpen, DoorClosed, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  floor: number;
  bed_count: number;
  is_occupied: boolean;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchRooms = async () => {
    try {
      const res = await api.get('/hospital/rooms/');
      setRooms(res.data?.results || res.data || []);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a,b) => a-b);
  
  const filteredRooms = rooms.filter(room => {
    const matchFloor = selectedFloor === 'all' || room.floor === selectedFloor;
    const matchType = filterType === 'all' || room.room_type === filterType;
    return matchFloor && matchType;
  });

  const getGradient = (type: string, is_occupied: boolean) => {
    if (type === 'EMERGENCY') return is_occupied ? 'linear-gradient(135deg, #fecaca, #f87171)' : 'linear-gradient(135deg, #fee2e2, #fca5a5)';
    if (type === 'GENERAL_WARD') return is_occupied ? 'linear-gradient(135deg, #fef08a, #facc15)' : 'linear-gradient(135deg, #fef9c3, #fde047)';
    // NORMAL
    return is_occupied ? 'linear-gradient(135deg, #bfdbfe, #60a5fa)' : 'linear-gradient(135deg, #eff6ff, #93c5fd)';
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.5rem', borderRadius: '12px', color: 'white' }}
          >
            <Bed size={28} />
          </motion.div>
          <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(90deg, #10b981, #059669)' }}>Room Management</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>View live occupancy of {rooms.length} registered rooms across the hospital.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <select className="input" value={selectedFloor} onChange={e => setSelectedFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">All Floors</option>
          {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
        </select>
        <select className="input" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="NORMAL">Normal</option>
          <option value="GENERAL_WARD">General Ward</option>
          <option value="EMERGENCY">Emergency Room</option>
        </select>
      </div>

      {loading ? <div>Loading rooms...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          <AnimatePresence>
            {filteredRooms.map(room => (
              <motion.div
                key={room.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: getGradient(room.room_type, room.is_occupied),
                  padding: '1.25rem', borderRadius: '16px', position: 'relative', overflow: 'hidden',
                  boxShadow: room.is_occupied ? '0 10px 15px -3px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                  border: room.is_occupied ? '2px solid rgba(0,0,0,0.1)' : '2px dashed rgba(255,255,255,0.5)',
                  color: room.is_occupied ? 'white' : '#1f2937',
                  minHeight: '120px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{room.room_number}</span>
                  {room.room_type === 'EMERGENCY' && <Activity size={18} color={room.is_occupied ? 'white' : '#ef4444'} />}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, marginTop: '1rem' }}>
                    {room.room_type.replace('_', ' ')} • Floor {room.floor}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {room.is_occupied ? <DoorClosed size={16} /> : <DoorOpen size={16} />}
                    {room.is_occupied ? 'Occupied' : 'Available'}
                  </div>
                </div>
                {room.is_occupied && <AlertCircle size={40} style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.1 }} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
