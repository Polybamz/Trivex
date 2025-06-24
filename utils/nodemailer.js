import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'polycarp.bame@gmail.com', // Your email address
        pass: 'pwivpyjiimqahtif'         // Your email password or app password
    }
});

/**
 * Generates the HTML content for the Trivex email.
 * @param {object} data - An object containing dynamic data for the email.
 * @param {string} data.recipientName - The name of the recipient.
 * @param {string} data.updatesLink - The URL for the "Explore Trivex" button.
 * @param {string} [data.content] - The main text content of the email. Optional.
 * @returns {string} The complete HTML string for the email.
 */
const generateEmailHtml = (data) => {
    // Basic styles for better email client rendering (inline for maximum compatibility)
    const globalEmailStyles = `
        body, html { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        a { text-decoration: none; color: #00FFFF; } /* Cyan links */
        h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
        p { margin: 0; padding: 0; }

        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .full-width-table { width: 100% !important; }
            .col-width { display: block !important; width: 100% !important; }
            .padding-stack { padding-left: 20px !important; padding-right: 20px !important; }
            .text-center-mobile { text-align: center !important; }
        }
    `;

    // Dynamic content for the email body. If data.content is provided, use it; otherwise, use default.
    const emailBodyContent = data.content ?
        `<p style="margin-bottom: 15px;">${data.content}</p>` :
        `
        <p style="margin-bottom: 15px;">We're excited to share some important updates from Trivex.</p>
        <p style="margin-bottom: 15px;">At Trivex, we continue to push the boundaries of technology, seamlessly integrating hardware and software to create innovative solutions. Our commitment to engineering synergy drives us to build the backbone of tomorrow's technology.</p>
        `;

    // The HTML structure with placeholders for dynamic data
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Your Trivex Update</title>
            <style type="text/css">${globalEmailStyles}</style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">

            <!-- Outer table for centering and max-width -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <!-- Inner content table -->
                        <table border="0" cellpadding="0" cellspacing="0" width="600" class="full-width-table" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #030712; padding: 30px 20px;">
                                    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: bold; margin: 0;">TRIVEX</h1>
                                    <p style="color: #00FFFF; font-size: 14px; margin-top: 5px;">Engineer Synergy</p>
                                </td>
                            </tr>

                            <!-- Body Content -->
                            <tr>
                                <td style="padding: 40px; text-align: left;" class="padding-stack">
                                    <h2 style="color: #00FFFF; font-size: 24px; margin-bottom: 20px;">Hello, ${data.recipientName || 'Valued Customer'}!</h2>
                                    ${emailBodyContent}

                                    <p style="margin-bottom: 25px;">You can learn more about our recent projects and insights by clicking the button below:</p>

                                    <!-- Call to Action Button -->
                                    <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                        <tr>
                                            <td align="center" style="border-radius: 6px; background-color: #00FFFF; padding: 12px 25px;">
                                                <a href="${data.updatesLink || 'https://www.example.com/trivex-updates'}" target="_blank" style="font-size: 18px; font-weight: bold; color: #030712; text-decoration: none; display: inline-block;">
                                                    Explore Trivex
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin-top: 30px;">Thank you for your continued interest and support in our mission.</p>
                                    <p style="margin-top: 15px;">Best regards,</p>
                                    <p style="font-weight: bold;">The Trivex Team</p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background-color: #f0f0f0; padding: 30px 20px; border-top: 1px solid #eeeeee;">
                                    <p style="font-size: 14px; color: #777777; margin-bottom: 10px;">&copy; ${new Date().getFullYear()} Trivex Inc. All rights reserved.</p>
                                    <p style="font-size: 14px; color: #777777; margin-top: 5px;">From Silicon to Software—We Engineer Synergy.</p>
                                    <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                                        <tr>
                                            <td style="padding: 0 10px;">
                                                <a href="#" style="color: #00FFFF; font-size: 14px;">Twitter</a>
                                            </td>
                                            <td style="padding: 0 10px;">
                                                <a href="#" style="color: #00FFFF; font-size: 14px;">LinkedIn</a>
                                            </td>
                                            <td style="padding: 0 10px;">
                                                <a href="#" style="color: #00FFFF; font-size: 14px;">GitHub</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
};


/**
 * Sends an email using Nodemailer with dynamic HTML content.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {object} data - An object containing data to customize the email HTML.
 * @param {string} data.recipientName - The name of the recipient for the greeting.
 * @param {string} data.updatesLink - The URL for the call-to-action button.
 * @param {string} [data.content] - The main text content of the email. Optional.
 */
export const sendEmail = async (to, subject, data) => {
    try {
        const emailHtmlContent = generateEmailHtml(data); // Generate HTML with dynamic data

        const mailOptions = {
            from: 'polycarp.bame@gmail.com' || 'info@trivex.com', // Use env variable or fallback
            to: to || 'polycarp.bame@gmail.com',
            subject,
            html: emailHtmlContent, // Set the HTML content here
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Example usage (ensure you're calling this from a server-side context where process.env is available or set 'from' directly)
/*
// To test, you might call it like this:
sendEmail(
    'test@example.com', // Recipient email
    'Your Latest Trivex Update!', // Subject
    {
        recipientName: 'Alice Johnson',
        updatesLink: 'https://www.trivex.com/latest-news',
        content: 'This is the custom content for the email body that you passed in the data object. It can be a longer message about recent updates or specific information.'
    }
);
*/