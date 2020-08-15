describe('dian.gov.co page', () => {
  it('should have the right title', async () => {
    await browser.url('https://muisca.dian.gov.co/WebArquitectura/DefLogin.faces')

    const input = $('#txtUsuario')

    // copies text from an input element
    input.setValue('1117552597');
    console.log(await input.getValue());

    await expect(browser).toHaveTitle('Dirección de Impuestos y Aduanas Nacionales - DIAN');
  })
})