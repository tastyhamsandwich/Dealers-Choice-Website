// src/server.ts
import http from 'http'
import express from 'express'
import cors from 'cors';
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { PokerRoom } from './rooms/PokerRoom';

const app = express()

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({ 
  transport: new WebSocketTransport({
    server,
  }),
  devMode: true
});

gameServer.define('poker', PokerRoom );

server.listen(2567, () => {
    console.log('Server is running on http://localhost:2567')
})
