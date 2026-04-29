const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'postgres-cnpg.default.svc.cluster.local',
  database: process.env.PGDATABASE || 'iot_db',
  password: process.env.PGPASSWORD || 'password',
  port: process.env.PGPORT || 5432,
});

// Authentication Endpoint
app.post('/mqtt/auth', async (req, res) => {
  const { clientid, username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT password, status FROM devices WHERE device_id = $1 AND username = $2',
      [clientid, username]
    );

    if (result.rows.length === 0) {
      console.log(`[Auth] Denied: Device not found - ${clientid}`);
      return res.status(401).json({ result: 'deny' });
    }

    const device = result.rows[0];

    // Simple password check (in production, use bcrypt or similar)
    if (device.password !== password) {
      console.log(`[Auth] Denied: Invalid password - ${clientid}`);
      return res.status(401).json({ result: 'deny' });
    }

    if (device.status === 'revoked') {
      console.log(`[Auth] Denied: Device revoked - ${clientid}`);
      return res.status(401).json({ result: 'deny' });
    }

    console.log(`[Auth] Allowed - ${clientid}`);
    
    // Update last_seen
    await pool.query('UPDATE devices SET last_seen = now() WHERE device_id = $1', [clientid]);

    return res.status(200).json({ result: 'allow', is_superuser: false });
  } catch (err) {
    console.error('[Auth Error]', err);
    return res.status(500).json({ result: 'deny' });
  }
});

// ACL Endpoint
app.post('/mqtt/acl', async (req, res) => {
  const { clientid, username, topic, action } = req.body;

  try {
    const result = await pool.query(
      'SELECT topic FROM devices WHERE device_id = $1',
      [clientid]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ result: 'deny' });
    }

    const device = result.rows[0];
    const allowedTopic = device.topic; // e.g., 'home/sensor-001/#'

    // Basic topic matching (ignoring advanced MQTT wildcards for simplicity)
    const allowedPrefix = allowedTopic.replace('/#', '/');
    if (topic.startsWith(allowedPrefix)) {
      console.log(`[ACL] Allowed ${action} to ${topic} for ${clientid}`);
      return res.status(200).json({ result: 'allow' });
    }

    console.log(`[ACL] Denied ${action} to ${topic} for ${clientid}`);
    return res.status(401).json({ result: 'deny' });

  } catch (err) {
    console.error('[ACL Error]', err);
    return res.status(500).json({ result: 'deny' });
  }
});

// Device Provisioning Endpoint (Single Source of Truth)
// NOTE: Protect this endpoint using Traefik/OAuth2 Proxy rules so only admins can call it.
app.post('/register-device', async (req, res) => {
  const { device_id, topic } = req.body;
  
  if (!device_id || !topic) {
    return res.status(400).json({ error: 'device_id and topic are required' });
  }

  // Generate a random secure password for the device
  const crypto = require('crypto');
  const password = crypto.randomBytes(16).toString('hex');
  const username = device_id; // Using device_id as username for simplicity

  try {
    await pool.query(
      `INSERT INTO devices (device_id, username, password, status, topic) 
       VALUES ($1, $2, $3, $4, $5)`,
      [device_id, username, password, 'ACTIVE', topic]
    );

    console.log(`[Provisioning] Registered new device: ${device_id}`);
    
    // Return credentials exactly as requested by the architecture doc
    return res.status(201).json({
      device_id,
      username,
      password,
      topic
    });
  } catch (err) {
    console.error('[Provisioning Error]', err);
    return res.status(500).json({ error: 'Failed to register device' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IoT Auth API running on port ${PORT}`);
});
