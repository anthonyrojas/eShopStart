'use strict';
const AWS = require('aws-sdk');
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
                Source: process.env.ORDERS_EMAIL
            }
            AWS.config.update({region: process.env.AWS_REGION});
            const ses = new AWS.SES({apiVersion: '2010-12-01'});
            await ses.sendEmail(params).promise();
            return true;
        }else if(process.env.USE_SENDGRID === 'true'){
            //send email via sendgrid
        }else if(process.env.USE_SMTP === 'true'){
            //send email via smtp
        }
        //there is no mail delivery configured
        return false
    }catch(e){
        console.error(e.message);
        return false;
    }
}