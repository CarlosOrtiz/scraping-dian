import { Injectable, BadRequestException } from '@nestjs/common';
import { LoginService } from '../../auth/services/login.service';
import { config } from '../../../../wdio.conf';
import { remote } from 'webdriverio';

import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

/* const webdriverio = require('webdriverio') */
const phantomjs = require('phantomjs-prebuilt')
const wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }
const params = {
  phantomjs: require('phantomjs-prebuilt'),
  webdriverio: require('webdriverio'),
  wdOpts: {
    desiredCapabilities: {
      browserName: 'phantomjs',
      'phantomjs.page.settings.loadImages': false
    }
  }
};
@Injectable()
export class RutService {

  constructor(
    private readonly loginService: LoginService,
    @InjectQueue('dian') private dianQueue: Queue
  ) { }

  /*   async prueba() {
      phantomjs.run('--webdriver=4444').then(program => {
        webdriverio.remote(wdOpts).init()
          .url('https://www.dian.gov.co/')
          .getTitle().then(title => {
            console.log(title) // 'Mozilla Developer Network'
            program.kill() // quits PhantomJS
          })
      })
    } */

  async downloadRut(document: string, password: string) {
    const job = await this.dianQueue.add('downloadRut', { config, document, password });
    return job;
  }
}