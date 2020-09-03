<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Instalación

#### 1.Tener el navegador Google Chrome instalado, si no cuenta con este, el siguente link es para descargarlo
```bash
https://www.google.com/intl/es/chrome/
```
#### 2.Tener instalado NodeJs, el siguente link es directo para descargarlo
```bash
#Windows
https://nodejs.org/dist/v12.18.3/node-v12.18.3-x86.msi

#MacOS
https://nodejs.org/dist/v12.18.3/node-v12.18.3.pkg
```
#### 3. Abril la terminal ejecutar el siguente comando en el directorio del repositorio

```bash
npm run start:dev
```
## Crear un archivo con la siguente extención .env para las varibles de entorno
#### .env

En este archivo se agregan constantes globales y accesibles.

| Constante                | Tipo    | Valor     
| ------------------------ | --------|  ---------------------------------------------------------------------------------------
| *NODE_ENV*	 	       | `String`  | local
| *APP_URL_PREFIX*	 	 | `String`  | v1
| *PORT*	 	           | `String`  | 4200
| *JWT_KEY*	 	         | `String`  | mega_password
| *JWT_EXPIRE*	 	     | `String`  | 365d
| *GCS_BUCKET*	 	     | `String`  | example-template
| *DB_TYPE*	 	         | `String`  | postgres
| *DB_HOST*	 	         | `String`  | ec2-3-217-87-84.compute-1.amazonaws.com
| *DB_PORT*	 	         | `String`  | 5432
| *DB_DATABASE*	 	     | `String`  | d2or6bllh2jrl1
| *DB_USERNAME*	 	     | `String`  | zhkazeqqdlvxcm
| *DB_PASSWORD*	 	     | `String`  | 56571f44b375abf3924765d03d6191f990c90c4d4afe16fc3dd2dbcfeeb0c2f1
| *APP_HOST_SERVER*	 	 | `String`  | http://localhost
| *APP_HOST_CLIENT*    | `String`  | http://localhost:3010
| *SENDGRID_API_KEY*   | `String`  | api_key
| *DIAN_USER*          | `String`  | 
| *DIAN_PASSWORD*      | `String`  | 
| *DIAN_URL_BASE*      | `String`  | https://muisca.dian.gov.co/WebArquitectura/DefLoginOld.faces
| *REDIS_HOST*         | `String`  | redis-17931.c52.us-east-1-4.ec2.cloud.redislabs.com
| *REDIS_PORT*         | `String`  | 17931
| *REDIS_PASSWORD*     | `String`  | nAs6E9hmkY2Eo6V6Jlu0fDf5BEMQxAPA

## Ejemplo práctico de como debería de quedar la primera varible de entorno

```bash
NODE_ENV=local
APP_URL_PREFIX=v1
PORT=4200

JWT_KEY=mega_password
JWT_EXPIRE=365d

GCS_BUCKET= example-template

DB_TYPE=postgres
DB_HOST=ec2-3-217-87-84.compute-1.amazonaws.com
DB_PORT=5432
DB_DATABASE=d2or6bllh2jrl1
DB_USERNAME=zhkazeqqdlvxcm
DB_PASSWORD=56571f44b375abf3924765d03d6191f990c90c4d4afe16fc3dd2dbcfeeb0c2f1

APP_HOST_SERVER=http://localhost
APP_HOST_CLIENT=http://localhost:3010

SENDGRID_API_KEY=api_key

DIAN_USER=1117552597
DIAN_PASSWORD=Caol9901
DIAN_URL_BASE=https://muisca.dian.gov.co/WebArquitectura/DefLoginOld.faces

REDIS_HOST=redis-17931.c52.us-east-1-4.ec2.cloud.redislabs.com
REDIS_PORT=17931
REDIS_PASSWORD=nAs6E9hmkY2Eo6V6Jlu0fDf5BEMQxAPA
```

## License

  Nest is [MIT licensed](LICENSE).
