import { InjectRepository } from "@nestjs/typeorm";
import { Logger, BadRequestException } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Repository } from "typeorm";
import { Job } from "bull";
import { Audit } from "../../../entities/security/audit.entity";
import { RentalDeclaration } from "../dto/rentalDeclaration.dto";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

@Processor('dian')
export class IncomeProcessor {
  private readonly logger = new Logger(IncomeProcessor.name);
  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  @Process({ name: 'rentalDeclaration' })
  async rentalDeclaration(job: Job<any>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { folder, body, moduleQuestions, loginPage } = job.data;
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

    let browser: any, page: any, pathIncome: string;
    const replay2 = []

    try {
      browser = await puppeteer.launch({ headless: false, args: ["--disable-notifications"] })
      page = await browser.newPage();
      await page.setDefaultNavigationTimeout(240000);
      /*  await page.setViewport({ width: 1365, height: 800 }) */

      await page.goto(`${process.env.DIAN_URL_BASE}`, { waitUntil: 'networkidle0' });
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: folder })
      console.log('\n%s URL ✅', chalk.bold.yellow('SUCCESS'));

      await page.select(loginPage.typeUser, '2');
      await page.select(loginPage.typeDocument, '13')
      await page.type(loginPage.numberDocument, body.document, { delay: 10 })
      await page.type(loginPage.password, body.password, { delay: 10 })
      await Promise.all([
        page.waitForNavigation(),
        page.click(loginPage.buttonLogin)
      ]);

      console.log(`%s LOGIN ✅`, chalk.bold.yellow('SUCCESS'));

