const express = require('express');
const router = express.Router();

router.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === "test@tanta.edu.eg" && password === "123") {
        res.status(200).json({ message: "Login successful", token: "fake-jwt-token-123" });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

router.get('/api/services', (req, res) => {
    res.status(200).json([
        { id: 1, title: 'Web Design Tutoring', price: 100, provider: 'Ahmed' },
        { id: 2, title: 'Laptop Repair', price: 250, provider: 'Sara' }
    ]);
});

module.exports = router;