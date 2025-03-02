// src/server.ts
import http from 'http'
import express from 'express'
import cors from 'cors';
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor';

import { PokerRoom } from './rooms/PokerRoom';

const app = express()

app.use(cors());
app.use(express.json);

const server = http.createServer(app);
const gameServer = new Server({ 
  server, 
})

gameServer.define('poker', PokerRoom );

server.listen(2567, () => {
    console.log('Server is running on http://localhost:2567')
})
