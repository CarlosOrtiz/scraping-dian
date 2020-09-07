import { InjectRepository } from "@nestjs/typeorm";
import { Logger, BadRequestException } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Repository } from "typeorm";
import { Job } from "bull";
import { remote } from "webdriverio";
import { config } from '../../../../wdio.conf';
import { Audit } from "../../../entities/security/audit.entity";
const NodeGoogleDrive = require('node-google-drive-new');
const credentials = require('../../../../proxy-google-drive.json');
const path = require('path');
const rutica = path.join(__dirname, '../../../../../../../Descargas/');
const fs = require('fs')

@Processor('dian')
export class RutExogenousProcessor {

  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  @Process({ name: 'downloadExogenousRut' })
  async downloadExogenousRut(job: Job<any>) {
    let browser;
    const { document, password } = job.data;

    if (!document)
      throw new BadRequestException({
        error: 'DOCUMENT_IS_NULL',
        detail: 'El campo de document se encuentra vacio.'
      })

    if (!password)
      throw new BadRequestException({
        error: 'PASSWORD_IS_NULL',
        detail: 'El campo de password se encuentra vacio.'
      });

    try {
      browser = await remote(config);
      console.log('URL ✅');
      await browser.throttle('Regular2G');
      await browser.url(`${process.env.DIAN_URL_BASE}`);

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (loginForm.isExisting()) {
        await browser.pause(1000);
        console.log('LOGIN... ✅');
        const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
        if (selectAll[0]) {
          await selectAll[0].selectByAttribute('value', '2');   // typeUser
          await selectAll[1].selectByAttribute('value', '13');  // typeDocument
          await browser.pause(500);
        } else {
          throw new BadRequestException({
            error: 'SELECT_NOT_FOUND',
            detail: 'No se encontro el selector para el tipo de usuario.'
          });
        }
        const credentials = await browser.$$('form > table tbody tr td input');
        if (credentials[1]) {
          await credentials[0].isDisplayed();           // numberDocumentOrganization
          await credentials[1].setValue(document);      // numberDocument
          await credentials[2].setValue(password);      // password
          await credentials[4].doubleClick();           // buttonLogin
          await browser.pause(500);
        } else {
          throw new BadRequestException({
            error: 'INPUT_NOT_FOUND',
            detail: 'No se encontraron las entras para la cédula y la contraseña.'
          });
        }
        console.log('VALIDATE LOGIN ✅');
        await browser.pause(500);
        /* Open Dashboard*/
        const dashboardForm = await browser.$$('form table input');
        await browser.pause(500);

        if (dashboardForm[12]) {
          console.log('SUCCESSFULL LOGIN ✅');
          console.log('DASHBOARD OPEN ✅');

          /* await dashboardForm[12].doubleClick(); */ // download the RUT
          const buttonRut = await browser.$('input[id="vistaDashboard:frmDashboard:btnConsultarRUT"]')
          await buttonRut.doubleClick();// download the RUT
          await browser.pause(10000);

          console.log('RUT DOWNLOAD COMPLETED ✅');

          if (dashboardForm[4].isExisting()) {

            await browser.$('input[id="vistaDashboard:frmDashboard:btnExogena"]').then(item => {
              item.doubleClick();// Open information panel
            });
            await browser.pause(1000);
            /*   await dashboardForm[4].doubleClick();  */// Open information panel
            console.log('OPEN PANEL INFORMATION EXOGENOUS ✅');
            await browser.pause(1000);

            const acceptButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnBuscar"]');
            await acceptButton.doubleClick()
            await browser.pause(1000);

            const selectYear = await browser.$('table > tbody > tr > td > select');
            await selectYear.selectByAttribute('value', '2019');
            await browser.pause(1000);

            const queryButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]');
            await queryButton.click();
            await browser.pause(10000);

            console.log('CLOSE PANEL INFORMATION EXOGENOUS ✅');

            /* Logout Panel */
            console.log('LOGOUT PANEL OPENED ✅')
            if (dashboardForm[3]) {
              await browser.pause(1100);
              await dashboardForm[3].doubleClick(); // button logout
              await browser.pause(500);

              console.log('ENDED PROCESS✅');
              await browser.deleteSession();
            } else {
              throw new BadRequestException({
                error: 'LOGOUT_PANEL_NOT_FOUND',
                detail: 'El panel de cerrar session no se logro encontrar'
              });
            }

          } else {
            throw new BadRequestException({
              error: 'PANEL_INFORMATION_EXOGENOUS_NOT_FOUND',
              detail: 'EL panel de información exógena no se encontro.'
            });
          }
        } else {
          throw new BadRequestException({
            error: 'INCORRECT_CREDENTIALS_LOGIN',
            detail: 'Credenciales incorrectas para iniciar sesión'
          });
        }
      } else {
        throw new BadRequestException({
          error: 'FORM_LOGIN_NOT_FOUND',
          detail: 'EL formulario de la pagina del iniciar sesión no se encontro.'
        });
      }

    } catch (err) {
      console.log(err)
      if (err.response) {
        await this.auditRepository.save({
          name: err.response.error,
          detail: err.response.detail,
          user: document,
          process: 'Descargar Rut y Información Exógena',
          view: await browser.getUrl()
        })

        await browser.deleteSession()
        return err.response
      } else if (err.name == 'stale element reference') {
        await this.auditRepository.save({
          name: 'STALE_ELEMENT_REFERENCE',
          detail: 'referencia de elemento obsoleto',
          user: document,
          process: 'Declaración de Renta-Formulario 210',
          view: await browser.getUrl() || `${process.env.DIAN_URL_BASE}`
        })
        await browser.deleteSession()

        return { error: 'STALE_ELEMENT_REFERENCE', detail: 'referencia de elemento obsoleto' };
      } else if (err.name == 'Error') {
        await browser.deleteSession()

        return { error: 'NOT_INTERNET_CONECTION', detail: 'No hay conexión a internet' };
      } else {
        await browser.deleteSession()
        return err
      }
    }

