import { ExpressoCapitalNgPage } from './app.po';

describe('expresso-capital-ng App', () => {
  let page: ExpressoCapitalNgPage;

  beforeEach(() => {
    page = new ExpressoCapitalNgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
