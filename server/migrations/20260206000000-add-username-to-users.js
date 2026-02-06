'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if the column already exists to be safe
        const tableInfo = await queryInterface.describeTable('users');

        if (!tableInfo.username) {
            await queryInterface.addColumn('users', 'username', {
                type: Sequelize.STRING,
                allowNull: true, // Allow null initially for existing records
                unique: true
            });

            // Add validation constraint if needed, but usually done in model
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('users');

        if (tableInfo.username) {
            await queryInterface.removeColumn('users', 'username');
        }
    }
};
