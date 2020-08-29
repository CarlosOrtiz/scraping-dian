import { Injectable } from '@nestjs/common';
import { LoginService } from '../../auth/services/login.service';
import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';
import { RentalDeclaration } from '../dto/rentalDeclaration.dto';
import { RelationCountAttribute } from 'typeorm/query-builder/relation-count/RelationCountAttribute';

@Injectable()
export class RentalDeclarationService {

  constructor(
    private readonly loginService: LoginService
  ) { }

  async rentalDeclaration(body: RentalDeclaration) {
    let browser;

    if (!body.document) {
      return { error: 'DOCUMENT_IS_NULL', detail: 'El campo document se encuentra vacio.' }
    } else if (!body.password) {
      return { error: 'PASSWORD_IS_NULL', detail: 'El campo password se encuentra vacio.' }
    }

    (async () => {
      browser = await remote(config);

      await browser.maximizeWindow()
      await browser.url(`${process.env.DIAN_URL_BASE}`);
      console.log('URL ✅');

      /* Login */
      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (!loginForm.isExisting())
        return await browser.deleteSession();

      const selectAll = await browser.$$('form > table tbody tr td select');
      await selectAll[0].selectByAttribute('value', '2');  // typeUser
      await selectAll[1].selectByAttribute('value', '13'); // typeDocument
      await browser.pause(1000);

      const credentials = await browser.$$('form > table tbody tr td input');
      await credentials[0].isDisplayed();           // numberDocumentOrganization
      await credentials[1].setValue(body.document); // numberDocument
      await credentials[2].setValue(body.password); // password
      await credentials[4].doubleClick();           // buttonLogin
      await browser.pause(1000);
      console.log('LOGIN ✅');

      /* Dashboard*/
      const dashboardForm = await browser.$$('form table');

      /*   if (!dashboardForm[17].isExisting())
          return await browser.deleteSession(); */

      await browser.pause(1000);
      const panels = await browser.$$('form table table table table table tbody > tr > td > input');
      await browser.pause(1000);
      console.log('DASHBOARD ✅');

      const form210 = await panels[5].doubleClick(); // form 210 open
      await browser.pause(500);

      /*      const bodyForm = await browser.$('div > mat-tab-group > div[class="mat-tab-body-wrapper"] app-formatos > div > div');
     
           if (!bodyForm.isExisting())
             return await browser.deleteSession();
     
           await browser.pause(1000);
           const buttonForm = await bodyForm.$$('div img')
           await buttonForm[3].doubleClick(); //Click Form 210
           await browser.pause(1000); */

      /*       const formRenta210 = await browser.$('div ingreso > div');
            if (!formRenta210.isExisting())
              return await browser.deleteSession() */

      await browser.refresh();

      await browser.pause(1000);
      const buttonAll = await browser.$$('div ingreso > div button');
      await browser.pause(500);
      console.log(await buttonAll[0].isElementSelected());
      await browser.pause(1100);

      await buttonAll[4].doubleClick();
      await browser.pause(1000);

      console.log('Aquui')
      await browser.pause(500);
      const formTaxResident = await browser.$('div[class="mat-dialog-content"] mat-card mat-card-content mat-radio-group mat-radio-button label > input');
      await browser.pause(1000);
      await formTaxResident.doubleClick()  // click al radio button Si 
      await browser.pause(1000);

      const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
      await send.doublelick(); // click al botton enviar
      await browser.pause(500);

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

      console.log(await panels210[0].getValue())
      console.log(await panels210[1].getValue())
      console.log(await panels210[2].getValue())
      console.log(await panels210[3].getValue())
      console.log(await panels210[4].getValue())

      await browser.pause(1000);
      await browser.deleteSession();
    })().catch((err) => {
      console.error(err)
      return browser.deleteSession()
    })
  }

}