 "use client";

import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "@/lib/supabase";

type Order = {
  id: string; created_at: string; customer_name: string; phone: string; order_type: string;
  requested_date: string; requested_time: string; delivery_address: string | null;
  notes: string | null; items: { name: string; quantity: number; unit_price: number; line_total: number }[];
  total: number; status: string;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setOrders((data || []) as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setSession(true); loadOrders(); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) => {
      const active = Boolean(current);
      setSession(active);
      if (active) setTimeout(() => loadOrders(), 0);
      else setOrders([]);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  async function updateStatus(id: string, status: string) {
    if (!supabase) return;
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setError(error.message); else loadOrders();
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); }

  return <main className="admin-page">
    <div className="admin-top"><a href="/">← Customer ordering page</a><span>ANNAI FOODS · ADMIN</span></div>
    <div className="admin-content">
      {!session ? <section className="login-card">
        <p className="eyebrow dark">PRIVATE AREA</p><h1>Admin sign in</h1>
        <p className="muted">Sign in with the admin email and password created in Supabase Authentication.</p>
        {!supabaseReady && <div className="notice warning">Supabase environment values are not configured.</div>}
        <form onSubmit={signIn}>
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          <button className="submit-button">Sign in</button>
        </form>
        {error && <div className="notice warning">{error}</div>}
      </section> : <section>
        <div className="admin-heading"><div><p className="eyebrow dark">ORDER MANAGEMENT</p><h1>Incoming orders</h1></div><div className="admin-actions"><button className="secondary-button" onClick={loadOrders}>Refresh</button><button className="secondary-button" onClick={signOut}>Sign out</button></div></div>
        {error && <div className="notice warning">{error}</div>}
        {loading ? <p>Loading orders…</p> : orders.length === 0 ? <div className="empty-state">No orders yet. New customer orders will appear here.</div> :
          <div className="orders-list">{orders.map(order => <article className="order-card" key={order.id}>
            <div className="order-card-head"><div><span className="order-id">#{order.id.slice(0, 8)}</span><h2>{order.customer_name}</h2><p>{order.phone} · {order.order_type}</p></div><strong>R{order.total}</strong></div>
            <p className="muted">Requested: {order.requested_date} at {order.requested_time}</p>
            {order.delivery_address && <p><b>Address:</b> {order.delivery_address}</p>}
            <ul>{(order.items || []).map((item, i) => <li key={i}>{item.name} × {item.quantity} — R{item.line_total}</li>)}</ul>
            {order.notes && <p><b>Special requests:</b> {order.notes}</p>}
            <div className="status-row"><label>Status<select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}><option>New</option><option>Accepted</option><option>Preparing</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select></label><span className="muted">{new Date(order.created_at).toLocaleString()}</span></div>
          </article>)}</div>}
      </section>}
    </div>
  </main>;
}
