import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GeneratedDocument extends Document {
  @Prop({ required: true })
  templateName: string;

  @Prop({ required: true })
  variables: Record<string, any>;

  @Prop({ required: true })
  wordPath: string;

  @Prop({ required: true })
  pdfPath: string;

  @Prop({ default: 0 })
  consultations: number; // Nouveau champ pour le nombre de consultations

  @Prop({ default: null })
  expirationDate: Date; // Option pour restreindre l'accès à une date spécifique

  @Prop({ default: 10 }) // Exemple : Limite de 10 consultations
  maxConsultations: number;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const GeneratedDocumentSchema =
  SchemaFactory.createForClass(GeneratedDocument);
