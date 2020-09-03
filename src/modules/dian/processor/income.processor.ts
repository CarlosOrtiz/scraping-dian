import { InjectRepository } from "@nestjs/typeorm";
import { Logger, BadRequestException } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Repository } from "typeorm";
import { Job } from "bull";
import { remote } from "webdriverio";
import { config } from '../../../../wdio.conf';
import { Audit } from "../../../entities/security/audit.entity";

@Processor('dian')
export class IncomeProcessor {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  @Process({ name: 'rentalDeclaration' })
  async rentalDeclaration(job: Job<any>) {
    const { body } = job.data;
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
      })

    if (!body.indicative)
      throw new BadRequestException({
        error: 'INDICATIVE_IS_NULL',
        detail: 'El invicativo para el 2019 es el 16, el del 2018 es el 14 y el del 2017 es el 13.'
      });

    if (!body.year_Rental_Declaration)
      throw new BadRequestException({
        error: 'YEAR_RENTAL_DECLARATION_IS_NULL',
        detail: 'El campo de año de la renta se encuentra vacio.'
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
        if (selectAll[0]) {
          await selectAll[0].selectByAttribute('value', '2');   // typeUser
          await selectAll[1].selectByAttribute('value', '13');  // typeDocument
          await browser.pause(1000);
        } else {
          throw new BadRequestException({
            error: 'SELECT_NOT_FOUND',
            detail: 'No se encontro el selector para el tipo de usuario.'
          });
        }

        const credentials = await browser.$$('form > table tbody tr td input');
        if (credentials[1]) {
          await credentials[0].isDisplayed();           // numberDocumentOrganization
          await credentials[1].setValue(body.document); // numberDocument
          await credentials[2].setValue(body.password); // password
          await credentials[4].doubleClick();           // buttonLogin
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
        if (dashboardForm[9]) {
          console.log('SUCCESSFULL LOGIN ✅');
          console.log('DASHBOARD OPEN ✅');
          console.log('FORM 210 OPEN ✅');
          await browser.navigateTo(`https://muisca.dian.gov.co/WebFormRenta210v${body.indicative}/?concepto=inicial&anio=${body.year_Rental_Declaration}&periodicidad=anual&periodo=1`);
          const isPopupQuestionFrom = await browser.$('div mat-card div[class="mat-dialog-content"] div');
          const popupQuestionFromItem = await isPopupQuestionFrom.$$('mat-card-content div mat-radio-button input');
          await browser.pause(1000);

          if (isPopupQuestionFrom) {
            if (body.year_Rental_Declaration.toString() === '2019') {

              const tax_resident_1 = body.tax_resident_1 === true ? await popupQuestionFromItem[0] : await popupQuestionFromItem[1]
              if (tax_resident_1.isExisting()) {
                await tax_resident_1.doubleClick();
                await browser.pause(1500);

                const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
                await send.doubleClick(); // click al botton enviar
                await browser.pause(1000);

                const panels210 = await browser.$$('form div div div div input');
                if (panels210[0]) {
                  await browser.pause(1000);

                  const income_country_27 = body.income_country_27 === true ? await panels210[9] : await panels210[10];
                  await income_country_27.doubleClick(); // 27
                  await browser.pause(1000);

                  const retirement_unemployment_113 = body.retirement_unemployment_113 === true ? await panels210[11] : await panels210[12];
                  await retirement_unemployment_113.doubleClick();
                  await browser.pause(1000);
                  /* await panels210[13].setValue(body.value_exempt_severance_pay_114); */ //114
                  await browser.pause(1000);

                  /*  if (await body.retirement_unemployment_113 === true) {
                     await panels210[13].setValue(' ');
                     await browser.pause(1000);
                   } */

                  const millitary_forces_police_115 = body.millitary_forces_police_115 === true ? await panels210[14] : await panels210[15];
                  await millitary_forces_police_115.doubleClick();
                  await browser.pause(1000);

                  /* if (await body.millitary_forces_police_115 === false) {
                    await panels210[16].setValue(' ');
                    await panels210[16].setValue(body.include_exempt_value_basic_salary_116)  // 116
                    await browser.pause(1000);
                  } */
                  /*  await browser.pause(1000);
                   await panels210[18].doubleClick() //117
                   await browser.pause(1000); */
                  /*     if (body.compensation_insurance_117 === true) {
                        await panels210[17].doubleClick() // button 117
    
                        await panels210[19].setValue(' ');
                        await panels210[19].setValue(body.value_compensation_FFMM_118); //118
                        await browser.pause(500);
                      } else {
                        await panels210[18].doubleClick()
                        await browser.pause(500);
                      } */

                  /*   if (await body.income_public_university_119 === false) {
                      await panels210[20].doubleClick() // button 119 *
                      await browser.pause(1000);
  
                      await panels210[22].setValue(' ');
                      await panels210[22].setValue(body.value_public_university_120); //120
                      await browser.pause(1000);
                    } else {
                      await panels210[21].doubleClick()
                      await browser.pause(1000);
                    } */
                  /* 
                                    if (body.public_servant_121 === true) {
                                      await panels210[23].doubleClick() // button 121 *
                  
                                      await panels210[25].setValue(' ');
                                      await panels210[25].setValue(body.value_public_servant_122); //122
                                      await browser.pause(500);
                                    } else {
                                      await panels210[24].doubleClick()
                                      await browser.pause(500);
                                    } */

                  /*   await browser.pause(500);
  
                    await panels210[24].doubleClick() //121
                    await browser.pause(500); */
                  /* 
                                    if (body.hotel_rental_income_123 === true) {
                                      await panels210[26].doubleClick() // button 123 *
                  
                                      await panels210[28].setValue(' ');
                                      await panels210[28].setValue(body.value_hotal_rental_124); //124
                                      await browser.pause(500);
                                    } else {
                                      await panels210[27].doubleClick()
                                      await browser.pause(500);
                                    } */
                  /*  await browser.pause(1000);
 
                   await panels210[27].doubleClick() //123
                   await browser.pause(500); */

                  /*   if (await body.work_rental_income_125 === false) {
                      await panels210[29].doubleClick() // button 125 *
                      await browser.pause(1000);
                      await panels210[31].setValue(' ');
                      await panels210[31].setValue(body.value_income_work_double_taxation_126); //126
                      await browser.pause(1000);
                    } else {
                      await panels210[30].doubleClick()
                      await browser.pause(1000);
                    } */

                  /*     if (body.can_capital_income_127 === true) {
                        await panels210[32].doubleClick() // button 127 *
    
                        await panels210[34].setValue(' ');
                        await panels210[34].setValue(body.value_income_capital_double_taxation_128); //128
                        await browser.pause(500);
                      } else {
                        await panels210[33].doubleClick()
                        await browser.pause(500);
                      } */

                  /* await browser.pause(500);
                  await panels210[33].doubleClick() // 127
                  await browser.pause(500); */

                  /*  if (await body.not_work_rental_income_129 === false) {
                     await panels210[35].doubleClick() // button 129 *
                     await browser.pause(1000);
                     await panels210[37].setValue(' ');
                     await panels210[37].setValue(body.can_not_labor_income_130); //130
                     await browser.pause(1000);
                   } else {
                     await panels210[36].doubleClick()
                     await browser.pause(1000);
                   } */

                  /*
                                    const economic_activity = await browser.$$('form div div div div select');
                                    await panels210[29].setValue(' ');
                                    await panels210[29].setValue(body.patrimony_total_28); //patrimony_total
                                    await browser.pause(100);
                  
                                    await panels210[30].clearValue()
                                    await panels210[30].setValue(body.debt_29); //debt
                                    await browser.pause(100);
                  
                                    await panels210[32].setValue(' ');
                                    await panels210[32].setValue(body.total_income_rental_work_31) //total_income_rental_work
                                    await browser.pause(100);
                  
                                    await panels210[33].setValue(' ');
                                    await panels210[33].setValue(body.not_constitutive_income_32); //not_constitutive_income
                                    await browser.pause(100);
                  
                                    await panels210[34].setValue(' ');
                                    await panels210[34].setValue(body.cost_deduction_rt_33); //cost_deduction_rt
                                    await browser.pause(100);
                  
                                    await panels210[36].setValue(' ');
                                    await panels210[36].setValue(body.exempt_rental_rt_35); //exempt_rental_rt
                                    await browser.pause(100);
                  
                                    await panels210[39].setValue(' ');
                                    await panels210[39].setValue(body.total_capital_income_38); //total_capital_income
                                    await browser.pause(100);
                  
                                    await panels210[40].setValue(' ');
                                    await panels210[40].setValue(body.income_not_constitutive_rental_39); //income_not_constitutive_rental
                                    await browser.pause(100);
                  
                                    await panels210[41].setValue(' ');
                                    await panels210[41].setValue(body.cost_deduction_coming_40); //cost_deduction_coming
                                    await browser.pause(100);
                  
                                    await panels210[43].setValue(' ');
                                    await panels210[43].setValue(body.liquid_rental_passive_rc_42); //liquid_rental_passive_rc
                                    await browser.pause(100);
                  
                                    await panels210[48].setValue(' ');
                                    await panels210[48].setValue(body.compasion_loss_capital_rental_47); //compasion_loss_capital_rental
                                    await browser.pause(100);
                  
                                    await panels210[50].setValue(' ');
                                    await panels210[50].setValue(body.total_income_rnl_49); //total_income_rnl
                                    await browser.pause(100);
                  
                                    await panels210[51].setValue(' ');
                                    await panels210[51].setValue(body.discount_refund_50); //discount_refund
                                    await browser.pause(100);
                  
                                    await panels210[52].setValue(' ');
                                    await panels210[52].setValue(body.income_not_constitutive_rental_rnl_51); //income_not_constitutive_rental_rnl
                                    await browser.pause(100);
                  
                                    await panels210[53].setValue(' ');
                                    await panels210[53].setValue(body.cost_expense_rnl_52); //cost_expense_rnl
                                    await browser.pause(100);
                  
                                    await panels210[55].setValue(' ');
                                    await panels210[55].setValue(body.not_labor_passive_liquid_rental_54); //not_labor_passive_liquid_rental
                                    await browser.pause(100);
                  
                                    await panels210[56].setValue(' ');
                                    await panels210[56].setValue(body.rental_exempt_deduction_rnl_55); //rental_exempt_deduction_rnl
                                    await browser.pause(100);
                  
                                    await panels210[60].setValue(' ');
                                    await panels210[60].setValue(body.compensation_loss_rental_rnl_59); //compensation_loss_rental_rnl
                                    await browser.pause(100);
                  
                                    await panels210[65].setValue(' ');
                                    await panels210[65].setValue(body.compensation_lost_cg_64); //compensation_lost_cg
                                    await browser.pause(100);
                  
                                    await panels210[66].setValue(' ');
                                    await panels210[66].setValue(body.excess_compensation_cg_65); //excess_compensation_cg
                                    await browser.pause(100);
                  
                                    await panels210[67].setValue(' ');
                                    await panels210[67].setValue(body.taxable_rental_66); //taxable_rental
                                    await browser.pause(100);
                  
                                    await panels210[69].setValue(' ');
                                    await panels210[69].setValue(body.presumptive_rental_cg_68); //presumptive_rental_cg
                                    await browser.pause(100);
                  
                                    await panels210[70].setValue(' ');
                                    await panels210[70].setValue(body.total_income_rental_cp_69); //total_income_rental_cp aqui voy
                                    await browser.pause(100);
                  
                                    await panels210[71].setValue(' ');
                                    await panels210[71].setValue(body.incomen_not_constitutive_rental_cp_70); //incomen_not_constitutive_rental_cp
                                    await browser.pause(100);
                  
                                    await panels210[73].setValue(' ');
                                    await panels210[73].setValue(body.pension_exempt_rental_cp_72); //pension_exempt_rental_cp
                                    await browser.pause(100);
                  
                                    await panels210[75].setValue(' ');
                                    await panels210[75].setValue(body.dividend_participation_cdp_74); //dividend_participation_cdp
                                    await browser.pause(100);
                  
                                    await panels210[76].setValue(' ');
                                    await panels210[76].setValue(body.not_constitutive_income_cdp_75); //not_constitutive_income_cdp
                                    await browser.pause(100);
                  
                                    await panels210[78].setValue(' ');
                                    await panels210[78].setValue(body.sub_cedula1_77); //sub_cedula1
                                    await browser.pause(100);
                  
                                    await panels210[79].setValue(' ');
                                    await panels210[79].setValue(body.sub_cedula2_78); //sub_cedula2
                                    await browser.pause(100);
                  
                                    await panels210[80].setValue(' ');
                                    await panels210[80].setValue(body.passive_liquid_rental_cdp_79); //passive_liquid_rental_cdp
                                    await browser.pause(100);
                  
                                    await panels210[81].setValue(' ');
                                    await panels210[81].setValue(body.exempt_rental_cdp_80); //exempt_rental_cdp
                                    await browser.pause(100);
                  
                                    await panels210[82].setValue(' ');
                                    await panels210[82].setValue(body.ingress_go_81); //ingress_go
                                    await browser.pause(100);
                  
                                    await panels210[83].setValue(' ');
                                    await panels210[83].setValue(body.cost_go_82); //cost_go
                                    await browser.pause(100);
                  
                                    await panels210[84].setValue(' ');
                                    await panels210[84].setValue(body.go_not_taxed_exempt_83); //go_not_taxed_exempt
                                    await browser.pause(100);
                  
                                    await panels210[92].setValue(' ');
                                    await panels210[92].setValue(body.taxes_paid_abroad_91); //taxes_paid_abroad
                                    await browser.pause(100);
                  
                                    await panels210[93].setValue(' ');
                                    await panels210[93].setValue(body.donations_92); //donations
                                    await browser.pause(100);
                  
                                    await panels210[94].setValue(' ');
                                    await panels210[94].setValue(body.others_private_93); //others_private
                                    await browser.pause(100);
                  
                                    await panels210[97].setValue(' ');
                                    await panels210[97].setValue(body.occasional_earnings_tax_96); //occasional_earnings_tax
                                    await browser.pause(100);
                  
                                    await panels210[98].setValue(' ');
                                    await panels210[98].setValue(body.discount_taxes_occasional_income_97); //discount_taxes_occasional_income
                                    await browser.pause(100);
                  
                                    await panels210[100].setValue(' ');
                                    await panels210[100].setValue(body.advance_rental_liquid_year_taxable_99); //advance_rental_liquid_year_taxable
                                    await browser.pause(100);
                  
                                    await panels210[101].setValue(' ');
                                    await panels210[101].setValue(body.balance_favor_previous_taxable_year_100); //balance_favor_previous_taxable_year
                                    await browser.pause(100);
                  
                                    await panels210[102].setValue(' ');
                                    await panels210[102].setValue(body.withholdings_taxable_year_to_report_101); //withholdings_taxable_year_to_report
                                    await browser.pause(100);
                  
                                    await panels210[103].setValue(' ');
                                    await panels210[103].setValue(body.income_advance_following_taxable_year_102); //income_advance_following_taxable_year
                                    await browser.pause(100);
                  
                                    await panels210[105].setValue(' ');
                                    await panels210[105].setValue(body.sanctions_104); //sanctions
                                    await browser.pause(100);
                  
                                    await panels210[108].setValue(' ');
                                    await panels210[108].setValue(body.signatory_identification_107); //signatory_identification
                                    await browser.pause(100);]
                  
                                    await economic_activity[1].selectByAttribute('value', body.dependent_document_type_109); //dependent_document_type
                                    await browser.pause(100);
                  
                                    await panels210[110].setValue(' ');
                                    await panels210[110].setValue(body.dependent_identification_110); //dependent_identification
                                    await browser.pause(100);
                                    /*  if (body.disclaimer_994 === true)
                                   await panels210[111].click();  //disclaimer
                   
                                 await browser.pause(100); *
                  
                                    await panels210[112].setValue(' ');
                                    await panels210[112].setValue(body.full_payment_980); //full_payment
                                    await browser.pause(100);
                                    //35 de ultimo
                                    /* await economic_activity[2].selectByAttribute('value', body.kinship_112) //kinship
                                    await browser.pause(100);
                   */


                  /* Aqui oprmir el botton + */

                  const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
                  if (panelBUttonSave[1]) {

                    await browser.pause(1000);
                    await panelBUttonSave[1].click();
                    await browser.pause(1000);

                    const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');

                    console.log(await buttonSave.length);
                    if (await buttonSave.length === 3) {
                      await buttonSave[0].click(); // DESCARGAR
                      await browser.pause(2200);

                      /*  await buttonSave[1].click(); //Save
                       await browser.pause(1200);
     
                       const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                       await buttonacetar[1].click(); // buton confirmar
                       await browser.pause(1000); */

                    } else if (await buttonSave.length === 1) {
                      await buttonSave[0].click();
                      await browser.pause(1200);

                      const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                      await buttonacetar[1].click(); // buton confirmar
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
                  /* if (logoutPanel[6]) {
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
                  } */
                } else {
                  throw new BadRequestException({
                    error: 'BUTTON_FORM210_NOT_FOUND',
                    detail: 'No se logro encontrar los campos del formulario 210 para diligenciarlos'
                  });
                }
              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_UNE',
                  detail: 'No se logro seleccionar la pregunta 1.'
                });
              }
            } else {
              const tax_resident_1 = body.tax_resident_1 === true ? await popupQuestionFromItem[0] : await popupQuestionFromItem[1]
              const severance_pay_2016_2 = body.severance_pay_2016_2 === true ? await popupQuestionFromItem[2] : await popupQuestionFromItem[3]
              const public_server_3 = body.public_server_3 === true ? await popupQuestionFromItem[4] : await popupQuestionFromItem[5]
              const income_country_4 = body.income_country_4 === true ? await popupQuestionFromItem[6] : await popupQuestionFromItem[7]

              if (tax_resident_1.isExisting()) {
                await browser.pause(2000);
                await tax_resident_1.doubleClick();
                await browser.pause(2000);

              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_UNE',
                  detail: 'No se logro seleccionar la pregunta 1.'
                });
              }
              if (severance_pay_2016_2.isExisting()) {
                await browser.pause(2000);
                await severance_pay_2016_2.doubleClick();
                await browser.pause(1500);

              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_TWO',
                  detail: 'No se logro seleccionar la pregunta 2.'
                });
              }
              if (public_server_3.isExisting()) {
                await browser.pause(2000);
                await public_server_3.doubleClick();
                await browser.pause(1500);

              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_THREE',
                  detail: 'No se logro seleccionar la pregunta 3.'
                });
              }
              if (income_country_4.isExisting()) {
                await browser.pause(2000);
                await income_country_4.doubleClick();
                await browser.pause(1500);

              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_FOUR',
                  detail: 'No se logro seleccionar la pregunta 4.'
                });
              }
              const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
              await send.doubleClick(); // click al botton enviar
              await browser.pause(1000);

              const panels210 = await browser.$$('form div div div div input');

              if (panels210[0]) {
                const economic_activity = await browser.$$('form div div div div select');
                /* Datos Declarante */

                console.log(replay)
                await browser.pause(500);

                /* Aqui oprmir el botton  */

                const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
                if (panelBUttonSave[1]) {

                  await browser.pause(1000);
                  await panelBUttonSave[1].click();
                  await browser.pause(1000);

                  const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');

                  console.log(await buttonSave.length);
                  if (await buttonSave.length === 3) {
                    await buttonSave[0].click(); // DESCARGAR
                    await browser.pause(1000);

                    /*  await buttonSave[1].click(); //Save
                     await browser.pause(1200);
   
                     const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                     await buttonacetar[1].click(); // buton confirmar
                     await browser.pause(1000); */

                  } else if (await buttonSave.length >= 1) {
                    await buttonSave[0].click();
                    await browser.pause(1200);

                    const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                    await buttonacetar[1].click(); // buton confirmar
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
            }

            /*   console.log(await severance_pay_2016_2.getHTML());
              console.log(await public_server_3.getHTML());
              console.log(await income_country_4.getHTML());
              console.log('*****************'); */

            /* const buttonYes = await browser.$('input[id="mat-radio-32-input"]') */


            /*  await buttonYes.doubleClick(); */  // click al radio button Si 
            //aqui llenar formulario
            /*  const panels210 = await browser.$$('form div div div div input');
 
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
 
               /* Datos Declarante *
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
               /* Preguntas Si o No *
               const income_country_27 = body.income_country_27 === false ? await panels210[10] : await panels210[9];
               await income_country_27.doubleClick();
               await browser.pause(900);
 
               const retirement_unemployment_113 = body.retirement_unemployment_113 === false ? await panels210[10] : await panels210[9];
               await retirement_unemployment_113.doubleClick();
               await browser.pause(900);
 
               const millitary_forces_police_115 = body.millitary_forces_police_115 === false ? await panels210[11] : await panels210[12];
               await millitary_forces_police_115.doubleClick();
               await browser.pause(900);
 
               const compensation_insurance_117 = body.compensation_insurance_117 === false ? await panels210[13] : await panels210[14];
               await compensation_insurance_117.doubleClick();
               await browser.pause(900);
 
               const income_public_university_119 = body.income_public_university_119 === false ? await panels210[15] : await panels210[9];
               await income_public_university_119.doubleClick();
               await browser.pause(900);
 
               const public_servant_121 = body.public_servant_121 === false ? await panels210[10] : await panels210[9];
               await public_servant_121.doubleClick();
               await browser.pause(900);
 
               const hotel_rental_income_123 = body.hotel_rental_income_123 === false ? await panels210[10] : await panels210[9];
               await hotel_rental_income_123.doubleClick();
               await browser.pause(900);
 
               const work_rental_income_125 = body.work_rental_income_125 === false ? await panels210[10] : await panels210[9];
               await work_rental_income_125.doubleClick();
               await browser.pause(900);
 
               const can_capital_income_127 = body.can_capital_income_127 === false ? await panels210[10] : await panels210[9];
               await can_capital_income_127.doubleClick();
               await browser.pause(900);
 
               const not_work_rental_income_129 = body.not_work_rental_income_129 === false ? await panels210[10] : await panels210[9];
               await not_work_rental_income_129.doubleClick();
               await browser.pause(900);
 
               replay.push({ name: 'retirement_unemployment', value: await panels210[12].getValue() });
               replay.push({ name: 'millitary_forces_police', value: await panels210[14].getValue() });
               replay.push({ name: 'compensation_insurance', value: await panels210[16].getValue() });
               replay.push({ name: 'income_public_university', value: await panels210[18].getValue() });
               replay.push({ name: 'public_servant', value: await panels210[0].getValue() });
               replay.push({ name: 'hotel_rental_income', value: await panels210[0].getValue() });
               replay.push({ name: 'work_rental_income', value: await panels210[0].getValue() });
               replay.push({ name: 'can_capital_income', value: await panels210[0].getValue() });
               replay.push({ name: 'not_work_rental_income', value: await panels210[0].getValue() });
               /* Patrimonio *
               await panels210[29].setValue(' ');
               await panels210[29].setValue(body.patrimony_total_28); //patrimony_total
               await browser.pause(100);
 
               await panels210[30].setValue(' ');
               await panels210[30].setValue(body.debt_29); //debt
               await browser.pause(100);
 
               await panels210[32].setValue(' ');
               await panels210[32].setValue(body.total_income_rental_work_31) //total_income_rental_work
               await browser.pause(100);
 
               await panels210[33].setValue(' ');
               await panels210[33].setValue(body.not_constitutive_income_32); //not_constitutive_income
               await browser.pause(100);
 
               await panels210[34].setValue(' ');
               await panels210[34].setValue(body.cost_deduction_rt_33); //cost_deduction_rt
               await browser.pause(100);
 
               await panels210[36].setValue(' ');
               await panels210[36].setValue(body.exempt_rental_rt_35); //exempt_rental_rt
               await browser.pause(100);
 
               await panels210[39].setValue(' ');
               await panels210[39].setValue(body.total_capital_income_38); //total_capital_income
               await browser.pause(100);
 
               await panels210[40].setValue(' ');
               await panels210[40].setValue(body.income_not_constitutive_rental_39); //income_not_constitutive_rental
               await browser.pause(100);
 
               await panels210[41].setValue(' ');
               await panels210[41].setValue(body.cost_deduction_coming_40); //cost_deduction_coming
               await browser.pause(100);
 
               await panels210[43].setValue(' ');
               await panels210[43].setValue(body.liquid_rental_passive_rc_42); //liquid_rental_passive_rc
               await browser.pause(100);
 
               await panels210[48].setValue(' ');
               await panels210[48].setValue(body.compasion_loss_capital_rental_47); //compasion_loss_capital_rental
               await browser.pause(100);
 
               await panels210[50].setValue(' ');
               await panels210[50].setValue(body.total_income_rnl_49); //total_income_rnl
               await browser.pause(100);
 
               await panels210[51].setValue(' ');
               await panels210[51].setValue(body.discount_refund_50); //discount_refund
               await browser.pause(100);
 
               await panels210[52].setValue(' ');
               await panels210[52].setValue(body.income_not_constitutive_rental_rnl_51); //income_not_constitutive_rental_rnl
               await browser.pause(100);
 
               await panels210[53].setValue(' ');
               await panels210[53].setValue(body.cost_expense_rnl_52); //cost_expense_rnl
               await browser.pause(100);
 
               await panels210[55].setValue(' ');
               await panels210[55].setValue(body.not_labor_passive_liquid_rental_54); //not_labor_passive_liquid_rental
               await browser.pause(100);
 
               await panels210[56].setValue(' ');
               await panels210[56].setValue(body.rental_exempt_deduction_rnl_55); //rental_exempt_deduction_rnl
               await browser.pause(100);
 
               await panels210[60].setValue(' ');
               await panels210[60].setValue(body.compensation_loss_rental_rnl_59); //compensation_loss_rental_rnl
               await browser.pause(100);
 
               await panels210[65].setValue(' ');
               await panels210[65].setValue(body.compensation_lost_cg_64); //compensation_lost_cg
               await browser.pause(100);
 
               await panels210[66].setValue(' ');
               await panels210[66].setValue(body.excess_compensation_cg_65); //excess_compensation_cg
               await browser.pause(100);
 
               await panels210[67].setValue(' ');
               await panels210[67].setValue(body.taxable_rental_66); //taxable_rental
               await browser.pause(100);
 
               await panels210[69].setValue(' ');
               await panels210[69].setValue(body.presumptive_rental_cg_68); //presumptive_rental_cg
               await browser.pause(100);
 
               await panels210[70].setValue(' ');
               await panels210[70].setValue(body.total_income_rental_cp_69); //total_income_rental_cp aqui voy
               await browser.pause(100);
 
               await panels210[71].setValue(' ');
               await panels210[71].setValue(body.incomen_not_constitutive_rental_cp_70); //incomen_not_constitutive_rental_cp
               await browser.pause(100);
 
               await panels210[73].setValue(' ');
               await panels210[73].setValue(body.pension_exempt_rental_cp_72); //pension_exempt_rental_cp
               await browser.pause(100);
 
               await panels210[75].setValue(' ');
               await panels210[75].setValue(body.dividend_participation_cdp_74); //dividend_participation_cdp
               await browser.pause(100);
 
               await panels210[76].setValue(' ');
               await panels210[76].setValue(body.not_constitutive_income_cdp_75); //not_constitutive_income_cdp
               await browser.pause(100);
 
               await panels210[78].setValue(' ');
               await panels210[78].setValue(body.sub_cedula1_77); //sub_cedula1
               await browser.pause(100);
 
               await panels210[79].setValue(' ');
               await panels210[79].setValue(body.sub_cedula2_78); //sub_cedula2
               await browser.pause(100);
 
               await panels210[80].setValue(' ');
               await panels210[80].setValue(body.passive_liquid_rental_cdp_79); //passive_liquid_rental_cdp
               await browser.pause(100);
 
               await panels210[81].setValue(' ');
               await panels210[81].setValue(body.exempt_rental_cdp_80); //exempt_rental_cdp
               await browser.pause(100);
 
               await panels210[82].setValue(' ');
               await panels210[82].setValue(body.ingress_go_81); //ingress_go
               await browser.pause(100);
 
               await panels210[83].setValue(' ');
               await panels210[83].setValue(body.cost_go_82); //cost_go
               await browser.pause(100);
 
               await panels210[84].setValue(' ');
               await panels210[84].setValue(body.go_not_taxed_exempt_83); //go_not_taxed_exempt
               await browser.pause(100);
 
               await panels210[92].setValue(' ');
               await panels210[92].setValue(body.taxes_paid_abroad_91); //taxes_paid_abroad
               await browser.pause(100);
 
               await panels210[93].setValue(' ');
               await panels210[93].setValue(body.donations_92); //donations
               await browser.pause(100);
 
               await panels210[94].setValue(' ');
               await panels210[94].setValue(body.others_private_93); //others_private
               await browser.pause(100);
 
               await panels210[97].setValue(' ');
               await panels210[97].setValue(body.occasional_earnings_tax_96); //occasional_earnings_tax
               await browser.pause(100);
 
               await panels210[98].setValue(' ');
               await panels210[98].setValue(body.discount_taxes_occasional_income_97); //discount_taxes_occasional_income
               await browser.pause(100);
 
               await panels210[100].setValue(' ');
               await panels210[100].setValue(body.advance_rental_liquid_year_taxable_99); //advance_rental_liquid_year_taxable
               await browser.pause(100);
 
               await panels210[101].setValue(' ');
               await panels210[101].setValue(body.balance_favor_previous_taxable_year_100); //balance_favor_previous_taxable_year
               await browser.pause(100);
 
               await panels210[102].setValue(' ');
               await panels210[102].setValue(body.withholdings_taxable_year_to_report_101); //withholdings_taxable_year_to_report
               await browser.pause(100);
 
               await panels210[103].setValue(' ');
               await panels210[103].setValue(body.income_advance_following_taxable_year_102); //income_advance_following_taxable_year
               await browser.pause(100);
 
               await panels210[105].setValue(' ');
               await panels210[105].setValue(body.sanctions_104); //sanctions
               await browser.pause(100);
 
               await panels210[108].setValue(' ');
               await panels210[108].setValue(body.signatory_identification_107); //signatory_identification
               await browser.pause(100);
 
               await economic_activity[1].selectByAttribute('value', body.dependent_document_type_109); //dependent_document_type
               await browser.pause(100);
 
               await panels210[110].setValue(' ');
               await panels210[110].setValue(body.dependent_identification_110); //dependent_identification
               await browser.pause(100);
               //35 de ultimo
               await economic_activity[2].selectByAttribute('value', body.kinship_112) //kinship
               await browser.pause(100);
 
               /*  if (body.disclaimer_994 === true)
                  await panels210[111].click();  //disclaimer
  
                await browser.pause(100); *
 
               await panels210[112].setValue(' ');
               await panels210[112].setValue(body.full_payment_980); //full_payment
               await browser.pause(100);
 
               replay.push({ name: 'patrimony_total', value: await panels210[29].getValue() });
               replay.push({ name: 'debt', value: await panels210[30].getValue() });
               replay.push({ name: 'total_income_rental_work', value: await panels210[31].getValue() });
               /* Rentas de trabajo *
               replay.push({ name: 'total_income_rental_work', value: await panels210[32].getValue() });
               replay.push({ name: 'not_constitutive_income', value: await panels210[33].getValue() });
               replay.push({ name: 'cost_deduction_rt', value: await panels210[34].getValue() });
               replay.push({ name: 'liquid_rental_rt', value: await panels210[35].getValue() });
               replay.push({ name: 'exempt_rental_rt', value: await panels210[36].getValue() });
               replay.push({ name: 'limit_rental_exempt_rt', value: await panels210[37].getValue() });
               replay.push({ name: 'liquid_rental_work_rt', value: await panels210[38].getValue() });
               /* Rentas de capital *
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
               /* Rentas no laborales *
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
               /*Cédula general:  *
               replay.push({ name: 'liquid_rental_cg', value: await panels210[62].getValue() });
               replay.push({ name: 'rental_exempt_deduction_cg', value: await panels210[63].getValue() });
               replay.push({ name: 'ordinaty_rental_cg', value: await panels210[64].getValue() });
               replay.push({ name: 'compensation_lost_cg', value: await panels210[65].getValue() });
               replay.push({ name: 'excess_compensation_cg', value: await panels210[66].getValue() });
               replay.push({ name: 'taxable_rental', value: await panels210[67].getValue() });
               replay.push({ name: 'liquid_rental_taxable_cg', value: await panels210[68].getValue() });
               replay.push({ name: 'presumptive_rental_cg', value: await panels210[69].getValue() });
               /*  Cédula de pensiones*
               replay.push({ name: 'total_income_rental_cp', value: await panels210[70].getValue() });
               replay.push({ name: 'incomen_not_constitutive_rental_cp', value: await panels210[71].getValue() });
               replay.push({ name: 'liquid_rental_cp', value: await panels210[72].getValue() });
               replay.push({ name: 'pension_exempt_rental_cp', value: await panels210[73].getValue() });
               replay.push({ name: 'liquid_rental_pension_cp', value: await panels210[74].getValue() });
               /* Cédula de dividendos y participaciones *
               replay.push({ name: 'dividend_participation_cdp', value: await panels210[75].getValue() });
               replay.push({ name: 'not_constitutive_income_cdp', value: await panels210[76].getValue() });
               replay.push({ name: 'ordinary_liquid_rental_cdp', value: await panels210[77].getValue() });
               replay.push({ name: 'sub_cedula1', value: await panels210[78].getValue() });
               replay.push({ name: 'sub_cedula2', value: await panels210[79].getValue() });
               replay.push({ name: 'passive_liquid_rental_cdp', value: await panels210[80].getValue() });
               replay.push({ name: 'exempt_rental_cdp', value: await panels210[81].getValue() });
               /* Ganancia ocasional *
               replay.push({ name: 'ingress_go', value: await panels210[82].getValue() });
               replay.push({ name: 'cost_go', value: await panels210[83].getValue() });
               replay.push({ name: 'go_not_taxed_exempt', value: await panels210[84].getValue() });
               replay.push({ name: 'go_taxed', value: await panels210[85].getValue() });
               /*  Liquidación privada*
               replay.push({ name: 'general_pension', value: await panels210[86].getValue() });
               replay.push({ name: 'presumptive_rental_pension', value: await panels210[87].getValue() });
               replay.push({ name: 'participation_dividend_lp', value: await panels210[88].getValue() });
               replay.push({ name: 'dividends_shares_2017_1', value: await panels210[89].getValue() });
               replay.push({ name: 'dividends_shares_2017_2', value: await panels210[90].getValue() });
               replay.push({ name: 'total_taxable_liquid_income', value: await panels210[91].getValue() });
               replay.push({ name: 'taxes_paid_abroad', value: await panels210[92].getValue() });
               replay.push({ name: 'donations', value: await panels210[93].getValue() });
               replay.push({ name: 'others_private', value: await panels210[94].getValue() });
               replay.push({ name: 'tax_discounts', value: await panels210[95].getValue() });
               replay.push({ name: 'total_income_tax', value: await panels210[96].getValue() });
               replay.push({ name: 'occasional_earnings_tax', value: await panels210[97].getValue() });
               replay.push({ name: 'discount_taxes_occasional_income', value: await panels210[98].getValue() });
               replay.push({ name: 'total_tax_charged', value: await panels210[99].getValue() });
               replay.push({ name: 'advance_rental_liquid_year_taxable', value: await panels210[100].getValue() });
               replay.push({ name: 'balance_favor_previous_taxable_year', value: await panels210[101].getValue() });
               replay.push({ name: 'withholdings_taxable_year_to_report', value: await panels210[102].getValue() });
               replay.push({ name: 'income_advance_following_taxable_year', value: await panels210[103].getValue() });
               replay.push({ name: 'balance_pay_tax', value: await panels210[104].getValue() });
               replay.push({ name: 'sanctions', value: await panels210[105].getValue() });
               replay.push({ name: 'total_balance_pay', value: await panels210[106].getValue() });
               replay.push({ name: 'total_balance_favor', value: await panels210[107].getValue() });
               /* Firmas *
               replay.push({ name: 'signatory_identification', value: await panels210[108].getValue() });
               replay.push({ name: 'DV_firm', value: await panels210[109].getValue() });
               /*  replay.push({ name: 'dependent_document_type', value: body.dependent_document_type }); * // validar
               replay.push({ name: 'dependent_identification', value: await panels210[110].getValue() });
               /*  replay.push({ name: 'kinship', value: body.kinship }); // validar *
               replay.push({ name: 'disclaimer', value: await panels210[111].getValue() });
               /*  Pago total*
               replay.push({ name: 'full_payment', value: await panels210[112].getValue() });
 
               /* await servico(dv,nit,first_lastname,second_lastname,first_name,other_name,sectional_address_code,panels210); *
 
               console.log(replay)
               await browser.pause(500);
 
               /* Aqui oprmir el botton + *
 
               const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
               if (panelBUttonSave[1]) {
 
                 await browser.pause(1000);
                 await panelBUttonSave[1].click();
                 await browser.pause(1000);
 
                 const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');
 
                 console.log(await buttonSave.length);
                 if (await buttonSave.length === 3) {
                   await buttonSave[0].click(); // DESCARGAR
                   await browser.pause(2200);
 
                   /*  await buttonSave[1].click(); //Save
                    await browser.pause(1200);
  
                    const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                    await buttonacetar[1].click(); // buton confirmar
                    await browser.pause(1000); *
 
                 } else if (await buttonSave.length === 1) {
                   await buttonSave[0].click();
                   await browser.pause(1200);
 
                   const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                   await buttonacetar[1].click(); // buton confirmar
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
               /* Logout Panel *
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
             }*/

          } else {
            throw new BadRequestException({
              error: 'POPUP_QUESTION_FORM_NOT_FOUND',
              detail: 'No se logro encontrar el formulario de la modal de preguntas emergente'
            });
          }




          /*    } else {
               throw new BadRequestException({
                 error: ' SELECT_YEAR_NOT_FOUND',
                 detail: `La lista de años no se encontro.`
               });
             } */
          /*           } else {
                      throw new BadRequestException({
                        error: 'MODAL_QUESTION_NOT_FOUND',
                        detail: 'No se encontro el button si para responder la pregunta ¿Es usted residente fiscal en Colombia para efectos tributarios?'
                      });
                    } */
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
      await browser.deleteSession();
    } catch (err) {
      console.log(err)
      if (err.response) {
        await this.auditRepository.save({
          name: err.response.error,
          detail: err.response.detail,
          user: body.document,
          process: 'Declaración de Renta-Formulario 210',
          view: await browser.getUrl() || `${process.env.DIAN_URL_BASE}`
        })

        await browser.deleteSession()
        return err.response
      }
      if (err.name == 'stale element reference') {
        await this.auditRepository.save({
          name: 'STALE_ELEMENT_REFERENCE',
          detail: 'referencia de elemento obsoleto',
          user: body.document,
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
        return err;
      }
    }
    return { success: 'OK', data: replay }
  }

}