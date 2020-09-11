import { InjectRepository } from "@nestjs/typeorm";
import { Logger, BadRequestException } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Repository } from "typeorm";
import { Job } from "bull";
import { Audit } from "../../../entities/security/audit.entity";

const puppeteer = require('puppeteer')
const fs = require('fs')
const chalk = require('chalk');

@Processor('dian')
export class RutExogenousProcessor {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
  ) { }

  @Process({ name: 'downloadExogenousRut' })
  async downloadExogenousRut(job: Job<any>) {
    let browser, page;
    const { loginPage, document, password, dirFolder, fileDirExo, newNameExo, uid, auxFolder } = job.data;
    try {
      browser = await puppeteer.launch({ headless: true, args: ["--disable-notifications"] })
      page = await browser.newPage();
      await page.setDefaultNavigationTimeout(120000);
      await page.goto(`${process.env.DIAN_URL_BASE}`, { waitUntil: 'networkidle2' });
      await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: auxFolder })
      console.log('\n%s URL ✅', chalk.bold.yellow('SUCCESS'));

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
      console.log(`%s LOGIN -> ${uid} ✅`, chalk.bold.yellow('SUCCESS'));

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
          full_name: itemSpam[2]
        },
        local_path_exogenous: newNameExo
      }
    } catch (err) {
      if (err.name === 'TimeoutError') {
        await page.close();
        await browser.close();
        console.error('%s {\n"error": "TIME_OUT_ERROR"\n"detail": "El servidor de la DIAN, superó el tiempo de espera de la solicitud o tiene una coneccion lenta"\n}', chalk.bold.red('ERROR'));
        return {
          error: 'TIME_OUT_ERROR',
          detail: 'El servidor de la DIAN, superó el tiempo de espera de la solicitud o tiene una coneccion lenta'
        };

      } else {
        await page.close();
        await browser.close();
        console.error('%s ' + err.message, chalk.bold.red('ERROR'));
        return {
          error: err.name.toUpperCase(),
          detail: err.message
        };
      }

    }

  }

  async scanDirs(dir: String) {
    const response = [];
    fs.readdirSync(dir).forEach(file => {
      response.push(file)
    });
    return response;
  }

}