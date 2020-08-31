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
        console.log('VALIDATE LOGIN ✅');

        await browser.pause(1000);

        /* Open Dashboard*/
        const dashboardForm = await browser.$$('form table input');
        await browser.pause(500);

        if (dashboardForm[9]) {
          console.log('SUCCESSFULL LOGIN ✅');
          console.log('DASHBOARD OPEN ✅');
          await dashboardForm[9].doubleClick(); // Open Panel Form 210
          await browser.pause(1500);

          const buttonAll = await browser.$$('div ingreso > div button');
          await browser.pause(1000);
          if (buttonAll) {
            /* console.log(await buttonAll[0].isClickable()); */
            await buttonAll[0].doubleClick(); // select 2019
            await browser.pause(1000);

            await buttonAll[4].doubleClick(); // Open Button Crear
            await browser.pause(1000);

            const formTaxResident = await browser.$('div mat-card mat-card-content div mat-radio-button');
            await browser.pause(1000);
            if (formTaxResident.isExisting()) {
              const YesOrNot = body.tax_resident === true ? await browser.$('input[id="mat-radio-32-input"]') : await browser.$('input[id="mat-radio-33-input"]')
              /* const buttonYes = await browser.$('input[id="mat-radio-32-input"]') */
              if (YesOrNot.isExisting()) {
                await browser.pause(2000);
                await YesOrNot.doubleClick();

                const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
                await send.doubleClick(); // click al botton enviar
                await browser.pause(2000);

              } else {
                throw new BadRequestException({
                  error: 'BUTTON_SAVE_INFO_RENTAL_NOT_FOUND',
                  detail: 'El Boton de guardar la informacion de la declaracion de la renta no se encontro.'
                });
              }
              await browser.pause(1200);
              /*  await buttonYes.doubleClick(); */  // click al radio button Si 
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
                const economic_activity = await browser.$$('form div div div div select');

                /* Datos Declarante */
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
                /* Preguntas Si o No */
                const income_country = body.income_country === false ? await panels210[10] : await panels210[9];
                await income_country.doubleClick();
                await browser.pause(1100);

                replay.push({ name: 'income_country', value: await income_country.getValue() });
                replay.push({ name: 'retirement_unemployment', value: await panels210[12].getValue() });
                replay.push({ name: 'millitary_forces_police', value: await panels210[14].getValue() });
                replay.push({ name: 'compensation_insurance', value: await panels210[16].getValue() });
                replay.push({ name: 'income_public_university', value: await panels210[18].getValue() });
                replay.push({ name: 'public_servant', value: await panels210[0].getValue() });
                replay.push({ name: 'hotel_rental_income', value: await panels210[0].getValue() });
                replay.push({ name: 'work_rental_income', value: await panels210[0].getValue() });
                replay.push({ name: 'can_capital_income', value: await panels210[0].getValue() });
                replay.push({ name: 'not_work_rental_income', value: await panels210[0].getValue() });
                /* Patrimonio */
                const patrimony_total = await panels210[29].setValue(' ');
                await panels210[29].setValue(body.patrimony_total.toString());
                await browser.pause(500);

                const debt = await panels210[30].setValue(' ');
                await panels210[30].setValue(body.debt.toString());
                await browser.pause(500);

                const total_income_rental_work = await panels210[32].setValue(' ');
                await panels210[32].setValue(body.total_income_rental_work.toString());
                await browser.pause(500);

                const not_constitutive_income = await panels210[33].setValue(' ');
                await panels210[33].setValue(body.not_constitutive_income.toString());
                await browser.pause(500);

                const cost_deduction_rt = await panels210[34].setValue(' ');
                await panels210[34].setValue(body.cost_deduction_rt.toString());
                await browser.pause(500);


                replay.push({ name: 'patrimony_total', value: await panels210[29].getValue() });
                replay.push({ name: 'debt', value: await panels210[30].getValue() });
                replay.push({ name: 'total_income_rental_work', value: await panels210[31].getValue() });
                /* Rentas de trabajo */
                replay.push({ name: 'total_income_rental_work', value: await panels210[32].getValue() });
                replay.push({ name: 'not_constitutive_income', value: await panels210[33].getValue() });
                replay.push({ name: 'cost_deduction_rt', value: await panels210[34].getValue() });
                replay.push({ name: 'liquid_rental_rt', value: await panels210[35].getValue() });
                replay.push({ name: 'exempt_rental_rt', value: await panels210[36].getValue() });
                replay.push({ name: 'limit_rental_exempt_rt', value: await panels210[37].getValue() });
                replay.push({ name: 'liquid_rental_work_rt', value: await panels210[38].getValue() });
                /* Rentas de capital */
                replay.push({ name: 'total_capital_income', value: await panels210[39].getValue() });
                replay.push({ name: 'income_not_constitutive_rental', value: await panels210[40].getValue() });
                replay.push({ name: 'cost_deduction_coming', value: await panels210[41].getValue() });
                replay.push({ name: 'liquid_rental_rc', value: await panels210[42].getValue() });
                replay.push({ name: 'liquid_rental_passive_rc', value: await panels210[43].getValue() });
                replay.push({ name: 'exempt_rental_rc', value: await panels210[44].getValue() });
                replay.push({ name: 'limit_exempt_rental_rc', value: await panels210[45].getValue() });
                replay.push({ name: 'ordinary_liquid_exercise', value: await panels210[46].getValue() });
                replay.push({ name: 'loss_liquid_exercise_rc', value: await panels210[47].getValue() });
                replay.push({ name: 'compasion_loss_capital_rental', value: await panels210[48].getValue() });
                replay.push({ name: 'liquid_capital_rc', value: await panels210[49].getValue() });
                /* Rentas no laborales */
                replay.push({ name: 'total_income_rnl', value: await panels210[50].getValue() });
                replay.push({ name: 'discount_refund', value: await panels210[51].getValue() });
                replay.push({ name: 'income_not_constitutive_rental_rnl', value: await panels210[52].getValue() });
                replay.push({ name: 'cost_expense_rnl', value: await panels210[53].getValue() });
                replay.push({ name: 'liquid_rental_rnl', value: await panels210[54].getValue() });
                replay.push({ name: 'not_labor_passive_liquid_rental', value: await panels210[55].getValue() });
                replay.push({ name: 'rental_exempt_deduction_rnl', value: await panels210[56].getValue() });
                replay.push({ name: 'limited_exempt_rental_rnl', value: await panels210[57].getValue() });
                replay.push({ name: 'ordinary_liquid_rental_rnl', value: await panels210[58].getValue() });
                replay.push({ name: 'loss_liquid_exercise_rnl', value: await panels210[59].getValue() });
                replay.push({ name: 'compensation_loss_rental_rnl', value: await panels210[60].getValue() });
                replay.push({ name: 'not_work_liquid_rental', value: await panels210[61].getValue() });
                /*Cédula general:  */
                replay.push({ name: 'liquid_rental_cg', value: await panels210[62].getValue() });
                replay.push({ name: 'rental_exempt_deduction_cg', value: await panels210[63].getValue() });
                replay.push({ name: 'ordinaty_rental_cg', value: await panels210[64].getValue() });
                replay.push({ name: 'compensation_lost_cg', value: await panels210[65].getValue() });
                replay.push({ name: 'excess_compensation_cg', value: await panels210[66].getValue() });
                replay.push({ name: 'taxable_rental', value: await panels210[67].getValue() });
                replay.push({ name: 'liquid_rental_taxable_cg', value: await panels210[68].getValue() });
                replay.push({ name: 'presumptive_rental_cg', value: await panels210[69].getValue() });
                /*  Cédula de pensiones*/
                replay.push({ name: 'total_income_rental_cp', value: await panels210[0].getValue() });
                replay.push({ name: 'incomen_not_constitutive_rental_cp', value: await panels210[0].getValue() });
                replay.push({ name: 'liquid_rental_cp', value: await panels210[0].getValue() });
                replay.push({ name: 'liquid_rental_pension_cp', value: await panels210[0].getValue() });
                /* Cédula de dividendos y participaciones */
                replay.push({ name: 'dividend_participation_cdp', value: await panels210[0].getValue() });
                replay.push({ name: 'not_constitutive_income_cdp', value: await panels210[0].getValue() });
                replay.push({ name: 'ordinary_liquid_rental_cdp', value: await panels210[0].getValue() });
                replay.push({ name: 'sub_cedula1', value: await panels210[0].getValue() });
                replay.push({ name: 'sub_cedula2', value: await panels210[0].getValue() });
                replay.push({ name: 'passive_liquid_rental_cdp', value: await panels210[0].getValue() });
                replay.push({ name: 'exempt_rental_cdp', value: await panels210[0].getValue() });
                /* Ganancia ocasional */
                replay.push({ name: 'ingress_go', value: await panels210[0].getValue() });
                replay.push({ name: 'cost_go', value: await panels210[0].getValue() });
                replay.push({ name: 'go_not_taxed_exempt', value: await panels210[0].getValue() });
                replay.push({ name: 'go_taxed', value: await panels210[0].getValue() });
                replay.push({ name: 'general_pension', value: await panels210[0].getValue() });
                replay.push({ name: 'presumptive_rental_pension', value: await panels210[0].getValue() });
                replay.push({ name: 'participation_dividend_lp', value: await panels210[0].getValue() });
                replay.push({ name: 'dividends_shares_2017_1', value: await panels210[0].getValue() });
                replay.push({ name: 'dividends_shares_2017_2', value: await panels210[0].getValue() });
                replay.push({ name: 'total_taxable_liquid_income', value: await panels210[0].getValue() });
                replay.push({ name: 'donations', value: await panels210[0].getValue() });
                replay.push({ name: 'others_private', value: await panels210[0].getValue() });
                replay.push({ name: 'tax_discounts', value: await panels210[0].getValue() });
                replay.push({ name: 'total_income_tax', value: await panels210[0].getValue() });
                replay.push({ name: 'occasional_earnings_tax', value: await panels210[0].getValue() });
                replay.push({ name: 'discount_taxes_occasional_income', value: await panels210[0].getValue() });
                replay.push({ name: 'total_tax_charged', value: await panels210[0].getValue() });
                replay.push({ name: 'advance_rental_liquid_year_taxable', value: await panels210[0].getValue() });
                replay.push({ name: 'balance_favor_previous_taxable_year', value: await panels210[0].getValue() });
                replay.push({ name: 'withholdings_taxable_year_to_report', value: await panels210[0].getValue() });
                replay.push({ name: 'income_advance_following_taxable_year', value: await panels210[0].getValue() });
                replay.push({ name: 'balance_pay_tax', value: await panels210[0].getValue() });
                replay.push({ name: 'sanctions', value: await panels210[0].getValue() });
                replay.push({ name: 'total_balance_pay', value: await panels210[0].getValue() });
                replay.push({ name: 'total_balance_favor', value: await panels210[0].getValue() });
                /* Firmas */
                replay.push({ name: 'signatory_identification', value: await panels210[0].getValue() });
                replay.push({ name: 'DV_firm', value: await panels210[0].getValue() });
                replay.push({ name: 'dependent_document_type', value: await panels210[0].getValue() });
                replay.push({ name: 'dependent_identification', value: await panels210[0].getValue() });
                replay.push({ name: 'kinship', value: await panels210[0].getValue() });
                replay.push({ name: 'disclaimer', value: await panels210[0].getValue() });
                /*  Pago total*/
                replay.push({ name: 'full_payment', value: await panels210[0].getValue() });

                /* await servico(dv,nit,first_lastname,second_lastname,first_name,other_name,sectional_address_code,panels210); */

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
                  error: 'BUTTON_FORM210_NOT_FOUND',
                  detail: 'No se logro encontrar los campos del formulario 210 para diligenciarlos'
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
            error: 'INCORRECT_CREDENTIALS_LOGIN',
            detail: 'Credenciales incorrectas para iniciar sesión'
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