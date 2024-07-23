const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'huymasterpiece@gmail.com',
        pass: 'egsl weqx svkh ukue'
    } 
});

exports.getRequestFilePage = (req, res) => {
    res.render('requestFile', { title: 'Request File' });
};

exports.sendRequestFile = async (req, res) => {
    const { title, description, folder, emails, setDeadline, deadlineDate, deadlineTime } = req.body;

    // Create folder (in the future, you can replace this with actual folder creation logic)
    const folderName = title;

    // Send email
    const mailOptions = {
        from: 'huymasterpiece@gmail.com',
        to: emails,
        subject: `File Request: ${title}`,
        text: `You have received a new file request.\n\nTitle: ${title}\nDescription: ${description}\nDeadline: ${deadlineDate} ${deadlineTime}\n\nPlease upload the requested files using the following link: http://yourwebsite.com/request-file/upload`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render('requestFile', { title: 'Request File', message: 'File request sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.render('requestFile', { title: 'Request File', message: 'Failed to send file request' });
    }
    
};