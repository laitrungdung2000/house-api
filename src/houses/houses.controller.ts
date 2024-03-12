import {
    BadRequestException, Controller, Post,
    UploadedFile, UseInterceptors, HttpCode, HttpStatus
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { getSimilarityPercentage, separateAddress } from '../utils/helper';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

@Controller('houses')
export class HousesController {
    @Post()
    @UseInterceptors(
        FileInterceptor('file'),
    )
    @HttpCode(HttpStatus.OK)
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const houses = [];
        const results = [];

        return new Promise((resolve, reject) => {
            const stream = Readable.from(file.buffer.toString())
                .pipe(csvParser())
                .on('data', (data) => houses.push(data))
                .on('end', () => {
                    while (houses.length > 0) {
                        const { houseId, houseAddress } = houses[0];
                        houses.splice(0, 1);
                        const { number, street } = separateAddress(houseAddress);
                        for (let i = 0; i < houses.length; i++) {
                            const { houseId: queryHouseId, houseAddress: queryHouseAddress } = houses[i];
                            const { number: queryNumber, street: queryStreet } = separateAddress(queryHouseAddress);
                            if (number === queryNumber) {

                                const percentage = getSimilarityPercentage(street, queryStreet);
                                if (percentage >= 40) {
                                    houses.splice(i, 1);
                                    i--;
                                    if (!results.includes(houseAddress)) {
                                        results.push(houseAddress);
                                    }
                                }
                            }
                        }
                        if (!results.includes(houseAddress)) {
                            results.push(houseAddress)
                        }
                    }
                    resolve({data: results.length});
                })
                .on('error', (error) => {
                    reject(error);
                });
        });

    }
}