import { InjectRepository } from "@nestjs/typeorm";
import { Logger, BadRequestException } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Repository } from "typeorm";
import { Job, DoneCallback } from "bull";
import { remote } from "webdriverio";
import { config } from '../../../../wdio.conf';
import { Audit } from "../../../entities/security/audit.entity";

@Processor('dian')
export class IncomeProcessor {
  private readonly logger = new Logger(IncomeProcessor.name);
  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  @Process({ name: 'rentalDeclaration' })
  async rentalDeclaration(job: Job<any>, callback: DoneCallback) {
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
      });

    /*  const replay = [] */
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
            detail: 'No se encontraron los campos para diligenciar el número de cédula y la contraseña.'
          });
        }
        console.log('VALIDATE LOGIN ✅');
        await browser.pause(500);

        /* Open Dashboard*/
        const dashboardForm = await browser.$$('form table input');
        await browser.pause(500);
        if (dashboardForm[0]) {
          console.log('SUCCESSFULL LOGIN ✅');
          console.log('DASHBOARD OPEN ✅');
          console.log('FORM 210 OPEN ✅');

          /*           if ((body.year_Rental_Declaration === 2019 && body.indicative === 16)) {
                      await browser.navigateTo(`https://muisca.dian.gov.co/WebFormRenta210v${body.indicative}/?concepto=inicial&anio=${body.year_Rental_Declaration}&periodicidad=anual&periodo=1`);
                      const isPopupQuestionFrom = await browser.$('div mat-card div[class="mat-dialog-content"] div');
                      const popupQuestionFromItem = await isPopupQuestionFrom.$$('mat-card-content div mat-radio-button input[type="radio"');
          
                    } else if ((body.year_Rental_Declaration === 2018 && body.indicative === 14) || (body.year_Rental_Declaration === 2017 && body.indicative === 13)) {
                      await browser.navigateTo('https://muisca.dian.gov.co/WebDilIngresoFormRenta210');
          
                    } else {
                      throw new BadRequestException({
                        error: 'YEAR_NOT_FOUNT_DIAN',
                        detail: 'No se logro seleccionar la pregunta 2.'
                      });
                    } */

          await browser.navigateTo(`https://muisca.dian.gov.co/WebFormRenta210v${body.indicative}/?concepto=inicial&anio=${body.year_Rental_Declaration}&periodicidad=anual&periodo=1`);
          const isPopupQuestionFrom = await browser.$('div mat-card div[class="mat-dialog-content"] div');
          const popupQuestionFromItem = await isPopupQuestionFrom.$$('mat-card-content div mat-radio-button input[type="radio"');

          if (isPopupQuestionFrom) {
            if (body.year_Rental_Declaration === 2019) {

              await browser.pause(1000);
              const tax_resident_1 = body.tax_resident_1 === true ? popupQuestionFromItem[0] : popupQuestionFromItem[1];
              await browser.pause(1000);
              /*   if (tax_resident_1.isExisting()) {  */
              await tax_resident_1.doubleClick();
              await tax_resident_1.doubleClick();
              await browser.pause(1500);

              const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
              await send.doubleClick(); // click al botton enviar
              await browser.pause(2000);

              // let inputText = await browser.$$('form div div div div input[type="text"]');
              await browser.pause(2000)
              const inputRadio = await browser.$$('form div div div div input[type="radio"]');
              await browser.pause(2000);
              const inputSelect = await browser.$$('form div div div div select');
              await browser.pause(2000);

              if (inputRadio[0]) {
                await browser.pause(3000);

                const income_country_27 = await body.income_country_27 === true ? await inputRadio[0] : await inputRadio[1];
                await income_country_27.doubleClick(); // 27 *
                await browser.pause(3000);

                const retirement_unemployment_113 = await body.retirement_unemployment_113 === true ? await inputRadio[2] : await inputRadio[3];
                await browser.pause(3500);
                await retirement_unemployment_113.doubleClick();
                await retirement_unemployment_113.doubleClick();
                await browser.pause(3000);

                await browser.pause(3000);
                let millitary_forces_police_115 = await body.millitary_forces_police_115 === true ? await inputRadio[4] : await inputRadio[5];
                millitary_forces_police_115 = await body.millitary_forces_police_115 === true ? await inputRadio[4] : await inputRadio[5];
                await browser.pause(3000);
                await millitary_forces_police_115.doubleClick();
                await millitary_forces_police_115.doubleClick();
                await browser.pause(3000);

                /*            await browser.pause(3000);
                           let compensation_insurance_117 = await body.compensation_insurance_117 === true ? await inputRadio[6] : await inputRadio[7];
                           await browser.pause(3000);
                           compensation_insurance_117 = await body.compensation_insurance_117 === true ? await inputRadio[6] : await inputRadio[7];
                           await browser.pause(3000);
                           await compensation_insurance_117.doubleClick();
                           await compensation_insurance_117.doubleClick();
                           await browser.pause(3000); */


                /* const compensation_insurance_117 = await body.compensation_insurance_117 === true ? await inputRadio[6] : await inputRadio[7];
                await browser.pause(3000);
                await compensation_insurance_117.doubleClick();
                await browser.pause(3000);

                if (await body.compensation_insurance_117 === true) {
                  const input118 = await browser.$('input[id="cs_id_118"]')
                  await browser.pause(3000);
                  await input118.setValue(' ');
                  await input118.setValue(body.response_compensation_insurance_118);  //respuesta 117
                  await browser.pause(3000);
                } */
                await browser.pause(3000);
                let income_public_university_119 = await body.income_public_university_119 === true ? await inputRadio[8] : await inputRadio[9];
                await browser.pause(3000);
                income_public_university_119 = await body.income_public_university_119 === true ? await inputRadio[8] : await inputRadio[9];
                await browser.pause(3000);
                await income_public_university_119.doubleClick();
                await income_public_university_119.doubleClick();
                await browser.pause(3000);

                /*            await browser.pause(3000);
                           let public_servant_121 = await body.public_servant_121 === true ? await inputRadio[10] : await inputRadio[11];
                           await browser.pause(3000);
                           public_servant_121 = await body.public_servant_121 === true ? await inputRadio[10] : await inputRadio[11];
                           await browser.pause(3000);
                           await public_servant_121.doubleClick();
                           await public_servant_121.doubleClick();
                           await browser.pause(3000); */

                /* const public_servant_121 = await body.public_servant_121 === true ? await inputRadio[10] : await inputRadio[11];
                await browser.pause(3000);
                await public_servant_121.doubleClick();
                await browser.pause(3000);

                if (await body.public_servant_121 === true) {
                  const input122 = await browser.$('input[id="cs_id_122"]')
                  await browser.pause(3000);
                  await input122.setValue(' ');
                  await input122.setValue(body.response_public_servant_122);  //respuesta 121
                  await browser.pause(3000);
                }

                const hotel_rental_income_123 = await body.hotel_rental_income_123 === true ? await inputRadio[12] : await inputRadio[13];
                await browser.pause(3000);
                await hotel_rental_income_123.doubleClick();
                await browser.pause(3000);

                if (await body.hotel_rental_income_123 === true) {
                  const input124 = await browser.$('input[id="cs_id_124"]')
                  await browser.pause(3000);
                  await input124.setValue(' ');
                  await input124.setValue(body.response_hotel_rental_income_124);  //respuesta 123
                  await browser.pause(3000);
                } */
                /*  await browser.pause(3000);
 
                  let hotel_rental_income_123 = await body.hotel_rental_income_123 === true ? await inputRadio[12] : await inputRadio[13];
                 await browser.pause(3000);
                 hotel_rental_income_123 = await body.hotel_rental_income_123 === true ? await inputRadio[12] : await inputRadio[13];
                 await hotel_rental_income_123.doubleClick();
                 await browser.pause(3000);
                 await hotel_rental_income_123.doubleClick();
                 await browser.pause(3000); */

                let work_rental_income_125 = await body.work_rental_income_125 === true ? await inputRadio[14] : await inputRadio[15];
                await browser.pause(3000);
                work_rental_income_125 = await body.work_rental_income_125 === true ? await inputRadio[14] : await inputRadio[15];
                await browser.pause(3000);
                await work_rental_income_125.doubleClick();
                work_rental_income_125 = await body.work_rental_income_125 === true ? await inputRadio[14] : await inputRadio[15];

                await work_rental_income_125.doubleClick();
                await browser.pause(3000);

                /*       await browser.pause(3000);
                      let can_capital_income_127 = await body.can_capital_income_127 === true ? await inputRadio[16] : await inputRadio[17];
                      await browser.pause(3000);
                      can_capital_income_127 = await body.can_capital_income_127 === true ? await inputRadio[16] : await inputRadio[17];
                      await browser.pause(3000);
                      await can_capital_income_127.doubleClick();
                      await can_capital_income_127.doubleClick();
                      await browser.pause(3000); */

                /* const can_capital_income_127 = await body.can_capital_income_127 === true ? await inputRadio[16] : await inputRadio[17];
                await browser.pause(3000);
                await can_capital_income_127.doubleClick();
                await browser.pause(3000);

                if (await body.can_capital_income_127 === true) {
                  const input128 = await browser.$('input[id="cs_id_128"]')
                  await browser.pause(3000);
                  await input128.setValue(' ');
                  await input128.setValue(body.response_can_capital_income_128);  //respuesta 127
                  await browser.pause(3000);
                } */
                await browser.pause(3000);

                let not_work_rental_income_129 = await body.not_work_rental_income_129 === true ? await inputRadio[18] : await inputRadio[19];
                await browser.pause(3000);
                not_work_rental_income_129 = await body.not_work_rental_income_129 === true ? await inputRadio[18] : await inputRadio[19];
                await browser.pause(3000);
                await not_work_rental_income_129.doubleClick();
                await not_work_rental_income_129.doubleClick();
                await browser.pause(3000);

                if (await body.retirement_unemployment_113 === true) {
                  await browser.pause(3000);
                  const input114 = await browser.$('input[id="cs_id_114"]')
                  await browser.pause(3000);
                  await input114.clearValue()
                  await input114.setValue(await body.response_retirement_unemployment_114);  //respuesta 113
                  await browser.pause(3000);
                }
                if (await body.millitary_forces_police_115 === true) {
                  await browser.pause(3000);
                  const input116 = await browser.$('input[id="cs_id_116"]')
                  await browser.pause(3000);
                  await input116.clearValue()
                  await input116.setValue(body.response_millitary_forces_police_116);  //respuesta 115
                  await browser.pause(3000);
                }
                if (await body.income_public_university_119 === true) {
                  await browser.pause(3000);
                  const input120 = await browser.$('input[id="cs_id_120"]')
                  await browser.pause(3000);
                  await input120.clearValue()
                  await input120.setValue(body.response_income_public_university_120);  //respuesta 119
                  await browser.pause(3000);
                }
                if (await body.work_rental_income_125 === true) {
                  await browser.pause(3000);
                  const input126 = await browser.$('input[id="cs_id_126"]')
                  await browser.pause(3000);
                  await input126.clearValue()
                  await input126.setValue(body.response_work_rental_income_126);  //respuesta 125
                  await browser.pause(3000);
                }
                if (await body.not_work_rental_income_129 === true) {
                  await browser.pause(3000);
                  const input130 = await browser.$('input[id="cs_id_130"]')
                  await browser.pause(3000);
                  await input130.clearValue()
                  await input130.setValue(body.response_not_work_rental_income_130);  //respuesta 129
                  await browser.pause(3000);
                }

                /* Patrimonio */
                await browser.pause(2500);
                const input28 = await browser.$('input[id="cs_id_28"]')
                await input28.clearValue()
                await input28.setValue(body.patrimony_total_28); //patrimony_total
                await browser.pause(2500);

                await browser.pause(2500);
                const input29 = await browser.$('input[id="cs_id_29"]')
                await input29.clearValue()
                await input29.setValue(body.debt_29); //debt
                await browser.pause(2500);


                await browser.pause(2500);
                const input31 = await browser.$('input[id="cs_id_31"]')
                await input31.clearValue()
                await input31.setValue(body.total_income_rental_work_31) //total_income_rental_work
                await browser.pause(2500);

                await browser.pause(2500);
                const input32 = await browser.$('input[id="cs_id_32"]')
                await input32.setValue(' ');
                await input32.setValue(body.not_constitutive_income_32); //not_constitutive_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input33 = await browser.$('input[id="cs_id_33"]')
                await input33.setValue(' ');
                await input33.setValue(body.cost_deduction_rt_33); //cost_deduction_rt
                await browser.pause(2500);

                /*  */
                await browser.pause(2500);
                const input38 = await browser.$('input[id="cs_id_38"]')
                await input38.setValue(' ');
                await input38.setValue(body.total_capital_income_38); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input39 = await browser.$('input[id="cs_id_39"]')
                await input39.setValue(' ');
                await input39.setValue(body.income_not_constitutive_rental_39); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input40 = await browser.$('input[id="cs_id_40"]')
                await input40.setValue(' ');
                await input40.setValue(body.cost_deduction_coming_40); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input42 = await browser.$('input[id="cs_id_42"]')
                await input42.setValue(' ');
                await input42.setValue(body.liquid_rental_passive_rc_42); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input43 = await browser.$('input[id="cs_id_43"]')
                await input43.setValue(' ');
                await input43.setValue(body.exempt_rental_rc_43); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input47 = await browser.$('input[id="cs_id_47"]')
                await input47.clearValue()
                await input47.setValue(body.compasion_loss_capital_rental_47); //total_capital_income
                await browser.pause(3000);

                await browser.pause(3000);
                let input49 = await browser.$('input[id="cs_id_49"][name="cs_id_49"][type="text"]');
                input49 = await browser.$('input[id="cs_id_49"][name="cs_id_49"][type="text"]');
                await input49.clearValue();
                await input49.setValue(body.total_income_rnl_49); //total_income_rnl_49
                await browser.pause(2500);

                await browser.pause(2500);
                const input50 = await browser.$('input[id="cs_id_50"]')
                await input50.clearValue()
                await input50.setValue(body.discount_refund_50); //discount_refund_50
                await browser.pause(2500);

                await browser.pause(2500);
                const input51 = await browser.$('input[id="cs_id_51"]')
                await input51.setValue(' ');
                await input51.setValue(body.income_not_constitutive_rental_rnl_51); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input52 = await browser.$('input[id="cs_id_52"]')
                await input52.setValue(' ');
                await input52.setValue(body.cost_expense_rnl_52); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input54 = await browser.$('input[id="cs_id_54"]')
                await input54.setValue(' ');
                await input54.setValue(body.not_labor_passive_liquid_rental_54); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input55 = await browser.$('input[id="cs_id_55"]')
                await input55.setValue(' ');
                await input55.setValue(body.rental_exempt_deduction_rnl_55); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input59 = await browser.$('input[id="cs_id_59"]')
                await input59.setValue(' ');
                await input59.setValue(body.compensation_loss_rental_rnl_59); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input64 = await browser.$('input[id="cs_id_64"]')
                await input64.setValue(' ');
                await input64.setValue(body.compensation_lost_cg_64); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input65 = await browser.$('input[id="cs_id_65"]')
                await input65.setValue(' ');
                await input65.setValue(body.excess_compensation_cg_65); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input66 = await browser.$('input[id="cs_id_66"]')
                await input66.setValue(' ');
                await input66.setValue(body.taxable_rental_66); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input68 = await browser.$('input[id="cs_id_68"]')
                await input68.setValue(' ');
                await input68.setValue(body.presumptive_rental_cg_68); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input69 = await browser.$('input[id="cs_id_69"]')
                await input69.setValue(' ');
                await input69.setValue(body.total_income_rental_cp_69); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input70 = await browser.$('input[id="cs_id_70"]')
                await input70.setValue(' ');
                await input70.setValue(body.incomen_not_constitutive_rental_cp_70); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input72 = await browser.$('input[id="cs_id_72"]')
                await input72.setValue(' ');
                await input72.setValue(body.pension_exempt_rental_cp_72); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input74 = await browser.$('input[id="cs_id_74"]')
                await input74.setValue(' ');
                await input74.setValue(body.dividend_participation_cdp_74); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input75 = await browser.$('input[id="cs_id_75"]')
                await input75.clearValue()
                await input75.setValue(body.not_constitutive_income_cdp_75); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input77 = await browser.$('input[id="cs_id_77"]')
                await input77.clearValue()
                await input77.setValue(body.sub_cedula1_77); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input78 = await browser.$('input[id="cs_id_78"]')
                await input78.clearValue()
                await input78.setValue(body.sub_cedula2_78); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input79 = await browser.$('input[id="cs_id_79"]')
                await input79.clearValue()
                await input79.setValue(body.passive_liquid_rental_cdp_79); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input80 = await browser.$('input[id="cs_id_80"]')
                await input80.clearValue()
                await input80.setValue(body.exempt_rental_cdp_80); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input81 = await browser.$('input[id="cs_id_81"]')
                await input81.clearValue()
                await input81.setValue(body.ingress_go_81); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input82 = await browser.$('input[id="cs_id_82"]')
                await input82.clearValue()
                await input82.setValue(body.cost_go_82); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input83 = await browser.$('input[id="cs_id_83"]')  // AQUI
                await input83.clearValue()
                await input83.setValue(body.go_not_taxed_exempt_83); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input91 = await browser.$('input[id="cs_id_91"]')
                await input91.clearValue()
                await input91.setValue(body.taxes_paid_abroad_91); // aqui rango de aquie hasta aqui 
                await browser.pause(2500);

                await browser.pause(2500);
                const input92 = await browser.$('input[id="cs_id_92"]')
                await input92.clearValue()
                await input92.setValue(body.donations_92); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input93 = await browser.$('input[id="cs_id_93"]')
                await input93.clearValue()
                await input93.setValue(body.others_private_93); //el mismo bugsito
                await browser.pause(2500);

                await browser.pause(2500);
                const input96 = await browser.$('input[id="cs_id_96"]')
                await input96.clearValue()
                await input96.setValue(body.occasional_earnings_tax_96); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input97 = await browser.$('input[id="cs_id_97"]')
                await input97.clearValue()
                await input97.setValue(body.discount_taxes_occasional_income_97); //total_capital_income
                await browser.pause(2500);

                /*                 await browser.pause(2500);
                                const input98 = await browser.$('input[id="cs_id_98"]')
                                await input98.clearValue()
                                await input98.setValue(body.total_tax_charged_98); // no se hace verificar 
                                await browser.pause(2500); */

                await browser.pause(2500);
                const input99 = await browser.$('input[id="cs_id_99"]')
                await input99.clearValue()
                await input99.setValue(body.advance_rental_liquid_year_taxable_99); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input100 = await browser.$('input[id="cs_id_100"]')
                await input100.clearValue()
                await input100.setValue(body.balance_favor_previous_taxable_year_100); //total_capital_income
                await browser.pause(2500);

                /*                await browser.pause(2500);
                               const input103 = await browser.$('input[id="cs_id_103"]')
                               await browser.pause(1500);
                               await input103.clearValue()
                               await browser.pause(1500);
                               await input103.setValue(body.balance_pay_tax_103); //total_capital_income
                               await browser.pause(2500); */

                await browser.pause(2500);
                const input104 = await browser.$('input[id="cs_id_104"]')
                await browser.pause(1500);
                await input104.clearValue()
                await browser.pause(1500);
                await input104.setValue(body.sanctions_104); //total_capital_income
                await browser.pause(2500);


                await browser.pause(2500);
                const input107 = await browser.$('input[id="cs_id_107"]')
                await browser.pause(1500);
                await input107.clearValue();
                await browser.pause(1500);
                await input107.setValue(body.signatory_identification_107); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                inputSelect[1].selectByAttribute('value', body.dependent_document_type_109);
                await browser.pause(2500);

                await browser.pause(2500);
                const input110 = await browser.$('input[id="cs_id_110"]')
                await input110.setValue(' ');
                await input110.setValue(body.dependent_identification_110); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                inputSelect[2].selectByAttribute('value', body.kinship_112);
                await browser.pause(2500);

                /*  if (await body.disclaimer_994 === true) {
                   await browser.pause(2500);
                   const disclaimer = await browser.$('input[name="cs_id_994"]')
                   console.log(await disclaimer.getHTML())
                   console.log(await disclaimer.isClickable())
                   await disclaimer.click();
                   await browser.pause(2500);
                 } */

                await browser.pause(2500);
                const input101 = await browser.$('input[id="cs_id_101"]')
                await input101.clearValue()
                await input101.setValue(body.withholdings_taxable_year_to_report_101); //total_capital_income
                await browser.pause(2500);

                await browser.pause(3500);
                const input102 = await browser.$('input[id="cs_id_102"]')
                await browser.pause(1500);
                await input102.clearValue()
                await browser.pause(1500);
                await input102.setValue(body.income_advance_following_taxable_year_102); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input980 = await browser.$('input[id="cs_id_980"]')
                await input980.clearValue()
                await input980.setValue(body.full_payment_980); //total_capital_income
                await browser.pause(2500);

                await browser.pause(2500);
                const input35 = await browser.$('input[id="cs_id_35"]')
                await input35.clearValue()
                await input35.setValue(body.exempt_rental_rt_35); //exempt_rental_rt
                await browser.pause(2500);

                /* Aqui oprmir el botton */
                const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
                if (panelBUttonSave[1]) {

                  await browser.pause(1500);
                  await panelBUttonSave[0].click();
                  await browser.pause(1500);

                  const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');

                  console.log(await buttonSave.length);
                  if (await buttonSave.length === 3) {
                    await buttonSave[0].doubleClick(); // DESCARGAR
                    await browser.pause(4500);

                  } else if (await buttonSave.length === 1) {
                    await buttonSave[0].doubleClick(); // guardar
                    await browser.pause(3500);

                    const buttonacetar = await browser.$$('mat-card div[class="mat-dialog-actions"] button')
                    await buttonacetar[0].doubleClick(); // buton confirmar para guardar
                    await browser.pause(3000);

                    const cerrar = await browser.$('button[class="mat-button"]');
                    await cerrar.doubleClick();
                    await browser.pause(3000);

                    await browser.pause(4000);
                    const newOptionMenu = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');
                    await newOptionMenu[0].doubleClick();
                    await browser.pause(4500);

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
                await browser.pause(3000);
                const logoutPanel = await browser.$$('div button');
                /* Logout Panel */
                if (logoutPanel[6]) {
                  console.log('LOGOUT PANEL OPENED ✅')
                  await logoutPanel[6].doubleClick(); // button logout
                  await browser.pause(2000);

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
              /*           } else {
                          throw new BadRequestException({
                            error: 'NOT_SELECT_QUESTION_UNE',
                            detail: 'No se logro seleccionar la pregunta 1.'
                          });
                        } */
            } else if (body.year_Rental_Declaration === 2017) {
              await browser.navigateTo('https://muisca.dian.gov.co/WebDilIngresoFormRenta210');
              await browser.refresh()
              await browser.pause(3500);
              const buttonAll = await browser.$$('div ingreso > div button');
              await browser.pause(2000);
              if (buttonAll) {
                /* console.log(await buttonAll[0].isClickable()); */
                await buttonAll[0].click(); // OPEN SELECT 2017
                await browser.pause(2000);

                const menuYear = await browser.$$('div[class="mat-menu-content ng-trigger ng-trigger-fadeInItems"] button')
                await menuYear[2].click();
                await browser.pause(3000);

                await buttonAll[4].click(); //  CREAR 2017
                await browser.pause(2000);
                const popupQuestionFromItem2 = await browser.$$('div mat-card div[class="mat-dialog-content"] div mat-card-content div mat-radio-button input[type="radio"]')
                await browser.pause(3000);

                const tax_resident_1 = body.tax_resident_1 === true ? await popupQuestionFromItem2[0] : await popupQuestionFromItem2[1]
                console.log(await tax_resident_1)
                await browser.pause(3000);
                const severance_pay_2016_2 = body.severance_pay_2016_2 === true ? await popupQuestionFromItem2[2] : await popupQuestionFromItem2[3]
                await browser.pause(3000);
                const public_server_3 = body.public_server_3 === true ? await popupQuestionFromItem2[4] : await popupQuestionFromItem2[5]
                await browser.pause(3000);
                const income_country_4 = body.income_country_4 === true ? await popupQuestionFromItem2[6] : await popupQuestionFromItem2[7]
                await browser.pause(3000);

                console.log(await tax_resident_1.getHTML())
                await browser.pause(3000);

                if (tax_resident_1.isExisting()) {

                } else {
                  throw new BadRequestException({
                    error: 'NOT_SELECT_QUESTION_UNE',
                    detail: 'No se logro seleccionar la pregunta 1.'
                  });
                }
                await browser.pause(3000);

                if (severance_pay_2016_2.isExisting()) {
                  await severance_pay_2016_2.click();
                  await browser.pause(3500);

                } else {
                  throw new BadRequestException({
                    error: 'NOT_SELECT_QUESTION_TWO',
                    detail: 'No se logro seleccionar la pregunta 2.'
                  });
                }
                await browser.pause(3000);

                if (public_server_3.isExisting()) {
                  await public_server_3.doubleClick();
                  await browser.pause(3500);

                } else {
                  throw new BadRequestException({
                    error: 'NOT_SELECT_QUESTION_THREE',
                    detail: 'No se logro seleccionar la pregunta 3.'
                  });
                }
                await browser.pause(3000);

                if (income_country_4.isExisting()) {
                  await income_country_4.doubleClick();
                  await browser.pause(3000);

                } else {
                  throw new BadRequestException({
                    error: 'NOT_SELECT_QUESTION_FOUR',
                    detail: 'No se logro seleccionar la pregunta 4.'
                  });
                }
                await browser.pause(3000);

                const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
                await send.doubleClick(); // click al botton enviar
                await browser.pause(2000);

                const inputText = await browser.$$('form div div div div input');
                await browser.pause(3000);

                if (inputText[0]) {
                  const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
                  if (panelBUttonSave[1]) {

                    const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');
                    await browser.pause(3000);

                    if (await buttonSave.length === 3) {
                      await buttonSave[0].click(); // DESCARGAR
                      await browser.pause(3500);
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

              /* const tax_resident_1 = body.tax_resident_1 === true ? await popupQuestionFromItem[0] : await popupQuestionFromItem[1]
              await browser.pause(3000);
              const severance_pay_2016_2 = body.severance_pay_2016_2 === true ? await popupQuestionFromItem[2] : await popupQuestionFromItem[3]
              await browser.pause(3000);
              const public_server_3 = body.public_server_3 === true ? await popupQuestionFromItem[4] : await popupQuestionFromItem[5]
              await browser.pause(3000);
              const income_country_4 = body.income_country_4 === true ? await popupQuestionFromItem[6] : await popupQuestionFromItem[7]
              await browser.pause(3000);
 
              if (tax_resident_1.isExisting()) {
                await browser.pause(3000);
                await tax_resident_1.doubleClick();
                await browser.pause(3000);
 
              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_UNE',
                  detail: 'No se logro seleccionar la pregunta 1.'
                });
              }
              await browser.pause(3000);
 
              if (severance_pay_2016_2.isExisting()) {
                await browser.pause(3000);
                await severance_pay_2016_2.doubleClick();
                await browser.pause(3500);
 
              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_TWO',
                  detail: 'No se logro seleccionar la pregunta 2.'
                });
              }
              await browser.pause(3000);
 
              if (public_server_3.isExisting()) {
                await browser.pause(3000);
                await public_server_3.doubleClick();
                await browser.pause(3500);
 
              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_THREE',
                  detail: 'No se logro seleccionar la pregunta 3.'
                });
              }
              await browser.pause(3000);
 
              if (income_country_4.isExisting()) {
                await browser.pause(3000);
                await income_country_4.doubleClick();
                await browser.pause(3000);
 
              } else {
                throw new BadRequestException({
                  error: 'NOT_SELECT_QUESTION_FOUR',
                  detail: 'No se logro seleccionar la pregunta 4.'
                });
              }
              await browser.pause(3000);
 
              const send = await browser.$('div[class="mat-dialog-actions"] div button[class="mat-button"]');
              await send.doubleClick(); // click al botton enviar
              await browser.pause(2000);
 
              const inputText = await browser.$$('form div div div div input');
              await browser.pause(3000);
 
              if (inputText[0]) {
                const panelBUttonSave = await browser.$$('div[class="fixed-action-btn click-to-toggle"] a')
                if (panelBUttonSave[1]) {
                  await browser.pause(2500);
                  await panelBUttonSave[1].click();
                  await browser.pause(2500);
 
                  const buttonSave = await browser.$$('button[class="btn-floating no-shadown mat-fab mat-primary"]');
                  await browser.pause(3000);
 
                  if (await buttonSave.length === 3) {
                    await buttonSave[0].click(); // DESCARGAR
                    await browser.pause(3500);
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
              } */
            } else if (body.year_Rental_Declaration === 2018) {

            } else {
              throw new BadRequestException({
                error: 'YEAR_NOT_FOUND',
                detail: 'No se logro encontrar el año'
              });
            }

          } else {
            throw new BadRequestException({
              error: 'POPUP_QUESTION_FORM_NOT_FOUND',
              detail: 'No se logro encontrar el formulario de la modal de preguntas emergente'
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
    return { success: 'OK' }
  }

}