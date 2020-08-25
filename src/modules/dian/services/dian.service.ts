import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { DianDTO } from '../dto/dian.dto';

const { remote } = require('webdriverio')
const sync = require('@wdio/sync').default

const path = require('path');
const fs = require('fs');

@Injectable()
export class DianService {

  constructor() { }

  async test() {
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');

    remote({
      runner: 'local',
      outputDir: __dirname,
      logLevel: 'trace',
      acceptInsecureCerts: true,
      capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
          'args': ['--headless', '--silent', '--test-type', '--start-maximized'],
          prefs: {
            'directory_upgrade': true,
            'prompt_for_download': false,
            'download.default_directory': downloadDir
          }
        }
      }]
    }).then((browser) => sync(() => {
      browser.url('https://webdriver.io')
      console.log(browser.getTitle())
      browser.deleteSession()
    }))
  }

  async automationProcessPhaseOne(body: DianDTO) {
    let browser;
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');
    const newPath = downloadDir;
    const oldPath = path.join(__dirname, '../../../../../../');
    console.log(downloadDir);
    console.log(oldPath);

    (async () => {
      browser = await remote({
        logLevel: 'trace',
        capabilities: {
          browserName: 'chrome'
        }
        /* acceptInsecureCerts: true,
        capabilities: [{
          browserName: 'chrome',
          'goog:chromeOptions': {
            'args': ['--headless', '--silent', '--test-type', '--start-maximized'],
            prefs: {
              'directory_upgrade': true,
              'prompt_for_download': false,
              'download.default_directory': downloadDir
            }
          }
        }] */
      });

      await browser.url(`${process.env.DIAN_URL_BASE}`);
      await browser.pause(1000);

      const typedUser = await browser.$('select[name="vistaLogin:frmLogin:selNit"]');
      await typedUser.selectByAttribute('value', '2');

      const numberOrganization = await browser.$('input[name="vistaLogin:frmLogin:txtNit"]');
      await numberOrganization.isDisplayedInViewport();

      const typeDocument = await browser.$('select[name="vistaLogin:frmLogin:selTipoDoc"]');
      await typeDocument.selectByAttribute('value', '13');

      const document = await browser.$('input[name="vistaLogin:frmLogin:txtUsuario"]');
      await document.setValue(body.document);

      const password = await browser.$('input[name="vistaLogin:frmLogin:txtCadena"]');
      await password.setValue(body.password);

      const form = await browser.$('form');
      const button = await form.$('input[name="vistaLogin:frmLogin:_id18"]');
      await button.doubleClick()

      /* Descargar Rut */
      const buttonRut = await browser.$('input[name="vistaDashboard:frmDashboard:btnConsultarRUT"]');
      await buttonRut.doubleClick();

      await browser.pause(3000);

      /* Proceso Para Descargar Informacion Exogena */
      const buttonExogenous = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogena"]');
      await buttonExogenous.doubleClick()

      const acceptButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnBuscar"]');
      await acceptButton.doubleClick()

      const selectYear = await browser.$('table > tbody > tr > td > select');
      await selectYear.selectByAttribute('value', '2019');

      const queryButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]');
      await queryButton.doubleClick()

      /*       let now = moment().format('DDMMYYYYhmmssa');
            const filePath = await path.join(downloadDir, 'Rut' + `${now.toString()}.png`)
            console.log(await filePath); */

      await browser.pause(2000);
      const closeSession = await browser.$('input[name="vistaEncabezado:frmCabeceraUsuario:_id29"]');
      await closeSession.doubleClick();

      await browser.deleteSession();
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })
  }

}