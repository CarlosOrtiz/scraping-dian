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
        }
      });

      await browser.url('https://muisca.dian.gov.co/WebArquitectura/DefLogin.faces')

      const typedUser = await browser.$('select[name="vistaLogin:frmLogin:selNit"]');
      await typedUser.setValue(2);

      const typeUser = await browser.$(function () {
        return document.getElementById('vistaLogin:frmLogin:selNit').value = 1;
      });

      const type = await browser.$('select[name="vistaLogin:frmLogin:selNit"]');
      console.log(await type.$('option[value="2"'));

      const dataTypeUser = await typeUser.$$('option');
      await dataTypeUser.map(item => {
        console.log(item.getValue());
      })

      const document = await browser.$('input[name="vistaLogin:frmLogin:txtUsuario"]');
      await document.setValue('1117552597');

      const typeDocument = await browser.$('select[name="vistaLogin:frmLogin:selTipoDoc"]');
      const subTypeDocument = await typeDocument.$$('option')[1];
      await subTypeDocument.map(item => {
        console.log(item.getValue());
      });
      console.log(await typeDocument.getValue());

      const password = await browser.$('input[name="vistaLogin:frmLogin:txtCadena"]');
      await password.setValue('caol9901');

      const botton = await browser.$('form[name="vistaLogin:frmLogin"]')
      await botton.submit();

      console.log(await browser.getAllCookies());

      await browser.deleteSession()
    })().catch(async (e) => {
      console.error(e.stack)
      await browser.deleteSession()
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