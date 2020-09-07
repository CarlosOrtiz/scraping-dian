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
const FileHound = require('filehound');
const { readdir, stat } = require("fs").promises
const rutica = path.join(__dirname, '../../../../../../../Descargas/');

@Injectable()
export class DianService {

  constructor(
    @InjectRepository(Audit, 'security') private readonly auditRepository: Repository<Audit>,
    @InjectQueue('dian') private dianQueue: Queue
  ) { }

  async downloadRut(document: string, password: string) {
    const job = await this.dianQueue.add('downloadRut', { document, password }, { priority: 4 });

    if (job) {
      const arraDIr = await this.scanDirs(rutica)
      let dirDocument = path.join(__dirname, '../../../../../../../Descargas/', '14659862170 (4).pdf');
      console.log(arraDIr)
      /*  arraDIr.map(item => {
         console.log(item);
       }) */
      const fileUpload = await this.UploadFileGDrive(dirDocument);
      /*    dirDocument = path.join(__dirname, '../../../../../../../Descargas/', '14659862170.pdf'); */


      return { success: 'OK', url: `https://drive.google.com/file/d/${fileUpload.id}/view?usp=sharing` }
    }

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


  async UploadFileGDrive(file, name?) {
    const YOUR_ROOT_FOLDER = '1D4gwvPNeCW3HFSPeoCTvknZO_4vhrgdc'; // id de mi carpeta de drive
    const PATH_TO_CREDENTIALS = credentials;

    const googleDriveInstance = new NodeGoogleDrive({
      ROOT_FOLDER: YOUR_ROOT_FOLDER
    });

    const creds_service_user = (PATH_TO_CREDENTIALS);

    let gdrive = await googleDriveInstance.useServiceAccountAuth(
      creds_service_user
    );

    let uploadResponse = await googleDriveInstance.create({
      source: file,
      parentFolder: YOUR_ROOT_FOLDER,
      name: name,
    }).catch(e => console.error(e));

    return uploadResponse
  }


  async moveDirsFiles(dir) {
    const moveFrom = path.join(__dirname, '../../../../../../../Descargas/');
    const moveTo = path.join(__dirname, '../files');

    return await fs.readdir(moveFrom, function (err, files) {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }

      files.forEach(function (file, index) {
        // Make one pass and make the file complete
        var fromPath = path.join(moveFrom, file);
        var toPath = path.join(moveTo, file);

        fs.stat(fromPath, function (error, stat) {
          if (error) {
            console.error("Error stating file.", error);
            return;
          }

          if (stat.isFile())
            console.log("'%s' is a file.", fromPath);
          else if (stat.isDirectory())
            console.log("'%s' is a directory.", fromPath);

          fs.rename(fromPath, toPath, function (error) {
            if (error) {
              console.error("File moving error.", error);
            }
            else {
              console.log("Moved file '%s' to '%s'.", fromPath, toPath);
            }
          });
        });
      });
    });
  }

  async scanDirs(dir) {
    return await fs.readdir(dir, (err, files) => {
      var r = [];
      files.forEach((file) => {
        s(file);
        function s(file) {
          fs.stat(dir + '/' + file, (err, stat) => {
            if (err) { console.error(err); return; }
            else if (stat.isFile()) r.push({ f: file, type: 'file' });
            else r.push(0);
            if (r.length == files.length) {
              r.filter((m) => { return m; });
              console.log(r);
            }
          });
        }
      });
    });
  }
}