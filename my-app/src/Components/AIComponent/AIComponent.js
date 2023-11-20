import React, { useState } from 'react';
import axios from 'axios';
import TutorComponent from '../TutorComponent/TutorComponent';

const AIComponent = () => {
    const [message, setMessage] = useState('');
    const [tutorResults, setTutorResults] = useState([]);

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:3001/ai', {
                message: message,
            });

            console.log(response);
            setTutorResults(response.data.matchedTutors);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <label>
                Input Message:
                <textarea
                    rows="4"
                    cols="50"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
            </label>

            <button onClick={handleSubmit}>Submit</button>

            <TutorComponent tutorResults={tutorResults} />
        </div>
    );
};



export default AIComponent;
