const db = require("../config/db");

const Supplier = {
  getAll: async () => {
    const [rows] = await db.execute("SELECT * FROM suppliers ORDER BY name");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM suppliers WHERE id = ?", [id]);
    return rows[0];
  },

  create: async (data) => {
    const { name, contact_person, phone, email, address } = data;
    const [result] = await db.execute(
      "INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)",
      [name, contact_person || null, phone || null, email || null, address || null]
    );
    return result;
  },

  update: async (id, data) => {
    const { name, contact_person, phone, email, address } = data;
    const [result] = await db.execute(
      "UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ?",
      [name, contact_person || null, phone || null, email || null, address || null, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM suppliers WHERE id = ?", [id]);
    return result;
  },
};

module.exports = Supplier;



