import { Injectable, BadRequestException } from '@nestjs/common';
import { LoginService } from '../../auth/services/login.service';
import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from '../../../entities/security/audit.entity';

@Injectable()
export class ExogenousService {

  constructor(
    private readonly loginService: LoginService,
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  async downloadExogenous(document: string, password: string) {
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

    let exogenous;

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
      await browser.pause(1000);
      const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');   // typeUser
      await selectAll[1].selectByAttribute('value', '13');  // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(document);      // numberDocument
      await credentials[2].setValue(password);      // password
      await credentials[4].doubleClick();           // buttonLogin
      console.log('FINISHED LOGIN ✅');
      await browser.pause(1000);

      /* Dashboard*/
      const dashboardForm = await browser.$$('form table input');

      if (!dashboardForm[4].isExisting())
        throw new BadRequestException({
          error: 'DASHBOARD_NOT_FOUND',
          detail: 'La pagina principal del administrador no se encontro.'
        });

      console.log('DASHBOARD OPEN ✅');
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
      console.log('LOGOUT PANEL ✅');
      /*     if (!dashboardForm[4].isExisting())
            return await browser.deleteSession(); */

      await browser.refresh();
      await browser.pause(500);

      const logoutPanel = await browser.$$('form table input')
      await logoutPanel[3].isClickable();
      await browser.pause(500);

      /*       const closeSession = await browser.$('input[name="vistaEncabezado:frmCabeceraUsuario:_id29"]');
            await closeSession.doubleClick(); */
      console.log('FINISHED ✅');
      console.log(' ');

      await browser.deleteSession();
    } catch (err) {
      console.log(err)
      if (err.response) {
        await this.auditRepository.save({
          name: err.response.error,
          detail: err.response.detail,
          user: document,
          process: 'Descargar Información Exogena',
          view: await browser.getUrl() || `${process.env.DIAN_URL_BASE}`
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
    return { success: 'OK', data: exogenous }
  }

}