const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("view"));

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`)
});

module.exports = app;