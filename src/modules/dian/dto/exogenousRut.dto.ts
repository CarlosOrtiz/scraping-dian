import { IsNotEmpty, IsString } from 'class-validator';

export class ExogenousRut {

  @IsString()
  @IsNotEmpty({ message: 'El campo para el número de documento se encuentra vacio -> document' })
  document: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo de para la contraseña de encuentra vacio -> password' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo uid se encuetra vacio' })
  uid: string;

}