    const arraDIr = await this.scanDirs(rutica)
    console.log(arraDIr)
    let dirRut = path.join(__dirname, '../../../../../../../Descargas/', '14659862170.pdf')
    let dirExogenous = path.join(__dirname, '../../../../../../../Descargas/', 'reporte.xls')
    const fileRut = await this.UploadFileGDrive(dirRut);
    const fileExogenous = await this.UploadFileGDrive(dirExogenous);
    fs.unlinkSync(dirRut)
    fs.unlinkSync(dirExogenous)
    return {
      success: 'OK',
      url_Rut: `https://drive.google.com/file/d/${fileRut.id}/view?usp=sharing`,
      url_Exogenous: `https://drive.google.com/file/d/${fileExogenous.id}/view?usp=sharing`
    }
  }

  async UploadFileGDrive(file, name?) {
    const YOUR_ROOT_FOLDER = '1D4gwvPNeCW3HFSPeoCTvknZO_4vhrgdc'; // id de mi carpeta de drive
    const PATH_TO_CREDENTIALS = credentials;

    const googleDriveInstance = new NodeGoogleDrive({
      ROOT_FOLDER: YOUR_ROOT_FOLDER
    });

    const creds_service_user = (PATH_TO_CREDENTIALS);

    let gdrive = await googleDriveInstance.useServiceAccountAuth(
      creds_service_user
    );

    let uploadResponse = await googleDriveInstance.create({
      source: file,
      parentFolder: YOUR_ROOT_FOLDER,
      name: name,
    }).catch(e => console.error(e));

    return uploadResponse
  }

  async scanDirs(dir) {
    return await fs.readdir(dir, (err, files) => {
      var r = [];
      files.forEach((file) => {
        s(file);
        function s(file) {
          fs.stat(dir + '/' + file, (err, stat) => {
            if (err) { console.error(err); return; }
            else if (stat.isFile()) r.push({ f: file, type: 'file' });
            else r.push(0);
            if (r.length == files.length) {
              r.filter((m) => { return m; });
              console.log(r);
            }
          });
        }
      });
    });
  }

}