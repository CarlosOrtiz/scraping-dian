import { Injectable } from '@nestjs/common';
import { LoginService } from '../../auth/services/login.service';
import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';

@Injectable()
export class RutService {

  constructor(
    private readonly loginService: LoginService
  ) { }

  async downloadRut(document, password) {
    let browser;

    if (!document) {
      return { error: 'DOCUMENT_IS_NULL', detail: 'El campo de document se encuentra vacio.' }
    } else if (!password) {
      return { error: 'PASSWORD_IS_NULL', detail: 'El campo de password se encuentra vacio.' }
    }

    (async () => {
      browser = await remote(config);

      await browser.url(`${process.env.DIAN_URL_BASE}`);
      console.log('URL ✅');

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (!loginForm.isExisting())
        return await browser.deleteSession();

      console.log('LOGIN... ✅');
      const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');   // typeUser
      await selectAll[1].selectByAttribute('value', '13');  // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(document); // numberDocument
      await credentials[2].setValue(password); // password
      await credentials[4].doubleClick();           // buttonLogin
      console.log('FINISHED LOGIN ✅');
      await browser.pause(1000);

      /* Dashboard*/
      const dashboardForm = await browser.$$('form table');

      if (!dashboardForm[17].isExisting())
        return await browser.deleteSession();

      await browser.pause(1000);
      const panels = await browser.$$('form table table table table table tbody > tr > td > input');
      await browser.pause(1000);
      console.log('DASHBOARD ✅');

      await panels[9].doubleClick(); // I download the RUT
      await browser.pause(1200);
      console.log('DOWNLOAD THE RUT ✅');

      /* Logout Panel */
      console.log('LOGOUT PANEL ✅')
      await browser.refresh();
      await browser.pause(1000);
      const logoutPanel = await browser.$$('form table input')
      await logoutPanel[3].doubleClick();
      await browser.pause(500);
      console.log('FINISHED ✅');
      console.log(' ');

      await browser.deleteSession();
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })
  }

}