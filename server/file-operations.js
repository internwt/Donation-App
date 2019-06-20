import { google } from 'googleapis';

const sheets = google.sheets('v4');

export const batchGetValues = (auth, spreadsheetId, _ranges) => {
  return new Promise((resolve, reject) => {

    sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SHEET_ID,
      ranges: 'A2:C1000',
      auth,
      majorDimension: 'ROWS'
    }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.data.valueRanges[0].values);
      }
    });
  });
};

export const appendData = (auth, fields) => {
  const { amount, country, time } = fields;
  return new Promise((resolve, reject) => {
    return sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: process.env.SHEET_ID,
        range: 'Sheet1!A2:C2',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: "RAW",
        resource: {
          values: [[amount, country, time] ]
        }
      }, (err, response) => {
        if (err) {
          reject(err)
        } else {
            resolve({ amount, country, time })
        }
      });
  })
}