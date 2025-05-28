import * as yup from 'yup';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Phone number validation regex (Indonesia)
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;

// Vehicle plate number validation regex (Indonesia)
const plateNumberRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/;

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .min(8, 'Password minimal 8 karakter')
    .required('Password wajib diisi'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .required('Nama wajib diisi'),
  email: yup
    .string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .matches(
      passwordRegex,
      'Password harus mengandung minimal 8 karakter, huruf besar, huruf kecil, angka, dan karakter spesial'
    )
    .required('Password wajib diisi'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
  role: yup
    .string()
    .oneOf(['user', 'landowner'], 'Role tidak valid')
    .required('Role wajib dipilih'),
});

export const bookingSchema = yup.object({
  vehicleType: yup
    .string()
    .oneOf(['car', 'motorcycle'], 'Jenis kendaraan tidak valid')
    .required('Jenis kendaraan wajib dipilih'),
  plateNumber: yup
    .string()
    .matches(plateNumberRegex, 'Nomor plat tidak valid')
    .required('Nomor plat wajib diisi'),
  startTime: yup
    .date()
    .min(new Date(), 'Waktu mulai tidak boleh kurang dari sekarang')
    .required('Waktu mulai wajib diisi'),
  duration: yup
    .number()
    .min(1, 'Durasi minimal 1 jam')
    .max(24, 'Durasi maksimal 24 jam')
    .required('Durasi wajib diisi'),
});

export const profileSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .required('Nama wajib diisi'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Nomor telepon tidak valid')
    .required('Nomor telepon wajib diisi'),
  address: yup
    .string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(200, 'Alamat maksimal 200 karakter')
    .required('Alamat wajib diisi'),
});

export const parkingLotSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Nama tempat parkir minimal 3 karakter')
    .max(100, 'Nama tempat parkir maksimal 100 karakter')
    .required('Nama tempat parkir wajib diisi'),
  address: yup
    .string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(200, 'Alamat maksimal 200 karakter')
    .required('Alamat wajib diisi'),
  description: yup
    .string()
    .min(20, 'Deskripsi minimal 20 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter')
    .required('Deskripsi wajib diisi'),
  totalSlots: yup
    .number()
    .min(1, 'Jumlah slot minimal 1')
    .required('Jumlah slot wajib diisi'),
  tariff: yup
    .number()
    .min(1000, 'Tarif minimal Rp 1.000')
    .required('Tarif wajib diisi'),
  operationalHours: yup.object({
    open: yup.string().required('Jam buka wajib diisi'),
    close: yup.string().required('Jam tutup wajib diisi'),
  }),
  facilities: yup
    .array()
    .of(yup.string())
    .min(1, 'Minimal pilih 1 fasilitas'),
  photos: yup
    .array()
    .of(yup.string())
    .min(1, 'Minimal upload 1 foto')
    .max(5, 'Maksimal 5 foto'),
}); 