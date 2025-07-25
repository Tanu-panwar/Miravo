import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins, change to your frontend URL in production
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users: Map<string, string> = new Map(); // userId -> socketId

  // ✅ Required by OnGatewayInit interface
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.users.set(userId, client.id);
      console.log(`User ${userId} connected with socket id ${client.id}`);
    } else {
      console.log('Connection attempted without userId');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.users.entries()].find(([_, sid]) => sid === client.id)?.[0];
    if (userId) {
      this.users.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  // ✅ Call this method from anywhere to send a notification
  sendNotification(toUserId: string, message: string) {
    const socketId = this.users.get(toUserId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message });
      console.log(`Notification sent to ${toUserId}`);
    } else {
      console.log(`User ${toUserId} is not connected`);
    }
  }
}
