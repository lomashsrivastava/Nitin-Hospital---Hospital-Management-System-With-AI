/**
 * Dashboard - Premium with animated stats, live charts, alerts, and micro-interactions
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee, ShoppingBag, Package, AlertTriangle,
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight,
  Zap, Activity, Pill, FileSpreadsheet
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../api/axios';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [inventoryStats, setInventoryStats] = useState<any>({});
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billStats, invStats, daily, top] = await Promise.all([
          api.get('/billing/invoices/dashboard_stats/'),
          api.get('/inventory/medicines/stats/'),
          api.get('/reports/daily-sales/?days=14'),
          api.get('/reports/top-products/?days=30&limit=5'),
        ]);
        setStats(billStats.data);
        setInventoryStats(invStats.data);
        setDailySales((daily.data.data || []).map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          sales: Number(d.total_sales) || 0,
          invoices: d.invoice_count || 0,
        })));
        setTopProducts(top.data.data || []);
      } catch { /* use defaults */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Today's Sales", value: `₹${(stats.today_sales || 0).toLocaleString('en-IN')}`,
      sub: `${stats.today_count || 0} invoices`, icon: IndianRupee,
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', change: '+12%', up: true, emoji: '💰',
    },
    {
      label: 'Monthly Sales', value: `₹${(stats.month_sales || 0).toLocaleString('en-IN')}`,
      sub: `${stats.month_count || 0} invoices`, icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', change: '+8%', up: true, emoji: '📊',
    },
    {
      label: 'Total Medicines', value: inventoryStats.total_medicines || 0,
      sub: `${inventoryStats.out_of_stock || 0} out of stock`, icon: Package,
      gradient: 'linear-gradient(135deg, #10b981, #059669)', change: '', up: false, emoji: '💊',
    },
    {
      label: 'Alerts', value: (inventoryStats.low_stock_count || 0) + (inventoryStats.expiring_count || 0),
      sub: `${inventoryStats.low_stock_count || 0} low, ${inventoryStats.expiring_count || 0} expiring`,
      icon: AlertTriangle, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      change: '', up: false, emoji: '⚠️',
    },
  ];

  const quickActions = [
    { label: 'New Bill', icon: Zap, color: '#6366f1', path: '/billing', emoji: '🧾' },
    { label: 'Add Medicine', icon: Pill, color: '#10b981', path: '/inventory', emoji: '💊' },
    { label: 'New Purchase', icon: ShoppingBag, color: '#06b6d4', path: '/purchases', emoji: '📦' },
    { label: 'Export Data', icon: FileSpreadsheet, color: '#f59e0b', path: '/excel', emoji: '📥' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          <span className="text-gradient">Dashboard</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Welcome back! Here's your store overview 📈
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.label}
              variants={item as any}
              whileHover={{ scale: 1.05, y: -5, boxShadow: `0 15px 30px -5px ${a.color}80` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(a.path)}
              style={{
                flex: 1, padding: '1rem', display: 'flex', alignItems: 'center',
                gap: '0.75rem', cursor: 'pointer', border: 'none',
                background: `linear-gradient(135deg, ${a.color}15, ${a.color}05)`,
                borderLeft: `4px solid ${a.color}`,
                borderRadius: 'var(--radius)', color: 'var(--text-primary)',
                fontSize: '0.875rem', fontWeight: 700, textAlign: 'left',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <motion.div 
                animate={{ rotate: i % 2 === 0 ? [0, 10, -10, 0] : [0, -10, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, ${a.color}, ${a.color}aa)`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 15px ${a.color}60`
                }}
              >
                <Icon size={20} color="white" />
              </motion.div>
              {a.label}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
              >
                <span style={{ filter: 'grayscale(0%)', fontSize: '1.25rem' }}>{a.emoji}</span>
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}
      >
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={item as any}
              whileHover={{ scale: 1.07, y: -8 }}
              className="stat-card"
              style={{ 
                background: card.gradient,
                boxShadow: `0 10px 25px -5px ${card.gradient.split(',')[1].trim()}80`,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      {card.emoji}
                    </motion.span> 
                    {card.label}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                  >
                    {card.value}
                  </motion.p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: 500 }}>{card.sub}</p>
                </div>
                <motion.div
                  animate={idx % 2 === 0 ? { rotate: [0, 360] } : { y: [0, -10, 0] }}
                  transition={idx % 2 === 0 ? { duration: 15, repeat: Infinity, ease: 'linear' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'rgba(255,255,255,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Icon size={26} color="white" />
                </motion.div>
              </div>
              {card.change && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  marginTop: '1rem', fontSize: '0.8125rem', opacity: 1,
                  position: 'relative', zIndex: 1, fontWeight: 700,
                  background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 20, width: 'fit-content'
                }}>
                  {card.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {card.change} vs last period
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <motion.div className="card" style={{ padding: '1.25rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📈 Sales Trend (14 Days)</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6, fill: '#4f46e5', stroke: 'white', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: '1.25rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🏆 Top Selling</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="medicine_name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={100} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="total_quantity" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <motion.div className="card" style={{ padding: '1.25rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            🕐 Recent Invoices
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(stats.recent_invoices || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
                No invoices yet. Create your first bill! 🎯
              </p>
            ) : (
              (stats.recent_invoices || []).map((inv: any, i: number) => (
                <motion.div key={inv.id}
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)',
                    background: 'var(--bg-tertiary)', transition: 'all 0.2s', cursor: 'default',
                  }}
                  whileHover={{ x: 4, background: 'var(--bg-hover)' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{inv.invoice_number}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.customer_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{Number(inv.total).toLocaleString('en-IN')}</div>
                    <span className={`badge badge-${inv.payment_method === 'CASH' ? 'success' : inv.payment_method === 'UPI' ? 'primary' : 'warning'}`}>
                      {inv.payment_method}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: '1.25rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            📦 Stock Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { label: 'Total Stock Value', value: `₹${(inventoryStats.total_stock_value || 0).toLocaleString('en-IN')}`, badge: 'success' },
              { label: 'Low Stock Items', value: inventoryStats.low_stock_count || 0, badge: 'warning' },
              { label: 'Expiring Soon', value: inventoryStats.expiring_count || 0, badge: 'error' },
              { label: 'Expired', value: inventoryStats.expired_count || 0, badge: 'error' },
              { label: 'Out of Stock', value: inventoryStats.out_of_stock || 0, badge: 'error' },
            ].map((row, i) => (
              <motion.div key={row.label}
                initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)',
                  background: 'var(--bg-tertiary)', transition: 'all 0.2s',
                }}
                whileHover={{ x: -4, background: 'var(--bg-hover)' }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                <span className={typeof row.value === 'number' ? `badge badge-${row.badge}` : ''} style={typeof row.value !== 'number' ? { fontWeight: 700, color: 'var(--success)' } : {}}>
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
