
import { pool } from '../src/server/db';

async function randomizeRecommendations() {
    try {
        console.log('Randomizing project recommendations...');

        // Set ~40% of projects to be recommended
        const result = await pool.query(`
      UPDATE projects 
      SET recommended = (random() < 0.4)
    `);

        console.log(`Updated project recommendations. ${result.rowCount} projects affected.`);
    } catch (error) {
        console.error('Error updating recommendations:', error);
    } finally {
        await pool.end();
    }
}

randomizeRecommendations();
