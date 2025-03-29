import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const Spinner = () => (
    <div className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
);

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="text-center">{children}</div>
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
};

const FormTicket = () => {
    const initialFormState = {
        namaLengkap: '',
        kecamatan: '',
        kota: '',
        alamat: '',
        disabilitas: '',
        jumlahPemudik: '',
        kodeTiket: '',
        keberangkatan: '',
        tujuan: '',
        tanggalBerangkat: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (!showSuccessModal) {
            setFormData(initialFormState);
            setQrCodeData('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showSuccessModal]);

    const validateForm = () => {
        const errors = [];

        if (!/^[A-Za-z'\-\s]+$/.test(formData.namaLengkap)) {
            errors.push('Nama lengkap hanya boleh mengandung huruf dan spasi.');
        }

        if (
            !formData.jumlahPemudik ||
            isNaN(formData.jumlahPemudik) ||
            Number(formData.jumlahPemudik) <= 0
        ) {
            errors.push('Jumlah pemudik harus lebih dari 0.');
        }

        const kodeTiket = formData.kodeTiket.trim();
        if (!/^YBM-\d{4}-[A-Z0-9]{4}$/.test(kodeTiket)) {
            errors.push('Format kode tiket tidak valid (Format: YBM-2024-XXXX).');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tanggalInput = new Date(formData.tanggalBerangkat);

        if (tanggalInput < today) {
            errors.push('Tanggal keberangkatan tidak boleh di masa lalu.');
        }

        if (errors.length > 0) {
            setError(errors.join(' '));
            return false;
        }

        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const generateQRCode = () => {
        const qrData = JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
            id: `TICKET-${formData.kodeTiket}-${Date.now()}`,
        });
        setQrCodeData(qrData);
    };

    const submitForm = async () => {
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9vhuJng1H8pnUeK-J1t7t6AD1h2i5oIy8rZDVYullNKLBtF3ZFEUX54hQoamaV9n8/exec';

        try {
            // Validate URL before making the request
            new URL(SCRIPT_URL);

            // eslint-disable-next-line no-unused-vars
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // With no-cors, we won't get a meaningful response
            // Instead, we'll consider the submission successful if it doesn't throw an error
            return true;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('URL')) {
                console.error('Invalid URL:', error);
                throw new Error('URL konfigurasi tidak valid. Silakan hubungi administrator.');
            }
            console.error('Submit error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            await submitForm();
            // If we get here, the submission was successful
            generateQRCode();
            setShowSuccessModal(true);
        } catch (error) {
            setError(error.message || 'Terjadi kesalahan pada server. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg max-w-lg w-full p-6 mt-10 mb-10">
                <h1 className="text-xl font-bold mb-6 text-gray-700 text-center">
                    Form E-Ticket Pemudik
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="namaLengkap"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Nama Lengkap *
                        </label>
                        <input
                            type="text"
                            id="namaLengkap"
                            name="namaLengkap"
                            value={formData.namaLengkap}
                            onChange={handleChange}
                            required
                            pattern="^[A-Za-z'\-\s]+$"
                            title="Hanya huruf, spasi, tanda kutip dan tanda hubung yang diperbolehkan"
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="kecamatan"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Kecamatan Pemudik *
                        </label>
                        <input
                            type="text"
                            id="kecamatan"
                            name="kecamatan"
                            value={formData.kecamatan}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="kota"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Kota Pemudik *
                        </label>
                        <input
                            type="text"
                            id="kota"
                            name="kota"
                            value={formData.kota}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="alamat"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Alamat Lengkap Pemudik *
                        </label>
                        <textarea
                            id="alamat"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div>
                        <label
                            htmlFor="disabilitas"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Disabilitas *
                        </label>
                        <select
                            name="disabilitas"
                            id="disabilitas"
                            value={formData.disabilitas}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Pilih --</option>
                            <option value="Tunanetra">Tunanetra</option>
                            <option value="Tunawicara">Tunawicara</option>
                            <option value="Tunarungu">Tunarungu</option>
                            <option value="Tunadaksa">Tunadaksa</option>
                            <option value="Tunagrahita">Tunagrahita</option>
                            <option value="Tunalaras">Tunalaras</option>
                            <option value="Tidak Ada">Tidak Ada</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="jumlahPemudik"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Jumlah Pemudik *
                        </label>
                        <input
                            type="number"
                            id="jumlahPemudik"
                            name="jumlahPemudik"
                            value={formData.jumlahPemudik}
                            onChange={handleChange}
                            required
                            min="1"
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="kodeTiket"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Kode Tiket YBM PLN * (Format: YBM-2024-XXXX)
                        </label>
                        <input
                            type="text"
                            id="kodeTiket"
                            name="kodeTiket"
                            value={formData.kodeTiket}
                            onChange={handleChange}
                            required
                            pattern="YBM-\d{4}-[A-Z0-9]{4}"
                            placeholder="YBM-2024-0001"
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="keberangkatan"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Keberangkatan *
                        </label>
                        <input
                            type="text"
                            id="keberangkatan"
                            name="keberangkatan"
                            value={formData.keberangkatan}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tujuan"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Tujuan *
                        </label>
                        <input
                            type="text"
                            id="tujuan"
                            name="tujuan"
                            value={formData.tujuan}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tanggalBerangkat"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Tanggal Berangkat *
                        </label>
                        <input
                            type="date"
                            id="tanggalBerangkat"
                            name="tanggalBerangkat"
                            value={formData.tanggalBerangkat}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <p className="text-sm text-gray-500">* Wajib diisi</p>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex justify-center items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting && <Spinner />}
                        {isSubmitting ? 'Mengirim...' : 'Kirim'}
                    </button>
                </form>

                <Modal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                >
                    <div className="text-green-600 text-5xl mb-4">✓</div>
                    <h2 className="text-xl font-semibold mb-2">
                        Data Berhasil Disimpan!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        QR Code E-Tiket Anda telah dibuat.
                    </p>
                    {qrCodeData && (
                        <QRCodeCanvas value={qrCodeData} size={200} className="mx-auto" />
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default FormTicket;