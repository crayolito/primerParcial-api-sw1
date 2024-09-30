import { Sala } from 'src/salas/entities/sala.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { unique: true, nullable: false })
  email: string;

  @Column('text', { nullable: false })
  password: string;

  @ManyToMany(() => Sala, (sala) => sala.users)
  salas: Sala[];
}
