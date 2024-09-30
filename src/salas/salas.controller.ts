import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSalaDto } from './dto/create-sala.dto';
import { SalasService } from './salas.service';

@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post()
  @HttpCode(200)
  create(@Body() createSalaDto: CreateSalaDto) {
    return this.salasService.create(createSalaDto);
  }

  @Get(':nombreSala')
  findOne(@Param('nombreSala') nombreSala: string) {
    console.log('hola mundo');
    console.log(nombreSala);
    return this.salasService.findOne(nombreSala);
  }

  @Patch('/diagrama/:id')
  updateDiagrama(@Param('id') id: string, @Body('diagrama') diagrama: string) {
    return this.salasService.updateDiagrama(+id, diagrama);
  }

  @Patch('/integrantes/:nombreSala')
  updateIntegrantes(
    @Param('nombreSala') nombreSala: string,
    @Body('newIntegrante') newIntegrante: string,
  ) {
    return this.salasService.updateIntegrantes(nombreSala, newIntegrante);
  }
}
