import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sala } from 'src/salas/entities/sala.entity';
import { SalasService } from 'src/salas/salas.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
  providers: [SocketGateway, SocketService, UsersService, SalasService],
  imports: [TypeOrmModule.forFeature([User, Sala])],
})
export class SocketModule {}
