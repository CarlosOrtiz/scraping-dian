import { Injectable, BadRequestException } from '@nestjs/common';
import { ExogenousRut } from '../dto/exogenousRut.dto';

import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from '../../../entities/security/audit.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RentalDeclaration } from '../dto/rentalDeclaration.dto';
import { onErrorResumeNext } from 'rxjs';
import { join } from 'path';
import { lstatSync, readdirSync, statSync } from 'fs';
import { error } from 'console';
import { type } from 'os';
const fse = require("fs-extra");
const NodeGoogleDrive = require('node-google-drive-new');
const credentials = require('../../../../proxy-google-drive.json');
const bufferFrom = require('buffer-from');
const path = require('path');
const util = require('util');
const fs = require('fs')
const { readdir, stat } = require("fs").promises
const rutica = path.join(__dirname, '../../../../../../../Test');
const moment = require("moment");
const puppeteer = require('puppeteer')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile);
const chalk = require('chalk');
const select = require('puppeteer-select');

const loginPage = {
  typeUser: 'select[name="vistaLogin:frmLogin:selNit2"]',
  typeDocument: 'select[name="vistaLogin:frmLogin:selTipoDoc"]',
  numberDocument: 'input[name="vistaLogin:frmLogin:txtUsuario"]',
  password: 'input[name="vistaLogin:frmLogin:txtCadena"]',
  buttonLogin: 'input[name="vistaLogin:frmLogin:_id18"]'
}

@Injectable()
export class DianService {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    @InjectQueue('dian') private dianQueue: Queue
  ) { }

  async downloadRut(document: string, password: string) {
    const job = await this.dianQueue.add('downloadRut', { document, password }, { priority: 4 });

    /*   if (job) {
        const arraDIr = await this.scanDirs(rutica)
        let dirDocument = path.join(__dirname, '../../../../../../../Descargas/', '14659862170 (4).pdf');
        console.log(arraDIr) */
    /*  arraDIr.map(item => {
       console.log(item);
     }) */
    /* const fileUpload = await this.UploadFileGDrive(dirDocument); */
    /*    dirDocument = path.join(__dirname, '../../../../../../../Descargas/', '14659862170.pdf'); */


    /*  return { success: 'OK', url: `https://drive.google.com/file/d/${fileUpload.id}/view?usp=sharing` } 
   }*/

  }

  async downloadExogenous(document: string, password: string) {
    return await this.dianQueue.add('downloadExogenous', { document, password }, { priority: 3, removeOnComplete: true, removeOnFail: true });
  }

  async downloadExogenousRut(document: string, password: string) {
    return await this.dianQueue.add('downloadExogenousRut', { document, password }, { priority: 2, removeOnComplete: true, removeOnFail: true });

  }

  async rentalDeclaration(body: RentalDeclaration) {
    await this.dianQueue.add('rentalDeclaration', { body }, { priority: 1, removeOnComplete: true, removeOnFail: true })
  }


  async testPupper(document: string, password: string) {
    const dirFolder = path.join(__dirname, '../../../../../../../' + process.env.DOWNLOAD_PATH)
    const fileDirExo = path.join(dirFolder, '/reporte.xls');
    const newNameExo = path.join(dirFolder, `/${document}.xls`);
    try {
      const browser = await puppeteer.launch({ headless: false })
      const page = await browser.newPage()
      await page.waitFor(5000);
      await page.setDefaultNavigationTimeout(120000);
      await page.goto(`${process.env.DIAN_URL_BASE}`, { waitUntil: 'networkidle2' });
      await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dirFolder })
      console.log('\n%s URL ✅', chalk.bold.yellow('SUCCESS'));

      await page.waitForSelector(loginPage.typeUser);
      await page.select(loginPage.typeUser, '2');
      await page.select(loginPage.typeDocument, '13')
      await page.type(loginPage.numberDocument, document)
      await page.type(loginPage.password, password)
      await Promise.all([
        page.waitForNavigation(),
        page.click(loginPage.buttonLogin)
      ]);

      const urlDashboard = await page.url()
      await page.goto(urlDashboard)

      const itemSpam = await page.$$eval('table.tipoFilaNormalGris td span', son => {
        return son.map(son2 => son2.innerText)
      })
      console.log('%s LOGIN ✅', chalk.bold.yellow('SUCCESS'));

      const rut = 'input[name="vistaDashboard:frmDashboard:btnConsultarRUT"]';
      await page.waitForSelector(rut);
      await page.$eval(rut, elem => elem.click());
      console.log('%s RUT DOWNLOAD COMPLETED ✅', chalk.bold.yellow('SUCCESS'));
      await page.waitFor(3000);

      const openMenuExogenous = 'input[name="vistaDashboard:frmDashboard:btnExogena"]';
      await page.$eval(openMenuExogenous, elem => elem.click());
      const acceptButton = 'input[name="vistaDashboard:frmDashboard:btnBuscar"]';
      await page.$eval(acceptButton, elem => elem.click());
      await page.select('select[name="vistaDashboard:frmDashboard:anioSel"]', '2019')
      const queryButton = 'input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]';
      await page.$eval(queryButton, elem => elem.click());
      const cerrar = 'input[name="vistaEncabezado:frmCabeceraUsuario:_id29"]';
      await page.$eval(cerrar, elem => elem.click());
      await page.waitFor(3500);
      console.log('%s INFORMATION EXOGENOUS DOWNLOAD COMPLETED ✅', chalk.bold.yellow('SUCCESS'));

      await fs.renameSync(fileDirExo, newNameExo, (err) => {
        if (err) return console.log('%s ' + err);
      });
      console.log(`%s NAME OF FILE reporte.xls WAS UPDATED CORRECTLY CORRECTLY TO ${document}.xls ✅`, chalk.bold.keyword('orange')('SUCCESS'));
      await page.close();
      await browser.close();
      console.log('%s ENDED PROCESS ✅', chalk.bold.green('FINISHED:'));

      return {
        success: 'OK', user_data: {
          document: document,
          name: itemSpam[2]
        },
        local_path_exogenous: newNameExo
      }
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.error('%s {\n"error": "TIME_OUT_ERROR"\n"detail": "El servidor de la DIAN, superó el tiempo de espera de la solicitud o tiene una coneccion lenta"\n}', chalk.bold.red('ERROR'));
        throw new BadRequestException({
          error: 'TIME_OUT_ERROR',
          detail: 'El servidor de la DIAN, superó el tiempo de espera de la solicitud o tiene una coneccion lenta'
        });
      } else {
        console.error('%s ' + err.message, chalk.bold.red('ERROR'));
        throw new BadRequestException({
          error: err.name.toUpperCase(),
          detail: err.message
        });
      }
    }
  }

  async testPupper2(body: RentalDeclaration) {
    const dirFolder = path.join(__dirname, '../../../../../../../' + process.env.DOWNLOAD_PATH)
    const fileDirExo = path.join(dirFolder, '/reporte.xls');
    const newNameExo = path.join(dirFolder, `/${body.document}.xls`);
    try {
      const browser = await puppeteer.launch({ headless: false })
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