import { Injectable } from '@nestjs/common';
import { ExogenousRut } from '../dto/exogenousRut.dto';
import { RentalDeclaration } from '../dto/rentalDeclaration.dto';

const config = require('../../../../wdio.conf.js')
const { remote } = require('webdriverio');
const path = require('path');

@Injectable()
export class DianService {

  constructor() { }

  async downloadExogenousRut(body: ExogenousRut) {
    let browser;
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');
    const oldPath = path.join(__dirname, '../../../../../../');
    const asd = config;

    if (!body.document) {
      return { error: 'DOCUMENT_IS_NULL', detail: 'El campo de document se encuentra vacio.' }
    } else if (!body.password) {
      return { error: 'PASSWORD_IS_NULL', detail: 'El campo de password se encuentra vacio.' }
    }

    (async () => {
      browser = await remote({
        logLevel: 'error', /* trace | debug | info | warn | error | silent */
        automationProtocol: 'devtools',
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            'args': [/* '--headless', */ '--silent', '--test-type', '--disable-gpu'],
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

      /* Login */
      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (!loginForm.isExisting())
        return { error: 'FORM_NOT_EXITS', detail: 'El formulario del login no existe' }

      const selectAll = await browser.$$('form > table tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');  // typeUser
      await selectAll[1].selectByAttribute('value', '13'); // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(body.document); // numberDocument
      await credentials[2].setValue(body.password); // password
      await credentials[4].doubleClick();           // buttonLogin
      await browser.pause(1000);
      console.log('LOGIN ✅');

      /* Dashboard*/
      const dashboardForm = await browser.$$('form table');

      if (!dashboardForm[17].isExisting())
        return { error: 'ADMIN_FORM_NOT_EXITS', detail: 'El formulario del dashboard no existe' }

      await browser.pause(1000);
      const panels = await browser.$$('form table table table table table tbody > tr > td > input');
      await browser.pause(1000);
      console.log('DASHBOARD ✅');

      const rut = await panels[9].doubleClick(); // I download the RUT
      await browser.pause(1500);
      console.log('DOWNLOAD THE RUT ✅');

      await panels[0].doubleClick(); // open information panel
      await browser.pause(1000);

      console.log('PANEL INFORMATION EXOGENOUS ✅');
      const panelExogenous = await browser.$$('div[class="dr-mpnl-panel rich-mpnl_panel"] table table'); // Panel Information Exogenous

      if (!panelExogenous[4].isExisting())
        return { error: 'ADMIN_FORM_NOT_EXITS', detail: 'El formulario del dashboard no existe' }

      const buttonExogenous = await browser.$$('div[class="dr-mpnl-panel rich-mpnl_panel"] table table input');
      await buttonExogenous[2].doubleClick();
      await browser.pause(1000);

      const selectYear = await browser.$('table > tbody > tr > td > select');
      await selectYear.selectByAttribute('value', '2019');
      await browser.pause(500);

      await browser.pause(500);
      await buttonExogenous[3].doubleClick();

      console.log('CLOSE PANEL INFORMATION EXOGENOUS ✅');
      const closePanel = await panelExogenous[4].$$('tbody td div > img');
      await closePanel[0].doubleClick();
      await browser.pause(1000);

      /* Logout Panel */
      console.log('LOGOUT PANEL ✅');
      if (!dashboardForm[4].isExisting())
        return { error: 'LOGOUT_PANEL_NOT_EXITS', detail: 'El panel de cerrar sesion no existe' }

      await browser.pause(1000);
      await browser.refresh();
      const logoutPanel = await browser.$$('form table input')
      await logoutPanel[3].doubleClick();
      console.log('FINISHED ✅');
      console.log(' ');

      await browser.deleteSession();
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })
  }

  async rentalDeclaration(body: RentalDeclaration) {
    let browser;
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');
    const oldPath = path.join(__dirname, '../../../../../../');
    const asd = config;

    if (!body.document) {
      return { error: 'DOCUMENT_IS_NULL', detail: 'El campo de document se encuentra vacio.' }
    } else if (!body.password) {
      return { error: 'PASSWORD_IS_NULL', detail: 'El campo de password se encuentra vacio.' }
    }

    (async () => {
      browser = await remote({
        logLevel: 'error', /* trace | debug | info | warn | error | silent */
        automationProtocol: 'devtools',
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            'args': [/* '--headless', */ '--silent', '--test-type', '--disable-gpu'],
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

      /* Login */
      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (!loginForm.isExisting())
        return { error: 'FORM_NOT_EXITS', detail: 'El formulario del login no existe' }

      const selectAll = await browser.$$('form > table tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');  // typeUser
      await selectAll[1].selectByAttribute('value', '13'); // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(body.document); // numberDocument
      await credentials[2].setValue(body.password); // password
      await credentials[4].doubleClick();           // buttonLogin
      await browser.pause(1000);
      console.log('LOGIN ✅');

      /* Dashboard*/
      const dashboardForm = await browser.$$('form table');

      if (!dashboardForm[17].isExisting())
        return { error: 'ADMIN_FORM_NOT_EXITS', detail: 'El formulario del dashboard no existe' }

      await browser.pause(1000);
      const panels = await browser.$$('form table table table table table tbody > tr > td > input');
      await browser.pause(1000);
      console.log('DASHBOARD ✅');

      const form210 = await panels[11].doubleClick(); // form 210 open
      await browser.pause(500);

      const bodyForm = await browser.$('div > mat-tab-group > div[class="mat-tab-body-wrapper"] app-formatos > div > div');

      if (!bodyForm.isExisting())
        return await browser.deleteSession();

      await browser.pause(1000);
      const buttonForm = await bodyForm.$$('div img')
      await buttonForm[3].doubleClick(); //Click Form 210
      await browser.pause(1000);

      const formRenta210 = await browser.$('div ingreso > div');
      if (!formRenta210.isExisting())
        return await browser.deleteSession()

      await browser.pause(1000);
      const buttonAll = await formRenta210.$$('div button');
      await buttonAll[0].doubleClick();
      await browser.pause(2000);

      await buttonAll[4].doubleClick();
      await browser.pause(2000);

      //aqui llenar formulario 


      await browser.deleteSession();
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })
  }
}