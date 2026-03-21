import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as medicineService from '../services/catalogue/medicine.service';

export const getMedicines = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query; // symptom, type, brand, search, page
    
    const medicines = await medicineService.listMedicines(filters);
    res.json({ success: true, data: medicines });
});

export const getMedicineById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const medicine = await medicineService.getMedicineDetails(id);
    if (!medicine) {
        res.status(404);
        throw new Error('Medicine not found');
    }
    res.json({ success: true, data: medicine });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await medicineService.getCategories();
    res.json({ success: true, data: categories });
});
