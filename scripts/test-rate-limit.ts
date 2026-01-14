async function signupOrLogin(apiBase: string, email: string) {
  const password = 'password123';
  let res = await fetch(apiBase + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    res = await fetch(apiBase + '/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, fullName: email.split('@')[0] })
    });
    if (!res.ok) throw new Error('Signup failed: ' + (await res.text()));
    const data = await res.json();
    return { token: data.token, user: data.user };
  }
  const data = await res.json();
  return { token: data.token, user: data.user };
}

async function main() {
  const API = 'http://localhost:4000/api';
  const alice = await signupOrLogin(API, 'alice+ratetest@test.local');
  const bob = await signupOrLogin(API, 'bob+ratetest@test.local');
  console.log('alice', alice.user.id, 'bob', bob.user.id);

  for (let i = 1; i <= 40; i++) {
    const res = await fetch(API + '/messages/private', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + alice.token },
      body: JSON.stringify({ receiverId: String(bob.user.id), message: 'Spam message ' + i })
    });
    const text = await res.text();
    console.log(i, res.status, text.substring(0, 100));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
