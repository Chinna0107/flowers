/**
 * Seed dummy orders + subscriptions for kancharlahemanth89@gmail.com
 * Usage:
 *   1. Open browser → login as kancharlahemanth89@gmail.com
 *   2. Run in browser console: JSON.parse(localStorage.getItem('auth')).token
 *   3. Copy the token
 *   4. Run: TOKEN=<paste_token> node seed-dummy-data.mjs
 */

const API = 'https://flowerbe.vercel.app/api';
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error('❌  Set TOKEN env var. See instructions at top of this file.');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

// ── ORDERS ──────────────────────────────────────────────────────────────────
const orders = [
  { items: [{ id: 18, name: 'Premium Pooja Flower Mix', price: 40, quantity: 2, img: '', unitQuantity: '100g' }], total: 84,  status: 'Delivered',   label: 'Order 1' },
  { items: [{ id: 19, name: 'Basic Pooja Flower Mix',   price: 20, quantity: 3, img: '', unitQuantity: '100g' }], total: 63,  status: 'Processing',  label: 'Order 2' },
  { items: [{ id: 18, name: 'Premium Pooja Flower Mix', price: 40, quantity: 1, img: '', unitQuantity: '100g' }], total: 42,  status: 'Confirmed',   label: 'Order 3' },
  { items: [{ id: 19, name: 'Basic Pooja Flower Mix',   price: 20, quantity: 5, img: '', unitQuantity: '100g' }], total: 105, status: 'In Transit',  label: 'Order 4' },
];

const address = {
  name: 'Hemanth Kancharla',
  flat: 'Flat 201',
  building: 'Vasavi Green Valley',
  city: 'Hyderabad',
  pincode: '500081',
  phone: '9999999999',
  timing: '6 am - 7:30 am',
};

// ── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
const subscriptions = [
  { schedule: 'monthly',   label: 'Monthly',              price_per_day: 20, total: 600,  n_days: undefined, weekday: undefined },
  { schedule: 'weekly',    label: 'Weekly',               price_per_day: 40, total: 160,  n_days: undefined, weekday: 1 },
  { schedule: 'alternate', label: 'Alternate Days',       price_per_day: 20, total: 300,  n_days: undefined, weekday: undefined },
  { schedule: 'n_days',    label: 'Custom 10 Days',       price_per_day: 20, total: 200,  n_days: 10,        weekday: undefined },
];

async function createOrder(order) {
  const res = await fetch(`${API}/payment/cod`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      cart: order.items,
      address,
      total: order.total,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${order.label}: ${data.error}`);
  console.log(`✅ ${order.label} created → #${data.order_id}`);
  return data.order_id;
}

async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API}/orders/${orderId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  if (res.ok) console.log(`   ↳ status set to "${status}"`);
}

async function createSubscription(sub) {
  const res = await fetch(`${API}/payment/create-subscription-order`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      product_name: 'Basic Pooja Flower Mix',
      schedule: sub.schedule,
      n_days: sub.n_days,
      weekday: sub.weekday,
      price_per_day: sub.price_per_day,
      total: sub.total,
      address: `Hemanth Kancharla, Flat 201, Vasavi Green Valley, Hyderabad - 500081 (Tel: 9999999999, Time: 6 am - 7:30 am)`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${sub.label}: ${data.error}`);
  console.log(`✅ ${sub.label} subscription order created → ${data.order_id}`);

  // Simulate payment verification with dummy values
  const verifyRes = await fetch(`${API}/payment/verify-subscription`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      razorpay_order_id: data.order_id,
      razorpay_payment_id: `pay_dummy_${Date.now()}`,
      razorpay_signature: 'dummy_signature',
      receipt: data.receipt,
      subscription_data: data.subscription_data,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) {
    console.log(`   ⚠️  Verify failed (${verifyData.error}) — trying direct insert...`);
    return null;
  }
  console.log(`   ↳ activated → sub #${verifyData.subscription?.id}`);
  return verifyData;
}

(async () => {
  console.log('\n🌸 Creating dummy orders...\n');
  for (const order of orders) {
    try {
      const id = await createOrder(order);
      if (order.status !== 'Processing') await updateOrderStatus(id, order.status);
    } catch (e) { console.error('❌', e.message); }
  }

  console.log('\n🔁 Creating dummy subscriptions...\n');
  for (const sub of subscriptions) {
    try {
      await createSubscription(sub);
    } catch (e) { console.error('❌', e.message); }
  }

  console.log('\n✨ Done! Refresh the admin dashboard.\n');
})();
