import { Injectable, BadRequestException, Body } from '@nestjs/common';
import { LoginService } from '../../auth/services/login.service';
import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';
import { RentalDeclaration } from '../dto/rentalDeclaration.dto';

@Injectable()
export class RentalDeclarationService {

  constructor(
    private readonly loginService: LoginService
  ) { }

  async rentalDeclaration(body: RentalDeclaration) {
    let browser;

    if (!body.document)
      throw new BadRequestException({
        error: 'DOCUMENT_IS_NULL',
        detail: 'El campo de document se encuentra vacio.'
      })

    if (!body.password)
      throw new BadRequestException({
        error: 'PASSWORD_IS_NULL',
        detail: 'El campo de password se encuentra vacio.'
      });

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
      await credentials[1].setValue(body.document);      // numberDocument
      await credentials[2].setValue(body.password);      // password
      await credentials[4].doubleClick();           // buttonLogin
      console.log('SUCCESSFULL LOGIN ✅');
      await browser.pause(1000);

      /* Open Dashboard*/
      const dashboardForm = await browser.$$('form table input');
      await browser.pause(500);

      if (dashboardForm[9].isExisting()) {
        console.log('DASHBOARD OPEN ✅');

        await dashboardForm[9].doubleClick(); // Open Panel Form 210

        await browser.pause(1500);
        await browser.refresh();
        await browser.pause(1500);

        const buttonAll = await browser.$$('div ingreso > div button');
        await browser.pause(500);

        /* console.log(await buttonAll[0].isClickable()); */
        await buttonAll[0].doubleClick(); // select 2019
        await browser.pause(1000);

        await buttonAll[4].doubleClick(); // Open Button Crear
        await browser.pause(1000);

        const formTaxResident = await browser.$$('div mat-card mat-card-content div input');
        await browser.pause(1000);

        console.log('holiiiiiiiiiii');
        console.log(await formTaxResident[0].isClickable());
        await browser.pause(1000);
        await formTaxResident[0].doubleClick();  // click al radio button Si 
        await browser.pause(1000);

        const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
        await send.doubleClick(); // click al botton enviar
        await browser.pause(1000);

        //aqui llenar formulario
        const panels210 = await browser.$$('form div div div div input');

        if (!panels210[0].isExisting())
          return await browser.deleteSession();

        const NIT = await panels210[0].getValue();

        const DV = await panels210[1].getValue();

        const first_lastname = await panels210[2].getValue();

        const second_lastname = await panels210[3].getValue();

        const first_name = await panels210[4].getValue();

        const other_name = await panels210[5].getValue();

        const correction_code = await panels210[6].getValue();

        /* await servico(dv,nit,first_lastname,second_lastname,first_name,other_name,sectional_address_code,economic_activity); */

        console.log(await panels210[0].getValue())
        console.log(await panels210[1].getValue())
        console.log(await panels210[2].getValue())
        console.log(await panels210[3].getValue())
        console.log(await panels210[4].getValue())
        await browser.pause(500);


        /* Aqui oprmir el botton + */

        const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
        await panelBUttonSave[1].click();

        await browser.pause(1000);
        const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"');
        await buttonSave[0].dobleClick();
        await browser.pause(1000);

        const buttonacetar = await browser.$('mat-card button')
        await buttonacetar.doubleClick();

        await browser.pause(1000);

        await browser.back();
        await browser.pause(1000);

        await browser.back();
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


      await browser.deleteSession();
    } catch (err) {
      console.log(err)
      await browser.deleteSession()

      if (err.response) return err.response
      return err
    }

    return { success: 'OK' }
  }

}