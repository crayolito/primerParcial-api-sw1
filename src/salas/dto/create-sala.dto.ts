import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateSalaDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @IsString({ message: 'El host debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El host no puede estar vacío' })
  host: string;

  @IsString({ message: 'El diagrama debe ser un número' })
  @IsNotEmpty({ message: 'El diagrama no puede estar vacío' })
  diagrama: string;

  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  users?: User[];
}
