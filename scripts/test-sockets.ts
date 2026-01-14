import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const API = 'http://localhost:4000/api';

async function signupOrLogin(email: string) {
  const password = 'password123';

  // Try login first
  let res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // Try signup
    res = await fetch(API + '/auth/signup', {
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
  const alice = await signupOrLogin('alice+socket@test.local');
  const bob = await signupOrLogin('bob+socket@test.local');

  console.log('alice', alice.user.id, 'bob', bob.user.id);

  const sockA = io('http://localhost:4000', { auth: { token: alice.token } });
  const sockB = io('http://localhost:4000', { auth: { token: bob.token } });

  sockA.on('connect', () => console.log('sockA connected', sockA.id));
  sockB.on('connect', () => console.log('sockB connected', sockB.id));

  sockA.on('message.created', (m: any) => console.log('sockA got message', m));
  sockB.on('message.created', (m: any) => console.log('sockB got message', m));

  sockA.on('messages.read', (p: any) => console.log('sockA got messages.read', p));
  sockB.on('messages.read', (p: any) => console.log('sockB got messages.read', p));

  sockA.on('connect_error', (err: any) => console.log('sockA connect_error', err));
  sockB.on('connect_error', (err: any) => console.log('sockB connect_error', err));
  sockA.on('connect_timeout', () => console.log('sockA connect_timeout'));
  sockB.on('connect_timeout', () => console.log('sockB connect_timeout'));
  sockA.on('reconnect_attempt', () => console.log('sockA reconnect_attempt'));
  sockB.on('reconnect_attempt', () => console.log('sockB reconnect_attempt'));

  // Give some time to connect
  await new Promise((r) => setTimeout(r, 1500));
  console.log('sockA connected:', sockA.connected, 'sockB connected:', sockB.connected);

  const res = await fetch(API + '/messages/private', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + alice.token },
    body: JSON.stringify({ receiverId: String(bob.user.id), message: 'Hello from Alice via test script ' + Date.now() }),
  });

  console.log('send status', res.status);

  await new Promise((r) => setTimeout(r, 2000));

  // Simulate Bob opening the chat and marking messages read
  console.log('Bob marking messages as read...');
  const readRes = await fetch(API + `/messages/private/${alice.user.id}/read`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + bob.token }
  });
  console.log('read res', readRes.status, await readRes.json());

  await new Promise((r) => setTimeout(r, 3000));
  console.log('After wait - sockA connected:', sockA.connected, 'sockB connected:', sockB.connected);
  sockA.disconnect();
  sockB.disconnect();

  console.log('alice token decoded', jwt.decode(alice.token));
  console.log('bob token decoded', jwt.decode(bob.token));
}

main().catch((err) => { console.error(err); process.exit(1); });
