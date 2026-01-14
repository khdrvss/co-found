import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    // Fail if more than 1% of requests fail
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<500'],
  },
};

const TARGET = __ENV.TARGET || 'http://127.0.0.1:5000';

function signup(email, password = 'password123') {
  const res = http.post(`${TARGET}/api/auth/signup`, JSON.stringify({ email, password, fullName: email.split('@')[0] }), {
    headers: { 'Content-Type': 'application/json' },
  });
  return res;
}

function login(email, password = 'password123') {
  const res = http.post(`${TARGET}/api/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });
  return res;
}

export function setup() {
  // Create two test accounts that will exchange messages
  const aliceEmail = `k6_alice_${Date.now()}@load.test`;
  const bobEmail = `k6_bob_${Date.now()}@load.test`;

  const a1 = signup(aliceEmail);
  if (a1.status !== 201 && a1.status !== 409) {
    throw new Error('Signup failed for alice: ' + a1.status);
  }

  const b1 = signup(bobEmail);
  if (b1.status !== 201 && b1.status !== 409) {
    throw new Error('Signup failed for bob: ' + b1.status);
  }

  const a2 = login(aliceEmail);
  if (a2.status !== 200) throw new Error('Login failed for alice');
  const alice = a2.json();

  const b2 = login(bobEmail);
  if (b2.status !== 200) throw new Error('Login failed for bob');
  const bob = b2.json();

  return { alice, bob };
}

export default function (data) {
  const sender = Math.random() > 0.5 ? data.alice : data.bob;
  const receiver = sender === data.alice ? data.bob : data.alice;

  const message = `k6 test message at ${new Date().toISOString()}`;

  const res = http.post(`${TARGET}/api/messages/private`, JSON.stringify({ receiverId: receiver.user.id, message }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sender.token}`,
    },
  });

  check(res, {
    'sent message': (r) => r.status === 201,
  });

  sleep(0.5);
}
