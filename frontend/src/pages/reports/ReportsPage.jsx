import { useState } from 'react';
import {
    downloadAttendanceReport,
    downloadLeaveReport,
    downloadPayrollReport,
    downloadPerformanceReport,
} from '../../api/reportAPI';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ReportCard = ({ title, description, icon, color, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
        {children}
    </div>
);

const ReportsPage = () => {
    const [message, setMessage] = useState({ type: '', text: '' });

    // attendance form
    const [attendanceForm, setAttendanceForm] = useState({
        startDate: '',
        endDate: '',
        format: 'pdf',
    });
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // leave form
    const [leaveForm, setLeaveForm] = useState({
        startDate: '',
        endDate: '',
        status: '',
        format: 'pdf',
    });
    const [leaveLoading, setLeaveLoading] = useState(false);

    // payroll form
    const [payrollForm, setPayrollForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        format: 'pdf',
    });
    const [payrollLoading, setPayrollLoading] = useState(false);

    // performance form
    const [performanceForm, setPerformanceForm] = useState({
        startDate: '',
        endDate: '',
        format: 'pdf',
    });
    const [performanceLoading, setPerformanceLoading] = useState(false);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleDownload = async (downloadFn, params, setLoading) => {
        setLoading(true);
        try {
            const response = await downloadFn(params);
            const extension = params.format === 'excel' ? 'xlsx' : 'pdf';
            const contentType = params.format === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf';
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showMessage('success', 'Report downloaded successfully');
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to download report';
            showMessage('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendance = (e) => {
        e.preventDefault();
        handleDownload(downloadAttendanceReport, attendanceForm, setAttendanceLoading);
    };

    //const handleLeave = (e) => {
        //e.preventDefault();
        //handleDownload(downloadLeaveReport, leaveForm, setLeaveLoading);
    //};

    const handleLeave = (e) => {
        e.preventDefault();
        const params = {
            startDate: leaveForm.startDate,
            endDate: leaveForm.endDate,
            format: leaveForm.format,
        };
        // only add status if not "All"
        if (leaveForm.status) {
            params.status = leaveForm.status;
        }
        handleDownload(downloadLeaveReport, params, setLeaveLoading);
    };

    const handlePayroll = (e) => {
        e.preventDefault();
        handleDownload(downloadPayrollReport, payrollForm, setPayrollLoading);
    };

    const handlePerformance = (e) => {
    e.preventDefault();
    handleDownload(downloadPerformanceReport, performanceForm, setPerformanceLoading);
    };


    return (
        <div className="space-y-4">

            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Attendance Report */}
                <ReportCard
                    title="Attendance Report"
                    description="Download attendance records by date range"
                    color="bg-blue-50"
                    icon={
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                >
                    <form onSubmit={handleAttendance} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={attendanceForm.startDate}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, startDate: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={attendanceForm.endDate}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, endDate: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                            <select
                                value={attendanceForm.format}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, format: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={attendanceLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {attendanceLoading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </form>
                </ReportCard>

                {/* Leave Report */}
                <ReportCard
                    title="Leave Report"
                    description="Download leave applications by date range"
                    color="bg-yellow-50"
                    icon={
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                >
                    <form onSubmit={handleLeave} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={leaveForm.status}
                                onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                            <select
                                value={leaveForm.format}
                                onChange={(e) => setLeaveForm({ ...leaveForm, format: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={leaveLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-xs font-medium rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {leaveLoading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </form>
                </ReportCard>

                {/* Payroll Report */}
                <ReportCard
                    title="Payroll Report"
                    description="Download payroll summary by month and year"
                    color="bg-green-50"
                    icon={
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                >
                    <form onSubmit={handlePayroll} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                                <select
                                    value={payrollForm.month}
                                    onChange={(e) => setPayrollForm({ ...payrollForm, month: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="number"
                                    required
                                    min="2000"
                                    max="2100"
                                    value={payrollForm.year}
                                    onChange={(e) => setPayrollForm({ ...payrollForm, year: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                            <select
                                value={payrollForm.format}
                                onChange={(e) => setPayrollForm({ ...payrollForm, format: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={payrollLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {payrollLoading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </form>
                </ReportCard>

                {/* Performance Report */}
                <ReportCard
                    title="Performance Report"
                    description="Download performance reviews by date range"
                    color="bg-purple-50"
                    icon={
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                >
                    <form onSubmit={handlePerformance} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={performanceForm.startDate}
                                    onChange={(e) => setPerformanceForm({ ...performanceForm, startDate: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={performanceForm.endDate}
                                    onChange={(e) => setPerformanceForm({ ...performanceForm, endDate: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                            <select
                                value={performanceForm.format}
                                onChange={(e) => setPerformanceForm({ ...performanceForm, format: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={performanceLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-medium rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {performanceLoading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </form>
                </ReportCard>

            </div>
        </div>
    );
};

export default ReportsPage;