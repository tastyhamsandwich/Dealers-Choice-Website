

export default interface LocalPlayerState {
  id         : string;  
  username   : string;
  displayName: string;
  lastAction : string;
  wallet     : number;
  chips      : number;    
  bet        : number;
  folded     : boolean;
  allIn      : boolean;  
  isActive   : boolean;
  canCheck   : boolean;
  canRaise   : boolean;
  canFold    : boolean;
  canCall    : boolean;
  canBet     : boolean;
  cards      : string[];
  hand       : string[];
      
}