import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import authentication from "./auth";
import { batchGetValues, appendData } from './file-operations';

dotenv.config();


const server = express();
const port = process.env.PORT || 3012;

// Allow Cross-Origin
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));


const getCountry = () => {
  return axios.get('https://api.ipdata.co?api-key=6336d98c5ff44def6611cdd2f020672fe09e7d5a0e781ca28cce305a')
  .then((resp) => {
    return resp.data.country_name;
  })
}

server.get('/fetch', (req, res) => {
  return authentication.authorize().then((auth) => {
    return batchGetValues(auth)
    .then((values) => {
      const val = JSON.parse(JSON.stringify(values))
      return res.status(200).json({
        values: val,
        success: true,
      });
    });
  });
});

server.post('/update', async (req, res) => {
  const country_name = await getCountry();
  req.body.country = country_name;
  return authentication.authorize().then((auth) => {
    return appendData(auth, req.body)
    .then((values) => {
      res.status(201).json({
        success: true,
        message: 'Sheet updated successfully!',
      });
    });
  });
});

server.listen(port, () => {
  console.log('listening.....')
});
