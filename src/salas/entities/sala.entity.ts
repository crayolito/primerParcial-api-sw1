import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sala' })
export class Sala {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: false, unique: true })
  nombre: string;

  @Column('text', { nullable: false })
  host: string;

  @Column('text', { nullable: false })
  diagrama: string;

  @ManyToMany(() => User, (user) => user.salas, {
    cascade: true,
  })
  @JoinTable({
    name: 'usuario_sala',
    joinColumn: { name: 'sala_id' },
    inverseJoinColumn: { name: 'usuario_id' },
  })
  users: User[];
}
