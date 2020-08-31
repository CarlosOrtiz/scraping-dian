import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { remote } from 'webdriverio';
import { config } from '../../../../wdio.conf';
import { LoginService } from '../../auth/services/login.service';
import { RentalDeclaration } from '../dto/rentalDeclaration.dto';
import { Audit } from '../../../entities/security/audit.entity';

@Injectable()
export class RentalDeclarationService {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    private readonly loginService: LoginService,
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

    const replay = []

    try {
      browser = await remote(config);

      console.log('URL ✅');
      await browser.url(`${process.env.DIAN_URL_BASE}`);

      const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
      await browser.pause(1000);

      if (loginForm.isExisting()) {
        console.log('LOGIN... ✅');
        const selectAll = await browser.$$('form > table[class="formulario_muisca"] tbody tr td select');
        await selectAll[0].selectByAttribute('value', '2');   // typeUser
        await selectAll[1].selectByAttribute('value', '13');  // typeDocument
        await browser.pause(1000);

        const credentials = await browser.$$('form > table tbody tr td input');
        await credentials[0].isDisplayed();                // numberDocumentOrganization
        await credentials[1].setValue(body.document);      // numberDocument
        await credentials[2].setValue(body.password);      // password
        await credentials[4].doubleClick();                // buttonLogin
        console.log('SUCCESSFULL LOGIN ✅');
        await browser.pause(1000);

        /* Open Dashboard*/
        const dashboardForm = await browser.$$('form table input');
        await browser.pause(500);

        if (dashboardForm[9]) {
          console.log('DASHBOARD OPEN ✅');

          await dashboardForm[9].doubleClick(); // Open Panel Form 210

          await browser.pause(1500);

          const buttonAll = await browser.$$('div ingreso > div button');
          await browser.pause(1000);

          /* console.log(await buttonAll[0].isClickable()); */
          await buttonAll[0].doubleClick(); // select 2019
          await browser.pause(1000);

          await buttonAll[4].doubleClick(); // Open Button Crear
          await browser.pause(1000);

          const formTaxResident = await browser.$('div mat-card mat-card-content div mat-radio-button');
          await browser.pause(1000);

          if (formTaxResident.isExisting()) {
            // const YesOrNot = body.tax_resident === true ? yes = await browser.$('input[id="mat-radio-32-input"]') : not = await browser.$('input[id="mat-radio-33-input"]')
            const buttonYes = await browser.$('input[id="mat-radio-32-input"]')
            console.log(await buttonYes.getHTML());

            await browser.pause(2000);
            await buttonYes.doubleClick();  // click al radio button Si 

            const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
            await send.doubleClick(); // click al botton enviar
            await browser.pause(2000);

            //aqui llenar formulario
            const panels210 = await browser.$$('form div div div div input');

            if (panels210[0]) {

              //El valor de la casilla 55 no puede superar 0. (CASILLA 49 + CASILLA 54 - CASILLA 50 - CASILLA 51 - CASILLA 52)
              // 1232000 + 213000 - 3123000 - 213000 -213000


              //El valor de la casilla 64 no puede superar el valor de la resta de la casilla 61 y la casilla 37
              //61 = 204000- 0 = 204000
              //El valor de la casilla 64 no puede superar el valor de la suma de las casillas 48 y 60
              //61 = 2004.000 + 0 

              //El valor de la casilla 64 más la casilla 65 no puede superar el valor de la casilla 63.
              // 100000 + 65 != 63 = 204.000 -100.000 = 104.000
              const economic_activity = await browser.$$('form div div div div select')
              economic_activity[0].getValue() //

              replay.push({ name: 'NIT', value: await panels210[0].getValue() }); //NIT
              replay.push({ name: 'DV', value: await panels210[1].getValue() }); // DV
              replay.push({ name: 'first_lastname', value: await panels210[2].getValue() });
              replay.push({ name: 'second_lastname', value: await panels210[3].getValue() });
              replay.push({ name: 'first_name', value: await panels210[4].getValue() });
              replay.push({ name: 'other_name', value: await panels210[5].getValue() });
              replay.push({ name: 'sectional_address_code', value: await panels210[6].getValue() });
              replay.push({ name: 'correction_code', value: await panels210[7].getValue() });
              replay.push({ name: 'previous_from_number', value: await panels210[8].getValue() });
              replay.push({ name: 'economic_activity', value: await economic_activity[0].getValue() });

              /* await servico(dv,nit,first_lastname,second_lastname,first_name,other_name,sectional_address_code,economic_activity); */

              console.log(replay)
              await browser.pause(500);

              /* Aqui oprmir el botton + */

              const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
              if (panelBUttonSave[1]) {

                await browser.pause(1000);
                await panelBUttonSave[1].click();
                await browser.pause(1000);

                const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');

                console.log(await buttonSave.length);
                if (await buttonSave.length === 3) {
                  await buttonSave[1].click();
                  await browser.pause(1200);

                  const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                  await buttonacetar[1].doubleClick(); // buton confirmar
                  await browser.pause(1000);

                } else if (await buttonSave.length === 1) {
                  await buttonSave[0].click();
                  await browser.pause(1200);

                  const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                  await buttonacetar[0].doubleClick(); // buton confirmar
                  await browser.pause(1000);

                } else {
                  throw new BadRequestException({
                    error: 'BUTTON_SAVE_INFO_RENTAL_NOT_FOUND',
                    detail: 'El Boton de guardar la informacion de la declaracion de la renta no se encontro.'
                  });
                }
              } else {
                throw new BadRequestException({
                  error: 'PANEL_SAVE_RENTAL_NOT_FOUND',
                  detail: 'El panel para guardar la informacion de la declaracion de la renta no se encontro.'
                });
              }

              const logoutPanel = await browser.$$('div button');
              /* Logout Panel */
              if (logoutPanel[6]) {
                console.log('LOGOUT PANEL OPENED ✅')
                await logoutPanel[6].doubleClick(); // button logout
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
                error: 'FORM_NOT_FOUND',
                detail: 'NO se logro encontrar los campos del formulario 210 para diligenciarlos'
              });
            }
          } else {
            throw new BadRequestException({
              error: 'MODAL_QUESTION_NOT_FOUND',
              detail: 'No se encontro el button si para responder la pregunta ¿Es usted residente fiscal en Colombia para efectos tributarios?'
            });
          }

        } else {
          throw new BadRequestException({
            error: 'PANEL_FORM210_NOT_FOUND',
            detail: 'El panel de Diligenciar y presentar Formulario 210 no se encontro.'
          });
        }

      } else {
        throw new BadRequestException({
          error: 'FORM_LOGIN_NOT_FOUND',
          detail: 'EL formulario de la pagina iniciar sesión no se encontro.'
        });
      }

    } catch (err) {
      console.log(err)
      if (err.response) {
        await this.auditRepository.save({
          name: err.response.error,
          detail: err.response.detail,
          user: body.document,
          process: 'Declaración Renta  Formulario 210',
          view: await browser.getUrl()
        })

        await browser.deleteSession()
        return err.response
      } else {
        await browser.deleteSession()
        return err
      }
    }

    return { success: 'OK', data: replay }
  }

}