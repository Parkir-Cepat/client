import React from "react";
import {
  Container,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  QrCode,
  AccessTime,
  LocationOn,
  DirectionsCar,
  Payment,
  Cancel,
  Extension,
  Chat,
} from "@mui/icons-material";
import { useQuery, useMutation, ApolloError } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { id } from "date-fns/locale/id"; // Import Indonesian locale
import {
  GET_MY_ACTIVE_BOOKINGS,
  GET_MY_BOOKING_HISTORY,
  CANCEL_BOOKING,
  EXTEND_BOOKING,
  GENERATE_BOOKING_QR,
} from "../apollo/queries";
import { useAuth } from "../contexts/AuthContext";
import type { Booking } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ActiveBookingsData {
  getMyActiveBookings: Booking[];
}

interface BookingHistoryData {
  getMyBookingHistory: Booking[];
}

const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(
    null
  );
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [extendDuration, setExtendDuration] = React.useState(1);

  // Queries
  const {
    data: activeBookingsData,
    loading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useQuery<ActiveBookingsData>(GET_MY_ACTIVE_BOOKINGS, {
    onCompleted: (data) => {
      console.log("Active bookings data:", data);
    },
    onError: (error: ApolloError) => {
      console.error("Error fetching active bookings:", error);
    },
  });

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<BookingHistoryData>(GET_MY_BOOKING_HISTORY, {
    onCompleted: (data) => {
      console.log("Booking history data:", data);
    },
    onError: (error: ApolloError) => {
      console.error("Error fetching booking history:", error);
    },
  });

  // Mutations
  const [cancelBooking] = useMutation(CANCEL_BOOKING);
  const [extendBooking] = useMutation(EXTEND_BOOKING);
  const [generateQR] = useMutation(GENERATE_BOOKING_QR);

  const activeBookings = activeBookingsData?.getMyActiveBookings || [];
  const bookingHistory = historyData?.getMyBookingHistory || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await cancelBooking({
        variables: { bookingId: selectedBooking._id },
      });

      setCancelDialogOpen(false);
      setSelectedBooking(null);
      refetchActive();
      refetchHistory();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error cancelling booking:", error);
        alert(error.message || "Failed to cancel booking");
      }
    }
  };

  const handleExtendBooking = async () => {
    if (!selectedBooking) return;

    try {
      await extendBooking({
        variables: {
          input: {
            bookingId: selectedBooking._id,
            additionalDuration: extendDuration,
          },
        },
      });

      setExtendDialogOpen(false);
      setSelectedBooking(null);
      refetchActive();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error extending booking:", error);
        alert(error.message || "Failed to extend booking");
      }
    }
  };

  const handleGenerateQR = async (booking: Booking) => {
    try {
      const { data } = await generateQR({
        variables: { bookingId: booking._id },
      });

      setSelectedBooking({ ...booking, ...data.generateBookingQR });
      setQrDialogOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating QR:", error);
        alert(error.message || "Failed to generate QR code");
      }
    }
  };

  const getStatusColor = (
    status: string
  ): "warning" | "success" | "info" | "error" | "default" => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "completed":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };
  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };
  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 50%, #f3e5f5 100%)",
          py: 4,
        }}
      >
        <Container>
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Alert
              severity="warning"
              sx={{
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 193, 7, 0.2)",
                borderRadius: 2,
              }}
            >
              Please login to view your booking list.
            </Alert>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                background: "linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #7B1FA2 90%)",
                  transform: "scale(1.02)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  const isLoading = activeLoading || historyLoading;
  const hasError = activeError || historyError;
  if (hasError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 50%, #f3e5f5 100%)",
          py: 4,
        }}
      >
        <Container>
          <Box sx={{ py: 4 }}>
            <Alert
              severity="error"
              sx={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(244, 67, 54, 0.2)",
                borderRadius: 2,
              }}
            >
              An error occurred while loading booking data.
            </Alert>
          </Box>
        </Container>
      </Box>
    );
  }

  // Show loading state
  if (activeLoading && tabValue === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (historyLoading && tabValue === 1) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (activeError && tabValue === 0) {
    return (
      <Box sx={{ p: 3 }}>
        {" "}
        <Alert severity="error">
          Error loading active bookings: {(activeError as ApolloError).message}
        </Alert>
      </Box>
    );
  }

  if (historyError && tabValue === 1) {
    return (
      <Box sx={{ p: 3 }}>
        {" "}
        <Alert severity="error">
          Error loading booking history: {(historyError as ApolloError).message}
        </Alert>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 50%, #f3e5f5 100%)",
      }}
    >
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontWeight: "bold",
              mb: 4,
            }}
          >
            My Bookings
          </Typography>

          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 3,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  fontWeight: 600,
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  },
                },
              }}
            >
              <Tab label="Active Bookings" />
              <Tab label="Booking History" />
            </Tabs>
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {" "}
              <TabPanel value={tabValue} index={0}>
                {activeBookings.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(33, 150, 243, 0.2)",
                      borderRadius: 2,
                    }}
                  >
                    You don't have any active bookings yet.
                  </Alert>
                ) : (
                  activeBookings.map((booking) => (
                    <Card
                      key={booking._id}
                      sx={{
                        mb: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ flex: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography variant="h6" sx={{ mr: 2 }}>
                                {booking.parkingLot.name}
                              </Typography>
                              <Chip
                                label={getStatusText(booking.status)}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <LocationOn
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                {booking.parkingLot.address}
                              </Typography>
                            </Box>{" "}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <DirectionsCar
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                {booking.vehicleType === "car"
                                  ? "Car"
                                  : "Motorcycle"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <AccessTime
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                {format(
                                  new Date(booking.startTime),
                                  "dd MMMM yyyy HH:mm",
                                  { locale: id }
                                )}
                                {" - "}
                                {format(
                                  new Date(
                                    new Date(booking.startTime).getTime() +
                                      booking.duration * 60 * 60 * 1000
                                  ),
                                  "HH:mm",
                                  { locale: id }
                                )}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Payment
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                Rp {booking.cost.toLocaleString("id-ID")}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Stack spacing={1}>
                              {booking.status === "confirmed" && (
                                <>
                                  <Button
                                    variant="outlined"
                                    startIcon={<QrCode />}
                                    onClick={() => handleGenerateQR(booking)}
                                    fullWidth
                                  >
                                    View QR Code
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    startIcon={<Extension />}
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setExtendDialogOpen(true);
                                    }}
                                    fullWidth
                                  >
                                    Extend
                                  </Button>
                                </>
                              )}
                              {booking.status === "pending" && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setCancelDialogOpen(true);
                                  }}
                                  fullWidth
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                startIcon={<Chat />}
                                onClick={() => navigate(`/chat/${booking._id}`)}
                                fullWidth
                              >
                                Chat
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabPanel>{" "}
              <TabPanel value={tabValue} index={1}>
                {bookingHistory.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(33, 150, 243, 0.2)",
                      borderRadius: 2,
                    }}
                  >
                    You don't have any booking history yet.
                  </Alert>
                ) : (
                  bookingHistory.map((booking) => (
                    <Card key={booking._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ flex: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography variant="h6" sx={{ mr: 2 }}>
                                {booking.parkingLot.name}
                              </Typography>
                              <Chip
                                label={getStatusText(booking.status)}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <LocationOn
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                {booking.parkingLot.address}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <AccessTime
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                {format(
                                  new Date(booking.startTime),
                                  "dd MMMM yyyy HH:mm",
                                  { locale: id }
                                )}
                                {" - "}
                                {format(
                                  new Date(
                                    new Date(booking.startTime).getTime() +
                                      booking.duration * 60 * 60 * 1000
                                  ),
                                  "HH:mm",
                                  { locale: id }
                                )}
                              </Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Payment
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography color="text.secondary">
                                Rp {booking.cost.toLocaleString("id-ID")}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabPanel>
            </>
          )}
        </Box>

        {/* QR Code Dialog */}
        <Dialog
          open={qrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Booking QR Code</DialogTitle>
          <DialogContent>
            {selectedBooking?.qrCode && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <img
                  src={selectedBooking.qrCode}
                  alt="Booking QR Code"
                  style={{ maxWidth: "100%", height: "auto" }}
                />{" "}
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Show this QR code during check-in
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialogOpen(false)}>Tutup</Button>
          </DialogActions>
        </Dialog>

        {/* Extend Booking Dialog */}
        <Dialog
          open={extendDialogOpen}
          onClose={() => setExtendDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Perpanjang Durasi Parkir</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              Biaya tambahan: Rp{" "}
              {selectedBooking
                ? (
                    (selectedBooking.parkingLot.tariff || 0) * extendDuration
                  ).toLocaleString("id-ID")
                : "0"}{" "}
              untuk {extendDuration} jam
            </Typography>
            <input
              type="number"
              min="1"
              max="24"
              value={extendDuration}
              onChange={(e) => setExtendDuration(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExtendDialogOpen(false)}>Batal</Button>
            <Button onClick={handleExtendBooking} variant="contained">
              Perpanjang
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Booking Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Batalkan Booking</DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin membatalkan booking ini?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>Tidak</Button>
            <Button
              onClick={handleCancelBooking}
              color="error"
              variant="contained"
            >
              Ya, Batalkan
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BookingListPage;
