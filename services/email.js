const nodemailer = require("nodemailer");

exports.sendEmail = async (options = {}) => {
	const transport = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: "dealvend@gmail.com",
		to: options.to,
		subject: options.subject,
		text: options.message,
	};

	await transport.sendMail(mailOptions);
};

