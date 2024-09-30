import { NotFoundException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateSalaDto } from 'src/salas/dto/create-sala.dto';
import { SalasService } from 'src/salas/salas.service';
import { UsersService } from 'src/users/users.service';
import {
  DataChangedDiagramaFrontendDto,
  DataInitSalaFrontendDto,
} from './dto/dataFrontend.dto';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class SocketGateway {
  constructor(
    private readonly socketService: SocketService,
    private readonly salasService: SalasService,
    private readonly usersService: UsersService,
  ) {}
  @WebSocketServer() wsServer: Server;

  handleConnection(client: Socket) {
    console.log('Cliente conectado');
  }

  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado');
  }

  @SubscribeMessage('nueva-reunion')
  async onNuevaReunion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DataInitSalaFrontendDto,
  ) {
    try {
      const { id: idUser, nombre: nombreSala } = payload[0];
      console.log(nombreSala);
      const user = await this.usersService.findOne(idUser);
      let createSalaDto: CreateSalaDto = {
        nombre: nombreSala,
        host: user.email,
        diagrama: '',
        users: [user],
      };
      const sala = await this.salasService.create(createSalaDto);
      // LOGIC : Aquí puedes continuar con la lógica utilizando user y nombreSala
      console.log(sala.nombre);
      client.join(nombreSala);
      client.emit('nueva-reunion', sala);
      // LOGIC : UNIRNO A LA SALA
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit('nueva-reunion', { message: 'Usuario no encontrado' });
      } else {
        client.emit('nueva-reunion', { message: 'Error interno del servidor' });
      }
    }
  }

  @SubscribeMessage('unirse-reunion')
  async onUnirseReunion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DataInitSalaFrontendDto,
  ) {
    try {
      const { id: idUser, nombre: nombreSala } = payload[0];
      console.log(nombreSala);
      const user = await this.usersService.findOne(idUser);
      const sala = await this.salasService.findOne(nombreSala);
      const updateSala = await this.salasService.updateIntegrantes(
        sala.nombre,
        user.email,
      );
      // LOGIC : Aquí puedes continuar con la lógica utilizando user y sala
      console.log(updateSala.nombre);
      client.join(nombreSala);
      client.emit('unirse-reunion', updateSala);
      // LOGIC : UNIRNO A LA SALA
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit('unirse-reunion', {
          message: 'Error en el proceso de unirse a reunion',
        });
      } else {
        client.emit('unirse-reunion', {
          message: 'Error interno del servidor',
        });
      }
    }
  }

  @SubscribeMessage('changed-diagrama')
  async onChangedDiagrama(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DataChangedDiagramaFrontendDto,
  ) {
    try {
      const { id: idSala, diagrama } = payload[0];
      console.log(idSala);
      const updateSala = await this.salasService.updateDiagrama(
        idSala,
        diagrama,
      );
      // LOGIC : Aquí puedes continuar con la lógica utilizando updateSala
      console.log(updateSala.nombre);
      client.broadcast
        .to(updateSala.nombre)
        .emit('changed-diagrama', updateSala.diagrama);
    } catch (error) {
      console.log(error);
    }
  }
}
