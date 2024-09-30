import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { EmailValidationPipe } from 'src/common/pipes/email-validation-pipe/email-validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/confirm-login')
  @HttpCode(200)
  confirmLogin(
    @Body('email', new EmailValidationPipe()) email: string,
    @Body() userVerifi: CreateUserDto,
  ) {
    return this.usersService.confirmLogin(userVerifi);
  }

  @Post()
  @HttpCode(200)
  create(
    @Body('email', new EmailValidationPipe()) email: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('/download/spring-boot-project')
  async downloadSpringBootProject(@Res() res: Response) {
    const filePath = await this.usersService.downloadSpringBootProject();
    res.download(filePath);
  }
}
