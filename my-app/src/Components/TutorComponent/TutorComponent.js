import React from 'react';
import axios from 'axios';

const TutorComponent = ({ tutorResults }) => {
    const addToFavorite = (studentName, tutorName, fitScore) => {
        const data = {
            studentName: studentName,
            tutorName: tutorName,
            fitScore: fitScore,
        };

        // Send a POST request to localhost:3001/addtofav with the data
        axios.post('http://localhost:3001/addtofav', data)
            .then(response => {
                console.log('Added to favorites:', response.data);
                // Handle success, e.g., update state to reflect the change
            })
            .catch(error => {
                console.error('Error adding to favorites:', error);
                // Handle error, e.g., show an error message to the user
            });
    };

    return (
        <div>
            <h2>Tutor Results</h2>
            {tutorResults && tutorResults.length > 0 ? (
                tutorResults.map((tutorResult, index) => (
                    <div key={index}>
                        {tutorResult.tutor ? (
                            <>
                                <p>Name: {tutorResult.tutor.name}</p>
                                <p>Fit Score: {tutorResult.fitScore}</p>
                                <button
                                    onClick={() => addToFavorite("StudentName", tutorResult.tutor.name, tutorResult.fitScore)}
                                >
                                    Add to Favorite
                                </button>
                                <hr />
                            </>
                        ) : (
                            <p>No tutor information available</p>
                        )}
                    </div>
                ))
            ) : (
                <p>No results</p>
            )}
        </div>
    );
};

export default TutorComponent;
