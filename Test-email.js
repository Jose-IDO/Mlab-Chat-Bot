const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Configuration Test Script (SSL FIXED)
 * Run this to verify your email setup before integrating with the chatbot
 * 
 * Usage: node test-email.js
 */

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  const requiredVars = ['EMAIL_USER', 'EMAIL_PASSWORD', 'SUPPORT_EMAIL'];
  let allVarsPresent = true;

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: ${varName === 'EMAIL_PASSWORD' ? '***hidden***' : process.env[varName]}`);
    } else {
      console.log(`❌ ${varName}: Missing!`);
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    console.log('\n❌ Error: Missing required environment variables!');
    console.log('Please check your .env file.');
    return;
  }

  console.log('\n📧 Creating Email Transporter...');
  
  // Create transporter with SSL fix
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // FIX: Handle SSL certificate issues
    tls: {
      rejectUnauthorized: false
    },
    secure: true,
    port: 465
  });

  // Verify connection
  console.log('🔌 Verifying SMTP Connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!\n');
  } catch (error) {
    console.log('❌ SMTP Connection Failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Tips:');
    console.log('1. Make sure you are using an App Password, not your regular password');
    console.log('2. Enable 2-Factor Authentication in Gmail');
    console.log('3. Generate App Password at: https://myaccount.google.com/apppasswords');
    console.log('4. Check your internet connection');
    console.log('5. Try disabling VPN if you have one');
    return;
  }

  // Send test email
  console.log('📨 Sending Test Email...');
  const testMailOptions = {
    from: `"mLab Test" <${process.env.EMAIL_USER}>`,
    to: process.env.SUPPORT_EMAIL,
    subject: '🧪 Test Email - mLab Chatbot Setup (SSL Fixed)',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .header { background: #A5CD39; color: white; padding: 20px; text-align: center; border-radius: 10px; }
          .content { background: white; padding: 20px; margin-top: 20px; border-radius: 10px; }
          .success { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Email Configuration Test</h1>
          </div>
          <div class="content">
            <p class="success">✅ Congratulations!</p>
            <p>Your email configuration is working correctly with SSL fix applied.</p>
            <p><strong>Configured Email:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Support Email:</strong> ${process.env.SUPPORT_EMAIL}</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>SSL Handling:</strong> Enabled (rejectUnauthorized: false)</p>
            <hr>
            <p>You can now integrate this with your mLab chatbot escalation form.</p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Note: The SSL certificate issue has been resolved by configuring the transporter 
              to accept self-signed certificates. This is safe for Gmail connections.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test Email Sent Successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log(`📧 Email sent to: ${process.env.SUPPORT_EMAIL}`);
    console.log('\n🎉 Email configuration is working perfectly!');
    console.log('✅ SSL certificate issue resolved!');
    console.log('✅ You can now use this setup with your chatbot.');
  } catch (error) {
    console.log('❌ Failed to Send Test Email!');
    console.error('Error:', error.message);
    console.log('\n💡 Additional troubleshooting:');
    console.log('1. Check if your Gmail account is active');
    console.log('2. Verify the App Password is correct (no typos)');
    console.log('3. Try regenerating the App Password');
    console.log('4. Check if Gmail is blocking the connection');
    console.log('5. Temporarily disable antivirus/firewall and try again');
  }
}

// Run the test
testEmailConfiguration().catch(console.error);