// note/entities/note.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 }) // Adjust the length based on your requirements
  title: string;

  @Column('text')
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  
  @ManyToOne(() => User, user => user.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index() 
  user: User;
}