      if (body.year_Rental_Declaration === 2019) {
        await page.goto(`https://muisca.dian.gov.co/WebFormRenta210v${body.indicative}/?concepto=inicial&anio=${body.year_Rental_Declaration}&periodicidad=anual&periodo=1`, { waitUntil: 'networkidle0' });

        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

        await page.waitForTimeout(2000);
        console.log('%s FROM DATA PROCESSING ✅', chalk.bold.cyan('INFO'));

        try {
          await page.waitForTimeout(1000);
          const taxResident1 = await page.$("#mat-radio-32-input")
          await page.waitForTimeout(1000);
          const box1 = await taxResident1.boundingBox()
          const x1 = await box1.x + (box1.width / 2);
          const y1 = await box1.y + (box1.height / 2);
          await page.waitForTimeout(2000);
          await page.mouse.click(x1, y1);
          await page.waitForTimeout(2000);

          const searchButton = await page.$("#mat-dialog-2 > ng-component > mat-card > div.mat-dialog-actions > div > button")
          await page.waitForTimeout(1000);
          const box2 = await searchButton.boundingBox()
          const x2 = await box2.x + (box2.width / 2);
          const y2 = await box2.y + (box2.height / 2);
          await page.waitForTimeout(2000);
          await page.mouse.click(x2, y2);
          await page.waitForTimeout(4000);
        } catch (err) {
          await page.close();
          await browser.close();
          return {
            error: 'RENTAL_DECLARATION_ALREADY_CREATED',
            detail: 'La declaración de la renta ya esta creada.'
          }
        }
        try {
          /*  console.log('\n%s QUESTION MODULE YES OR NOT, STARTING...', chalk.bold.yellow('SUCCESS'));
           for (let i = 0; i < 2; i++) { *
          await this.questionOne(page, body, moduleQuestions);
          await page.waitForTimeout(4000);

          await this.questionTwo(page, body, moduleQuestions);
          await page.waitForTimeout(4000);

          await this.questionThree(page, body, moduleQuestions);
          await page.waitForTimeout(4000);

          await this.questionFour(page, body, moduleQuestions);
          await page.waitForTimeout(4000);

          await this.questionFive(page, body, moduleQuestions);
          await page.waitForTimeout(4000);
          /*  } 
          console.log('\n%s QUESTION MODULE YES OR NOT, FINISHED ✅', chalk.bold.yellow('SUCCESS'));*/
          let buttonSave = [];
          try {
            await page.waitForTimeout(2000);
            console.log('%s ADDING DATA TO THE FORM ✅', chalk.bold.cyan('INFO'));

            await this.formData(page, body);
            await page.waitForTimeout(2000);

            const panelBUttonSave = await page.$('body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div:nth-child(2) > a');
            const box8 = await panelBUttonSave.boundingBox();
            const x8 = await box8.x + (box8.width / 2);
            const y8 = await box8.y + (box8.height / 2);
            await page.waitForTimeout(2000);
            await page.mouse.click(x8, y8);
            await page.waitForTimeout(4000);

            buttonSave = await page.$$('body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div.fixed-action-btn.click-to-toggle.active > ul > li');
            if (buttonSave.length === 0) {
              console.log('%s DATA COULD NOT BE SAVED ❌', chalk.bold.red('ERROR'));
              throw new BadRequestException({
                error: 'DATA_COULD_NOT_SAVES',
                detail: 'No se pudieron guardar los datos.'
              });
            }
            try {
              if (buttonSave.length === 3) {
                console.log('%s UPDATING DATA ✅', chalk.bold.cyan('INFO'));
                const buttonDownload = 'body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div.fixed-action-btn.click-to-toggle.active > ul > li:nth-child(1) > button'
                await page.$eval(buttonDownload, elem => elem.click());
                await page.waitForTimeout(3000);

                const arrayDir = await this.scanDirs(folder);
                await page.waitForTimeout(2000);
                console.log(folder)

                const oldNameIncome = path.join(folder, arrayDir[0]);
                const newNameIncome = path.join(folder, `/declaracion.pdf`);
                pathIncome = newNameIncome;

                await fs.renameSync(oldNameIncome, newNameIncome, (err: any) => {
                  if (err)
                    return console.log('%s ' + err);
                });
                console.log(`%s FILE DOWNLOADED AT ${newNameIncome} ✅`, chalk.bold.keyword('orange')('SUCCESS'));

              } else if (buttonSave.length === 1) {
                try {
                  console.log('%s SAVING DATA ✅', chalk.bold.cyan('INFO'));
                  await page.waitForTimeout(4000);
                  const buttonSave1 = 'body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div.fixed-action-btn.click-to-toggle.active > ul > li > button';
                  await page.$eval(buttonSave1, elem => elem.click());
                  await page.waitForTimeout(4000);

                  const cerrar = '#mat-dialog-11 > ng-component > mat-card > div.mat-dialog-actions > button';
                  await page.$eval(cerrar, elem => elem.click());
                  await page.waitForTimeout(4000);

                  const newOptionMenu = 'body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div.fixed-action-btn.click-to-toggle.active > ul > li:nth-child(1) > button';
                  await page.$eval(newOptionMenu, elem => elem.click());
                  await page.waitForTimeout(4100);

                  const arrayDir = await this.scanDirs(folder);
                  await page.waitForTimeout(2200);
                  console.log(folder);

                  const oldNameIncome = path.join(folder, arrayDir[0]);
                  const newNameIncome = path.join(folder, `/declaracion.pdf`);
                  pathIncome = newNameIncome;
                  await page.waitForTimeout(2200);

                  await fs.renameSync(oldNameIncome, newNameIncome, (err: any) => {
                    if (err) return console.log('%s ' + err);
                  });
                  console.log(`%s FILE DOWNLOADED AT ${newNameIncome} ✅`, chalk.bold.keyword('orange')('SUCCESS'));
                  await page.waitForTimeout(2200);

                  await axios.post(body.url_response, {
                    email: body.email,
                    uid: body.uid,
                    file: newNameIncome,
                    year: body.year_Rental_Declaration.toString(),
                    urlResponse: body.url_response
                  })
                    .then(function (response) {
                      console.log(response.success);
                      console.log(response.status);
                      replay2.push({ status: response.status });
                    })
                    .catch(function (error) {
                      console.log(error);
                    });

                  console.log(`%s PETICION SEND ✅`, chalk.bold.keyword('orange')('SUCCESS'));
                } catch (err) {
                  await page.close();
                  await browser.close();
                  return {
                    error: 'DATA_COULD_NOT_SAVES',
                    detail: 'No se pudieron guardar los datos.'
                  }
                }
              } else if (await buttonSave.length === 4) {
                console.log('%s HAS DIGITAL FIRM ✅', chalk.bold.cyan('INFO'));
                const buttonDownload = 'body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div.fixed-action-btn.click-to-toggle.active > ul > li:nth-child(1) > button';
                await page.$eval(buttonDownload, elem => elem.click());
                await page.waitForTimeout(3000);

                const arrayDir = await this.scanDirs(folder);
                await page.waitForTimeout(2000);
                console.log(folder)

                const oldNameIncome = path.join(folder, arrayDir[0]);
                const newNameIncome = path.join(folder, `/declaracion.pdf`);
                pathIncome = newNameIncome;

                await fs.renameSync(oldNameIncome, newNameIncome, (err: any) => {
                  if (err) return console.log('%s ' + err);
                });
                console.log(`%s FILE DOWNLOADED AT ${newNameIncome} ✅`, chalk.bold.keyword('orange')('SUCCESS'));
              }
              await page.close();
              await browser.close();
              console.log('%s ENDED PROCESS ✅ \n', chalk.bold.green('FINISHED:'));

              return {
                success: 'OK',
                localPath: pathIncome,
                urlResponse: replay2
              }
            } catch (err) {
              await page.close();
              await browser.close();
              if (err.response) {
                return err.response
              } else {
                await job.retry();
                return {
                  error: 'DATA_COULD_NOT_SAVES', detail: 'No se logra guardar la informacion.'
                }
              }
            }

          } catch (err) {
            await page.close();
            await browser.close();
            if (err.response) {
              return err.response
            } else {
              return {
                error: 'DATA_COULD_NOT_SAVES', detail: 'No se pudieron guardar los datos.'
              }
            }
          }
        } catch (err) {
          await page.close();
          await browser.close();
          await job.retry();
          return {
            error: 'QUESTION_MODULE_YES_OR_NOT_NOT_FOUND',
            detail: 'Módulo de preguntas sí o no, no encontrado'
          }
        }

      } else if (body.year_Rental_Declaration === 2018 || body.year_Rental_Declaration === 2017) {
        await page.goto(`https://muisca.dian.gov.co/WebFormRenta210v${body.indicative}/?concepto=inicial&anio=${body.year_Rental_Declaration}&periodicidad=anual&periodo=1`, { waitUntil: 'networkidle0' });

        await page.waitForTimeout(2000);
        console.log('%s FROM DATA PROCESSING ✅', chalk.bold.cyan('INFO'));

        await page.waitForTimeout(1000);
        const taxResident1 = await page.$("#mat-radio-2-input");
        await page.waitForTimeout(1000);
        const box1 = await taxResident1.boundingBox();
        const x1 = await box1.x + (box1.width / 2);
        const y1 = await box1.y + (box1.height / 2);
        await page.waitForTimeout(2000);
        await page.mouse.click(x1, y1);
        await page.waitForTimeout(2000);

        await page.waitForTimeout(1000);
        const severancePay20162 = await page.$("#mat-radio-5-input");
        await page.waitForTimeout(1000);
        const box2 = await severancePay20162.boundingBox();
        const x2 = await box2.x + (box2.width / 2);
        const y2 = await box2.y + (box2.height / 2);
        await page.waitForTimeout(2000);
        await page.mouse.click(x2, y2);
        await page.waitForTimeout(2000);

        await page.waitForTimeout(1000);
        const publicServer3 = await page.$("#mat-radio-8-input");
        await page.waitForTimeout(1000);
        const box3 = await publicServer3.boundingBox();
        const x3 = await box3.x + (box3.width / 2);
        const y3 = await box3.y + (box3.height / 2);
        await page.waitForTimeout(2000);
        await page.mouse.click(x3, y3);
        await page.waitForTimeout(2000);

        await page.waitForTimeout(1000);
        const incomeCountry4 = await page.$("#mat-radio-11-input");
        await page.waitForTimeout(1000);
        const box4 = await incomeCountry4.boundingBox();
        const x4 = await box4.x + (box4.width / 2);
        const y4 = await box4.y + (box4.height / 2);
        await page.waitForTimeout(2000);
        await page.mouse.click(x4, y4);
        await page.waitForTimeout(2000);

        if (await body.year_Rental_Declaration === 2018) {
          console.log('%s YEAR 2018 ✅', chalk.bold.cyan('INFO'));
          const searchButton = await page.$("#cdk-overlay-2 > mat-dialog-container > ng-component > mat-card > div.mat-dialog-actions > div > button");
          await page.waitForTimeout(1000);
          const box5 = await searchButton.boundingBox();
          const x5 = await box5.x + (box5.width / 2);
          const y5 = await box5.y + (box5.height / 2);
          await page.waitForTimeout(2000);
          await page.mouse.click(x5, y5);
          await page.waitForTimeout(2000);
        }
        const searchButton = "#cdk-overlay-3 > mat-dialog-container > ng-component > mat-card > div.mat-dialog-actions > div > button";
        await page.$eval(searchButton, elem => elem.click());

        const buttonSave = 'body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div:nth-child(2) > a';
        await page.$eval(buttonSave, elem => elem.click());
        await page.waitForTimeout(1000);

        const buttonDownload = 'body > app-root > mat-sidenav-container > mat-sidenav-content > div > app-contenedor-formulario > div > app-formulario > dspeed-dial-componente > div.fixed-action-btn.click-to-toggle.active > ul > li:nth-child(1) > button'
        await page.$eval(buttonDownload, elem => elem.click());
        await page.waitForTimeout(3000);

        const arrayDir = await this.scanDirs(folder);
        await page.waitForTimeout(2000);
        console.log(arrayDir)
        console.log(folder)
        const oldNameIncome = path.join(folder, arrayDir[0]);
        const newNameIncome = path.join(folder, `/declaraciona.pdf`);
        pathIncome = newNameIncome;
        await fs.renameSync(oldNameIncome, newNameIncome, (err) => {
          if (err) return console.log('%s ' + err);
        });
        console.log(`%s FILE DOWNLOADED AT ${newNameIncome} ✅`, chalk.bold.keyword('orange')('SUCCESS'));

        await page.close();
        await browser.close();
        console.log('%s ENDED PROCESS ✅ \n', chalk.bold.green('FINISHED:'));
        const replay = []
        await axios.post(body.url_response, {
          email: body.email,
          uid: body.uid,
          file: newNameIncome,
          year: body.year_Rental_Declaration.toString(),
          urlResponse: body.url_response
        })
          .then(function (response) {
            console.log(response.success);
            console.log(response.status);
            replay.push({ success: response.success, status: response.status });
          })
          .catch(function (error) {
            console.log(error);
          });

        return {
          success: 'OK',
          localPath: pathIncome,
          urlResponse: replay
        }

      } else {
        throw new BadRequestException({
          error: 'RENTAL_DECLARATION_ALREADY_CREATED',
          detail: 'La declaración de la renta ya esta creada.'
        });
      }


    } catch (err) {
      if (err.name === 'TimeoutError') {
        await page.close();
        await browser.close();
        console.error('%s {\n"error": "TIME_OUT_ERROR"\n"detail": "El servidor de la DIAN, superó el tiempo de espera de la solicitud o tiene una coneccion lenta"\n}', chalk.bold.red('ERROR'));
        await job.retry();

        return {
          error: 'TIME_OUT_ERROR',
          detail: 'El servidor de la DIAN, superó el tiempo de espera de la solicitud o tiene una coneccion lenta'
        };

      } else if (err.response) {
        await page.close();
        await browser.close();
        console.error(`%s {${err.response.error},\n${err.response.detail}\n}`, chalk.bold.red('ERROR'));
        await job.retry();

        return err.response

      } else {
        await page.close();
        await browser.close();
        console.error('%s ' + err.message, chalk.bold.red('ERROR'));
        await job.retry();

        return {
          error: err.name.toUpperCase(),
          detail: err.message
        };
      }
    }
  }

  async scanDirs(dir: string) {
    const response = [];
    fs.readdirSync(dir).forEach(file => {
      response.push(file)
    });
    return response;
  }

  private async formQuestion(page: any, body: RentalDeclaration, moduleQuestions: any) {
    if (body.retirement_unemployment_113 === true) {
      await page.waitForTimeout(2000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const retirement_unemployment_113 = await page.$(moduleQuestions.retirement_unemployment_113);
      await page.waitForSelector(moduleQuestions.retirement_unemployment_113);
      await page.waitForTimeout(3000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box3 = await retirement_unemployment_113.boundingBox();
      const x3 = await box3.x + (await box3.width / 2);
      const y3 = await box3.y + (await box3.height / 2);
      await page.waitForTimeout(5000);
      await page.mouse.click(x3, y3);
      await page.waitForTimeout(5000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      console.log(retirement_unemployment_113._mainFrame);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (retirement_unemployment_113) {
        await page.waitForSelector(moduleQuestions.response_retirement_unemployment_114);
        await page.type(moduleQuestions.response_retirement_unemployment_114, body.response_retirement_unemployment_114.toString(), { delay: 10 })
        console.log(`%s 113 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }

    if (body.millitary_forces_police_115 === true) {
      await page.waitForTimeout(2000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const millitary_forces_police_115 = await page.$(moduleQuestions.millitary_forces_police_115);
      await page.waitForSelector(moduleQuestions.millitary_forces_police_115);
      await page.waitForTimeout(3000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box4 = await millitary_forces_police_115.boundingBox();
      const x4 = await box4.x + (await box4.width / 2);
      const y4 = await box4.y + (await box4.height / 2);
      await page.waitForTimeout(5000);
      await page.mouse.click(x4, y4);
      await page.waitForTimeout(5000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      console.log(millitary_forces_police_115._mainFrame);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (millitary_forces_police_115) {
        await page.waitForSelector(moduleQuestions.response_millitary_forces_police_116);
        await page.type(moduleQuestions.response_millitary_forces_police_116, body.response_millitary_forces_police_116.toString(), { delay: 10 })
        console.log(`%s 115 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }

    if (body.income_public_university_119 === true) {
      await page.waitForTimeout(2000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const income_public_university_119 = await page.$(moduleQuestions.income_public_university_119);
      await page.waitForSelector(moduleQuestions.income_public_university_119);
      await page.waitForTimeout(3000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box5 = await income_public_university_119.boundingBox();
      const x5 = await box5.x + (await box5.width / 2);
      const y5 = await box5.y + (await box5.height / 2);
      await page.waitForTimeout(5000);
      await page.mouse.click(x5, y5);
      await page.waitForTimeout(5000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      console.log(income_public_university_119._mainFrame)
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (income_public_university_119) {
        await page.waitForSelector(moduleQuestions.response_income_public_university_120);
        await page.type(moduleQuestions.response_income_public_university_120, body.response_income_public_university_120.toString(), { delay: 10 })
        console.log(`%s 119 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }

    if (body.work_rental_income_125 === true) {
      await page.waitForTimeout(2000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const work_rental_income_125 = await page.$(moduleQuestions.work_rental_income_125);
      await page.waitForSelector(moduleQuestions.work_rental_income_125);
      await page.waitForTimeout(3000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box6 = await work_rental_income_125.boundingBox();
      const x6 = await box6.x + (await box6.width / 2);
      const y6 = await box6.y + (await box6.height / 2);
      await page.waitForTimeout(5000);
      await page.mouse.click(x6, y6);
      await page.waitForTimeout(5000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      console.log(work_rental_income_125._mainFrame);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (work_rental_income_125) {
        await page.waitForSelector(moduleQuestions.response_work_rental_income_126);
        await page.type(moduleQuestions.response_work_rental_income_126, body.response_work_rental_income_126.toString(), { delay: 10 })
        console.log(`%s 125 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }

    if (body.not_work_rental_income_129 === true) {
      await page.waitForTimeout(2000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const not_work_rental_income_129 = await page.$(moduleQuestions.not_work_rental_income_129);
      await page.waitForSelector(moduleQuestions.not_work_rental_income_129);
      await page.waitForTimeout(3000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box7 = await not_work_rental_income_129.boundingBox();
      const x7 = await box7.x + (await box7.width / 2);
      const y7 = await box7.y + (await box7.height / 2);
      await page.waitForTimeout(5000);
      await page.mouse.click(x7, y7);
      await page.waitForTimeout(5000);
      // eslint-disable-next-line @typescript-eslint/camelcase
      console.log(not_work_rental_income_129._mainFrame)
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (not_work_rental_income_129) {
        await page.waitForSelector(moduleQuestions.response_not_work_rental_income_130);
        await page.type(moduleQuestions.response_not_work_rental_income_130, body.response_not_work_rental_income_130.toString(), { delay: 10 })
        console.log(`%s 129 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }
  }

  private async questionOne(page, body, moduleQuestions) {
    await page.waitForTimeout(2000);
    if (body.retirement_unemployment_113 === true) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const retirement_unemployment_113 = await page.$(moduleQuestions.retirement_unemployment_113);
      await page.waitForSelector(moduleQuestions.retirement_unemployment_113);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box3 = await retirement_unemployment_113.boundingBox();
      const x3 = await box3.x + (await box3.width / 2);
      const y3 = await box3.y + (await box3.height / 2);
      await page.mouse.click(x3, y3);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (retirement_unemployment_113) {
        await page.waitForTimeout(2000);
        await page.type(moduleQuestions.response_retirement_unemployment_114, body.response_retirement_unemployment_114.toString(), { delay: 10 })
        console.log(`%s 113 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }
  }
  private async questionTwo(page, body, moduleQuestions) {
    await page.waitForTimeout(2000);
    if (body.millitary_forces_police_115 === true) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const millitary_forces_police_115 = await page.$(moduleQuestions.millitary_forces_police_115);
      await page.waitForSelector(moduleQuestions.millitary_forces_police_115);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box4 = await millitary_forces_police_115.boundingBox();
      const x4 = await box4.x + (await box4.width / 2);
      const y4 = await box4.y + (await box4.height / 2);
      await page.mouse.click(x4, y4);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (millitary_forces_police_115) {
        await page.waitForTimeout(2000);
        await page.type(moduleQuestions.response_millitary_forces_police_116, body.response_millitary_forces_police_116.toString(), { delay: 10 })
        console.log(`%s 115 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }
  }
  private async questionThree(page, body, moduleQuestions) {
    await page.waitForTimeout(2000);
    if (body.income_public_university_119 === true) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const income_public_university_119 = await page.$(moduleQuestions.income_public_university_119);
      await page.waitForSelector(moduleQuestions.income_public_university_119);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box5 = await income_public_university_119.boundingBox();
      const x5 = await box5.x + (await box5.width / 2);
      const y5 = await box5.y + (await box5.height / 2);
      await page.mouse.click(x5, y5);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (income_public_university_119) {
        await page.waitForTimeout(2000);
        await page.type(moduleQuestions.response_income_public_university_120, body.response_income_public_university_120.toString(), { delay: 10 })
        console.log(`%s 119 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }
  }
  private async questionFour(page, body, moduleQuestions) {
    await page.waitForTimeout(2000);
    if (body.work_rental_income_125 === true) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const work_rental_income_125 = await page.$(moduleQuestions.work_rental_income_125);
      await page.waitForSelector(moduleQuestions.work_rental_income_125);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box6 = await work_rental_income_125.boundingBox();
      const x6 = await box6.x + (await box6.width / 2);
      const y6 = await box6.y + (await box6.height / 2);
      await page.mouse.click(x6, y6);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (work_rental_income_125) {
        await page.waitForTimeout(2000);
        await page.type(moduleQuestions.response_work_rental_income_126, body.response_work_rental_income_126.toString(), { delay: 10 })
        console.log(`%s 125 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }
  }
  private async questionFive(page, body, moduleQuestions) {
    await page.waitForTimeout(2000);
    if (body.not_work_rental_income_129 === true) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const not_work_rental_income_129 = await page.$(moduleQuestions.not_work_rental_income_129);
      await page.waitForSelector(moduleQuestions.not_work_rental_income_129);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const box7 = await not_work_rental_income_129.boundingBox();
      const x7 = await box7.x + (await box7.width / 2);
      const y7 = await box7.y + (await box7.height / 2);
      await page.mouse.click(x7, y7);
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (not_work_rental_income_129) {
        await page.waitForTimeout(2000);
        await page.type(moduleQuestions.response_not_work_rental_income_130, body.response_not_work_rental_income_130.toString(), { delay: 10 })
        console.log(`%s 129 ✅`, chalk.bold.yellow('SUCCESS'));
      }
    }
  }
  private async formData(page, body) {
    await page.waitForTimeout(1000);
    await page.type('#cs_id_28', body.patrimony_total_28.toString(), { delay: 15 })
    await page.type('#cs_id_29', body.debt_29.toString(), { delay: 15 })
    await page.type('#cs_id_31', body.total_income_rental_work_31.toString(), { delay: 15 })
    await page.type('#cs_id_33', body.cost_deduction_rt_33.toString(), { delay: 15 })
    await page.type('#cs_id_38', body.total_capital_income_38.toString(), { delay: 15 })
    await page.type('#cs_id_39', body.income_not_constitutive_rental_39.toString(), { delay: 15 })
    await page.type('#cs_id_40', body.cost_deduction_coming_40.toString(), { delay: 15 })
    await page.type('#cs_id_42', body.liquid_rental_passive_rc_42.toString(), { delay: 15 })
    await page.type('#cs_id_43', body.exempt_rental_rc_43.toString(), { delay: 15 })
    await page.type('#cs_id_47', body.compasion_loss_capital_rental_47.toString(), { delay: 15 })
    await page.type('#cs_id_49', body.total_income_rnl_49.toString(), { delay: 15 })
    await page.type('#cs_id_50', body.discount_refund_50.toString(), { delay: 15 })
    await page.type('#cs_id_51', body.income_not_constitutive_rental_rnl_51.toString(), { delay: 15 })
    await page.type('#cs_id_55', body.rental_exempt_deduction_rnl_55.toString(), { delay: 15 })
    await page.type('#cs_id_59', body.compensation_loss_rental_rnl_59.toString(), { delay: 15 })
    await page.type('#cs_id_64', body.compensation_lost_cg_64.toString(), { delay: 15 })
    await page.type('#cs_id_65', body.excess_compensation_cg_65.toString(), { delay: 15 })
    await page.type('#cs_id_66', body.taxable_rental_66.toString(), { delay: 15 })
    await page.type('#cs_id_68', body.presumptive_rental_cg_68.toString(), { delay: 15 })
    await page.type('#cs_id_69', body.total_income_rental_cp_69.toString(), { delay: 15 })
    await page.type('#cs_id_70', body.incomen_not_constitutive_rental_cp_70.toString(), { delay: 15 })
    await page.type('#cs_id_72', body.pension_exempt_rental_cp_72.toString(), { delay: 15 })
    await page.type('#cs_id_74', body.dividend_participation_cdp_74.toString(), { delay: 15 })
    await page.type('#cs_id_75', body.not_constitutive_income_cdp_75.toString(), { delay: 15 })
    await page.type('#cs_id_77', body.sub_cedula1_77.toString(), { delay: 15 })
    await page.type('#cs_id_78', body.sub_cedula2_78.toString(), { delay: 15 })
    await page.type('#cs_id_79', body.passive_liquid_rental_cdp_79.toString(), { delay: 15 })
    await page.type('#cs_id_80', body.exempt_rental_cdp_80.toString(), { delay: 15 })
    await page.type('#cs_id_81', body.ingress_go_81.toString(), { delay: 15 })
    await page.type('#cs_id_82', body.cost_go_82.toString(), { delay: 15 })
    await page.type('#cs_id_83', body.go_not_taxed_exempt_83.toString(), { delay: 15 })
    await page.type('#cs_id_91', body.taxes_paid_abroad_91.toString(), { delay: 15 })
    await page.type('#cs_id_92', body.donations_92.toString(), { delay: 15 })
    await page.type('#cs_id_93', body.others_private_93.toString(), { delay: 15 })
    await page.type('#cs_id_95', body.total_income_tax_95.toString(), { delay: 15 })
    await page.type('#cs_id_96', body.occasional_earnings_tax_96.toString(), { delay: 15 })
    await page.type('#cs_id_97', body.discount_taxes_occasional_income_97.toString(), { delay: 15 })
    await page.type('#cs_id_99', body.advance_rental_liquid_year_taxable_99.toString(), { delay: 15 })
    await page.type('#cs_id_100', body.balance_favor_previous_taxable_year_100.toString(), { delay: 15 })
    await page.type('#cs_id_101', body.withholdings_taxable_year_to_report_101.toString(), { delay: 15 })
    await page.type('#cs_id_102', body.income_advance_following_taxable_year_102.toString(), { delay: 15 })
    await page.type('#cs_id_107', body.signatory_identification_107.toString(), { delay: 15 })
    await page.select('#cs_id_109', body.dependent_document_type_109);
    await page.type('#cs_id_110', body.dependent_identification_110.toString(), { delay: 15 })
    await page.select('#cs_id_112', body.kinship_112)
    await page.type('#cs_id_980', body.full_payment_980.toString(), { delay: 15 });
    await page.type('#cs_id_35', body.exempt_rental_rt_35.toString(), { delay: 15 });
    await page.waitForTimeout(1000);
  }

}

