const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//require('dotenv').config(); // Uncommented dotenv for environment variables

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://dkushal129:VT8mveycwJ2nn7IM@cluster0.tii9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { 

})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  email: String,
  rollNumber: String
});

const User = mongoose.model('User', userSchema);

// Utility functions
const processData = (data) => {
  const numbers = data.filter(item => /^\d+$/.test(item));
  const alphabets = data.filter(item => /^[a-zA-Z]+$/.test(item)); // Allowing multi-character strings
  const highestLowercase = alphabets.filter(char => char === char.toLowerCase())
                                    .sort((a, b) => b.localeCompare(a))[0];

  return {
    numbers,
    alphabets,
    highestLowercaseAlphabet: highestLowercase ? [highestLowercase] : []
  };
};

const processFile = (fileB64) => {
  if (!fileB64) return { fileValid: false };

  try {
    const buffer = Buffer.from(fileB64, 'base64');
    return {
      fileValid: true,
      fileSizeKb: Math.round(buffer.length / 1024 * 100) / 100,
      fileMimeType: 'application/octet-stream' // Default MIME type
    };
  } catch (error) {
    console.log(error);
    return { fileValid: false, error: "Invalid file format" }; // Returning error message
  }
};

// Routes
app.post('/bfhl', async (req, res) => {
  try {
    const { data, file_b64 } = req.body;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = `${user.fullName.toLowerCase().replace(/\s+/g, '_')}_${user.dob ? user.dob.toISOString().slice(0, 10).replace(/-/g, '') : 'unknown'}`;

    const processedData = processData(data);
    const fileInfo = processFile(file_b64);

    res.json({
      is_success: true,
      user_id: userId,
      email: user.email,
      roll_number: user.rollNumber,
      ...processedData,
      ...fileInfo
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/bfhl', (req, res) => {
  res.json({ operation_code: 1 });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing purposes
