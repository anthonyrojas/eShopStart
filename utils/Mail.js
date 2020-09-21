'use strict';
const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const hbs = require('handlebars');
const db = require('../models');
const MailTemplate = db.MailTemplate;

exports.sendOrderEmail = async(data) => {
    try{
        const source = await MailTemplate.findOne({
            where: {
                category: 'Orders',
                primaryTemplate: true
            },
            raw: true
        });
        const template = hbs.compile(source.content.toString());
        const output = template(data);
        if(process.env.USE_SES === 'true'){
            //send email via aws ses
            let params = {
                Destination: {
                    ToAddresses: [
                        data.user.email
                    ]
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: output
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: `Order Confirmation: ${data.id}`
                    }
                },
                Source: `Orders <${process.env.ORDERS_EMAIL}>`
            }
            AWS.config.update({region: process.env.AWS_REGION});
            const ses = new AWS.SES({apiVersion: '2010-12-01'});
            await ses.sendEmail(params).promise();
            return true;
        }else if(process.env.USE_SENDGRID === 'true'){
            //send email via sendgrid
            sgMail.setApiKey(process.env.SENGRID_KEY);
            const msg = {
                to: data.user.email,
                from: process.env.ORDERS_EMAIL,
                subject: `Order Confirmation: ${data.id}`,
                html: output
            }
            sgMail.send(output);
            return true;
        }else if(process.env.USE_SMTP === 'true'){
            //send email via smtp
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_USE_TLS === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            });
            await transporter.sendMail({
                from: process.env.ORDERS_EMAIL,
                to: data.user.email,
                subject: `Order Confirmation: ${data.id}`,
                html: output
            });
            return true;
        }
        //there is no mail delivery configured
        return false;
    }catch(e){
        console.error(e.message);
        return false;
    }
}