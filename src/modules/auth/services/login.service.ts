import { Injectable, BadRequestException } from "@nestjs/common";
import { Login } from "../dto/login.dto";
import { remote } from 'webdriverio';
import { config } from '../../../../wdio.conf';
import { Audit } from '../../../entities/security/audit.entity';
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  async loginPost(body: Login) {
    let browser;

    if (!body.document)
      throw new BadRequestException({
        error: 'DOCUMENT_IS_NULL',
        detail: 'El campo de document se encuentra vacio.'
      });

    if (!body.password)
      throw new BadRequestException({
        error: 'PASSWORD_IS_NULL',
        detail: 'El campo de password se encuentra vacio.'
      });

    try {
      browser = await remote(config);

      console.log('URL ✅');
      await browser.url(`${process.env.DIAN_URL_BASE}`);

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (loginForm.isExisting()) {
        console.log('LOGIN... ✅');
        const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
        await selectAll[0].selectByAttribute('value', '2');  // typeUser
        await selectAll[1].selectByAttribute('value', '13'); // typeDocument
        await browser.pause(1000);

        const credentials = await browser.$$('form > table tbody tr td input');
        await credentials[0].isDisplayed();           // numberDocumentOrganization
        await credentials[1].setValue(body.document); // numberDocument
        await credentials[2].setValue(body.password); // password
        await credentials[4].doubleClick();           // buttonLogin
        console.log('VALIDATE LOGIN ✅');

        const dashboardForm = await browser.$$('form table');
        if (dashboardForm[9]) {
          console.log('SUCCESSFULL LOGIN ✅');
          console.log('DASHBOARD FIND ✅');
          await browser.pause(500);
          await browser.deleteSession();
        } else {
          throw new BadRequestException({
            error: 'INCORRECT_CREDENTIALS_LOGIN',
            detail: 'Credenciales incorrectas para iniciar sesión'
          });
        }
      } else {
        throw new BadRequestException({
          error: 'FORM_LOGIN_NOT_FOUND',
          detail: 'EL formulario de la pagina iniciar sesión no se encontro.'
        });
      }
    } catch (err) {
      console.log(err)
      if (err.response) {
        await this.auditRepository.save({
          name: err.response.error,
          detail: err.response.detail,
          user: body.document,
          process: 'Iniciar Sesión',
          view: await browser.getUrl()
        });

        await browser.deleteSession()
        return err.response;
      } else {
        await browser.deleteSession()
        return err;
      }
    }
    return { success: 'OK' }
  }


  async loginGet(document, password) {
    let browser;
    (async () => {
      browser = await remote({
        logLevel: 'error',
        automationProtocol: 'devtools',
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            'args': ['--headless', '--silent'],
          }
        }
      });

      await browser.url(`${process.env.DIAN_URL_BASE}`);
      console.log('URL ✅');

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (!loginForm.isExisting())
        return { error: 'FORM_NOT_EXITS', detail: 'El formulario del login no existe' }

      console.log('LOGIN... ✅');
      const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');  // typeUser
      await selectAll[1].selectByAttribute('value', '13'); // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();      // numberDocumentOrganization
      await credentials[1].setValue(document); // numberDocument
      await credentials[2].setValue(password); // password
      await credentials[4].doubleClick();      // buttonLogin
      console.log('FINISHED LOGIN ✅');

      const dashboardForm = await browser.$$('form table');
      console.log('DASHBOARD FIND ✅');
      console.log(await dashboardForm[17].isExisting())

      await browser.pause(1000);
      await browser.deleteSession();
      return { success: 'OK' }
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })
  }
}