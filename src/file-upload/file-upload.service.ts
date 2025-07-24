import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import {  UserEntity } from 'src/user/user.entity';
import { File } from './entities/file.entity';
import { UploadedFileEntity } from 'src/uploaded-file/uploaded-file.entity';
import { FilePurpose } from 'src/uploaded-file/uploaded-file-purpose.enum';

@Injectable()
export class FileUploadService {

    constructor(
        @InjectRepository(UploadedFileEntity)
        private readonly uploadedFileRepository: Repository<UploadedFileEntity>,
        private readonly cloudinaryService: CloudinaryService
    ){}

    async uploadFile(file: Express.Multer.File, purpose: FilePurpose, user: UserEntity): Promise<UploadedFileEntity>{
        const cloudinaryReponse = await this.cloudinaryService.uploadFile(file);

        const newlyCreatedFile = this.uploadedFileRepository.create({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            purpose: purpose,
            publicId: cloudinaryReponse?.public_id,
            fileUrl: cloudinaryReponse?.secure_url,
            user: user
        });

        return this.uploadedFileRepository.save(newlyCreatedFile)
        
    }

    async findAll(): Promise<UploadedFileEntity[]>{
        return this.uploadedFileRepository.find({
            relations:['uploader'],
            order:{uploadedAt: 'DESC'}
        })
    }
    async remove(id: number): Promise<void>{
        const fileToBeDeleted = await this.uploadedFileRepository.findOne({
            where: { id }
        })

        if(!fileToBeDeleted){
            throw new NotFoundException(`File with ID ${id} not found!`)
        }

        //delete from cloudinary
        await this.cloudinaryService.deleteFile(fileToBeDeleted.publicId);

        //delete from db
        await this.uploadedFileRepository.remove(fileToBeDeleted)
    }
}
