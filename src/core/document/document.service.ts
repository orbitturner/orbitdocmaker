import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { GeneratedDocument } from './schemas/document.schema';
import { performance } from 'perf_hooks';
import * as libre from 'libreoffice-convert';

@Injectable()
export class DocumentService {
  private logger = new Logger(DocumentService.name);

  // Utilisation des variables d'environnement pour définir les paramètres dynamiques
  private archivePath = process.env.ARCHIVE_PATH || './archives';
  private maxConsultations =
    parseInt(process.env.PDF_MAX_CONSULTATIONS, 10) || 5;
  private expirationHours =
    parseInt(process.env.PDF_EXPIRATION_HOURS, 10) || 24;
  private appUrl = process.env.APP_URL;

  constructor(
    @InjectModel(GeneratedDocument.name)
    private readonly docModel: Model<GeneratedDocument>,
  ) {}

  async generateDocument(templatePath: string, variables: Record<string, any>) {
    const startTime = performance.now();
    this.logger.log('⚙️ Starting document generation...');

    // Lecture du template Word
    const readStart = performance.now();
    this.logger.log(`📂 Reading template from path: ${templatePath}`);

    let content: Buffer;
    try {
      content = fs.readFileSync(path.resolve(templatePath)); // Lire le fichier en tant que Buffer
    } catch (error) {
      this.logger.error(`❌ Failed to read template file: ${error.message}`);
      throw new Error('Template file reading failed');
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const readEnd = performance.now();
    this.logger.log(
      `✅ Template read in ${(readEnd - readStart).toFixed(2)} ms`,
    );

    // Insertion des variables et génération du fichier Word
    const renderStart = performance.now();
    this.logger.log(`🔧 Inserting variables into template...`);

    try {
      doc.setData(variables);
      doc.render();
    } catch (error) {
      this.logger.error(`❌ Error during template rendering: ${error.message}`);
      throw new Error('Document rendering failed');
    }

    const renderEnd = performance.now();
    this.logger.log(
      `✅ Template rendered in ${(renderEnd - renderStart).toFixed(2)} ms`,
    );

    // Sauvegarde du fichier Word généré
    const wordSaveStart = performance.now();
    const wordPath = `${this.archivePath}/${Date.now()}_output.docx`; // Utilisation du répertoire d'archivage
    fs.writeFileSync(wordPath, doc.getZip().generate({ type: 'nodebuffer' }));
    const wordSaveEnd = performance.now();
    this.logger.log(
      `📝 Word document saved at ${wordPath} in ${(wordSaveEnd - wordSaveStart).toFixed(2)} ms`,
    );

    // Conversion en PDF avec libreoffice-convert
    const pdfConvertStart = performance.now();
    this.logger.log('🖨️ Converting Word document to PDF with LibreOffice...');

    const pdfPath = wordPath.replace('.docx', '.pdf');
    await this.convertToPDF(wordPath, pdfPath);

    const pdfConvertEnd = performance.now();
    this.logger.log(
      `📝 PDF document saved at ${pdfPath} in ${(pdfConvertEnd - pdfConvertStart).toFixed(2)} ms`,
    );

    // Enregistrement dans MongoDB
    const dbSaveStart = performance.now();
    this.logger.log('💾 Saving document metadata to MongoDB...');

    const expirationDate = new Date(
      Date.now() + this.expirationHours * 60 * 60 * 1000,
    ); // Utilisation de la durée d'expiration dynamique

    const newDoc = new this.docModel({
      templateName: path.basename(templatePath),
      variables,
      wordPath,
      pdfPath,
      consultations: 0, // Initialiser à 0
      maxConsultations: this.maxConsultations, // Utilisation de la limite de consultations dynamique
      expirationDate, // Date d'expiration dynamique
      createdAt: new Date(),
    });

    await newDoc.save();

    const dbSaveEnd = performance.now();
    this.logger.log(
      `✅ Metadata saved in MongoDB in ${(dbSaveEnd - dbSaveStart).toFixed(2)} ms`,
    );

    // Générer une URL pour le téléchargement du PDF
    const downloadUrl = `${this.appUrl}/documents/${newDoc._id}/download`;
    this.logger.log(`📄 Document generated and available at: ${downloadUrl}`);

    // Mesure du temps total
    const endTime = performance.now();
    this.logger.log(
      `🚀 Document generation process completed in ${(endTime - startTime).toFixed(2)} ms`,
    );

    return { downloadUrl };
  }

  /**
   * Utilise libreoffice-convert pour convertir un fichier Word en PDF
   *
   * @param wordFilePath Le chemin du fichier Word à convertir
   * @param pdfFilePath Le chemin de destination du fichier PDF généré
   */
  private async convertToPDF(
    wordFilePath: string,
    pdfFilePath: string,
  ): Promise<void> {
    const file = fs.readFileSync(wordFilePath, { encoding: null }); // Lire le fichier comme Buffer
    const extend = '.pdf';

    return new Promise((resolve, reject) => {
      libre.convert(file, extend, undefined, (err, done) => {
        if (err) {
          this.logger.error(`❌ PDF conversion error: ${err.message}`);
          return reject(err);
        }

        // Écrire le fichier converti (PDF) sur le disque
        fs.writeFileSync(pdfFilePath, done);
        this.logger.log(
          `✅ PDF successfully converted and saved to ${pdfFilePath}`,
        );
        resolve();
      });
    });
  }
}
