import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async confirmLogin(userVerifi: CreateUserDto) {
    try {
      return await this.userRepository.findOneBy({
        email: userVerifi.email,
        password: userVerifi.password,
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.userRepository.save(createUserDto);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        console.log('aqui');
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.userRepository.update(id, updateUserDto);
      return await this.userRepository.findOneBy({ id });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      await this.userRepository.delete(id);
      return {
        message: 'La eliminación del usuario fue exitosa',
        user: user,
      };
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

  async downloadSpringBootProject(): Promise<string> {
    const url =
      'https://start.spring.io/starter.zip?type=maven-project&language=java&platformVersion=3.3.4&packaging=jar&jvmVersion=17&groupId=com.nombreproyecto&artifactId=proyecto&name=proyecto&description=PROYECTO%20UML%20FICCT&packageName=com.nombreproyecto.proyecto&dependencies=lombok,web,data-jpa,postgresql';
    const filePath = path.resolve(__dirname, '..', 'downloads', 'proyecto.zip');

    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      // Crear el directorio de descargas si no existe
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Guardar el archivo en el sistema de archivos
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al descargar el proyecto Spring Boot',
      );
    }
  }
}
