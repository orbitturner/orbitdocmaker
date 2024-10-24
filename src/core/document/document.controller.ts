import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GeneratedDocument } from './schemas/document.schema';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('documents')
export class DocumentController {
  private logger = new Logger(DocumentController.name);

  constructor(
    private readonly documentService: DocumentService,
    @InjectModel(GeneratedDocument.name)
    private readonly docModel: Model<GeneratedDocument>,
  ) {}

  /**
   * Endpoint pour générer un document Word et PDF à partir d'un template
   *
   * @param body Le corps de la requête contenant le chemin du template et les variables
   */
  @Post('generate')
  async generateDocument(
    @Body() body: { templatePath: string; variables: Record<string, any> },
  ) {
    this.logger.log('📄 Received request to generate document...');
    const { templatePath, variables } = body;

    // Appeler le service pour générer le document
    const result = await this.documentService.generateDocument(
      templatePath,
      variables,
    );

    this.logger.log(
      `✅ Document generated with download URL: ${result.downloadUrl}`,
    );
    return result;
  }

  /**
   * Endpoint pour télécharger un document PDF généré.
   * Applique des restrictions sur le nombre de consultations et la date d'expiration.
   *
   * @param id L'identifiant du document à télécharger
   * @param res L'objet de réponse HTTP
   */
  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    this.logger.log(`📥 Download request received for document ID: ${id}`);

    // Récupérer le document depuis MongoDB
    const document = await this.docModel.findById(id);

    if (!document) {
      this.logger.error(`❌ Document with ID: ${id} not found`);
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    // Vérifier si le document a expiré
    if (document.expirationDate && new Date() > document.expirationDate) {
      this.logger.error(`❌ Document with ID: ${id} has expired`);
      throw new HttpException(
        'This document has expired',
        HttpStatus.FORBIDDEN,
      );
    }

    // Vérifier si le nombre de consultations est atteint
    if (document.consultations >= document.maxConsultations) {
      this.logger.error(
        `❌ Document with ID: ${id} has reached its maximum consultations`,
      );
      throw new HttpException(
        'Consultation limit reached',
        HttpStatus.FORBIDDEN,
      );
    }

    // Incrémenter le nombre de consultations
    document.consultations += 1;
    await document.save();

    this.logger.log(
      `✅ Document with ID: ${id} has been consulted ${document.consultations} times`,
    );

    // Envoyer le fichier PDF
    const filePath = document.pdfPath;

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      this.logger.error(
        `❌ PDF file for document ID: ${id} not found at path: ${filePath}`,
      );
      throw new HttpException('PDF file not found', HttpStatus.NOT_FOUND);
    }

    const file = fs.createReadStream(filePath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${document.templateName}.pdf"`,
    });

    this.logger.log(`📄 Serving PDF file for document ID: ${id}`);
    file.pipe(res); // Envoyer le fichier PDF dans la réponse
  }
}
