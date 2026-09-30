require('dotenv').config();
const connectDB = require('./config/db')
const app = require('./app')

connectDB(); //Kết nối DB

// Bật server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chay tai http://localhost:${PORT}`);
});