
import moduleAlias from 'module-alias';
import path from 'path';
import { Op } from 'sequelize';

// Register aliases
moduleAlias.addAliases({
    '@': path.join(__dirname, 'src'),
    '@config': path.join(__dirname, 'src/config'),
    '@models': path.join(__dirname, 'src/models'),
    '@utils': path.join(__dirname, 'src/utils'),
});

import User from './src/models/User';
import Escrow from './src/models/Escrow';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

async function cleanupDatabase() {
    try {
        console.log('Starting database cleanup...');

        // 1. Delete ALL Escrows (to avoid FK constraints and clear data)
        // If we wanted to keep his escrows, we'd need to find his ID first, but request was broad.
        // "delete all users and escrows... except [user]" usually implies keeping the user account.
        // We will wipe all escrows for a clean state.
        const deletedEscrows = await Escrow.destroy({
            where: {},
            truncate: false // use delete from
        });
        console.log(`Deleted ${deletedEscrows} escrows.`);

        // 2. Delete Users except the specified email
        const targetEmail = 'bobseger028@gmail.com';

        const deletedUsers = await User.destroy({
            where: {
                email: {
                    [Op.ne]: targetEmail
                }
            }
        });
        console.log(`Deleted ${deletedUsers} users (kept ${targetEmail}).`);

    } catch (error) {
        console.error('Cleanup failed:', error);
    }
}

cleanupDatabase();
