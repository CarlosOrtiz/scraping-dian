import { Injectable } from '@nestjs/common';

const { remote } = require('webdriverio');

@Injectable()
export class DianService {

  constructor(

  ) { }

  async login() {
    (async () => {
      const browser = await remote({
        logLevel: 'trace',
        capabilities: {
          browserName: 'chrome'
        }
      })

      await browser.url('https://muisca.dian.gov.co/WebArquitectura/DefLogin.faces')

      const user = await browser.$('[value="2"]')
      await user.getValue()

      const typeUser = await browser.$('[value="13"]')
      await typeUser.getValue()

      const document = await browser.$('[name="vistaLogin:frmLogin:txtUsuario"]')
      await document.setValue('1117552597')

      const password = await browser.$('[name="vistaLogin:frmLogin:txtCadena"]')
      await password.setValue('Caol9901')

      const submitBtn = await browser.$('[name="vistaLogin:frmLogin:_id18"]')
      await submitBtn.click()

      console.log(await browser.getTitle()) // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
      console.log(await user.getValue()) // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
      console.log(await typeUser.getValue()) // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
      console.log(await document.getValue()) // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
      console.log(await password.getValue()) // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"

      await browser.deleteSession()
    })().catch((e) => console.error(e))

  }

}
