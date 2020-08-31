import { Injectable, BadRequestException } from '@nestjs/common';
import { ExogenousRut } from '../dto/exogenousRut.dto';

import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from '../../../entities/security/audit.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const path = require('path');

@Injectable()
export class DianService {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    @InjectQueue('dian') private dianQueue: Queue
  ) { }

  async downloadExogenousRutVersionOld(document: string, password: string) {
    let browser;
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');
    const oldPath = path.join(__dirname, '../../../../../../');
    const asd = config;

    if (!document) {
      return { error: 'DOCUMENT_IS_NULL', detail: 'El campo de document se encuentra vacio.' }
    } else if (!password) {
      return { error: 'PASSWORD_IS_NULL', detail: 'El campo de password se encuentra vacio.' }
    }

    const response = (async () => {
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
      await credentials[1].setValue(document); // numberDocument
      await credentials[2].setValue(password); // password
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

    await this.dianQueue.add('downloadRutExogenous', response);

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

      if (loginForm.isExisting()) {
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
        console.log('VALIDATE LOGIN ✅');
        await browser.pause(1000);
        /* Open Dashboard*/
        const dashboardForm = await browser.$$('form table input');
        await browser.pause(500);

        if (dashboardForm[13]) {
          console.log('SUCCESSFULL LOGIN ✅');
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

            /* Logout Panel */
            console.log('LOGOUT PANEL OPENED ✅')
            if (dashboardForm[3]) {
              await browser.pause(1000);
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
      } else {
        await browser.deleteSession()
        return err
      }
    }

    return { success: 'OK', rut: rut, exogenous: exogenous }
  }
}