import { PartialType } from '@nestjs/swagger';

import { CriarPetDto } from './criar-pet.dto';

export class AtualizarPetDto extends PartialType(CriarPetDto) {}
