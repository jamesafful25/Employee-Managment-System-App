import { useAuth } from '../../context/AuthContext';

const Topbar = ({ title }) => {
    const { employee } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                        {employee && employee.first_name} {employee && employee.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{employee && employee.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {employee && employee.first_name && employee.first_name.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default Topbar;