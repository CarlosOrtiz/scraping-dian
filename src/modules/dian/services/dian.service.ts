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
    const imgen = '/login.png';
    const dirFolder = path.join(__dirname, '../../../../../../../' + process.env.DOWNLOAD_PATH)
    try {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto(`${process.env.DIAN_URL_BASE}`, { waitUntil: 'networkidle2' });
      await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dirFolder })
      await page.select('select[name="vistaLogin:frmLogin:selNit"]', '2')
      await page.select('select[name="vistaLogin:frmLogin:selTipoDoc"]', '13')
      await page.type('input[name="vistaLogin:frmLogin:txtUsuario"]', document)
      await page.type('input[name="vistaLogin:frmLogin:txtCadena"]', password)
      let login = 'input[name="vistaLogin:frmLogin:_id18"]';
      await page.$eval(login, elem => elem.click());
      const urlDashboard = await page.url()
      await page.goto(urlDashboard)
      const itemSpam = await page.$$eval('table.tipoFilaNormalGris td span', son => {
        return son.map(son2 => son2.innerText)
      })
      const reportLink = 'input[name="vistaDashboard:frmDashboard:btnConsultarRUT"]';
      await page.$eval(reportLink, elem => elem.click());
      const openMenuExogenous = 'input[id="vistaDashboard:frmDashboard:btnExogena"';
      await page.$eval(openMenuExogenous, elem => elem.click());
      const acceptButton = 'input[name="vistaDashboard:frmDashboard:btnBuscar"]';
      await page.$eval(acceptButton, elem => elem.click());
      await page.select('select[name="vistaDashboard:frmDashboard:anioSel"]', '2019')
      const queryButton = 'input[name="vistaDashboard:frmDashboard:btnExogenaGenerar"]';
      await page.$eval(queryButton, elem => elem.click());
      const cerrar = 'input[name="vistaEncabezado:frmCabeceraUsuario:_id29"]';
      await page.$eval(cerrar, elem => elem.click());
      await page.screenshot({ path: rutica + imgen })
      await page.close();
      await browser.close();
      return {
        succes: 'OK', user: {
          document: document,
          name: itemSpam[2]
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}