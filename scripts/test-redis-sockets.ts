import { io } from 'socket.io-client';

const API1 = process.env.API1 || 'http://localhost:4000/api';
const API2 = process.env.API2 || 'http://localhost:4001/api';

async function signupOrLogin(apiBase: string, email: string) {
  const password = 'password123';

  // Try login first
  let res = await fetch(apiBase + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // Try signup
    res = await fetch(apiBase + '/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName: email.split('@')[0] }),
    });
    if (!res.ok) throw new Error('Signup failed: ' + (await res.text()));
    const data = await res.json();
    return { token: data.token, user: data.user };
  }

  const data = await res.json();
  return { token: data.token, user: data.user };
}

async function main() {
  console.log('Using endpoints:', API1, API2);
  const alice = await signupOrLogin(API1, 'alice+redis@test.local');
  const bob = await signupOrLogin(API2, 'bob+redis@test.local');

  console.log('alice', alice.user.id, 'bob', bob.user.id);

  const sockA = io(API1.replace(/\/api$/, ''), { auth: { token: alice.token }, transports: ['websocket', 'polling'] });
  const sockB = io(API2.replace(/\/api$/, ''), { auth: { token: bob.token }, transports: ['websocket', 'polling'] });

  sockA.on('connect', () => console.log('sockA connected', sockA.id));
  sockB.on('connect', () => console.log('sockB connected', sockB.id));

  sockA.on('message.created', (m: any) => console.log('sockA got message', m));
  sockB.on('message.created', (m: any) => console.log('sockB got message', m));

  // Give some time to connect
  await new Promise((r) => setTimeout(r, 1500));
  console.log('sockA connected:', sockA.connected, 'sockB connected:', sockB.connected);

  const res = await fetch(API1 + '/messages/private', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + alice.token },
    body: JSON.stringify({ receiverId: String(bob.user.id), message: 'Hello from Alice via redis smoke test ' + Date.now() }),
  });

  console.log('send status', res.status);

  await new Promise((r) => setTimeout(r, 4000));
  console.log('After wait - sockA connected:', sockA.connected, 'sockB connected:', sockB.connected);
  sockA.disconnect();
  sockB.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
