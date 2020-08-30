import { Injectable, BadRequestException } from '@nestjs/common';
import { ExogenousRut } from '../dto/exogenousRut.dto';

import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';

const path = require('path');

@Injectable()
export class DianService {

  constructor() { }

  async downloadExogenousRut1(body: ExogenousRut) {
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

      const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
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
      console.log(rut)
      await browser.pause(1500);
      console.log('DOWNLOAD THE RUT ✅');

      await panels[0].doubleClick(); // open information panel
      await browser.pause(1000);

      console.log('PANEL INFORMATION EXOGENOUS ✅');
      const panelExogenous = await browser.$$('div[class="dr-mpnl-panel rich-mpnl_panel"] table table'); // Panel Information Exogenous

      if (!panelExogenous[4].isExisting())
        await browser.deleteSession();

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


  async downloadExogenousRut(document: string, password: string) {
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

    let rut, exogenous;

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

      await browser.pause(1000);
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

        if (dashboardForm[4].isExisting()) {

          await browser.pause(1000);
          await dashboardForm[4].doubleClick(); // Open information panel
          console.log('OPEN PANEL INFORMATION EXOGENOUS ✅');
          await browser.pause(1000);
          exogenous = { url: await dashboardForm[4].getHTML() }

          const acceptButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnBuscar"]');
          await acceptButton.doubleClick()
          await browser.pause(1000);

          const selectYear = await browser.$('table > tbody > tr > td > select');
          await selectYear.selectByAttribute('value', '2019');
          await browser.pause(1000);

          const queryButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]');
          await queryButton.click()
          await browser.pause(1000);

          console.log('CLOSE PANEL INFORMATION EXOGENOUS ✅');
        } else {
          throw new BadRequestException({
            error: 'PANEL_NOT_FOUND',
            detail: 'El panel de información exógena no se encontro.'
          });
        }
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

    return { success: 'OK', rut: rut, exogenous: exogenous }

  }
}