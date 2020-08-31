import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, BadRequestException } from '@nestjs/common';
import { DianService } from './dian.service';
import { remote } from 'webdriverio';

import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from '../../../entities/security/audit.entity';
import { Repository } from 'typeorm';

@Processor('downloadRut')
export class FuntionQueue {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    private readonly dianService: DianService,
  ) { }

  @Process({ name: 'downloadRut' })
  async downloadRut(job: Job<any>) {
    this.onActive(job);
    const { config, document, password } = job.data;

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

      if (!loginForm.isExisting())
        throw new BadRequestException({
          error: 'FORM_LOGIN_NOT_FOUND',
          detail: 'EL formulario de la pagina del iniciar sesión no se encontro.'
        });

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
          process: 'Descargar Rut queue',
          view: await browser.getUrl()
        })

        await browser.deleteSession()
        return err.response
      } else {
        await browser.deleteSession()
        return err
      }
    }

    return { success: 'OK', data: rut }
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}