import { Router, Request, RequestHandler } from 'express';
import * as got from 'got';
import { URL } from 'url';

const DATA_SOURCE = 'https://api.exchangeratesapi.io';

export const exchangeApi: RequestHandler = (req, res, next) => {
  const url = new URL(req.url, DATA_SOURCE);

  got(url.toString())
    .then((response) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(response.statusCode).send(response.body);
    });
}