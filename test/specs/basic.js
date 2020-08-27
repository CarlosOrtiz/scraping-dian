describe('dian.gov.co page', () => {
  it('login', async () => {
    await browser.url('https://muisca.dian.gov.co/WebArquitectura/DefLoginOld.faces')
    const loginForm = await browser.$('form > table[class="formulario_muisca"] > tbody > tr tr table');
    console.log(await loginForm.isExisting())

    const selectAll = await browser.$$('form > table tbody tr td select');
    await selectAll[0].selectByAttribute('value', '2');  // typeUser

    await expect(browser).toHaveTitle('Dirección de Impuestos y Aduanas Nacionales de Colombia');
  })
})