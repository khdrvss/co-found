import { Client } from 'pg';

async function main() {
  const connection = process.env.DATABASE_URL;
  if (!connection) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: connection });
  await client.connect();

  try {
    console.log('Creating recommended indexes if missing...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_private_messages_sender_receiver ON private_messages(sender_id, receiver_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at DESC);`);

    console.log('Running VACUUM ANALYZE... (this may take a while)');
    await client.query('VACUUM ANALYZE');

    console.log('Gathering table statistics...');
    const res = await client.query(`SELECT relname, n_live_tup, seq_scan, idx_scan FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20;`);
    console.table(res.rows);

    // Optional: run EXPLAIN ANALYZE on the conversation query sample if there are users
    const users = await client.query('SELECT id FROM users LIMIT 1');
    if (users.rows.length > 0) {
      const uid = users.rows[0].id;
      console.log('Running EXPLAIN ANALYZE for conversation query with a sample user', uid);
      const explain = await client.query(
        `EXPLAIN ANALYZE
         WITH partners AS (
           SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partner_id,
                  MAX(created_at) AS last_message_at
           FROM private_messages
           WHERE sender_id = $1 OR receiver_id = $1
           GROUP BY partner_id
         )
         SELECT
           p.partner_id as id,
           pm.message as last_message,
           pm.created_at as last_message_at,
           pm.sender_id as last_sender_id
         FROM partners p
         JOIN LATERAL (
           SELECT message, created_at, sender_id
           FROM private_messages pm
           WHERE (pm.sender_id = $1 AND pm.receiver_id = p.partner_id) OR (pm.receiver_id = $1 AND pm.sender_id = p.partner_id)
           ORDER BY pm.created_at DESC LIMIT 1
         ) pm ON true
         ORDER BY p.last_message_at DESC`,
        [uid]
      );

      console.log(explain.rows.map(r => r['QUERY PLAN']).join('\n'));
    } else {
      console.log('No users found; skipping EXPLAIN ANALYZE');
    }

    console.log('Optimization complete');
  } catch (err) {
    console.error('Optimization failed', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
