import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateSalaDto } from './dto/create-sala.dto';
import { Sala } from './entities/sala.entity';

@Injectable()
export class SalasService {
  private readonly logger = new Logger('SalasService');

  constructor(
    @InjectRepository(Sala)
    private readonly salaRepository: Repository<Sala>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createSalaDto: CreateSalaDto) {
    const { users = [], ...salaDetails } = createSalaDto;

    // LOGIC : BUSCAR EL USUARIO POR SU EMAIL
    const user = await this.userRepository.findOne({
      where: { email: salaDetails.host },
    });
    if (!user) {
      throw new NotFoundException(
        `Usuario con email ${salaDetails.host} no encontrado`,
      );
    }

    // LOGIC : CREAR LA SALA Y ASOCIAR EL USUARIO
    const sala = this.salaRepository.create({
      ...salaDetails,
      users: [user],
    });

    try {
      const savedSala = await this.salaRepository.save(sala);

      // Transformar la respuesta para incluir solo los emails de los usuarios
      const response = {
        ...savedSala,
        users: savedSala.users.map((user) => ({ email: user.email })),
      };

      return response;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(nombreSala: string) {
    console.log(nombreSala);
    const sala = await this.salaRepository.findOne({
      where: { nombre: nombreSala },
      relations: ['users'],
    });

    if (!sala) {
      throw new Error('Sala no encontrada');
    }

    const userEmails = sala.users.map((user) => user.email);
    return {
      id: sala.id,
      nombre: sala.nombre,
      host: sala.host,
      diagrama: sala.diagrama,
      userEmails,
    };
  }

  async updateDiagrama(id: number, diagrama: string) {
    await this.salaRepository.update(id, { diagrama });
    return this.salaRepository.findOneBy({ id });
  }

  async updateIntegrantes(nombreSala: string, nuevoIntegrante: string) {
    try {
      const sala = await this.salaRepository.findOne({
        where: { nombre: nombreSala },
        relations: ['users'],
      });

      if (!sala) {
        throw new NotFoundException(
          `Sala con nombre ${nombreSala} no encontrada`,
        );
      }

      const user = await this.userRepository.findOneBy({
        email: nuevoIntegrante,
      });
      if (!user) {
        throw new NotFoundException(
          `Usuario con email ${nuevoIntegrante} no encontrado`,
        );
      }

      // Asegurarse de que la propiedad users esté inicializada
      if (!sala.users) {
        sala.users = [];
      }

      // Verificar si el usuario ya está en la lista de usuarios
      if (
        !sala.users.some((existingUser) => existingUser.email === user.email)
      ) {
        sala.users.push(user);
      }

      const updatedSala = await this.salaRepository.save(sala);

      // Transformar la respuesta para incluir solo los emails de los usuarios
      const response = {
        id: updatedSala.id,
        nombre: updatedSala.nombre,
        host: updatedSala.host,
        diagrama: updatedSala.diagrama,
        userEmails: updatedSala.users.map((user) => user.email),
      };

      return response;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
