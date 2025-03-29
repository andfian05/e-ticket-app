import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react';

const QRScanner = () => {
    const [pemudik, setPemudik] = useState(null);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 30,
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
            focusMode: 'continuous',
            videoConstraints: {
                facingMode: "environment",
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
            },
        });

        scanner.render(onScanSuccess, onScanError);

        return () => {
            scanner.clear().catch(console.error);
        };
    }, []);

    const fetchPemudik = async (kodeTiket) => {
        setError('');
        setPemudik(null);
        try {
            const response = await axios.get(`/api?kodeTiket=${kodeTiket}`);
            if (response.data.status === 'error') {
                setError(response.data.message);
            } else {
                setPemudik(response.data);
                setIsModalOpen(true);
                setScanning(false);
            }
        } catch (err) {
            setError('Gagal mengambil data pemudik.');
        }
    };

    const onScanSuccess = (decodedText) => {
        try {
            const scannedObject = JSON.parse(decodedText);
            if (scannedObject.kodeTiket) {
                fetchPemudik(scannedObject.kodeTiket);
            } else {
                setError(`QR Code tidak valid. Tidak ditemukan kodeTiket ${kodeTiket}.`);
            }
        } catch (e) {
            setError('Format QR Code tidak valid.');
        }
    };

    const onScanError = (error) => {
        // Only show errors that might be helpful to the user
        if (error?.includes('NotFoundError')) {
            setError('Kamera tidak ditemukan. Pastikan kamera sudah diaktifkan.');
        } else if (error?.includes('NotAllowedError')) {
            setError('Mohon izinkan akses kamera untuk melakukan scan.');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setScanning(true);
        setPemudik(null);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scanner QR Code Ticket</h2>
                        <p className="text-gray-600 text-sm">Arahkan kamera ke QR Code untuk memverifikasi tiket pemudik</p>
                    </div>

                    <div className="relative">
                        <div id="reader" className="overflow-hidden rounded-lg"></div>
                        <style jsx>{`
                            #reader {
                            border: none !important;
                            }
                            #reader video {
                            width: 100% !important;
                            height: auto !important;
                            border-radius: 0.5rem;
                            }
                            #reader__scan_region {
                            background: transparent !important;
                            }
                            #reader__scan_region > img {
                            display: none !important;
                            }
                            #reader__camera_selection {
                            width: 100% !important;
                            padding: 8px !important;
                            margin-bottom: 10px !important;
                            border: 1px solid #e2e8f0 !important;
                            border-radius: 0.375rem !important;
                            }
                            #reader__dashboard_section_swaplink {
                            text-decoration: none !important;
                            color: #2563eb !important;
                            }
                        `}</style>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <CModal visible={isModalOpen} onClose={handleCloseModal} alignment="center">
                <div className="flex items-center justify-center p-4">
                    <div className="bg-white max-w-xl w-full rounded-lg shadow-lg overflow-auto max-h-screen sm:min-w-sm sm:w-md sm:h-20">
                        <CModalHeader closeButton>
                            <h3
                                className="text-xl font-semibold justify-center text-center mt-6 mb-2">
                                Data Pemudik
                            </h3>
                        </CModalHeader>
                        <CModalBody>
                            {pemudik && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ms-4 me-4">
                                    {Object.entries(pemudik).map(([key, value]) => (
                                        <div key={key} className="border-b pb-3">
                                            <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                            <p className="text-lg font-medium">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CModalBody>
                        <CModalFooter className="flex flex-col sm:flex-row gap-2 justify-center align-center">
                            <button
                                onClick={handleCloseModal}
                                className="w-sx sm:w-3xs bg-blue-600 text-white py-2 px-2 rounded-md hover:bg-blue-700 transition-colors mt-6 mb-6 ms-4 me-4"
                            >
                                Scan Tiket Berikutnya
                            </button>
                        </CModalFooter>
                    </div>
                </div>
            </CModal>
        </div>
    );
};

export default QRScanner;