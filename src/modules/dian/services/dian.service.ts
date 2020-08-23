import { Injectable } from '@nestjs/common';
import moment = require('moment');

const { remote } = require('webdriverio');
const path = require('path')
const fs = require('fs')
@Injectable()
export class DianService {

  constructor() { }

  async login() {
    let browser;
    const downloadDir = path.join(__dirname, '../../../../src/modules/dian/files');
    console.log(downloadDir);

    (async () => {
      browser = await remote({
        logLevel: 'info',
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
      });

      await browser.url(`${process.env.DIAN_URL_BASE}`)

      const typedUser = await browser.$('select[name="vistaLogin:frmLogin:selNit"]');
      await typedUser.selectByAttribute('value', '2');

      const numberOrganization = await browser.$('input[name="vistaLogin:frmLogin:txtNit"]');
      await numberOrganization.isDisplayedInViewport();

      const typeDocument = await browser.$('select[name="vistaLogin:frmLogin:selTipoDoc"]');
      await typeDocument.selectByAttribute('value', '13');
      /* await typeDocument.selectByIndex(2); */

      const document = await browser.$('input[name="vistaLogin:frmLogin:txtUsuario"]');
      await document.setValue(`${process.env.DIAN_USER}`);

      const password = await browser.$('input[name="vistaLogin:frmLogin:txtCadena"]');
      await password.setValue(`${process.env.DIAN_PASSWORD}`);

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

      const panelSeleccion = await browser.$('table[id="vistaDashboard:frmDashboard:panelSeleccion"]');
      await panelSeleccion.isExisting();

      const selectYear = await browser.$('table > tbody > tr > td > select');
      await selectYear.selectByAttribute('value', '2019');

      const queryButton = await browser.$('input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]');
      await queryButton.doubleClick()

      let now = moment().format('DDMMYYYYhmmssa');
      const filePath = await path.join(downloadDir, 'Rut' + `${now.toString()}.png`)
      console.log(await filePath);

      /* const closeButton = await browser.$('td > div > table > tbody > tr > td > div > img');
      await closeButton.doubleClick();
      await browser.back();
      await browser.navigateTo('https://muisca.dian.gov.co/WebDashboard/DefDashboard.faces'); */

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