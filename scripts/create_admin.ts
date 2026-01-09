
import { pool } from '../src/server/db';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    const email = 'saidxon3105@gmail.com';
    const password = 'Saidxon_2006';
    const fullName = 'Saidxon Admin';

    try {
        console.log(`Checking for user ${email}...`);
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            console.log('User exists, updating to admin...');
            await pool.query('UPDATE users SET is_admin = true WHERE email = $1', [email]);
            console.log('User updated.');
        } else {
            console.log('User does not exist, creating...');
            const hash = await bcrypt.hash(password, 10);

            const userResult = await pool.query(
                'INSERT INTO users (email, password_hash, is_admin) VALUES ($1, $2, true) RETURNING id',
                [email, hash]
            );
            const userId = userResult.rows[0].id;

            await pool.query(
                `INSERT INTO profiles (user_id, full_name, avatar_url, bio, roles) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    userId,
                    fullName,
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
                    'System Administrator',
                    ['Admin']
                ]
            );
            console.log('Admin user created successfully.');
        }
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        await pool.end();
    }
}

createAdmin();
