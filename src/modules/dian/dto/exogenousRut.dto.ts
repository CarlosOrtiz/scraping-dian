import { IsString } from 'class-validator';

export class ExogenousRut {

  @IsString()
  document: string;

  @IsString()
  password: string;

  @IsString()
  uid: string;

}
