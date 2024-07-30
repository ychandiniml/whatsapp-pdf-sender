const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

const accessToken = 'accessToken';
const phoneNumberId = 'phoneNumberId';


app.post('/send-pdf', upload.single('pdf'), async (req, res) => {
    const { to } = req.body;
    const pdfPath = req.file.path;

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(pdfPath), {
            filename: req.file.originalname, 
            contentType: "application/pdf",
        });
        form.append('type', 'application/pdf');
        form.append('messaging_product', 'whatsapp');

        const mediaResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${phoneNumberId}/media`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data"
                },
            }
        );

        const mediaId = mediaResponse.data.id;
        console.log(`Media uploaded successfully. Media ID: ${mediaId}`);

        // Send the media message
        const messageResponse = await axios.post(
            `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'document',
                document: {
                    id: mediaId,
                    filename: 'test_doc.pdf',
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("messageResponse", messageResponse.data);

        console.log(`Message sent successfully. Message ID: ${messageResponse.data.messages[0].id}`);
        res.status(200).json({ message: 'PDF sent successfully!' });
    } catch (error) {
        console.error('Error sending PDF:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to send PDF' });
    } 
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
