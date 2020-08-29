import { Length, IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class Login {

  @IsString()
  @IsNotEmpty()
  document: string;

  @Length(3, 30)
  @IsNotEmpty()
  password: string;

}
