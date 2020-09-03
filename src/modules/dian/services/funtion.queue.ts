import { Processor, Process, OnQueueActive, OnGlobalQueueCompleted, OnQueueCompleted } from '@nestjs/bull';
import { Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { remote } from 'webdriverio';
import { DianService } from './dian.service';
import { Audit } from '../../../entities/security/audit.entity';
import { config } from '../../../../wdio.conf';
const fs = require('fs')
const axios = require('axios')
const path = require('path');
const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const capabilities = Capabilities.chrome();
import 'dotenv/config';

@Processor('dian')
export class FuntionQueue {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    private readonly dianService: DianService,
  ) { }



  /*   @OnGlobalQueueCompleted()
    async onGlobalCompleted(jobId: number, result?: any) {
      console.log('On completed job ', jobId, ' -> result: ', result);
    }
  
    @OnQueueActive()
    onActive(job: Job) {
      console.log(
        `Processing job ${job.id} of funtion ${job.name}...`,
      );
    } */

  async downloadImage() {
    const url = 'https://muisca.dian.gov.co/WebReportes/reportservlet?PR_reporte=reporteInformacionExogena&PR_datasource=dashboard.informacionexogena.DCmdSrvConsInformacionExogenaCont&PU_anio=2019&PU_fecha_procesamiento=2020-9-3%205:52:46&PR_paginacion=true&PR_renderer=xls'
    const dir = path.resolve(__dirname, 'images', 'code.jpg')
    const writer = fs.createWriteStream(dir)

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }
}