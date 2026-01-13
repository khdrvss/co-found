
import 'dotenv/config';
import { pool, query } from './src/server/db.js';
import { mockPeople } from './src/data/mockPeople.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        // Clear existing data
        await query('DELETE FROM join_requests');
        await query('DELETE FROM project_members');
        await query('DELETE FROM project_messages');
        await query('DELETE FROM projects');
        await query('DELETE FROM profiles');
        await query('DELETE FROM users');

        console.log('🧹 Cleared existing data');

        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [];

        // Insert Users and Profiles
        for (const person of mockPeople) {
            // Create User
            const email = `${person.name?.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            const isAdmin = email.includes('admin') || person.name === 'Aziz Karimov'; // Mock logic
            const userResult = await query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
                [email, hashedPassword]
            );
            const userId = userResult.rows[0].id;
            users.push({ ...person, userId, email });

            // Create Profile
            await query(
                `INSERT INTO profiles (
                    user_id, full_name, avatar_url, role, viloyat, bio, skills, 
                    looking_for, available, telegram_url, instagram_url, linkedin_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    userId,
                    person.name,
                    person.avatar,
                    person.role || 'User',
                    person.viloyat || 'toshkent-sh',
                    person.bio || '',
                    person.skills || [],
                    person.lookingFor,
                    person.available !== undefined ? person.available : true,
                    person.telegram_url,
                    person.instagram_url,
                    person.linkedin_url
                ]
            );
        }
        console.log(`✅ Inserted ${users.length} users/profiles`);

        // Insert Projects
        const projects = [
            {
                name: "Startup Match",
                description: "Startap asoschilarini topish uchun platforma. O'zbekiston bozoriga moslashtirilgan Tinder-style matching.",
                category: "IT & Dasturlash",
                stage: "MVP",
                viloyat: "toshkent-sh",
                work_type: "hybrid",
                looking_for: ["Full-Stack Dasturchi", "Marketing"],
                recommended: true
            },
            {
                name: "EduTech Platform",
                description: "Online ta'lim platformasi, jonli darslar va interaktiv topshiriqlar bilan.",
                category: "Ta'lim",
                stage: "Idea",
                viloyat: "samarqand",
                work_type: "remote",
                looking_for: ["UX/UI Dizayner", "Metodist"],
                recommended: false
            },
            {
                name: "DeliverEase",
                description: "Restoranlar uchun yetkazib berish xizmatini avtomatlashtirish tizimi. Telegram bot integratsiyasi bilan.",
                category: "Logistika",
                stage: "Growth",
                viloyat: "buxoro",
                work_type: "office",
                looking_for: ["Sales Manager", "Backend Dev"],
                recommended: true
            }
        ];

        for (const project of projects) {
            // Assign random owner from users
            const owner = users[Math.floor(Math.random() * users.length)];

            await query(
                `INSERT INTO projects (
                    user_id, name, description, category, stage, viloyat, work_type, looking_for, recommended
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    owner.userId,
                    project.name,
                    project.description,
                    project.category,
                    project.stage,
                    project.viloyat,
                    project.work_type,
                    project.looking_for,
                    project.recommended
                ]
            );
        }
        console.log(`✅ Inserted ${projects.length} projects`);

        await pool.end();
        console.log('✨ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        await pool.end();
        process.exit(1);
    }
}

seed();
