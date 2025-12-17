const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Function to add data to Excel file
async function addToExcel(data, sheetName, fileName) {
    const filePath = path.join(dataDir, fileName);
    const workbook = new ExcelJS.Workbook();
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
    } else {
        // Create new workbook
        workbook.creator = 'Tvaraa Organics';
        workbook.created = new Date();
    }
    
    // Get or create worksheet
    let worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
        worksheet = workbook.addWorksheet(sheetName);
        // Add headers based on data type
        if (data.type === 'contact') {
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'First Name', key: 'firstName', width: 15 },
                { header: 'Last Name', key: 'lastName', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Phone', key: 'phone', width: 15 },
                { header: 'Company', key: 'company', width: 20 },
                { header: 'Country', key: 'country', width: 15 },
                { header: 'Subject', key: 'subject', width: 20 },
                { header: 'Message', key: 'message', width: 50 },
                { header: 'Newsletter', key: 'newsletter', width: 10 }
            ];
        } else if (data.type === 'quote') {
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Company Name', key: 'companyName', width: 20 },
                { header: 'Industry', key: 'industry', width: 15 },
                { header: 'Contact Person', key: 'contactPerson', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Phone', key: 'phone', width: 15 },
                { header: 'Country', key: 'country', width: 15 },
                { header: 'Services', key: 'services', width: 30 },
                { header: 'Project Type', key: 'projectType', width: 20 },
                { header: 'Product Category', key: 'productCategory', width: 20 },
                { header: 'Initial Quantity', key: 'initialQuantity', width: 20 },
                { header: 'Budget', key: 'budget', width: 20 }
            ];
        } else if (data.type === 'newsletter') {
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Source', key: 'source', width: 20 }
            ];
        }
        
        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
    }
    
    // Prepare row data
    const rowData = {
        date: new Date().toISOString()
    };
    
    if (data.type === 'contact') {
        Object.assign(rowData, {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            country: data.country || '',
            subject: data.subject || '',
            message: data.message || '',
            newsletter: data.newsletter ? 'Yes' : 'No'
        });
    } else if (data.type === 'quote') {
        Object.assign(rowData, {
            companyName: data.companyName || '',
            industry: data.industry || '',
            contactPerson: data.contactPerson || '',
            email: data.email || '',
            phone: data.phone || '',
            country: data.country || '',
            services: Array.isArray(data.services) ? data.services.join(', ') : (data.services || ''),
            projectType: data.projectType || '',
            productCategory: data.productCategory || '',
            initialQuantity: data.initialQuantity || '',
            budget: data.budget || ''
        });
    } else if (data.type === 'newsletter') {
        Object.assign(rowData, {
            email: data.email || '',
            source: data.source || 'Footer'
        });
    }
    
    // Add row
    worksheet.addRow(rowData);
    
    // Save workbook
    await workbook.xlsx.writeFile(filePath);
    console.log(`Data added to ${fileName}`);
}

