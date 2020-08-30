import { Injectable, BadRequestException } from '@nestjs/common';
import { LoginService } from '../../auth/services/login.service';
import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';

@Injectable()
export class RutService {

  constructor(
    private readonly loginService: LoginService
  ) { }

  async downloadRut(document: string, password: string) {
    let browser;

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

    let rut;

    try {
      browser = await remote(config);

      console.log('URL ✅');
      await browser.url(`${process.env.DIAN_URL_BASE}`);

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (typeof loginForm.isExisting() === 'undefined')
        throw new BadRequestException({
          error: 'FORM_LOGIN_NOT_FOUND',
          detail: 'EL formulario de la pagina del iniciar sesión no se encontro.'
        });

      console.log('LOGIN... ✅');
      const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');   // typeUser
      await selectAll[1].selectByAttribute('value', '13');  // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(document);      // numberDocument
      await credentials[2].setValue(password);      // password
      await credentials[4].doubleClick();           // buttonLogin
      console.log('SUCCESSFULL LOGIN ✅');
      await browser.pause(1000);

      /* Open Dashboard*/
      const dashboardForm = await browser.$$('form table input');
      await browser.pause(500);

      if (dashboardForm[13].isExisting()) {
        console.log('DASHBOARD OPEN ✅');

        await dashboardForm[13].doubleClick(); // download the RUT
        await browser.pause(20000);

        rut = { url: await dashboardForm[13].getHTML() }
        console.log('RUT DOWNLOAD COMPLETED ✅');

        /* Logout Panel */
        console.log('LOGOUT PANEL OPENED ✅')
        await browser.pause(1000);
        await dashboardForm[3].doubleClick(); // button logout
        await browser.pause(500);

        console.log('ENDED PROCESS✅');
        await browser.deleteSession();
      } else {
        throw new BadRequestException({
          error: 'DASHBOARD_NOT_FOUND',
          detail: 'La pagina principal del administrador no se encontro.'
        });
      }

    } catch (err) {
      console.log(err)
      await browser.deleteSession()
      if (err.name == 'Error')
        return { error: 'ERR_INTERNET_DISCONNECTED', detail: 'No tiene internet' }

      return err.response
    }

    return { success: 'OK', data: rut }

  }
}