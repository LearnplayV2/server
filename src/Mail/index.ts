import nodemailer from 'nodemailer';

interface ISendEmail {
    to: string;
    subject: string;
    body: any;
}

class Mail {
    private ssl = process.env.SMTP_SSL;
    private tsl = process.env.SMTP_TSL;
    private host = process.env.SMTP_HOST;
    private email = process.env.SMTP_EMAIL;
    private password = process.env.SMTP_PASS;

    private transporter;
    
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: this.host,
            port: parseInt(this?.tsl ?? '465'),
            secure: true,
            auth: {
                user: this.email,
                pass: this.password
            }
        });
    }

    public send(props: ISendEmail) {
        const { to, subject, body } = props;
        const mailOptions = {
            from: this.email,
            to,
            subject,
            html: body
        };

        this.transporter.sendMail(mailOptions, (err, res) => {
            if(err) {
                console.error(err);
            } else {
                console.log(res);
                console.log('E-mail enviado com sucesso!');
            }
        });
    }
    
}

export default Mail;