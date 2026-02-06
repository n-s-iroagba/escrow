import { Model, DataTypes } from 'sequelize';
import { DocumentType, KycStatus } from '../utils/constants';
import sequelize from '@/config/database';

export interface IKYCDocument {
  id: string;
  userId: string;
  documentType: string;
  documentNumber: string;
  fullName?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  status: string;

  createdAt: Date;
  updatedAt: Date;
}

class KYCDocument extends Model<IKYCDocument> implements IKYCDocument {
  declare public id: string;
  declare public userId: string;
  declare public documentType: string;
  declare public documentNumber: string;
  declare public fullName?: string;
  declare public documentFrontUrl?: string;
  declare public documentBackUrl?: string;
  declare public selfieUrl?: string;
  declare public status: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}


KYCDocument.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    documentType: {
      type: DataTypes.ENUM(...Object.values(DocumentType)),
      allowNull: false,
      field: 'document_type',
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'document_number',
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'full_name',
    },

    documentFrontUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'document_front_url',
    },
    documentBackUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'document_back_url',
    },
    selfieUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'selfie_url',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(KycStatus)),
      defaultValue: KycStatus.PENDING,
      allowNull: false
    },


    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },

  {
    sequelize,
    tableName: 'kyc_documents',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id'],
        unique: true,
      },
      {
        fields: ['status'],
      },
    ],
  }
);


export default KYCDocument;