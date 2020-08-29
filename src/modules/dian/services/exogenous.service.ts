import { Injectable } from '@nestjs/common';
import { ExogenousRut } from '../dto/exogenousRut.dto';
import { LoginService } from '../../auth/services/login.service';

const config = require('../../../../wdio.conf.js')
const { remote } = require('webdriverio');
const path = require('path');

@Injectable()
export class ExogenousService {

  constructor(
    private readonly loginService: LoginService
  ) { }

  async downloadExogenous(document, password) {
    let browser;
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');
    const oldPath = path.join(__dirname, '../../../../../../');
    const asd = config;

    if (!document) {
      return { error: 'DOCUMENT_IS_NULL', detail: 'El campo de document se encuentra vacio.' }
    } else if (!password) {
      return { error: 'PASSWORD_IS_NULL', detail: 'El campo de password se encuentra vacio.' }
    }

    const t = (async () => {
      browser = await remote({
        logLevel: 'trace', /* trace | debug | info | warn | error | silent */
        automationProtocol: 'devtools',
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            'args': [/* '--headless', */ '--silent', '--test-type', '--disable-gpu', '--window-size=1200,700'],
            prefs: {
              'directory_upgrade': true,
              'prompt_for_download': false,
              'download.default_directory': downloadDir
            }
          }
        }
      });

      await browser.url(`${process.env.DIAN_URL_BASE}`);
      console.log('URL ✅');

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (!loginForm.isExisting())
        return await browser.deleteSession();

      console.log('LOGIN... ✅');
      await browser.pause(1000);
      const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');   // typeUser
      await selectAll[1].selectByAttribute('value', '13');  // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(document);      // numberDocument
      await credentials[2].setValue(password);      // password
      await credentials[4].doubleClick();           // buttonLogin
      console.log('FINISHED LOGIN ✅');
      await browser.pause(1000);

      /* Dashboard*/
      const dashboardForm = await browser.$$('form table');

      /* if (!dashboardForm[14].isExisting())
        return await browser.deleteSession(); */

      await browser.pause(1000);
      const panels = await dashboardForm[14].$$('table table table table tbody > tr > td > input');
      await browser.pause(1000);
      console.log('DASHBOARD ✅');

      console.log('OPEN PANEL INFORMATION EXOGENOUS ✅');
      await panels[0].click(); // open information panel
      await browser.pause(1000);

      /*       const buttonExogenous = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogena"]');
            await buttonExogenous.doubleClick() */

      const acceptButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnBuscar"]');
      await acceptButton.doubleClick()
      await browser.pause(1000);

      const selectYear = await browser.$('table > tbody > tr > td > select');
      await selectYear.selectByAttribute('value', '2019');
      await browser.pause(1000);

      const queryButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]');
      await queryButton.click()
      await browser.pause(1000);

      /*       const buttonExogenous = await browser.$('input');
            await buttonExogenous.doubleClick();
            await browser.pause(1000);
      
            const selectYear = await browser.$('select');
            await selectYear[0].selectByAttribute('value', '2019');
            await browser.pause(500);
      
            await browser.pause(500);
            await buttonExogenous[1].doubleClick(); */

      console.log('CLOSE PANEL INFORMATION EXOGENOUS ✅');
      /*      const closePanel = await browser.$$('tbody td div > img');
           await closePanel[0].doubleClick();
           await browser.pause(1000); */

      await browser.dismissAlert()

      /* Logout Panel */
      console.log('LOGOUT PANEL ✅');
      /*     if (!dashboardForm[4].isExisting())
            return await browser.deleteSession(); */

      await browser.refresh();
      await browser.pause(500);

      const logoutPanel = await browser.$$('form table input')
      await logoutPanel[3].isClickable();
      await browser.pause(500);

      /*       const closeSession = await browser.$('input[name="vistaEncabezado:frmCabeceraUsuario:_id29"]');
            await closeSession.doubleClick(); */
      console.log('FINISHED ✅');
      console.log(' ');

      await browser.deleteSession();
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })

    return t
  }

}