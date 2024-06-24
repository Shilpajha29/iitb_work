const express = require('express');
const fileUpload = require('express-fileupload');
const csvParser = require('csv-parser');
const fs = require('fs');
const { parse } = require('json2csv');

const app = express();
app.use(fileUpload());

app.post('/upload', (req, res) => {
    const groupFile = req.files['group-csv'];
    const hostelFile = req.files['hostel-csv'];

    const groups = [];
    const hostels = [];

    fs.createReadStream(groupFile.data)
        .pipe(csvParser())
        .on('data', (row) => {
            groups.push(row);
        })
        .on('end', () => {
            fs.createReadStream(hostelFile.data)
                .pipe(csvParser())
                .on('data', (row) => {
                    hostels.push(row);
                })
                .on('end', () => {
                    const allocation = allocateRooms(groups, hostels);
                    const csv = parse(allocation);

                    res.json({ allocation, csv });
                });
        });
});

function allocateRooms(groups, hostels) {
    // Allocation logic here
    const allocation = [];
    // Sort and allocate rooms according to the rules
    // ...
    return allocation;
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


//////////////////////OUTPUT////////////////////////////////////////////////////
document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const groupFile = document.getElementById('group-csv').files[0];
    const hostelFile = document.getElementById('hostel-csv').files[0];

    const formData = new FormData();
    formData.append('group-csv', groupFile);
    formData.append('hostel-csv', hostelFile);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data.allocation);
        enableDownload(data.csv);
    });
});

function displayResults(allocation) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Room Allocation</h2>';
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Group ID</th>
                <th>Hostel Name</th>
                <th>Room Number</th>
                <th>Members Allocated</th>
            </tr>
        </thead>
        <tbody>
            ${allocation.map(row => `
                <tr>
                    <td>${row['Group ID']}</td>
                    <td>${row['Hostel Name']}</td>
                    <td>${row['Room Number']}</td>
                    <td>${row['Members Allocated']}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    resultsDiv.appendChild(table);
}

function enableDownload(csv) {
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.style.display = 'block';
    downloadBtn.onclick = () => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'allocation.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}
