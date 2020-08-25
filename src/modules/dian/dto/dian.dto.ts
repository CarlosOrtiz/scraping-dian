import { Length, IsEmail, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class DianDTO {

  @IsNumber()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsNotEmpty()
  password: string;

}
