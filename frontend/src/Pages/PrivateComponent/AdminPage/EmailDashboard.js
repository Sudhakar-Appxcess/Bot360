import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Message from '../../../Response/Message';

axios.defaults.withCredentials = true;

const EmailDashboard = () => {
    const [emails, setEmails] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [totalEmails, setTotalEmails] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    const fetchEmails = async (page, limit) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/email/?page=${page}&limit=${limit}`,
                { withCredentials: true }
            );

            const { emails, total_emails, total_pages } = response.data;
            setEmails(emails);
            setTotalEmails(total_emails);
            setTotalPages(total_pages);
        } catch (err) {
            setError('Failed to fetch emails. Please try again later.');
            setShowMessage(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails(page, limit);
    }, [page, limit]);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl text-center mb-6 font-bold text-blue-600">Email Dashboard</h2>
            
            {showMessage && error && (
                <Message
                    message={error}
                    type="error"
                    onClose={() => setShowMessage(false)}
                />
            )}

            {loading && <div className="text-center"><div className="loader"></div></div>}
            
            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emails.map((email, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-4 transition-transform transform hover:scale-105">
                            <h3 className="font-semibold text-lg">{email.name}</h3>
                            <p className="text-gray-600">Email: {email.email}</p>
                            <p className="text-gray-600">Mobile: {email.mobile}</p>
                            <p className="text-gray-600">Message: {email.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center mt-6">
                <button 
                    onClick={() => setPage(page > 1 ? page - 1 : 1)} 
                    className={`mx-2 px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="mx-2 text-lg">Page {page} of {totalPages}</span>
                <button 
                    onClick={() => setPage(page < totalPages ? page + 1 : totalPages)} 
                    className={`mx-2 px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default EmailDashboard;
