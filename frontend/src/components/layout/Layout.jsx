import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/employees': 'Employees',
    '/departments': 'Departments',
    '/attendance': 'Attendance',
    '/leaves': 'Leave Management',
    '/leaves/types': 'Leave Types',
    '/payroll': 'Payroll',
    '/performance': 'Performance Reviews',
    '/reports': 'Reports',
    '/profile': 'My Profile',
    '/uploads': 'File Uploads',
};

const Layout = () => {
    const location = useLocation();

    const getTitle = () => {
        if (pageTitles[location.pathname]) {
            return pageTitles[location.pathname];
        }
        if (location.pathname.startsWith('/employees/')) {
            return 'Employee Detail';
        }
        return 'EMS Portal';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar title={getTitle()} />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;