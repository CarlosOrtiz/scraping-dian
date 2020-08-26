import { Length, IsEmail, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class DianDTO {

  @IsString()
  document: string;

  @IsString()
  password: string;

}
