require('dotenv').config()

// de twilio whatsapp

const accountSid = process.env.TWILIO_ACCOUNT_SID 
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilio = require('twilio')
const client = new twilio(accountSid, authToken)

// de gridEmail

const sgMail = require('@sendgrid/mail')
const gridToken = process.env.SENDGRID_API_KEY

module.exports = {
    whatspapp: async( payload ) => {

        const twilioMessage = await client.messages 
        .create({ 
            body: payload, 
            from: 'whatsapp:+14155238886',       
            to: 'whatsapp:+5215524097656'
        }) 
        .then(message => message.sid )

        if(twilioMessage){
            return twilioMessage
        }
    },
    email: async( payload ) => {
        // TODO: cambiar el correo de contacto y se puede programar un correo que una vez que el cliente manda mensaje, se le envie una respuesta de esta accion


    sgMail.setApiKey(gridToken)
        const msg = {
          to: 'cchavez@grupointecsa.com', // Change to your recipient
          from: 'cchavez@grupointecsa.com', // Change to your verified sender
        subject: 'mensaje de grupointecsa.com',
        text: payload
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }

    const send = await sgMail
        .send(msg)
        .then(() => true)
        .catch(() => {
            throw new Error('Email error send')
        })

        return send 
        
    }
}

