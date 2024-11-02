// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON body
app.use(express.json());
app.use(cors());


const corsOptions = {
    origin: 'http://localhost:3001'
  };
  
  //app.use(cors(corsOptions));


  function setCorsHeaders(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); //, PUT, PATCH, DELETE
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  }


  app.use(setCorsHeaders);

// POST endpoint to handle form submission
app.post('/api/complaint', upload.single('image'), (req, res) => {
    const { email, description } = req.body;

    console.log("Entery point");

    // Simple form validation
    if (!email || !description) {
        return res.status(400).json({ success: false, message: 'Email and description are required.' });
    }

    // Save form data to a local file
    const complaintData = {
        email,
        description,
        image: req.file ? req.file.filename : null,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
        path.join(__dirname, 'complaints.json'),
        JSON.stringify(complaintData, null, 2),
        { flag: 'a' } // Append to file
    );

    res.json({ success: true, message: 'Complaint submitted successfully!' });
});

// Simple success route for redirect
app.get('/success', (req, res) => {
    res.send('<h1>Complaint Submitted Successfully!</h1>');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/allcomplaints',(req, res)=>{

    res.send(JSON.stringify([{id:"1",title:"complaint title",description:"dshjd"}]))
});
