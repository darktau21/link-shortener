import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  GoneException,
  Header,
  HttpCode,
  HttpStatus,
  Ip,
  NotFoundException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateLinkDto } from './dto/request/create-link.dto';
import { LinkInfoDto } from './dto/response/link-info.dto';
import {
  SHORT_URL_PARAM,
  ShortUrlParamDto,
} from './dto/request/short-url-param.dto';
import { LinkAnalyticsDto } from './dto/response/link-analytics.dto';

@Controller()
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @ZodSerializerDto(LinkInfoDto)
  @Post('/shorten')
  @HttpCode(HttpStatus.CREATED)
  async createLink(@Body() body: CreateLinkDto) {
    if (body.alias) {
      const existingLink = await this.shortenerService.getLink(body.alias);

      if (existingLink) {
        throw new ConflictException(
          `Link with alias ${body.alias} already exists`,
        );
      }
    }
    const linkInfo = await this.shortenerService.createLink(body);

    return linkInfo;
  }

  @Get(`/:${SHORT_URL_PARAM}`)
  @Redirect()
  // На самом деле не очень хорошо отключать кеш, но для корректной работы
  // clicksCount счетчика это необходимо. Иначе браузер кеширует редирект
  // и переходит на originalUrl не делая запрос на этот роут, следовательно
  // счетчик не увеличивается
  @Header('Cache-Control', 'no-cache')
  async redirect(@Param() link: ShortUrlParamDto, @Ip() clientIp: string) {
    const linkInfo = await this.shortenerService.getLink(link[SHORT_URL_PARAM]);

    if (!linkInfo) {
      throw new NotFoundException('Link not found');
    }

    if (linkInfo.expiresAt && new Date(linkInfo.expiresAt) < new Date()) {
      throw new GoneException('Link has expired');
    }

    await this.shortenerService.addVisitor(link[SHORT_URL_PARAM], clientIp);

    return {
      url: linkInfo.originalUrl,
      statusCode: HttpStatus.MOVED_PERMANENTLY,
    };
  }

  @ZodSerializerDto(LinkInfoDto)
  @Get(`/info/:${SHORT_URL_PARAM}`)
  async getLink(@Param() link: ShortUrlParamDto) {
    const linkInfo = await this.shortenerService.getLink(link[SHORT_URL_PARAM]);

    if (!linkInfo) {
      throw new NotFoundException('Link not found');
    }

    return { ...linkInfo, clicksCount: linkInfo._count.visitors };
  }

  @Delete(`/delete/:${SHORT_URL_PARAM}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLink(@Param() link: ShortUrlParamDto) {
    await this.shortenerService.deleteLink(link[SHORT_URL_PARAM]);
  }

  @ZodSerializerDto(LinkAnalyticsDto)
  @Get(`/analytics/:${SHORT_URL_PARAM}`)
  async getLinkStatistic(@Param() link: ShortUrlParamDto) {
    const linkInfo = await this.shortenerService.getLink(link[SHORT_URL_PARAM]);
    if (!linkInfo) {
      throw new NotFoundException('Link not found');
    }

    return { ...linkInfo, clicksCount: linkInfo._count.visitors };
  }
}
