import { test, expect } from '@playwright/test';

const api = (base: string) => ({
  signup: (email: string) => fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'password123', fullName: email.split('@')[0] }) }).then(r => r.json()),
  login: (email: string) => fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'password123' }) }).then(r => r.json()),
});

test('private message send and read flow', async ({ browser, baseURL }) => {
  const aliceEmail = `alice+e2e${Date.now()}@test.local`;
  const bobEmail = `bob+e2e${Date.now()}@test.local`;

  const a = await api(baseURL as string).signup(aliceEmail);
  const b = await api(baseURL as string).signup(bobEmail);

  const tokenA = a.token || (await api(baseURL as string).login(aliceEmail)).token;
  const tokenB = b.token || (await api(baseURL as string).login(bobEmail)).token;

  // Launch two contexts (two users)
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  // Auth by setting localStorage token and reloading
  await pageA.goto(baseURL as string);
  await pageA.evaluate((t) => localStorage.setItem('token', t), tokenA);
  await pageA.reload();

  await pageB.goto(baseURL as string);
  await pageB.evaluate((t) => localStorage.setItem('token', t), tokenB);
  await pageB.reload();

  // Open private chat programmatically
  await pageA.evaluate((detail) => window.dispatchEvent(new CustomEvent('open-private-chat', { detail })), { partnerId: b.user.id, partnerName: b.user.full_name || b.user.email, partnerAvatar: '' });
  await pageB.evaluate((detail) => window.dispatchEvent(new CustomEvent('open-private-chat', { detail })), { partnerId: a.user.id, partnerName: a.user.full_name || a.user.email, partnerAvatar: '' });

  // Send a message from A to B
  const message = 'E2E hello ' + Date.now();
  await pageA.fill('input[aria-label="Write a message"]', message);
  await pageA.click('button[aria-label="Send message"]');

  // Assert B sees the message
  await expect(pageB.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });

  // Simulate B marking read by opening the chat (already open) — server mark-as-read should run when chat opens
  await pageB.evaluate((detail) => window.dispatchEvent(new CustomEvent('private-chat-open', { detail })), { partnerId: a.user.id });

  // Wait for the server to emit messages.read and for A to show 'Seen'
  await expect(pageA.locator('text=Seen')).toBeVisible({ timeout: 5000 });

  await contextA.close();
  await contextB.close();
});
