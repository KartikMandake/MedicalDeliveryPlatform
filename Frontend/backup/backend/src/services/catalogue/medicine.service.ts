export const listMedicines = async (filters: any) => {
    // TODO: Fetch from Prisma mapping filters (symptom, type, brand, search, page)
    console.log('[Medicine Service] Fetching medicines with filters:', filters);
    
    // Mock Data
    return [
        { id: '1', name: 'Paracetamol 500mg', type: 'Tablet', brand: 'GSK', price: 15 },
        { id: '2', name: 'Amoxicillin 250mg', type: 'Capsule', brand: 'Pfizer', price: 120 }
    ];
};

export const getMedicineDetails = async (id: string) => {
    // TODO: Fetch single medicine detail from Prisma DB
    console.log(`[Medicine Service] Fetching details for medicine ID: ${id}`);
    
    // Mock Data
    return { 
        id, 
        name: 'Paracetamol 500mg', 
        type: 'Tablet', 
        brand: 'GSK', 
        price: 15,
        description: 'Pain reliever and fever reducer.',
        stock: true
    };
};

export const getCategories = async () => {
    // Mock Data for categories
    return ['Pain Relief', 'Antibiotics', 'Vitamins', 'First Aid'];
};
