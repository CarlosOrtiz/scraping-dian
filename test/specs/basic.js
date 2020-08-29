describe('dian.gov.co page', () => {
  it('login', async () => {
    await browser.url('https://muisca.dian.gov.co/WebArquitectura/DefLoginOld.faces')
    await expect(browser).toHaveTitle('Dirección de Impuestos y Aduanas Nacionales de Colombia');
  })
})