var assert = require('assert');

describe('muisca.dian.gov page', () => {
  it('should get text a menu link', () => {
    const text = $('#menu');
    console.log(text.$$('li')[2].$('a').getText()); // outputs: "API"
  });

  it('should get text a menu link - JS Function', () => {
    const text = $(function () { // Arrow function is not allowed here.
      // this is Window https://developer.mozilla.org/en-US/docs/Web/API/Window
      // TypeScript users may do something like this
      // return (this as Window).document.querySelector('#menu')
      return this.document.querySelector('#menu'); // Element
    });
    console.log(text.$$('li')[2].$('a').getText()); // outputs: "API"
  });
})