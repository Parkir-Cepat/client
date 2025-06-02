import React from 'react';
import {
  Container,  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Divider,
  Rating,  CircularProgress,
  Stack
} from '@mui/material';
import { LocationOn, QrCode, CheckCircle } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
// Using midtransService directly
import { midtransService } from '../services/midtrans';
import { GET_PARKING_LOT, CREATE_BOOKING, CREATE_PAYMENT } from '../apollo/queries';
import type { ParkingLot, CreateBookingInput, CreatePaymentInput } from '../types';

const steps = ['Booking Details', 'Payment', 'Confirmation'];

const vehicleTypes = [
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'truck', label: 'Truck' }
];

const paymentMethods = [
  { value: 'saldo', label: 'ParkGo Balance', icon: '💰' },
  { value: 'qris', label: 'QRIS', icon: '📱' },
  { value: 'virtual_account', label: 'Virtual Account', icon: '🏦' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📲' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' }
];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();  const { user } = useAuth();

  const parkingLotId = searchParams.get('parkingLotId') || '';
  const initialVehicleType = searchParams.get('vehicleType') || 'car';
  const initialDuration = parseInt(searchParams.get('duration') || '2');
  const [activeStep, setActiveStep] = React.useState(0);
  const [bookingData, setBookingData] = React.useState({
    vehicleType: initialVehicleType,
    startTime: new Date(),
    duration: initialDuration,
    paymentMethod: 'saldo'
  });
  const [createdBooking, setCreatedBooking] = React.useState<{
    _id: string;
    parkingLot: ParkingLot;
    vehicleType: string;
    startTime: string;
    duration: number;
    status: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Fetch parking lot details
  const { data: parkingLotData, loading: parkingLotLoading, error: parkingLotError } = useQuery(
    GET_PARKING_LOT,
    {
      variables: { id: parkingLotId },
      skip: !parkingLotId
    }
  );

  // Create booking mutation
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [createPayment] = useMutation(CREATE_PAYMENT);

  const parkingLot: ParkingLot = parkingLotData?.getParkingLot;

  // Calculate total cost
  const totalCost = parkingLot ? parkingLot.tariff * bookingData.duration : 0;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateBooking = async () => {
    if (!parkingLot || !user) return;

    try {
      setIsProcessing(true);

      const bookingInput: CreateBookingInput = {
        parkingLotId: parkingLot._id,
        vehicleType: bookingData.vehicleType,
        startTime: bookingData.startTime.toISOString(),
        duration: bookingData.duration
      };

      const { data } = await createBooking({
        variables: { input: bookingInput }
      });

      setCreatedBooking(data.createBooking);
      handleNext();    } catch (error) {
      console.error('Error creating booking:', error);
      if (error instanceof Error) {
        alert(error.message);      } else {
        alert('Failed to create booking');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!createdBooking) return;

    try {
      setIsProcessing(true);

      if (bookingData.paymentMethod === 'saldo') {
        // Direct saldo payment
        const paymentInput: CreatePaymentInput = {
          bookingId: createdBooking._id,
          amount: totalCost,
          paymentMethod: 'saldo',
          type: 'booking'
        };

        await createPayment({
          variables: { input: paymentInput }
        });

        handleNext();
      } else {
        // Midtrans payment
        const paymentInput: CreatePaymentInput = {
          bookingId: createdBooking._id,
          amount: totalCost,
          paymentMethod: bookingData.paymentMethod,
          type: 'booking'
        };

        const { data } = await createPayment({
          variables: { input: paymentInput }
        });

        if (data?.createPayment?.paymentToken) {          await midtransService.openSnapPayment(data.createPayment.paymentToken, {
            onSuccess: () => {
              handleNext();            },
            onPending: () => {
              navigate('/bookings');
            },
            onError: () => {
              alert('Payment failed');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error instanceof Error) {
        alert(error.message);      } else {
        alert('Failed to process payment');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!parkingLotId) {    return (
      <Container>
        <Alert severity="error">
          Parking lot ID not found
        </Alert>
      </Container>
    );
  }

  if (parkingLotLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (parkingLotError || !parkingLot) {    return (
      <Container>
        <Alert severity="error">
          Failed to load parking lot data
        </Alert>
      </Container>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
              <Box flex={1}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={parkingLot.photos[0] || '/placeholder-parking.jpg'}
                    alt={parkingLot.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {parkingLot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                      {parkingLot.address}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={parkingLot.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({parkingLot.rating.toFixed(1)})
                      </Typography>
                    </Box>                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small" 
                        label={`${parkingLot.availableSlots} slots available`}
                        color="success"
                      />
                      <Chip 
                        size="small" 
                        label={`$${parkingLot.tariff.toLocaleString('en-US')}/hour`}
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box flex={1}>
                <Card>                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Booking Details
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        select
                        label="Vehicle Type"
                        value={bookingData.vehicleType}
                        onChange={(e) => setBookingData({ ...bookingData, vehicleType: e.target.value })}
                      >
                        {vehicleTypes
                          .filter(type => parkingLot.vehicleTypes.includes(type.value))
                          .map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 2 }}>                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                        <DateTimePicker
                          label="Start Time"
                          value={bookingData.startTime}
                          onChange={(newValue) => {
                            if (newValue) {
                              setBookingData({ ...bookingData, startTime: newValue });
                            }
                          }}
                          minDateTime={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Duration (hours)"
                        value={bookingData.duration}
                        onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) || 1 })}
                        inputProps={{ min: 1, max: 24 }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Rate per hour:</Typography>
                      <Typography>${parkingLot.tariff.toLocaleString('en-US')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Duration:</Typography>
                      <Typography>{bookingData.duration} hours</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        ${totalCost.toLocaleString('en-US')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
              <Box flex={2}>
                <Card>                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Choose Payment Method
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                      {paymentMethods.map((method) => (
                        <Box key={method.value} flex={{ xs: '100%', sm: '45%' }}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: bookingData.paymentMethod === method.value ? 2 : 1,
                              borderColor: bookingData.paymentMethod === method.value ? 'primary.main' : 'grey.300'
                            }}
                            onClick={() => setBookingData({ ...bookingData, paymentMethod: method.value })}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ mb: 1 }}>
                                {method.icon}
                              </Typography>
                              <Typography variant="body1">
                                {method.label}
                              </Typography>
                              {method.value === 'saldo' && (
                                <Typography variant="body2" color="text.secondary">
                                  Balance: ${user?.saldo.toLocaleString('en-US')}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box flex={1}>
                <Card>                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Booking Summary
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Parking Lot
                      </Typography>
                      <Typography variant="body1">
                        {parkingLot.name}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Time
                      </Typography>
                      <Typography variant="body1">
                        {bookingData.startTime.toLocaleDateString('en-US')} {bookingData.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {bookingData.duration} hours
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Vehicle
                      </Typography>
                      <Typography variant="body1">
                        {vehicleTypes.find(v => v.value === bookingData.vehicleType)?.label}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <Typography variant="h6">Total Payment:</Typography>
                      <Typography variant="h6" color="primary">
                        ${totalCost.toLocaleString('en-US')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Stack>
        );

      case 2:
        return (          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Booking Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your booking has been confirmed. Use the QR code to enter the parking area.
            </Typography>

            {createdBooking && (
              <Card sx={{ maxWidth: 400, mx: 'auto', mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Booking Details
                  </Typography>
                  <Typography variant="body2">
                    Booking ID: {createdBooking._id}
                  </Typography>
                  <Typography variant="body2">
                    Status: {createdBooking.status}
                  </Typography>
                    <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    startIcon={<QrCode />}
                    onClick={() => navigate(`/booking/${createdBooking._id}`)}
                    disabled={false} // Set a default value
                  >
                    View QR Code
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Book Parking Space
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 3 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          <Box>
            {activeStep === 0 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!parkingLot.vehicleTypes.includes(bookingData.vehicleType) || bookingData.duration < 1}
              >
                Next
              </Button>
            )}
            {activeStep === 1 && (
              <Button
                variant="contained"
                onClick={handleCreateBooking}
                disabled={Boolean(isProcessing || (bookingData.paymentMethod === 'saldo' && user && user.saldo < totalCost))}
                startIcon={isProcessing ? <CircularProgress size={20} /> : null}
              >
                {isProcessing ? 'Processing...' : 'Create Booking'}
              </Button>
            )}
            {activeStep === 2 && (
              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : null}
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                onClick={() => navigate('/bookings')}
              >
                View All Bookings
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingPage;
