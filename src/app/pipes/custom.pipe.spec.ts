import { IncomeStatementPipe } from './custom.pipe';

describe('IncomeStatementPipe', () => {
  it('create an instance', () => {
    const pipe = new IncomeStatementPipe();
    expect(pipe).toBeTruthy();
  });
});