// Function to send email
async function sendEmail(subject, htmlContent, textContent) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@tvaraaorganics.com',
            subject: subject,
            html: htmlContent,
            text: textContent
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email: ', error);
        return { success: false, error: error.message };
    }
}

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const formData = {
            type: 'contact',
            ...req.body
        };
        
        // Add to Excel
        await addToExcel(formData, 'Contact Form Submissions', 'contact_submissions.xlsx');
        
        // Send email
        const emailSubject = `New Contact Form Submission - ${formData.subject || 'General Inquiry'}`;
        const emailHtml = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
            <p><strong>Country:</strong> ${formData.country || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
            <p><strong>Newsletter Subscription:</strong> ${formData.newsletter ? 'Yes' : 'No'}</p>
            <hr>
            <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
        `;
        
        await sendEmail(emailSubject, emailHtml, emailHtml.replace(/<[^>]*>/g, ''));
        
        res.json({ success: true, message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Error processing contact form: ', error);
        res.status(500).json({ success: false, message: 'Error processing form submission' });
    }
});

// Quote Form Endpoint
app.post('/api/quote', async (req, res) => {
    try {
        const formData = {
            type: 'quote',
            ...req.body
        };
        
        // Add to Excel
        await addToExcel(formData, 'Quote Requests', 'quote_requests.xlsx');
        
        // Send email
        const emailSubject = `New Quote Request from ${formData.companyName || 'Unknown Company'}`;
        const emailHtml = `
            <h2>New Quote Request</h2>
            <h3>Company Information</h3>
            <p><strong>Company Name:</strong> ${formData.companyName}</p>
            <p><strong>Industry:</strong> ${formData.industry}</p>
            <p><strong>Contact Person:</strong> ${formData.contactPerson}</p>
            <p><strong>Position:</strong> ${formData.position || 'Not provided'}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Country:</strong> ${formData.country}</p>
            <p><strong>Website:</strong> ${formData.website || 'Not provided'}</p>
            
            <h3>Service Requirements</h3>
            <p><strong>Services Required:</strong> ${Array.isArray(formData.services) ? formData.services.join(', ') : formData.services}</p>
            <p><strong>Project Type:</strong> ${formData.projectType}</p>
            <p><strong>Urgency:</strong> ${formData.urgency}</p>
            
            <h3>Product Details</h3>
            <p><strong>Product Category:</strong> ${formData.productCategory}</p>
            <p><strong>Product Form:</strong> ${formData.productForm}</p>
            <p><strong>Product Description:</strong> ${formData.productDescription}</p>
            <p><strong>Key Ingredients:</strong> ${formData.keyIngredients || 'Not specified'}</p>
            <p><strong>Special Requirements:</strong> ${formData.specialRequirements || 'None'}</p>
            <p><strong>Certifications Required:</strong> ${Array.isArray(formData.certifications) ? formData.certifications.join(', ') : 'None'}</p>
            
            <h3>Volume & Timeline</h3>
            <p><strong>Initial Order Quantity:</strong> ${formData.initialQuantity}</p>
            <p><strong>Expected Monthly Volume:</strong> ${formData.monthlyVolume || 'Not specified'}</p>
            <p><strong>Target Price Range:</strong> ${formData.targetPrice || 'Not specified'}</p>
            <p><strong>Target Launch Date:</strong> ${formData.launchDate || 'Not specified'}</p>
            <p><strong>Packaging Requirements:</strong> ${formData.packaging || 'Not specified'}</p>
            <p><strong>Required Shelf Life:</strong> ${formData.shelfLife || 'Not specified'}</p>
            
            <h3>Additional Information</h3>
            <p><strong>Existing Supplier:</strong> ${formData.existingSupplier || 'Not specified'}</p>
            ${formData.reasonForChange ? `<p><strong>Reason for Change:</strong> ${formData.reasonForChange}</p>` : ''}
            <p><strong>Total Project Budget:</strong> ${formData.budget || 'Not specified'}</p>
            <p><strong>How did you hear about us:</strong> ${formData.hearAbout || 'Not specified'}</p>
            <p><strong>Additional Information:</strong> ${formData.additionalInfo || 'None'}</p>
            <p><strong>NDA Requested:</strong> ${formData.nda ? 'Yes' : 'No'}</p>
            <p><strong>Newsletter Subscription:</strong> ${formData.newsletter ? 'Yes' : 'No'}</p>
            
            <hr>
            <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
        `;
        
        await sendEmail(emailSubject, emailHtml, emailHtml.replace(/<[^>]*>/g, ''));
        
        res.json({ success: true, message: 'Quote request submitted successfully!' });
    } catch (error) {
        console.error('Error processing quote form: ', error);
        res.status(500).json({ success: false, message: 'Error processing quote request' });
    }
});

// Newsletter Subscription Endpoint
app.post('/api/newsletter', async (req, res) => {
    try {
        const formData = {
            type: 'newsletter',
            email: req.body.email,
            source: req.body.source || 'Footer'
        };
        
        // Add to Excel
        await addToExcel(formData, 'Newsletter Subscriptions', 'newsletter_subscriptions.xlsx');
        
        // Send email
        const emailSubject = 'New Newsletter Subscription';
        const emailHtml = `
            <h2>New Newsletter Subscription</h2>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Source:</strong> ${formData.source}</p>
            <hr>
            <p><small>Subscribed on: ${new Date().toLocaleString()}</small></p>
        `;
        
        await sendEmail(emailSubject, emailHtml, emailHtml.replace(/<[^>]*>/g, ''));
        
        res.json({ success: true, message: 'Successfully subscribed to newsletter!' });
    } catch (error) {
        console.error('Error processing newsletter subscription: ', error);
        res.status(500).json({ success: false, message: 'Error processing subscription' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Make sure to set up your .env file with email credentials`);
});

