import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateFornecedorDto {
  @IsString({ message: 'O CNPJ deve ser um texto.' })
  @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$\vert{}^\d{14}$/, {
    message: 'CNPJ em formato inválido.',
  })
  @IsOptional()
  cnpj?: string;

  @IsString({ message: 'A razão social deve ser um texto.' })
  @IsOptional()
  razaoSocial?: string;

  @IsString({ message: 'O nome fantasia deve ser um texto.' })
  @IsOptional()
  nomeFantasia?: string;

  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsOptional()
  telefone?: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsOptional()
  email?: string;
}
