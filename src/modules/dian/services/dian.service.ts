import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { ExogenousRut } from '../dto/exogenousRut.dto';
import { Audit } from '../../../entities/security/audit.entity';
import { RentalDeclaration } from '../dto/rentalDeclaration.dto';

const path = require('path');
const loginPage = {
  typeUser: 'select[name="vistaLogin:frmLogin:selNit"]',
  typeDocument: 'select[name="vistaLogin:frmLogin:selTipoDoc"]',
  numberDocument: 'input[name="vistaLogin:frmLogin:txtUsuario"]',
  password: 'input[name="vistaLogin:frmLogin:txtCadena"]',
  buttonLogin: 'input[name="vistaLogin:frmLogin:_id18"]'
}

const puppeteer = require('puppeteer')
const fs = require('fs')
const chalk = require('chalk');

@Injectable()
export class DianService {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    @InjectQueue('dian') private dianQueue: Queue
  ) { }

  async downloadRut(document: string, password: string) {
    return { WARNING: 'SERVICE_NOT_AVAILABLE', DETAIL: 'Servicio no disponible por el momento.' }
  }

  async downloadExogenous(document: string, password: string) {
    return { WARNING: 'SERVICE_NOT_AVAILABLE', DETAIL: 'Servicio no disponible por el momento.' }
  }

  async downloadExogenousRut(document: string, password: string, uid: string) {
    const dirFolder = path.join(__dirname, '../../../../../../../' + process.env.DOWNLOAD_PATH)
    const fileDirExo = path.join(dirFolder, '/reporte.xls');
    const newNameExo = path.join(dirFolder, `/${uid}.xls`);

    const job = await this.dianQueue.add('downloadExogenousRut', { loginPage, document, password, dirFolder, fileDirExo, newNameExo, uid }, { priority: 2, removeOnComplete: true, removeOnFail: true });
    return job.finished();
  }

  async rentalDeclaration(body: RentalDeclaration) {
    await this.dianQueue.add('rentalDeclaration', { body }, { priority: 1, removeOnComplete: true, removeOnFail: true })
  }

  async testPupper2(body: RentalDeclaration) {
    const dirFolder = path.join(__dirname, '../../../../../../../' + process.env.DOWNLOAD_PATH)
    const fileDirExo = path.join(dirFolder, '/reporte.xls');
    const newNameExo = path.join(dirFolder, `/${body.document}.xls`);
    try {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()
      await page.setViewport({ width: 1300, height: 700 })
      await page.goto(`${process.env.DIAN_URL_BASE}`, { waitUntil: 'networkidle2' });
      await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dirFolder })

      await page.select('select[name="vistaLogin:frmLogin:selNit"]', '2')
      await page.select('select[name="vistaLogin:frmLogin:selTipoDoc"]', '13')

      await page.type('input[name="vistaLogin:frmLogin:txtUsuario"]', body.document, { delay: 5 })
      await page.type('input[name="vistaLogin:frmLogin:txtCadena"]', body.password, { delay: 5 })

      let login = 'input[name="vistaLogin:frmLogin:_id18"]';
      await page.$eval(login, elem => elem.click());

      const urlDashboard = await page.url()
      await page.goto(urlDashboard, { waitUntil: 'networkidle2' })
      /*  const itemSpam = await page.$$eval('table.tipoFilaNormalGris td span', son => {
         return son.map(son2 => son2.innerText)
       }) */
      console.log('%s LOGIN ✅', chalk.bold.yellow('SUCCESS:'));

      if (body.year_Rental_Declaration === 2019) {
        await page.goto(`https://muisca.dian.gov.co/WebFormRenta210v${body.indicative}/?concepto=inicial&anio=${body.year_Rental_Declaration}&periodicidad=anual&periodo=1`, { waitUntil: 'networkidle2' });

        /*  await page.$$eval('nput[name="mat-radio-group-30"]', checkboxes => {
           checkboxes.forEach(chbox => chbox.click())
         }); */

        /*       let tax_resident_1 = 'input[name="mat-radio-group-30"]';
              await page.evaluate((tax_resident_1) => document.querySelector(tax_resident_1).click(), tax_resident_1);
              await page.waitFor(2000);
              const linkHandler = (await page.$x("//a[contains(text(), 'Some text')]"))[0];
              await linkHandler.click() 
      
              const pullovers = await page.$$('a.a-link-normal.a-text-normal')
              await pullovers[2].click() */

        /*  await page.$eval(tax_resident_1, elem => elem.click({ clickCount: 1 }));
 
         await page.mouse.down({ clickCount: 1 });
         // wait however long you want here
         await page.mouse.down({ clickCount: 2 }); */

        const searchButton = await page.$("#mat-dialog-2 > ng-component > mat-card > div.mat-dialog-actions > div > button");
        const box = await searchButton.boundingBox();
        const x = box.x + (box.width / 2);
        const y = box.y + (box.height / 2);
        const r = await Promise.all([
          page.mouse.click(x, y),
          page.waitForNavigation()
        ]);

        /* await page.evaluate(() => {
          const send = page.$eval('div[class="mat-dialog-actions"] divbutton[class="mat-button"]', element => element.innerText);
          const send2 = page.$eval('div[class="mat-dialog-actions"] divbutton[class="mat-button"]');
          if (send === 'Enviar')
            return send2.click();
        }) */

        /* await select(page).assertElementPresent('div[class="mat-dialog-actions"] div button[class="mat-button"]'); */
        /*  const element = await select(page).getElement('div[class="mat-dialog-actions"] div button[class="mat-button"]');
         await element.click()
  */
        await page.waitFor(3000);

        /*    const itemSpam = await page.$$eval('table.tipoFilaNormalGris td span', son => {
             return son.map(son2 => son2.innerText)
           }) */
        /*  const inputRadio = await page.$$eval('form div div div div input[type="radio"]');
 
         await page.waitFor(2000);
 
         const inputSelect = await browser.$$('form div div div div select');
  */
        await page.close();
        await browser.close();
        console.log('%s ENDED PROCESS ✅ \n', chalk.bold.green('FINISHED:'));


      } else {
        throw new BadRequestException({
          error: 'YEAR_NOT_FOUND',
          detail: 'No se logro encontrar el año'
        });
      }


    } catch (err) {
      console.error(err)
    }
  }
}