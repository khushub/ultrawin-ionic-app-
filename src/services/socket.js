import { io } from 'socket.io-client';
const USER_SOCKET = import.meta.env.VITE_SOCKET_URL;


export const Socket = io(USER_SOCKET, {
  transports: ['polling', 'websocket'], 
  reconnection: true,             
  reconnectionAttempts: Infinity, 
  reconnectionDelay: 1000,        
  reconnectionDelayMax: 5000,     
  randomizationFactor: 0.5        
});


Socket.on("connect", () => {
  console.log("Connected with ID:", Socket.id);
  
  if (Socket.io.engine.transport.name === 'polling') {
    console.log('Currently connected via polling');
  }
});

Socket.on("connect_error", (err) => {
  console.log("Connection failed, retrying automatically...", err.message);
  console.log('err: ', err);
});