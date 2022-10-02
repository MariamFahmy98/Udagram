import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
var validator = require('validator');
var onFinished = require('on-finished');
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  app.get( "/filteredimage", async (request, response) => {
    const { image_url } = request.query;

    if (!image_url) {
      response.status(400).send('No image url provided');
    }

    if (image_url.match(/\.(jpeg|jpg)$/) == null) {
      return response.status(400).send(`image is of wrong format`);
    }
    
    const filtered_image_path = await filterImageFromURL(image_url);

    response.status(200).sendFile(filtered_image_path, async (error) => {
      if (error) {
        console.log(error);
      }

      return await deleteLocalFiles([filtered_image_path]);
    })
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (request, response) => {
    response.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();