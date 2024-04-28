const express = require("express");
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
const { google } = require('googleapis');
const cors = require('cors'); 
const multer  = require('multer')
const upload=multer();
require('dotenv').config();


const app = express(); 
app.use(cors());
app.use(express.json());
app.use(upload.none());
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
// support encoded bodies
app.use(bodyParser.json()); // parse some custom middleware here if you so choose

// Define a simple route handler for the home page
const Client_id = process.env.CLIENT_ID;

const Client_secret = process.env.CLIENT_SECRET;

const redirect_uri = process.env.REDIRECT_URI;

const Refresh_token = process.env.REFRESH_TOKEN;

const oAuthToken = new google.auth.OAuth2(Client_id, Client_secret, redirect_uri);
oAuthToken.setCredentials({ refresh_token: Refresh_token });

app.post('/contact',async (req,res)=>
{
  
    const {from_email,from_name,subject,message}=req.body;
    const accessToken= await oAuthToken.getAccessToken()
     let transporter = nodeMailer.createTransport({
      service: 'gmail',
       // upgrade later with STARTTLS & ignore self signed certs
      auth: {
          type: "OAUTH2",
          user: '20x31a6608@gmail.com',
          clientId: Client_id,
          clientSecret: Client_secret ,
          refreshToken: Refresh_token,
          accessToken:accessToken,
          
        }
    });
    const mailData={
        from:"Abhi<20x31a6608@gmail.com>",
        to:"abhiramgaddam13@gmail.com", 
        subject:"New Mail from Website ",
        text:`Name : ${from_name} \nMail : ${from_email}\nSubject : ${subject} \nMessage ${message}`,
        html: `<b> Name : ${from_name} </b><br/> <b> Mail : ${from_email}</b> <br/> <b> Subject : ${subject} </b> <br/> <b> message ${message}`
    }
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    
  try {
    const info = await transporter.sendMail(mailData);
    console.log('Email sent:', info.response);
    res.json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'There was an error sending your message.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
      
});