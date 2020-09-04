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

const path = require('path');
const util = require('util');
const fs = require('fs')

@Injectable()
export class DianService {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    @InjectQueue('dian') private dianQueue: Queue
  ) { }

  async downloadRut(document: string, password: string) {
    return await this.dianQueue.add('downloadRut', { document, password }, { priority: 4 });
  }

  async downloadExogenous(document: string, password: string) {
    return await this.dianQueue.add('downloadExogenous', { document, password }, { priority: 3 });
  }

  async downloadExogenousRut(document: string, password: string) {
    return await this.dianQueue.add('downloadExogenousRut', { document, password }, { priority: 2 });
  }

  async rentalDeclaration(body: RentalDeclaration) {
    return await this.dianQueue.add('rentalDeclaration', { body }, { priority: 1 })
  }

  async moveFiles(pathOriginal, newPath, nameArchive) {
    fs.copyFile(pathOriginal + '/' + nameArchive, newPath + '/' + nameArchive, (error) => {
      if (error) {

      } else {
        this.deleteFile(pathOriginal, nameArchive)
      }
    })
  }

  async deleteFile(pathOriginal, fileName) {
    fs.unlink(pathOriginal + '/' + fileName, (error) => {
      if (error) {
        console.log(error)
      } else {
        console.log('ok')
      }
    })
  }
}