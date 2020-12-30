const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
	constructor(user, url) {
		this.from = "Deal Vend admin <dealvend@email.com>";
		this.user = user;
		this.to = user.email;
		this.url = url;
	}

	createNewTransport = () => {
		let transport;

		if (process.env.NODE_ENV === "production") {
			// use SEND_GRID
			// transport = nodemailer.createTransport({...sendGrid})

			return 1;
		} else {
			transport = nodemailer.createTransport({
				host: process.env.EMAIL_HOST,
				port: process.env.EMAIL_PORT,
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASS,
				},
			});
		}

		return transport;
	};

	async send(template, subject) {
		const html = pug.renderFile(
			`${__dirname}/../view/email/${template}.pug`,
			{
				url: this.url,
				user: this.user,
				subject,
			}
		);

		const text = htmlToText(html);

		const mailOptions = {
			from: this.from,
			to: this.to,
			subject: subject,
			html,
			text,
		};

		const transport = this.createNewTransport();
		await transport.sendMail(mailOptions);
	}

	async resetPassword() {
		await this.send(
			"resetPassword",
			"Password Reset Token (valid for 10mins)"
		);
	}

	async welcome() {
		await this.send("welcome", "Welcome to Deal Vend");
	}
};

