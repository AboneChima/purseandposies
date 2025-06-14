const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the root directory
app.use(express.static(__dirname));

// Error handling middleware should come after routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle specific routes with error handling
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Fallback route should be a simple redirect
app.use((req, res) => {
    res.redirect('/');
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});