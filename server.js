const express = require('express');
const mysql = require('mysql2');
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;

const app = express();

// Express middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to mysql database
const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'dAisy>peach!1!',
        database: 'election'
    },
    console.log('Connected to the election database.')
);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});


// db.query method allows SQL commands to be written from a Node.js application
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id;`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'success',
            data: rows,
        });
    });
});

app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidate.*, parties.name AS parties_name FROM candidates LEFT JOIN parties ON candidates.party_id = parties.id WHERE candidate.id = ?`;
    params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row,
        });
    });
});

app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.statusMessage(400).json({ error: err.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id,
            });
        }
    });
});

app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message })
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

// HOW TO MAKE A REQUEST FOR MULTIPLE INFORMATION
// Update a candidates party affiliation
app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            // check if a record was found
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

app.get('/api/parties', (req, res) => {
    const sql = 'SELECT * FROM parties';
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

app.get('/api/parties/:id', (req, res) => {
    const sql = 'SELECT * FROM parties WHERE id = ?';
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: row
        });
    });
});

app.delete('/api/parties/:id', (req, res) => {
    const sql = 'DELETE FROM parties WHERE id = ?';
    const params = [req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Party not found'
            });
        } else {
            res.json({
                message: "deleted",
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});