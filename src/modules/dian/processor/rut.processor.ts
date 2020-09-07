import { InjectRepository } from "@nestjs/typeorm";
import { Logger, BadRequestException } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Repository } from "typeorm";
import { Job } from "bull";
import { remote } from "webdriverio";
import { config } from '../../../../wdio.conf';
import { Audit } from "../../../entities/security/audit.entity";
import { onErrorResumeNext } from "rxjs";
import { join } from "path";
const fs = require('fs')
const axios = require('axios')
const { readdir, stat } = require("fs").promises
const path = require('path');
const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

@Processor('dian')
export class RutProcessor {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  @Process({ name: 'downloadRut2' })
  async downloadRut2(job: Job<any>) {
    (async function example() {
      let driver = await new Builder().forBrowser('chrome').build();
      try {
        await driver.get('http://www.google.com/ncr');
        await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
      } finally {
        await driver.quit();
      }
    })();
  }

  @Process({ name: 'downloadRut' })
  async downloadRut(job: Job<any>) {
    let browser;
    const { document, password } = job.data;

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

    let rut = {}, exogenous = {};
    let base64String;
    try {
      browser = await remote(config);
      console.log('URL ✅');
      await browser.url(`${process.env.DIAN_URL_BASE}`);
      /*  await browser.throttle('Regular2G'); */

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (loginForm.isExisting()) {
        await browser.pause(1000);
        console.log('LOGIN... ✅');
        const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
        if (selectAll[0]) {
          await selectAll[0].selectByAttribute('value', '2');   // typeUser
          await selectAll[1].selectByAttribute('value', '13');  // typeDocument
          await browser.pause(500);
        } else {
          throw new BadRequestException({
            error: 'SELECT_NOT_FOUND',
            detail: 'No se encontro el selector para el tipo de usuario.'
          });
        }
        const credentials = await browser.$$('form > table tbody tr td input');
        if (credentials[1]) {
          await credentials[0].isDisplayed();           // numberDocumentOrganization
          await credentials[1].setValue(document);      // numberDocument
          await credentials[2].setValue(password);      // password
          await credentials[4].doubleClick();           // buttonLogin
          await browser.pause(500);
        } else {
          throw new BadRequestException({
            error: 'INPUT_NOT_FOUND',
            detail: 'No se encontraron las entras para la cédula y la contraseña.'
          });
        }
        console.log('VALIDATE LOGIN ✅');
        await browser.pause(500);
        /* Open Dashboard*/
        const dashboardForm = await browser.$$('form table input');
        await browser.pause(500);

        if (dashboardForm[12]) {
          console.log('SUCCESSFULL LOGIN ✅');
          console.log('DASHBOARD OPEN ✅');

          const buttonRut = await browser.$('input[id="vistaDashboard:frmDashboard:btnConsultarRUT"]')
          await buttonRut.doubleClick();// download the RUT
          await browser.pause(10000);
          console.log('RUT DOWNLOAD COMPLETED ✅');

          if (dashboardForm[3]) {
            await browser.pause(1100);
            console.log('LOGOUT PANEL OPENED ✅')
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
          process: 'Descargar Rut',
          view: await browser.getUrl()
        })

        await browser.deleteSession()
        return err.response
      } else if (err.name == 'stale element reference') {
        await this.auditRepository.save({
          name: 'STALE_ELEMENT_REFERENCE',
          detail: 'referencia de elemento obsoleto',
          user: document,
          process: 'Declaración de Renta-Formulario 210',
          view: await browser.getUrl() || `${process.env.DIAN_URL_BASE}`
        })
        await browser.deleteSession()

        return { error: 'STALE_ELEMENT_REFERENCE', detail: 'referencia de elemento obsoleto' };
      } else if (err.name == 'Error') {
        await browser.deleteSession()

        return { error: 'NOT_INTERNET_CONECTION', detail: 'No hay conexión a internet' };
      } else {
        await browser.deleteSession()
        return err
      }
    }

    return { success: 'OK' }

  }

}