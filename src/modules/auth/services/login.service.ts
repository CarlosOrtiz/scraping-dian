import { Injectable } from "@nestjs/common";
import { Login } from "../dto/login.dto";

const { remote } = require('webdriverio');

@Injectable()
export class LoginService {
  constructor() { }

  async loginPost(body: Login) {
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
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(body.document); // numberDocument
      await credentials[2].setValue(body.password); // password
      await credentials[4].doubleClick();           // buttonLogin
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