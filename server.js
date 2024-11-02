const http = require('http');
const fs = require('fs');
const csv = require('csv-parser'); // Ensure you have csv-parser installed
const path = require('path');

const jsonFilePath = path.join(__dirname, 'profiles.json'); // Path to the JSON file
const csvFilePath = path.join(__dirname, 'profiles.csv'); // Path to the CSV file

const server = http.createServer((req, res) => {
  // Handle POST request to submit profile
  if (req.url === '/submit-profile' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // Append each chunk of data
    });

    req.on('end', () => {
      try {
        const profileData = JSON.parse(body); // Parse the JSON data

        // Validate required fields
        const requiredFields = ['Name', 'Title', 'Targeted Keywords', 'Education', 'Certification', 'Contact'];
        const missingFields = requiredFields.filter(field => !profileData.hasOwnProperty(field));

        if (missingFields.length > 0) {
          // Respond with 400 Bad Request if any fields are missing
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: `Missing fields: ${missingFields.join(', ')}` }));
        }

        // Append the profile to the JSON file
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
          let profiles = [];
          if (!err && data) {
            profiles = JSON.parse(data);
          }

          profiles.push(profileData); // Add the new profile to the list

          fs.writeFile(jsonFilePath, JSON.stringify(profiles, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Failed to save profile to JSON' }));
            }

            // Append to CSV file
            const csvRow = `${profileData.Name},${profileData.Title},"${profileData['Targeted Keywords'].join(',')}",${profileData.Education},${profileData.Certification},${profileData.Contact}\n`;

            fs.appendFile(csvFilePath, csvRow, (err) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Failed to save profile to CSV' }));
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Profile received and saved successfully' }));
            });
          });
        });
      } catch (error) {
        // Respond with error if JSON parsing fails
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.url === '/profiles' && req.method === 'GET') {
    // Handle GET request to retrieve profiles from CSV
    const profiles = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        profiles.push(row); // Push each row into the profiles array
      })
      .on('end', () => {
        // Respond with the profiles in JSON format
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(profiles));
      })
      .on('error', (error) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read profiles from CSV' }));
      });
  } else {
    // Handle other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
