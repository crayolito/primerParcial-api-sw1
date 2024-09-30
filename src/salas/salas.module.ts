import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Sala } from './entities/sala.entity';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';

@Module({
  controllers: [SalasController],
  providers: [SalasService],
  imports: [TypeOrmModule.forFeature([Sala, User])],
})
export class SalasModule {}
