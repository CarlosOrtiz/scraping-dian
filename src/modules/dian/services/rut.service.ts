import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { remote } from 'webdriverio';
import { Queue } from 'bull';
import { config } from '../../../../wdio.conf';
import { Audit } from '../../../entities/security/audit.entity';
import { LoginService } from '../../auth/services/login.service';

/* const webdriverio = require('webdriverio') */
const phantomjs = require('phantomjs-prebuilt')
const wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }
const params = {
  phantomjs: require('phantomjs-prebuilt'),
  webdriverio: require('webdriverio'),
  wdOpts: {
    desiredCapabilities: {
      browserName: 'phantomjs',
      'phantomjs.page.settings.loadImages': false
    }
  }
};
@Injectable()
export class RutService {

  constructor(
    private readonly loginService: LoginService,
    @InjectQueue('dian') private dianQueue: Queue,
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  async downloadRut(document: string, password: string) {
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

    let rut;

    try {
      browser = await remote(config);

      console.log('URL ✅');
      await browser.url(`${process.env.DIAN_URL_BASE}`);

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      /*  if (!loginForm.isExisting())
         throw new BadRequestException({
           error: 'FORM_LOGIN_NOT_FOUND',
           detail: 'EL formulario de la pagina del iniciar sesión no se encontro.'
         }); */

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

    return { success: 'OK', data: rut }
  }


  async downloadRutQueue(document: string, password: string) {
    const job = await this.dianQueue.add('downloadRut', { config, document, password });
    return job;
  }

  /*   async prueba() {
      phantomjs.run('--webdriver=4444').then(program => {
        webdriverio.remote(wdOpts).init()
          .url('https://www.dian.gov.co/')
          .getTitle().then(title => {
            console.log(title) // 'Mozilla Developer Network'
            program.kill() // quits PhantomJS
          })
      })
    } */
}