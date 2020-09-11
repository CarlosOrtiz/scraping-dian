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
const moduleQuestions = {
  retirement_unemployment_113: '#mat-radio-5-input',
  response_retirement_unemployment_114: '#cs_id_114',

  millitary_forces_police_115: '#mat-radio-8-input',
  response_millitary_forces_police_116: '#cs_id_116',

  income_public_university_119: '#mat-radio-14-input',
  response_income_public_university_120: '#cs_id_120',

  work_rental_income_125: '#mat-radio-23-input',
  response_work_rental_income_126: '#cs_id_126',

  not_work_rental_income_129: '#mat-radio-29-input',
  response_not_work_rental_income_130: '#cs_id_130',
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
    const auxFolder = path.join(dirFolder, `/${document}/`);

    const job = await this.dianQueue.add('downloadExogenousRut', { loginPage, document, password, dirFolder, uid, auxFolder }, { priority: 1, removeOnComplete: true, removeOnFail: true });
    return job.finished();
  }

  async rentalDeclaration(body: RentalDeclaration) {
    const dirFolder = path.join(__dirname, '../../../../../../../' + process.env.DOWNLOAD_PATH)
    const auxFolder = path.join(dirFolder, `/${body.document}/`);

    const job = await this.dianQueue.add('rentalDeclaration', { auxFolder, body, moduleQuestions, loginPage }, { priority: 2, removeOnComplete: true, removeOnFail: true })
    return job.finished();
  }

}