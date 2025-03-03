import { Client } from 'colyseus.js';
import 'phaser';
import LocalGameState from '../../server/lib/LocalGameState';

export default class Server {

  client: Client;
  private events: Phaser.Events.EventEmitter;

  constructor(protocol = 'ws://',host = 'localhost', port = 2567) {
    this.client = new Client(`${protocol}${host}:${port}`);
    this.events = new Phaser.Events.EventEmitter();
    console.log(`Server started on ${protocol}${host}, port ${port}.\n${this.client}`);
  }

  async join() {
    const room = await this.client.joinOrCreate<LocalGameState>('poker');
    console.log(`Joined room 'poker'!\n${room}`);

    room.onStateChange.once(state => {
      console.log(state)
      this.events.emit('once-state-changed', state);
    })
  }

  onceStateChanged(cb: (state: LocalGameState) => void, context?: any) {
    this.events.once('once-state-changed', cb, context);
  }
}
