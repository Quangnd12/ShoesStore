const db = require('../config/db');

const User = {
    createUser: async (username, email, password, role = 'user') => {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, role]
        );
        return result;
    },
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },
    updateUser: async (id, username, email, role) => {
        const [result] = await db.execute('UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?', [username, email, role, id]);
        return result;
    },
    deleteUser: async (id) => {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result;
    },
    getAllUsers: async () => {
        const [rows] = await db.execute('SELECT * FROM users');
    }
};

module.exports = User;