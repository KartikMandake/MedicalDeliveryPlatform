import api from './axios';

export const uploadPrescription = (file) => {
  const formData = new FormData();
  formData.append('prescription', file);

  return api.post('/upload/prescription', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const extractPrescriptionFromFile = (file) => {
  const formData = new FormData();
  formData.append('prescription', file);

  return api.post('/upload/prescription/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const extractPrescriptionFromPdf = extractPrescriptionFromFile;
