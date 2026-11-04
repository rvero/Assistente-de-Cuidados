import { cpfValido } from './cpf';

describe('Validação de CPF', () => {
  it('aceita CPF com ou sem pontuação', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('52998224725')).toBe(true);
  });
  it('rejeita CPF ausente, incompleto, repetido ou com dígito incorreto', () => {
    for (const cpf of ['', '123', '11111111111', '52998224726', '529a98224725']) expect(cpfValido(cpf)).toBe(false);
  });
});
