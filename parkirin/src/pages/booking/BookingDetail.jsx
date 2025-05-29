import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { 
  Card, 
  Button, 
  Badge, 
  Modal, 
  LoadingSpinner, 
  Alert 
} from '../../components/common';
import { 
  GET_BOOKING, 
  GENERATE_BOOKING_QR, 
  GENERATE_PARKING_ACCESS_QR 
} from '../../graphql/queries';
import { 
  CANCEL_BOOKING, 
  EXTEND_BOOKING,
  CONFIRM_BOOKING 
} from '../../graphql/mutations';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { 
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  QrCodeIcon,
  PhoneIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import QRCode from 'qrcode';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrType, setQrType] = useState(''); // 'booking', 'entry', 'exit'
  const [extensionHours, setExtensionHours] = useState(1);

  // Fetch booking details
  const { data, loading, error, refetch } = useQuery(GET_BOOKING, {
    variables: { id },
    fetchPolicy: 'cache-and-network'
  });

  // Mutations
  const [cancelBooking, { loading: cancelLoading }] = useMutation(CANCEL_BOOKING, {
    onCompleted: () => {
      setShowCancelModal(false);
      refetch();
    }
  });

  const [confirmBooking, { loading: confirmLoading }] = useMutation(CONFIRM_BOOKING, {
    onCompleted: () => {
      refetch();
    }
  });

  const [extendBooking, { loading: extendLoading }] = useMutation(EXTEND_BOOKING, {
    onCompleted: () => {
      setShowExtendModal(false);
      refetch();
    }
  });

  const [generateBookingQR, { loading: generateQRLoading }] = useMutation(GENERATE_BOOKING_QR);
  const [generateAccessQR, { loading: generateAccessLoading }] = useMutation(GENERATE_PARKING_ACCESS_QR);

  const booking = data?.getBooking;

  // Generate QR Code
  const handleGenerateQR = async (type) => {
    try {
      let qrData = '';
      
      if (type === 'booking') {
        const result = await generateBookingQR({
          variables: { bookingId: id }
        });
        qrData = result.data.generateBookingQR.qrCode;
      } else {
        const result = await generateAccessQR({
          variables: { 
            bookingId: id,
            type: type // 'entry' or 'exit'
          }
        });
        qrData = result.data.generateParkingAccessQR;
      }

      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(qrData);
      setQrCodeUrl(qrUrl);
      setQrType(type);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    try {
      await cancelBooking({ variables: { id } });
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  // Handle confirm booking
  const handleConfirmBooking = async () => {
    try {
      await confirmBooking({ variables: { id } });
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  // Handle extend booking
  const handleExtendBooking = async () => {
    try {
      await extendBooking({
        variables: {
          id,
          additionalDuration: extensionHours
        }
      });
    } catch (error) {
      console.error('Error extending booking:', error);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'green';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu Konfirmasi';
      case 'confirmed': return 'Dikonfirmasi';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  // Check if booking can be modified
  const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed';
  const canExtend = booking?.status === 'confirmed';
  const canConfirm = booking?.status === 'pending';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Booking Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Booking yang Anda cari tidak ditemukan atau sudah dihapus."}
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/bookings')}
          >
            Kembali ke Daftar Booking
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Booking
              </h1>
              <p className="text-gray-600">
                ID: {booking._id}
              </p>
            </div>
            
            <Badge color={getStatusColor(booking.status)} size="lg">
              {getStatusText(booking.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parking Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Tempat Parkir</h2>
              
              <div className="flex items-start gap-4">
                {booking.parking?.images?.[0] && (
                  <img
                    src={booking.parking.images[0]}
                    alt={booking.parking.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {booking.parking?.name}
                  </h3>
                  
                  <div className="flex items-start gap-2 text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{booking.parking?.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>⭐ {booking.parking?.rating || 0}/5</span>
                    <span>•</span>
                    <span>📍 {booking.distance ? `${booking.distance}m` : 'N/A'}</span>
                  </div>
                  
                  {booking.parking?.owner && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        Pemilik: <span className="font-medium">{booking.parking.owner.name}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 flex items-center gap-2"
                        onClick={() => navigate(`/chat/${booking.parking.owner._id}`)}
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Hubungi Pemilik
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Booking Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Detail Booking</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal & Waktu</p>
                      <p className="font-medium">
                        {formatDateTime(booking.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Durasi</p>
                      <p className="font-medium">{booking.duration} jam</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="text-sm text-gray-600">Jenis Kendaraan</p>
                      <p className="font-medium">
                        {booking.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                      </p>
                    </div>
                  </div>
                  
                  {booking.licensePlate && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔢</span>
                      <div>
                        <p className="text-sm text-gray-600">Plat Nomor</p>
                        <p className="font-medium">{booking.licensePlate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Catatan:</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Pembayaran</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarif per jam:</span>
                  <span className="font-medium">
                    {formatCurrency(booking.hourlyRate || booking.cost / booking.duration)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Durasi:</span>
                  <span className="font-medium">{booking.duration} jam</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total Biaya:</span>
                  <span className="text-blue-600">{formatCurrency(booking.cost)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <CreditCardIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Status Pembayaran: 
                    <span className={`ml-1 font-medium ${
                      booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {booking.paymentStatus === 'paid' ? 'Dibayar' : 'Belum Dibayar'}
                    </span>
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            {/* QR Codes */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">QR Code</h3>
              
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGenerateQR('booking')}
                  disabled={generateQRLoading}
                  className="w-full flex items-center gap-2"
                >
                  <QrCodeIcon className="h-4 w-4" />
                  QR Booking
                </Button>
                
                {booking.status === 'confirmed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateQR('entry')}
                      disabled={generateAccessLoading}
                      className="w-full flex items-center gap-2"
                    >
                      <QrCodeIcon className="h-4 w-4" />
                      QR Masuk
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateQR('exit')}
                      disabled={generateAccessLoading}
                      className="w-full flex items-center gap-2"
                    >
                      <QrCodeIcon className="h-4 w-4" />
                      QR Keluar
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Aksi</h3>
              
              <div className="space-y-2">
                {canConfirm && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmBooking}
                    disabled={confirmLoading}
                    className="w-full flex items-center gap-2"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {confirmLoading ? 'Mengkonfirmasi...' : 'Konfirmasi Booking'}
                  </Button>
                )}
                
                {canExtend && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExtendModal(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Perpanjang Waktu
                  </Button>
                )}
                
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Batalkan Booking
                  </Button>
                )}
              </div>
            </Card>

            {/* Booking Timeline */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Timeline</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Booking Dibuat</p>
                    <p className="text-gray-600">{formatDateTime(booking.createdAt)}</p>
                  </div>
                </div>
                
                {booking.confirmedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Dikonfirmasi</p>
                      <p className="text-gray-600">{formatDateTime(booking.confirmedAt)}</p>
                    </div>
                  </div>
                )}
                
                {booking.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Selesai</p>
                      <p className="text-gray-600">{formatDateTime(booking.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`QR Code ${qrType === 'booking' ? 'Booking' : qrType === 'entry' ? 'Masuk' : 'Keluar'}`}
      >
        <div className="text-center py-4">
          {qrCodeUrl && (
            <div className="mb-4">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="mx-auto w-64 h-64"
              />
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            Tunjukkan QR code ini kepada petugas parkir
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.download = `qr-${qrType}-${booking._id}.png`;
                link.href = qrCodeUrl;
                link.click();
              }}
            >
              Download
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowQRModal(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Batalkan Booking"
      >
        <div className="py-4">
          <Alert
            type="warning"
            title="Peringatan"
            message="Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan."
            className="mb-4"
          />
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Batal
            </Button>
            
            <Button
              variant="primary"
              onClick={handleCancelBooking}
              disabled={cancelLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelLoading ? 'Membatalkan...' : 'Ya, Batalkan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Extend Booking Modal */}
      <Modal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        title="Perpanjang Waktu Parkir"
      >
        <div className="py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tambah Durasi (jam)
            </label>
            <select
              value={extensionHours}
              onChange={(e) => setExtensionHours(parseInt(e.target.value))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map(hour => (
                <option key={hour} value={hour}>
                  {hour} jam
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between text-sm">
              <span>Biaya tambahan:</span>
              <span className="font-medium">
                {formatCurrency((booking.hourlyRate || booking.cost / booking.duration) * extensionHours)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowExtendModal(false)}
            >
              Batal
            </Button>
            
            <Button
              variant="primary"
              onClick={handleExtendBooking}
              disabled={extendLoading}
            >
              {extendLoading ? 'Memperpanjang...' : 'Perpanjang'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetail;