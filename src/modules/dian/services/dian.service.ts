import { Injectable } from '@nestjs/common';
const { remote } = require('webdriverio');

@Injectable()
export class DianService {

  constructor() { }

  async login() {
    let browser;
    (async () => {
      browser = await remote({
        logLevel: 'trace',
        capabilities: {
          browserName: 'chrome'
        },
        waitforTimeout: 50000,
        //
        // Default timeout in milliseconds for request
        // if browser driver or grid doesn't send response
        connectionRetryTimeout: 120000,
      });

      await browser.url('https://muisca.dian.gov.co/WebArquitectura/DefLogin.faces')

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
      await button.getHTML();
      await button.isClickable()
      await button.doubleClick()


      await browser.pause(10000);
      await browser.deleteSession()
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })

  }

  async downloadExogenous() {
    let browser;
    (async () => {
      browser = await remote({
        logLevel: 'trace',
        capabilities: {
          browserName: 'chrome'
        }
      });

      await browser.url('http://191.102.85.226/GIECOM_PRUEBA/Views/PublicViews/login.aspx')

      const document = await browser.$('input[name="Correo_Electronico"]');
      await document.setValue('carlos.ortiz@udla.edu.co');

      const password = await browser.$('input[name="contrasena"]');
      await password.setValue('caol9901');

      const botton = await browser.$('input[name="ctl05"]')
      await botton.click();

      console.log(await browser.getAllCookies());
      console.log(await browser.getNamedCookie('ASP.NET_SessionId'));

      await browser.deleteSession()
    })().catch(async (e) => {
      console.error(e.stack)
      await browser.deleteSession()
    })
  }

}