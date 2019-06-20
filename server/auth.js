import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
// import credentials from './credentials.json';

let SCOPES = ['https://www.googleapis.com/auth/spreadsheets']; 
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.donation-credential/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.donation-page.json';

class Authenticate {

  authorize() {
    var clientSecret = process.env.CLIENT_SECRET;
    var clientId = process.env.CLIENT_ID;
    var redirectUrl = process.env.REDIRECT_URL;
    // var auth = new GoogleAuth();
    var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
 
    return new Promise((resolve, reject)=>{
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          this.getNewToken(oauth2Client).then((oauth2ClientNew)=>{
            resolve(oauth2ClientNew);
          }, (err)=>{
            reject(err);
          });
        } else {
          oauth2Client.credentials = JSON.parse(token);
          resolve(oauth2Client);
        }
      });
    });
  }

  getNewToken(oauth2Client, callback) {
    return new Promise((resolve, reject)=>{
      if (process.env.REFRESH_TOKEN) {
        oauth2Client.credentials = {
          "access_token": process.env.ACCESS_TOKEN,
          "token_type":"Bearer",
          "refresh_token":process.env.REFRESH_TOKEN,
          "expiry_date":1540531084537}
        resolve(oauth2Client);
      } else {
        var authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: \n ', authUrl);
        var rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question('\n\nEnter the code from that page here: ', (code) => {
          rl.close();
          oauth2Client.getToken(code, (err, token) => {
            if (err) {
              console.log('Error while trying to retrieve access token', err);
              reject();
            }
            oauth2Client.credentials = token;
            this.storeToken(token);
            resolve(oauth2Client);
          });
        });
      }
      
    });
  }

  storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EXIST') { // eslint-disable-line
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
  }
}


export default new Authenticate();
